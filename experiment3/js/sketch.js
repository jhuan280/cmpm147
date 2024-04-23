// sketch.js - purpose and description here
// Author: Jackie Huang
// Date: 4/19/2024

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

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
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  numCols = select("#asciiBox").attribute("rows") | 0;
  numRows = select("#asciiBox").attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#reseedButton").mousePressed(reseed);
  select("#asciiBox").input(reparseGrid);

  reseed();

  // // create an instance of the class
  // myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
  );
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  randomSeed(seed);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

// p2_solution //

/* exported generateGrid, drawGrid */
/* global placeTile */

function generateGrid(numCols, numRows) {
  let grid = [];

  // Loop through each row
  for (let i = 0; i < numRows; i++) {
    let row = [];
    
    // Loop through each column in the current row
    for (let j = 0; j < numCols; j++) {
      // Generate outer noise value based on current row and column
      let outerValue = noise(i / 40, j / 40);
      
      // Check if the absolute difference between outerValue and 0.5 is less than 0.03
      if (abs(outerValue - 0.5) < 0.03) {
        // If true, push "w" to the row array
        row.push("w"); // Represents water
      } 
      
      else {
        // If false, generate inner noise value based on current row and column
        let innerValue = noise(i / 20, j / 20);
        
        // Check if innerValue is greater than 0.5
        if (innerValue > 0.5) {
          // If true, push ":" to the row array
          row.push(":"); // Represents special content
        } 
        
        else {
          // If false, push "." to the row array
          row.push("."); // Represents default content
        }
      }
      
    }
    
    // Push the row array to the grid array
    grid.push(row);
  }

  // Return the generated grid
  return grid;
}

$("#switchButton").click(function() {
  
});

function drawGrid(grid) {
  // Set up background and time variables

  background(128);
  const t = 5 * millis() / 750.0; // Increase the speed by multiplying t by 3

  // Loop through each cell in the grid
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      // Place a tile based on Perlin noise for terrain
      // water
      placeTile(i, j, (4 * pow(noise(t / 10, i, j / 4 + t), 2)) | 0, 13);

      // Check if the current cell contains ":"
      if (grid[i][j] === ":") {
        // Place a random tile for specific content
        // : = dirt
        if (random() < 0.03) { // 3% chance of altering the tile
          // Alter the tile to something else
          placeTile(i, j, (4 * pow(random(), 10)) | 0, 0);
          placeTile(i, j, (4 * pow(random(), 10)) | 27, 0);
          
        } else {
          // Otherwise, keep the dirt tile
          placeTile(i, j, (4 * pow(random(), 10)) | 0, 0);
        }
      } else {
        // Otherwise, draw context based on content "w"
        // w = water
        drawContext(grid, i, j, "w", 9, 3, true);
      }

      // Check if the current cell contains "."
      if (grid[i][j] === ".") {
        // Place a random tile for specific content
        // grass
        if (random() < 0.03) { // 3% chance of altering the tile
          // Alter the tile to something else
          placeTile(i, j, (4 * pow(random(), 10)) | 0, 12);
          placeTile(i, j, (4 * pow(random(), 10)) | 14, 12);
        } else {
          // Otherwise, keep the grass tile
          placeTile(i, j, (4 * pow(random(), 10)) | 0, 12);
        }
      } else {
        // Otherwise, draw context based on content "."
        // . = grass + dirt
        drawContext(grid, i, j, ".", 4, 12);
      }
    }
  }
  
  // Draw clouds if less than 10000 milliseconds have passed
  if (millis() < 30000) {
    // Draw static black rectangles representing clouds
    stroke(100, 100); // Lighter shade for the border
    fill(50, 100); // Lighter shade of black
    rect(50 + t % width, 50, 100, 50); // First cloud
    rect(200 + t % width, 80, 80, 40); // Second cloud
    // rect(350 + t % width, 60, 120, 60); // Third cloud
    // rect(500 + t % width, 70, 90, 45); // Fourth cloud
    // rect(50 + t % width, height - 100, 100, 50); // Fifth cloud
    // rect(200 + t % width, height - 130, 80, 40); // Sixth cloud
  }

}


function drawContext(grid, i, j, target, dti, dtj, invert = false) {
  let code = gridCode(grid, i, j, target);
  if (invert) {
    code = ~code & 0xf;
  }
  let [ti,tj] = lookup[code];
  placeTile(i, j, dti + ti, dtj + tj);
}

function gridCode(grid, i, j, target) {
  return (
    (gridCheck(grid, i - 1, j, target) << 0) +
    (gridCheck(grid, i, j - 1, target) << 1) +
    (gridCheck(grid, i, j + 1, target) << 2) +
    (gridCheck(grid, i + 1, j, target) << 3)
  );
}

function gridCheck(grid, i, j, target) {
  if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
    return grid[i][j] == target;
  } else {
    return false;
  }
}

// Generate a lookup table for drawing different tile variations
const lookup = [
  [1, 1],
  [1, 0], // bottom
  [0, 1], // right
  [0, 0], // right+bottom
  [2, 1], // left
  [2, 0], // left+bottom
  [1, 1],
  [1, 0], // * 
  [1, 2], // top
  [1, 1],
  [0, 2], // right+top
  [0, 1], // *
  [2, 2], // top+left
  [2, 1], // *
  [1, 2], // *
  [1, 1]
];

// p2_solution //



// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}