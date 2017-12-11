*This is a copy of discussion from [Stack Overflow Documentation][4] on how to debug a memory leak in TensorFlow. Unfortunately, the original discussion became unavailable due to Stack Overflow shutting down Stack Overflow Documentation. I have downloaded the post from [Internet Archive][5], and I'm sharing it here for others to use. Thanks to the original authors.*

### Finalize Graph

The most common mode of using TensorFlow involves first **building** a dataflow graph of TensorFlow operators (like `tf.constant()` and `tf.matmul()`, then **running steps** by calling the [`tf.Session.run()`][6] method in a loop (e.g. a training loop).

A common source of memory leaks is where the training loop contains calls that add nodes to the graph, and these run in every iteration, causing the graph to grow. These may be obvious (e.g. a call to a TensorFlow operator like `tf.square()`), implicit (e.g. a call to a TensorFlow library function that creates operators like `tf.train.Saver()`), or subtle (e.g. a call to an overloaded operator on a `tf.Tensor` and a NumPy array, which implicitly calls `tf.convert_to_tensor()` and adds a new `tf.constant()` to the graph).

The [`tf.Graph.finalize()`][7] method can help to catch leaks like this: it marks a graph as read-only, and raises an exception if anything is added to the graph. For example:

    loss = ...
    train_op = tf.train.GradientDescentOptimizer(0.01).minimize(loss)
    init = tf.initialize_all_variables()
    with tf.Session() as sess:
        sess.run(init)
        sess.graph.finalize()  # Graph is read-only after this statement.

        for _ in range(1000000):
            sess.run(train_op)
            loss_sq = tf.square(loss)  # Exception will be thrown here.
            sess.run(loss_sq)

In this case, the overloaded `*` operator attempts to add new nodes to the graph:

    loss = ...
    # ...
    with tf.Session() as sess:
        # ...
        sess.graph.finalize()  # Graph is read-only after this statement.
        # ...
        dbl_loss = loss * 2.0  # Exception will be thrown here.



### Use `tcmalloc` Allocator

To improve memory allocation performance, many TensorFlow users often use [`tcmalloc`][1] instead of the default `malloc()` implementation, as `tcmalloc` suffers less from fragmentation when allocating and deallocating large objects (such as many tensors).  Some memory-intensive TensorFlow programs have been known to leak **heap address space** (while freeing all of the individual objects they use) with the default `malloc()`, but performed just fine after switching to `tcmalloc`.  In addition, `tcmalloc` includes a [heap profiler][2], which makes it possible to track down where any remaining leaks might have occurred.

The installation for `tcmalloc` will depend on your operating system, but the following works on Anaconda python on Ubuntu 16.04 
```
$ sudo apt-get install google-perftools
$ conda install libgcc
```

To run your TensorFlow Python program `script.py` with `tcmalloc`:
```
$ LD_PRELOAD=/usr/lib/libtcmalloc.so.4 python script.py ...
```

As noted above, simply switching to `tcmalloc` can fix a lot of apparent leaks. However, if the memory usage is still growing, you can use the heap profiler as follows:
```
$ LD_PRELOAD=/usr/lib/libtcmalloc.so.4 HEAPPROFILE=/tmp/profile python script.py ...
```
After you run the above command, the program will periodically write profiles to the filesystem. The sequence of profiles will be named:

* `/tmp/profile.0000.heap`
* `/tmp/profile.0001.heap`
* `/tmp/profile.0002.heap`
* ...

You can read the profiles using the `google-pprof` tool, which is installed as part of the `google-perftools` package. For example, to look at the third snapshot collected above:
```
$ pprof --gv `which python` /tmp/profile.0002.heap
```
Running the above command will pop up a GraphViz window, showing the profile information as a directed graph.

Alternatively, you can run:
```
$ pprof --pdf `which python` /tmp/profile.0002.heap > graph.pdf
```
Which will generate `graph.pdf` file showing the profile information as a directed graph.


 [1]: http://goog-perftools.sourceforge.net/doc/tcmalloc.html
 [2]: http://goog-perftools.sourceforge.net/doc/heap_profiler.html
 [3]: http://packages.ubuntu.com/trusty/libs/libtcmalloc-minimal4
 [4]: https://stackoverflow.com/documentation#t=201703201715326785429
 [5]: https://archive.org/details/documentation-dump.7z
 [6]: https://www.tensorflow.org/api_docs/python/tf/Session#run 
 [7]: https://www.tensorflow.org/api_docs/python/tf/Graph#finalize
 
