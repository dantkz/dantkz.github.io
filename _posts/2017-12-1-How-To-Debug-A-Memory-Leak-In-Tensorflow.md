*This is someones's post from [Stack Overflow Documentation][4] that became unavailable due to Stack Overflow shutting down
Stack Overflow Documentation. I have downloaded the post from [Internet Archive][5], and sharing it here for others to use. Thanks to the original author.*

# How to debug a memory leak in Tensorflow

To improve memory allocation performance, many TensorFlow users often use [`tcmalloc`][1] instead of the default `malloc()` implementation, as `tcmalloc` suffers less from fragmentation when allocating and deallocating large objects (such as many tensors).  Some memory-intensive TensorFlow programs have been known to leak **heap address space** (while freeing all of the individual objects they use) with the default `malloc()`, but performed just fine after switching to `tcmalloc`.  In addition, `tcmalloc` includes a [heap profiler][2], which makes it possible to track down where any remaining leaks might have occurred.

The installation for `tcmalloc` will depend on your operating system, but the following works on [Ubuntu 14.04 (trusty)][3] (where `script.py` is the name of your TensorFlow Python program):

    $ sudo apt-get install google-perftools4
    $ LD_PRELOAD=/usr/lib/libtcmalloc.so.4 python script.py ...

As noted above, simply switching to `tcmalloc` can fix a lot of apparent leaks. However, if the memory usage is still growing, you can use the heap profiler as follows:

    $ LD_PRELOAD=/usr/lib/libtcmalloc.so.4 HEAPPROFILE=/tmp/profile python script.py ...

After you run the above command, the program will periodically write profiles to the filesystem. The sequence of profiles will be named:

* `/tmp/profile.0000.heap`
* `/tmp/profile.0001.heap`
* `/tmp/profile.0002.heap`
* ...

You can read the profiles using the `google-pprof` tool, which (for example, on Ubuntu 14.04) can be installed as part of the `google-perftools` package. For example, to look at the third snapshot collected above:

    $ google-pprof --gv `which python` /tmp/profile.0002.heap

Running the above command will pop up a GraphViz window, showing the profile information as a directed graph.

 [1]: http://goog-perftools.sourceforge.net/doc/tcmalloc.html
 [2]: http://goog-perftools.sourceforge.net/doc/heap_profiler.html
 [3]: http://packages.ubuntu.com/trusty/libs/libtcmalloc-minimal4
 [4]: https://stackoverflow.com/documentation#t=201703201715326785429
 [5]: https://archive.org/details/documentation-dump.7z
