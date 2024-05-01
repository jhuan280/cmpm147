// sketch.js - purpose and description here
// Author: Jackie Huang
// Date: 4/19/2024

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
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
    rock = loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_081.png?v=1714468864750'); //32
    rock2 = loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_078.png?v=1714468872580'); //67
    rock3 = loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_069.png?v=1714468879355'); //67
    water = loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/tile_104.png?v=1714468885185'); //37
    bird = loadImage('https://cdn.glitch.global/0a203342-a96d-4e1a-a00a-6fd84e0334df/bird.png?v=1714469971400');
    bird.resize(32, 32); // Resize the bird image to 32x32 pixels
    
    // Create bird objects with random initial positions on the y-axis
    for (let i = 0; i < numBirds; i++) {
      birds.push({
        x: -100, // Initial x-coordinate of the bird
        y: random(height), // Random initial y-coordinate of the bird
        speed: birdSpeeds[i] // Speed of the bird's movement
      });
    }
  }
  
  function p3_setup() {}
  
  let worldSeed;
  
  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    noiseSeed(worldSeed);
    randomSeed(worldSeed);
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
    noStroke();
  
    if ((floor(7 * noise(i, j))) < 2) {
      image(rock, 0, 0, 64, 64); // Display grass
    } else if ((floor(4 * noise(i, j))) < 3) {
      // Add slight animation to the water
      let xOffset = cos(time + i * 0.5) * 2; // Adjust speed and intensity as needed
      let yOffset = sin(time + j * 0.5) * 2; // Adjust speed and intensity as needed
      image(water, xOffset, yOffset, 64, 64); // Display water
    } else if ((floor(3 * noise(i, j))) < 4) {
      image(rock2, 0, 0, 64, 64); // Display flower
    }
  
    if (XXH.h32("tile:" + [i, j], worldSeed) % 8 == 0) {
      image(rock3, 0, 0, 64, 64); // Display rock
    }
  
    // Your additional code (if any) can go here
  
    push();
    // Your additional drawing code (if any) can go here
    pop();
  }
  
  function p3_drawSelectedTile(i, j) {
    noFill();
    stroke(0, 255, 0, 128);
  
    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);
  
    noStroke();
    fill(0);
    text("tile " + [i, j], 0, 0);
  }
  
  function p3_drawAfter() {
    // Increment time for animation
    time += 0.1; // Adjust speed of animation as needed
    
    // Update positions and draw all birds
    for (let i = 0; i < numBirds; i++) {
      birds[i].x += birds[i].speed;
      
      // If a bird goes off-screen, reset its position
      if (birds[i].x > width) {
        birds[i].x = -bird.width;
        birds[i].y = random(height); // Randomize the y-coordinate again
      }
      
      // Draw the bird at its current position with desired size and flipped horizontally
      let birdSize = 32; // Adjust the size of the bird as needed
      push();
      scale(-1, 1); // Flip horizontally
      image(bird, -birds[i].x - birdSize, birds[i].y, birdSize, birdSize);
      pop();
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
  
    camera_offset = new p5.Vector(-width / 2, height / 2);
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
    tile_columns = sketch.ceil(width / (tile_width_step_main * 2));
    tile_rows = sketch.ceil(height / (tile_height_step_main * 2));
  }
  
  sketch.mouseClicked = () => {
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
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
      [0 - mouseX, mouseY],
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
    push();
    translate(screen_x, screen_y);
    // if (window.p3_drawSelectedTile) {
    p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    // }
    pop();
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
  
let world1 = new p5(w1, 'w1');


}




