// sketch.js - purpose and description here
// Author: Jackie Huang
// Date: 4/19/2024

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

//world1//
//#--------------------------------------------------------------------------------------------------------------------------#//
"use strict";

const w1 = (sketch) => {

  sketch.resizeScreen = () => {
    centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
    centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
    console.log("Resizing...");
    sketch.resizeCanvas(canvasContainer.width(), canvasContainer.height());
    // redrawCanvas(); // Redraw everything based on new size
  };
  
  let rock;
  let rock2;
  let rock3;
  let water;
  let bird;
  let time = 0;
  let birds = []; // Array to store bird objects
  let numBirds = 4; // Number of birds
  let birdSpeeds = [2, 2.5, 3, 3.5]; // Different speeds for each bird
  
  function p3_preload() {
    rock = sketch.loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_081.png?v=1714468864750'); //32
    rock2 = sketch.loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_078.png?v=1714468872580'); //67
    rock3 = sketch.loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_069.png?v=1714468879355'); //67
    water = sketch.loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_104.png?v=1714468885185'); //37
    bird = sketch.loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/bird.png?v=1714469971400');
    bird.resize(32, 32); // Resize the bird image to 32x32 pixels
    
    // Create bird objects with random initial positions on the y-axis
    for (let i = 0; i < numBirds; i++) {
      birds.push({
        x: -100, // Initial x-coordinate of the bird
        y: sketch.random(sketch.height), // Random initial y-coordinate of the bird
        speed: birdSpeeds[i] // Speed of the bird's movement
      });
    }
  }
  
  function p3_setup() {}
  
  let worldSeed;
  
  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    sketch.noiseSeed(worldSeed);
    sketch.randomSeed(worldSeed);
  }
  
  function p3_tileWidth() {
    return 32;
  }
  
  function p3_tileHeight() {
    return 16;
  }
  
  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];
  
  let clicks = {};
  
  function p3_tileClicked(i, j) {
    let key = [i, j];
    clicks[key] = 1 + (clicks[key] | 0);
  }
  
  function p3_drawBefore() {}
  
  function p3_drawTile(i, j) {
    sketch.noStroke();
  
    if ((sketch.floor(7 * sketch.noise(i, j))) < 2) {
      sketch.image(rock, 0, 0, 64, 64); // Display grass
    } else if ((sketch.floor(4 * sketch.noise(i, j))) < 3) {
      // Add slight animation to the water
      let xOffset = sketch.cos(time + i * 0.5) * 2; // Adjust speed and intensity as needed
      let yOffset = sketch.sin(time + j * 0.5) * 2; // Adjust speed and intensity as needed
      sketch.image(water, xOffset, yOffset, 64, 64); // Display water
    } 
    else if ((sketch.floor(3 * sketch.noise(i, j))) < 4) {
      sketch.image(rock2, 0, 0, 64, 64); // Display flower
    }
  
    if (XXH.h32("tile:" + [i, j], worldSeed) % 8 == 0) {
      sketch.image(rock3, 0, 0, 64, 64); // Display rock
    }
  
    // Your additional code (if any) can go here
  
    sketch.push();
    // Your additional drawing code (if any) can go here
    sketch.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    sketch.noFill();
    sketch.stroke(0, 255, 0, 128);
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape(sketch.CLOSE);
  
    sketch.noStroke();
    sketch.fill(0);
    sketch.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {
    // Increment time for animation
    time += 0.1; // Adjust speed of animation as needed
    
    // Update positions and draw all birds
    for (let i = 0; i < numBirds; i++) {
      birds[i].x += birds[i].speed;
      
      // If a bird goes off-screen, reset its position
      if (birds[i].x > sketch.width) {
        birds[i].x = -bird.width;
        birds[i].y = sketch.random(sketch.height); // Randomize the y-coordinate again
      }
      
      // Draw the bird at its current position with desired size and flipped horizontally
      let birdSize = 32; // Adjust the size of the bird as needed
      sketch.push();
      sketch.scale(-1, 1); // Flip horizontally
      sketch.image(bird, -birds[i].x - birdSize, birds[i].y, birdSize, birdSize);
      sketch.pop();
    }
  }
  
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */
  
  // Project base code provided by {amsmith,ikarth}@ucsc.edu
  
  
  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height
  
  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;
  
  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }
  
  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }
  
  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }
  
  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [sketch.floor(screen_y + screen_x), sketch.floor(screen_y - screen_x)];
  }
  
  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: sketch.round(world_x), y: sketch.round(world_y) };
  }
  
  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }
  
  sketch.preload = () => {
    p3_preload();
  }
  
  sketch.setup = () => {
    let canvas = sketch.createCanvas(800, 400);
    canvas.parent("container");
  
    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);
  
    if (sketch.p3_setup) {
      sketch.p3_setup();
    }
  
    let label = sketch.createP();
    label.html("World key: ");
    label.parent("container");
  
    let input = sketch.createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      rebuildWorld(input.value());
    });
  
    sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("container");
  
    rebuildWorld(input.value());
  }
  
  function rebuildWorld(key) {
    // if (window.p3_worldKeyChanged) {
    p3_worldKeyChanged(key);
    // }
    tile_width_step_main = window.p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = window.p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = sketch.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = sketch.ceil(sketch.height / (tile_height_step_main * 2));
  }
  
  sketch.mouseClicked = () => {
    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
  
    // if (window.p3_tileClicked) {
    p3_tileClicked(world_pos[0], world_pos[1]);
    // }
    return false;
  }
  
  sketch.draw = () => {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW)) {
      camera_velocity.y += 1;
    }
  
    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }
  
    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);
  
    sketch.background(100);
  
    // if (window.p3_drawBefore) {
    p3_drawBefore();
    // }
  
    let overdraw = 0.1;
  
    let y0 = sketch.floor((0 - overdraw) * tile_rows);
    let y1 = sketch.floor((1 + overdraw) * tile_rows);
    let x0 = sketch.floor((0 - overdraw) * tile_columns);
    let x1 = sketch.floor((1 + overdraw) * tile_columns);
  
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }
  
    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);
  
    // if (window.p3_drawAfter) {
    p3_drawAfter();
    // }
  }
  
  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }
  
  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    // if (window.p3_drawSelectedTile) {
    p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    // }
    sketch.pop();
  }
  
  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    // if (window.p3_drawTile) {
    p3_drawTile(world_x, world_y, -screen_x, screen_y);
    // }
    sketch.pop();
  }
  
}

