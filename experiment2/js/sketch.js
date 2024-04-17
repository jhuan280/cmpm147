// sketch.js - This project was based off Mount Shasta. This mountain is technically classified as a potentially active
//             volcano located in Siskiyou County, California.
// Author: Jackie Huang
// Date: 4/15/2024

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

//imported from remix
let seed = 239;

const grassColor = "#8DB360"; // Lighter shade of green
const skyColor = "#69ade4";
const stoneColor = "#858290";
const treeColor = "#33330b";
const cloudColor = "#ffffff"; // Color of clouds

class Cloud {
  constructor(x, y, speed, size) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
  }

  update() {
    this.y += this.speed; // Update y-coordinate to make clouds fall vertically
    if (this.y > height) {
      this.y = -this.size; // Reset cloud position if it moves off-screen
    }
  }

  display() {
    fill(cloudColor);
    ellipse(this.x, this.y, this.size);
  }
}

let clouds = [];

//for reimgaine button
$("#reimagine").click(function() {
  seed = millis();
});

class MyClass {
  constructor(param1, param2) {
    this.property1 = param1;
    this.property2 = param2;
  }

  myMethod() {
    // code to run when method is called
  }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  //added from remix
  createCanvas(400, 200);
  // createButton("reimagine").mousePressed(() => seed++);  

  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  // Create clouds
  for (let i = 0; i < 5; i++) {
    let x = random(width);
    let y = random(-height / 2); // Start clouds above the canvas
    let speed = random(1, 3);
    let size = random(20, 50);
    clouds.push(new Cloud(x, y, speed, size));
  }
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  //imported from remix
  randomSeed(seed);

  background(100);

  noStroke();

  fill(skyColor);
  rect(0, 0, width, height / 2);

  fill(grassColor);
  rect(0, height / 2, width, height / 2);

  //chatGPT
  fill(stoneColor);
  beginShape();
  vertex(0, height / 2);
  const steps = 20; // Increase the number of steps for more vertices
  for (let i = 0; i < steps + 1; i++) {
    let x = (width * i) / steps;
    let y =
      height / 3.5 - (random() * random() * random() * height) / 5; // Adjust the formula to generate slightly higher mountains
    vertex(x, y);
  }
  vertex(width, height / 2);
  endShape(CLOSE);

  // Calculate the middle of the mountain's height
  let middleMountainHeight = (height / 2 + height / 3.5) / 2;

  // Shift the snow patch higher
  middleMountainHeight -= 40; // Adjust as needed

  // Add irregular snow patches on the mountains
  fill(255); // White color for snow
  const numSnowPatches = 20; // Increase the number of snow patches as desired
  for (let i = 0; i < numSnowPatches; i++) {
    beginShape();
    for (let j = 0; j < 5; j++) {
      // Choose the number of vertices for each snow patch
      let x = random(0, width); // Random x-coordinate within canvas width
      let y = random(
        middleMountainHeight - 20,
        middleMountainHeight + 20
      ); // Random y-coordinate around the middle of the mountain's height
      vertex(x, y); // Add vertex to the shape
    }
    endShape(CLOSE); // Close the irregular shape
  }
  //chatGPT

  //random fern life
  fill(treeColor);
  const trees = 100 * random(); // Increase the multiplier for more trees
  const scrub = mouseX / width;
  for (let i = 0; i < trees; i++) {
    let z = random();
    let x =
      width *
      ((random() + (scrub / 50 + millis() / 500000.0) / z) % 1);
    let s = width / 50 / z;
    let y = height / 2 + height / 20 / z;
    triangle(x, y - s, x - s / 4, y, x + s / 4, y);
  }

  // Update and display snowflakes
  for (let cloud of clouds) {
    cloud.update();
    cloud.display();
  }

  // Generating smaller plant life
  const plantColor = color(random(0, 100), random(100, 255), random(0, 100)); // Random shades of green
  fill(plantColor); // Random shade of green
  const plantLife = 50 * random(); // Adjust the number of plant life as needed
  for (let i = 0; i < plantLife; i++) {
    let z = random();
    let x = width * ((random() + (scrub/50 + millis() / 500000.0) / z) % 1);
    let s = width / 100 / z; // Smaller size compared to trees
    let y = height / 2 + height / 20 / z;
    triangle(x, y - s, x - s / 8, y, x + s / 8, y); // Adjust the shape as needed
  }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
  // code to run when mouse is pressed
}
