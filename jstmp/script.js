const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Load sprite image
const sprite = new Image();
sprite.src = 'sprite.png'; // Replace 'sprite.png' with the path to your sprite image

// Define sprite properties
const spriteWidth = 200; // Width of each sprite frame
const spriteHeight = 200; // Height of each sprite frame
const numFrames = 1; // Number of frames in the sprite
let currentFrame = 0; // Current frame to display

// Function to draw sprite
function drawSprite() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    sprite, 
    currentFrame * spriteWidth, // X coordinate of the sprite frame
    0, // Y coordinate of the sprite frame (assuming it's on the top)
    spriteWidth, // Width of the sprite frame
    spriteHeight, // Height of the sprite frame
    0, // X coordinate on the canvas to draw the sprite
    0, // Y coordinate on the canvas to draw the sprite
    spriteWidth, // Width to draw the sprite
    spriteHeight // Height to draw the sprite
  );
}

// Update animation frame
function updateFrame() {
  currentFrame = (currentFrame + 1) % numFrames;
  drawSprite();
}

// Start animation
setInterval(updateFrame, 100); // Change the interval to adjust the animation speed