let world1 = new p5(w1, 'w1');

//world1//
//#--------------------------------------------------------------------------------------------------------------------------#//


//world2//
//#--------------------------------------------------------------------------------------------------------------------------#//
const w2 = (sketch) => {

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */
  
  let shrub;
  let rock;
  let water;
  let grass;
  let flower;
  let raindrops = [];
  
  function p3_preload() {
    shrub = sketch.loadImage('https://cdn.glitch.global/c9e28603-a30e-48a2-88aa-71aacb622551/tile_032.png?v=1714453107197'); //32
    rock = sketch.loadImage('https://cdn.glitch.global/c9e28603-a30e-48a2-88aa-71aacb622551/tile_067.png?v=1714453112704'); //67
    water = sketch.loadImage('https://cdn.glitch.global/c9e28603-a30e-48a2-88aa-71aacb622551/tile_104.png?v=1714467293272')
    grass = sketch.loadImage('https://cdn.glitch.global/c9e28603-a30e-48a2-88aa-71aacb622551/tile_037.png?v=1714453127412'); //37
    flower = sketch.loadImage('https://cdn.glitch.global/c9e28603-a30e-48a2-88aa-71aacb622551/tile_044.png?v=1714464956976')
  }
  
  function p3_setup() {
    // Initialize raindrops
    for (let i = 0; i < 500; i++) {
      raindrops.push({
        x: sketch.random(sketch.width / 2, sketch.width), // Start from the top right corner
        y: sketch.random(0, sketch.height / 2), // Randomize vertical position within the top half of the canvas
        speed: sketch.random(2, 5) // Random speed
      });
    }
  }
  
  let worldSeed;
  
  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    sketch.noiseSeed(worldSeed);
    sketch.randomSeed(worldSeed);
  }
  
  function p3_tileWidth() {
    return 32;
  }
  
  function p3_tileHeight() {
    return 16;
  }
  
  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];
  
  let clicks = {};
  
  function p3_tileClicked(i, j) {
    let key = [i, j];
    clicks[key] = 1 + (clicks[key] | 0);
  }
  
  function p3_drawBefore() {
    // Clear the background
    sketch.background(255);
  }
  
  function p3_drawTile(i, j) {
    sketch.noStroke();
  
    if ((sketch.floor(7 * sketch.noise(i, j))) < 2) {
      sketch.image(grass, 0, 0, 64, 64); // Display grass
    } else if ((sketch.floor(2 * sketch.noise(i, j))) < 1) {
      let imgSize = 64; // Size of each tile in the grid
      sketch.image(water, 0, 0, imgSize, imgSize); // Display water at top-left corner
      sketch.image(water, imgSize, 0, imgSize, imgSize); // Display water at top-right corner
      sketch.image(water, 0, imgSize, imgSize, imgSize); // Display water at bottom-left corner
      sketch.image(water, imgSize, imgSize, imgSize, imgSize); // Display water at bottom-right corner
    } 
    else if ((sketch.floor(4 * sketch.noise(i, j))) < 3) {
      sketch.image(shrub, 0, 0, 64, 64); // Display shrub
    } 
    else if ((sketch.floor(3 * sketch.noise(i, j))) < 4) {
      sketch.image(flower, 0, 0, 64, 64); // Display flower
    }
  
    if (XXH.h32("tile:" + [i, j], worldSeed) % 8 == 0) {
      sketch.image(rock, 0, 0, 64, 64); // Display rock
    }
  
    // Your additional code (if any) can go here
  
    sketch.push();
    // Your additional drawing code (if any) can go here
    sketch.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    sketch.noFill();
    sketch.stroke(0, 255, 0, 128);
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape(sketch.CLOSE);
  
    sketch.noStroke();
    sketch.fill(0);
    sketch.text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {
    // Draw raindrops falling diagonally from top right to bottom left
    for (let i = 0; i < raindrops.length; i++) {
      let drop = raindrops[i];
      drop.x -= drop.speed; // Move the raindrop towards the left
      drop.y += drop.speed; // Move the raindrop downwards
      sketch.stroke(0, 0, 255); // Blue color for raindrops
      sketch.line(drop.x, drop.y, drop.x + 5, drop.y + 5); // Draw raindrop
      // If the raindrop moves off the screen, reset its position
      if (drop.x < 0 || drop.y > sketch.height) {
        drop.x = sketch.random(sketch.width / 2, sketch.width); // Start from the top right corner again
        drop.y = sketch.random(0, sketch.height / 2); // Randomize vertical position within the top half of the canvas
      }
    }
  }
  

/* global p5 */
/* exported preload, setup, draw, mouseClicked */

// Project base code provided by {amsmith,ikarth}@ucsc.edu


let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;

/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i, j];
}

function tileRenderingOrder(offset) {
  return [offset[1] - offset[0], offset[0] + offset[1]];
}

function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
  screen_x -= camera_x;
  screen_y -= camera_y;
  screen_x /= tile_width_step_main * 2;
  screen_y /= tile_height_step_main * 2;
  screen_y += 0.5;
  return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width_step_main * 2);
  let world_y = camera_y / (tile_height_step_main * 2);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}

function worldOffsetToCamera([world_x, world_y]) {
  let camera_x = world_x * (tile_width_step_main * 2);
  let camera_y = world_y * (tile_height_step_main * 2);
  return new p5.Vector(camera_x, camera_y);
}

sketch.preload = () => {
  // if (window.p3_preload) {
  p3_preload();
  // }
}

sketch.setup = () => {
  let canvas = sketch.createCanvas(800, 400);
  canvas.parent("container2");

  camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
  camera_velocity = new p5.Vector(0, 0);

  // if (window.p3_setup) {
  p3_setup();
  // }

  let label = sketch.createP();
  label.html("World key: ");
  label.parent("container2");

  let input = sketch.createInput("xyzzy");
  input.parent(label);
  input.input(() => {
    rebuildWorld(input.value());
  });

  sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("container2");

  rebuildWorld(input.value());
}

function rebuildWorld(key) {
  // if (window.p3_worldKeyChanged) {
  p3_worldKeyChanged(key);
  // }
  tile_width_step_main = window.p3_tileWidth ? p3_tileWidth() : 32;
  tile_height_step_main = window.p3_tileHeight ? p3_tileHeight() : 14.5;
  tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
  tile_rows = Math.ceil(sketch.height / (tile_height_step_main * 2));
}

sketch.mouseClicked = () => {
  let world_pos = screenToWorld(
    [0 - sketch.mouseX, sketch.mouseY],
    [camera_offset.x, camera_offset.y]
  );

  // if (window.p3_tileClicked) {
  p3_tileClicked(world_pos[0], world_pos[1]);
  // }
  return false;
}

sketch.draw = () => {
  // Keyboard controls!
  if (sketch.keyIsDown(sketch.LEFT_ARROW)) {
    camera_velocity.x -= 1;
  }
  if (sketch.keyIsDown(sketch.RIGHT_ARROW)) {
    camera_velocity.x += 1;
  }
  if (sketch.keyIsDown(sketch.DOWN_ARROW)) {
    camera_velocity.y -= 1;
  }
  if (sketch.keyIsDown(sketch.UP_ARROW)) {
    camera_velocity.y += 1;
  }

  let camera_delta = new p5.Vector(0, 0);
  camera_velocity.add(camera_delta);
  camera_offset.add(camera_velocity);
  camera_velocity.mult(0.95); // cheap easing
  if (camera_velocity.mag() < 0.01) {
    camera_velocity.setMag(0);
  }

  let world_pos = screenToWorld(
    [0 - sketch.mouseX, sketch.mouseY],
    [camera_offset.x, camera_offset.y]
  );
  let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

  sketch.background(100);

  // if (window.p3_drawBefore) {
  p3_drawBefore();
  // }

  let overdraw = 0.1;

  let y0 = Math.floor((0 - overdraw) * tile_rows);
  let y1 = Math.floor((1 + overdraw) * tile_rows);
  let x0 = Math.floor((0 - overdraw) * tile_columns);
  let x1 = Math.floor((1 + overdraw) * tile_columns);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
        camera_offset.x,
        camera_offset.y
      ]); // odd row
    }
    for (let x = x0; x < x1; x++) {
      drawTile(
        tileRenderingOrder([
          x + 0.5 + world_offset.x,
          y + 0.5 - world_offset.y
        ]),
        [camera_offset.x, camera_offset.y]
      ); // even rows are offset horizontally
    }
  }

  describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

  // if (window.p3_drawAfter) {
  p3_drawAfter();
  // }
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
}

function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
  sketch.push();
  sketch.translate(screen_x, screen_y);
  // if (window.p3_drawSelectedTile) {
  p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
  // }
  sketch.pop();
}

// Draw a tile, mostly by calling the user's drawing code.
function drawTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  sketch.push();
  sketch.translate(0 - screen_x, screen_y);
  // if (window.p3_drawTile) {
  p3_drawTile(world_x, world_y, -screen_x, screen_y);
  // }
  sketch.pop();
}


}

let world2 = new p5(w2, 'w2');

//world2//
//#--------------------------------------------------------------------------------------------------------------------------#//


//world3//
//#--------------------------------------------------------------------------------------------------------------------------#//
const w3 = (sketch) => {

  /* global XXH */
  /* exported --
      p3_preload
      p3_setup
      p3_worldKeyChanged
      p3_tileWidth
      p3_tileHeight
      p3_tileClicked
      p3_drawBefore
      p3_drawTile
      p3_drawSelectedTile
      p3_drawAfter
  */
  
  let tileImage;
  let tileImage2;
  let tileImage3;
  let tileImage4;
  let tileImage5;
  let meteors = [];
  
  class Meteor {
    constructor(x, y, speed, size) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.size = size;
      this.trail = []; // Array to store trail positions
    }
  
    update() {
      // Update position
      this.x -= this.speed;
      if (this.x < -this.size) {
        // If the meteor goes off the screen, reset its position
        this.x = sketch.width + sketch.random(100, 1000);
        this.y = sketch.random(0, sketch.height);
      }
  
      // Add current position to the trail
      this.trail.push({ x: this.x, y: this.y });
  
      // Limit the length of the trail
      if (this.trail.length > 10) {
        this.trail.shift(); // Remove oldest position
      }
    }
  
    display() {
      // Draw trail
      for (let i = 0; i < this.trail.length; i++) {
        let alpha = sketch.map(i, 0, this.trail.length, 255, 0); // Decrease opacity along the trail
        sketch.fill(255, alpha);
        sketch.ellipse(this.trail[i].x, this.trail[i].y, this.size * 1.5);
      }
  
      // Draw meteor
      sketch.fill(255);
      sketch.ellipse(this.x, this.y, this.size);
    }
  }
  
  function p3_preload() {
    // Load your image(s) here
    tileImage = sketch.loadImage('https://cdn.glitch.global/d6220317-7110-428e-a738-ad06186c9346/earth.png?v=1714286067120');
    tileImage2 = sketch.loadImage('https://cdn.glitch.global/d6220317-7110-428e-a738-ad06186c9346/jupiter.png?v=1714286066249');
    tileImage3 = sketch.loadImage('https://cdn.glitch.global/d6220317-7110-428e-a738-ad06186c9346/star.png?v=1714286067612');
    tileImage4 = sketch.loadImage('https://cdn.glitch.global/d6220317-7110-428e-a738-ad06186c9346/saturn.png?v=1714447712427');
    tileImage5 = sketch.loadImage('https://cdn.glitch.global/d6220317-7110-428e-a738-ad06186c9346/uranus.png?v=1714447740104');
  }
  
  function p3_setup() {
    // Create meteor objects and add them to the array
    for (let i = 0; i < 10; i++) { // Increase the number of meteors to 10
      let x = sketch.random(sketch.width);
      let y = sketch.random(sketch.height);
      let speed = sketch.random(1, 3);
      let size = sketch.random(5, 20);
      meteors.push(new Meteor(x, y, speed, size));
    }
  }
  
  
  let worldSeed;
  
  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    sketch.noiseSeed(worldSeed);
    sketch.randomSeed(worldSeed);
  }
  
  function p3_tileWidth() {
    return 32;
  }
  
  function p3_tileHeight() {
    return 16;
  }
  
  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];
  
  let clicks = {};
  
  function p3_tileClicked(i, j) {
    let key = [i, j];
    clicks[key] = 1 + (clicks[key] | 0);
  }
  
  function p3_drawBefore() {}
  
  let starAnimationOffset = 0; // Animation offset for the stars
  
  function p3_drawTile(i, j) {
    sketch.noStroke();
  
    // Set the fill color to black
    sketch.fill(0);
  
    sketch.push();
  
    // Draw the tile shape
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape(sketch.CLOSE);
  
    // Draw the image only on specific tiles
    let tileType = XXH.h32("tile:" + [i, j], worldSeed) % 100; // Generate a random number between 0 and 99
  
    if (tileType < 1) {
      sketch.image(tileImage, -tw / 2, -th / 2, tw, th); // Earth (1% chance)
    } 
    else if (tileType < 3) {
      sketch.image(tileImage2, -tw / 2, -th / 2, tw, th); // Jupiter (2% chance)
    } 
    else if (tileType < 6) {
      sketch.image(tileImage5, -tw / 2, -th / 2, tw, th); // Uranus (3% chance)
    } 
    else if (tileType < 26) {
      // Animate the stars
      let starColor = sketch.color(255, 255, 0); // Yellow color for stars
      let starSize = 5; // Size of the star
      let maxGlowSize = 40; // Maximum size of the glow effect
      let glowSpeed = 0.02; // Speed of the glow effect
  
      // Calculate glow size based on time
      let glowSize = sketch.map(sketch.sin(sketch.frameCount * glowSpeed + starAnimationOffset), -1, 1, 0, maxGlowSize);
  
      // Draw glowing effect
      let glowAlpha = sketch.map(glowSize, 0, maxGlowSize, 50, 100);
      sketch.fill(sketch.red(starColor), sketch.green(starColor), sketch.blue(starColor), glowAlpha);
      sketch.ellipse(0, 0, starSize + glowSize, starSize + glowSize);
  
      // Draw star
      sketch.fill(starColor);
      sketch.ellipse(0, 0, starSize, starSize);
    } 
    else if (tileType < 31) {
      sketch.image(tileImage4, -tw / 2, -th / 2, tw, th); // Saturn (5% chance)
    }
  
    // Draw additional graphics if needed
  
    sketch.pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    sketch.noFill();
    sketch.stroke(0, 255, 0, 128);
  
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape(sketch.CLOSE);
  
    sketch.noStroke();
    sketch.fill(255); // Set text color to white
    sketch.text("tile " + [i, j], 0, 0);
  }
  
  
  function p3_drawAfter() {
    // Update and display meteors
    for (let meteor of meteors) {
      meteor.update();
      meteor.display();
    }
  }

  "use strict";

  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */
  
  // Project base code provided by {amsmith,ikarth}@ucsc.edu
  
  
  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height
  
  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;
  
  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }
  
  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }
  
  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }
  
  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }
  
  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }
  
  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }
  
  sketch.preload = () => {
    // if (window.p3_preload) {
  p3_preload();
    // }
  }
  
  sketch.setup = () => {
    let canvas = sketch.createCanvas(800, 400);
    canvas.parent("container");
  
    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);
  
    // if (window.p3_setup) {
    p3_setup();
    // }
  
    let label = sketch.createP();
    label.html("World key: ");
    label.parent("container");
  
    let input = sketch.createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      rebuildWorld(input.value());
    });
  
    sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("container");
  
    rebuildWorld(input.value());
  }
  
  function rebuildWorld(key) {
    // if (window.p3_worldKeyChanged) {
    p3_worldKeyChanged(key);
    // }
    tile_width_step_main = window.p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = window.p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(sketch.height / (tile_height_step_main * 2));
  }
  
  sketch.mouseClicked = () => {
    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
  
    // if (window.p3_tileClicked) {
    p3_tileClicked(world_pos[0], world_pos[1]);
    // }
    return false;
  }
  
  sketch.draw = () => {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW)) {
      camera_velocity.y += 1;
    }
  
    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }
  
    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);
  
    sketch.background(100);
  
    // if (window.p3_drawBefore) {
    p3_drawBefore();
    // }
  
    let overdraw = 0.1;
  
    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);
  
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }
  
    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);
  
    // if (window.p3_drawAfter) {
    p3_drawAfter();
    // }
  }
  
  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }
  
  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    // if (window.p3_drawSelectedTile) {
    p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    // }
    sketch.pop();
  }
  
  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    // if (window.p3_drawTile) {
    p3_drawTile(world_x, world_y, -screen_x, screen_y);
    // }
    sketch.pop();
  }  

}

let world3 = new p5(w3, 'w3');
