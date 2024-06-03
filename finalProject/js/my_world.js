"use strict";

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
    p3_drawAfter2
    getResourceInfo
    startGathering
    updateGathering
*/

// global variables for sound
let osc1;
let osc2;
let osc3;
let amp1 = 0.01;
let amp2 = 0.1;
let amp3 = 0.05;

let soundLoop;
//let notePattern1 = [62, 66, 69, 74, 67, 71, 64, 64, 69, 73, 76, 81, 66, 69, 74, 73, 67, 71, 74, 79, 69, 73, 76, 81, 71, 74, 78, 81, 73, 76, 79, 81];
//let notePattern2 = [50, 50, 45, 45, 47, 47, 43, 43, 38, 38, 33, 33, 40, 40, 36, 36, 38, 38, 33, 33, 40, 40, 36, 36, 42, 42, 38, 38, 45, 45, 41, 41];
//let notePattern3 = [38, 38, 38, 38, 45, 45, 42, 42, 33, 33, 33, 33, 40, 40, 36, 36, 38, 38, 33, 33, 40, 40, 36, 36, 42, 42, 38, 38, 45, 45, 41, 41];
let notePattern1 = [];
let notePattern2 = [];
let notePattern3 = [];

// change tempo here
let intervalInSeconds = 0.9;

function p3_preload() {
  biomeTilesheet = loadImage("https://cdn.glitch.global/89835fff-f6de-48e0-bb2e-674d0cfb96b8/biomes.png?v=1717365582951");
  resourceTilesheet = loadImage("https://cdn.glitch.global/89835fff-f6de-48e0-bb2e-674d0cfb96b8/resources.png?v=1717311481532");
  overworldResourcesTilesheet = loadImage("https://cdn.glitch.global/89835fff-f6de-48e0-bb2e-674d0cfb96b8/overworld_resources.png?v=1716787355069")
  housesTilesheet = loadImage("https://cdn.glitch.global/89835fff-f6de-48e0-bb2e-674d0cfb96b8/houses.png?v=1717005572099")
  cropTilesheet = loadImage("https://cdn.glitch.global/89835fff-f6de-48e0-bb2e-674d0cfb96b8/crops.png?v=1717369137022");
}

function p3_setup() {
  // lead
  osc1 = new p5.Oscillator('square')
  osc1.freq(0)
  osc1.amp(amp1)
  osc1.start()
  
  // pad
  osc2 = new p5.Oscillator('sine')
  osc2.freq(0)
  osc2.amp(amp2)
  osc2.start()
  
  // bass
  osc3 = new p5.Oscillator('triangle')
  osc3.freq(0)
  osc3.amp(amp3)
  osc3.start()
  
  createPatterns()
  soundLoop = new p5.SoundLoop(onSoundLoop, intervalInSeconds);
  playSynth()
}

let worldSeed;
let player;
let playerSize = 32; // Size of the player square
let playerPosition; // Tile coordinates of the player

let biomeTilesheet;
let resourceTilesheet;
let overworldResourcesTilesheet;
let housesTilesheet;
let cropTilesheet;

let startMillis = 0;
let gathering = false;
const gatheringDuration = 1500; // 5 seconds in milliseconds
let wood = 10;
let stone = 10;
let seeds = 10;
let rocks = {}; // Object to track tiles with rocks
let trees = {}; // Object to track tiles with trees
let deadtrees = {}; // Object to track tiles with trees
let houses = {};
let rockPosition = {};
let treePosition = {};
let deadtreePosition = {};
let housesPosition = {};
let housesType = {};
let water = {};
let pathTiles = {};
let farmTiles = {};
let fences = {};
let stonePaths = {};
let crop = {};

let placingHouse = false;
let upgradeHouse = false;
let placingPathTiles = false;
let placingFarmTiles = false;
let placingFence = false;
let placingStonePaths = false;
let planting = false;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  createPatterns()
  
  startMillis = 0;
  gathering = false;
  wood = 10;
  stone = 10;
  seeds = 10;
  rocks = {}; // Object to track tiles with rocks
  trees = {}; // Object to track tiles with trees
  deadtrees = {}; // Object to track tiles with trees
  houses = {};
  rockPosition = {};
  treePosition = {};
  deadtreePosition = {};
  housesPosition = {};
  housesType = {};
  water = {};
  pathTiles = {};
  farmTiles = {};
  fences = {};
  stonePaths = {};
  crop = {};
}

function createPatterns(){
  notePattern1.length = 0;
  notePattern2.length = 0;
  notePattern3.length = 0;
  // select the key
  let n = 60 + XXH.h32(0, worldSeed)%12;
  let chord;
  // 0 = tonic, 1 = subdominant, 2 = dominant
  let prevchord = 0;
  
  for (let i = 0; i < 8; i++){
    if(i == 0){
      chord = getTonic(n);
      prevchord = 0;
    } else if(i == 7){
      chord = getDominant(n);
      prevchord = 2;
    } else {
      if (prevchord == 0){
        if(XXH.h32(i * 9999 + worldSeed * 1000 + prevchord * 2412, i * 42314 + worldSeed * 1000)%10 <= 1){
          chord = getTonic(n);
          prevchord = 0;
        } else if(XXH.h32(i * 9999 + worldSeed * 1000 + prevchord * 2412, i  * 24164 + worldSeed * 1000)%10 <= 8){
          chord = getSubdominant(n);
          prevchord = 1;
        } else {
          chord = getDominant(n);
          prevchord = 2;
        }
      } else if (prevchord == 1){
         if(XXH.h32(i  * 9999 + worldSeed * 1000 + prevchord * 2412, i * 21353 + worldSeed * 1000)%10 <= 1){
          chord = getSubdominant(n);
          prevchord = 1;
        } else {
          chord = getDominant(n);
          prevchord = 2;
        }
      } else {
        chord = getTonic(n);
        prevchord = 0;
      }
    }
    
    let melodyNotes = getMelodyNotes(chord, i);
    
    for (let j = 0; j < 4; j++){
      notePattern1.push(melodyNotes[j]);
      notePattern2.push(melodyNotes[j%3]-36);
      notePattern3.push(chord - 24);
    }
  }
  console.log(notePattern1);
}

function getMelodyNotes(chordRoot, times) {
  let notes = [];
  // Choose melody notes based on the chord
  // For simplicity, let's just go up a major scale starting from the chord root
  let scale = [-5, -3, 0, 2, 4, 7, 9, 12, 14];
  for (let i = 0; i < 4; i++) {
    let index = XXH.h32(i * worldSeed * 99999 % 89+ times*230%2, i * worldSeed * 2423 + times%2) % scale.length;
    notes.push(chordRoot + scale[index]);
  }
  return notes;
}

function getTonic(n){
  if (XXH.h32(worldSeed * 1000 + n * 21341, worldSeed * worldSeed * n * 241)%2 == 0){
    return n;
  }
  else {
    return n + 4
  }
}

function getSubdominant(n){
  if (XXH.h32(worldSeed * 1000 + n * 21341, worldSeed * worldSeed * n * 241)%3 == 0){
    return n + 2;
  }
  else if (XXH.h32(worldSeed * 1000 + n * 21341, worldSeed * worldSeed - n * 241)%3 == 1){
    return n + 5
  }
  else {
    return n + 9
  }
}

function getDominant(n){
  if (XXH.h32(worldSeed * 1000%4, worldSeed * worldSeed * n * 241)%2 == 0){
    return n + 7;
  }
  else{
    return n + 11;
  }
}

function playSynth() {
  userStartAudio();

  if (soundLoop.isPlaying) {
    soundLoop.stop();
  } else {
    // start the loop
    soundLoop.start();
  }
}

function onSoundLoop(timeFromNow) {
  let noteIndex1 = (soundLoop.iterations - 1) % notePattern1.length;
  let note1 = midiToFreq(notePattern1[noteIndex1]);
  osc1.freq(note1, 0.01)
  
  let noteIndex2 = (soundLoop.iterations - 1) % notePattern2.length;
  let note2 = midiToFreq(notePattern2[noteIndex2]);
  osc2.freq(note2, 0.01)
  
  let noteIndex3 = (soundLoop.iterations - 1) % notePattern3.length;
  let note3 = midiToFreq(notePattern3[noteIndex3]);
  osc3.freq(note3, 0.01)
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 32;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];

  // Calculate the player's neighboring tile positions
  let playerX = playerPosition[0];
  let playerY = playerPosition[1];
  let adjacentTiles = [
    [playerX, playerY],           // Player's current tile
    // Radius 1
    [playerX + 1, playerY],       // Right
    [playerX + 1, playerY + 1],   // Bottom-right
    [playerX, playerY + 1],       // Bottom
    [playerX - 1, playerY + 1],   // Bottom-left
    [playerX - 1, playerY],       // Left
    [playerX - 1, playerY - 1],   // Top-left
    [playerX, playerY - 1],       // Top
    [playerX + 1, playerY - 1],   // Top-right
    // Radius 2
    [playerX + 2, playerY],       // Right (2 tiles away)
    [playerX + 2, playerY + 1],
    [playerX + 2, playerY + 2],
    [playerX + 1, playerY + 2],   // Bottom-right (2 tiles away)
    [playerX, playerY + 2],       // Bottom (2 tiles away)
    [playerX - 1, playerY + 2],
    [playerX - 2, playerY + 2],
    [playerX - 2, playerY + 1],   // Bottom-left (2 tiles away)
    [playerX - 2, playerY],       // Left (2 tiles away)
    [playerX - 2, playerY - 1],
    [playerX - 2, playerY - 2],
    [playerX - 1, playerY - 2],   // Top-left (2 tiles away)
    [playerX, playerY - 2],       // Top (2 tiles away)
    [playerX + 1, playerY - 2],
    [playerX + 2, playerY - 2],
    [playerX + 2, playerY - 1]    // Top-right (2 tiles away)
  ];

  // Check if the player is next to any rock tiles
  let playerNextToRock = null;
  adjacentTiles.some(tile => {
    if (rocks[tile]) {
      playerNextToRock = tile;
      return true; // Stop iteration once a rock is found
    }
  });

  // Check if the player is next to any tree tiles
  let playerNextToTree = null;
  adjacentTiles.some(tile => {
    if (trees[tile]) {
      playerNextToTree = tile;
      return true; // Stop iteration once a tree is found
    }
  });
  let playerNextToDeadTree = null;
  adjacentTiles.some(tile => {
    if (deadtrees[tile]) {
      playerNextToDeadTree = tile;
      return true; // Stop iteration once a tree is found
    }
  });

  let actionTaken = false;
  // Check if the player is next to a rock or tree
  if ((playerNextToRock || playerNextToTree || playerNextToDeadTree) && !actionTaken) {
    // Check if the clicked tile or any of its adjacent tiles are rocks
    if (playerNextToRock && adjacentTiles.some(tile => rockPosition[tile] && tile[0] >= i - 1 && tile[0] <= i && tile[1] >= j - 1 && tile[1] <= j)) {
      // If it's a rock, perform your action (increment stone count, remove image, etc.)
      stone++;
      // Reset the rock status for the clicked tile and its adjacent tiles
      for (let x = i - 1; x <= i + 1; x++) {
        for (let y = j - 1; y <= j + 1; y++) {
          if (rocks[[x, y]]) {
            rocks[[x, y]] = false;
            rockPosition[[x, y]] = false;
            removeObstacle([x,y]);
          }
        }
      }
      startGathering();
      actionTaken = true;
    }

    // Check if the clicked tile or any of its adjacent tiles are trees
    if (playerNextToTree && adjacentTiles.some(tile => treePosition[tile] && tile[0] >= i - 1 && tile[0] <= i && tile[1] >= j - 1 && tile[1] <= j)) {
      // If it's a rock, perform your action (increment stone count, remove image, etc.)
      wood++;
      // Reset the rock status for the clicked tile and its adjacent tiles
      for (let x = i - 1; x <= i + 1; x++) {
        for (let y = j - 1; y <= j + 1; y++) {
          if (trees[[x, y]]) {
            trees[[x, y]] = false;
            treePosition[[x, y]] = false
            removeObstacle([x,y]);
          }
        }
      }
      startGathering();
      actionTaken = true;
    }

    if (playerNextToDeadTree && adjacentTiles.some(tile => deadtreePosition[tile] && tile[0] >= i - 1 && tile[0] <= i && tile[1] >= j - 1 && tile[1] <= j)) {
      // If it's a rock, perform your action (increment stone count, remove image, etc.)
      wood++;
      // Reset the rock status for the clicked tile and its adjacent tiles
      for (let x = i - 1; x <= i + 1; x++) {
        for (let y = j - 1; y <= j + 1; y++) {
          if (deadtrees[[x, y]]) {
            deadtrees[[x, y]] = false;
            deadtreePosition[[x, y]] = false;  
            removeObstacle([x,y]);
          }
        }
      }
      startGathering();
      actionTaken = true;
    }

    // If no action was taken, treat the click as a regular tile click
    if (!actionTaken) {
        click(key);
    }
  } else {
    click(key);
  }
}

function click(key) {
  // clicked fence
  if (!fences[key] && wood > 0) {
      if (placingFence) {
        if (!houses[key] && !rocks[key] && !trees[key] && !deadtrees[key] && !water[key] && !stonePaths[key]) {
          fences[key] = true;
          wood--;
        }
      }
    }
  else if (fences[key]){
    if (placingFence) {
      fences[key] = false;
      wood++;
      removeObstacle(key);
    }
  }   

  // clicked stone
  if (!stonePaths[key] && stone > 0) {
    if (placingStonePaths) {
      if (!houses[key] && !rocks[key] && !trees[key] && !deadtrees[key] && !water[key] && !fences[key]) {
        stonePaths[key] = true;
        stone--;
      }
    }
  }
  else if (stonePaths[key]){
    if (placingStonePaths) {
      stonePaths[key] = false;
      stone++;
    }
  }  

  // clicked farm tile
  if (!farmTiles[key]) {
      if (placingFarmTiles) {
        if (!houses[key] && !rocks[key] && !trees[key] && !deadtrees[key] && !water[key]) {
          farmTiles[key] = true;
        }
      }
  }
  else if (farmTiles[key]){
    if (placingFarmTiles) {
      farmTiles[key] = false;
    }
  } 
  
  // clicked farm tile + planting seed
  if (farmTiles[key] && (crop[key] === undefined || crop[key] === null || crop[key] === false)) {
    if (planting && seeds > 0) {
      let num = floor(random(12)); // randomize based on random
      // let num = XXH.h32("tile:" + key, worldSeed) % 4; // randomize based on hash
      let cropType = ""
      if (num === 0) {
        cropType = "carrot"
      }
      else if (num === 1) {
        cropType = "parsnip"
      }
      else if (num === 2) {
        cropType = "potato"
      }
      else if (num === 3) {
        cropType = "cauliflower"
      }
      else if (num === 4){
        cropType = "eggplant"
      }
      else if (num === 5) {
        cropType = "radish"
      }
      else if (num === 6) {
        cropType = "pumpkin"
      }
      else if (num === 7) {
        cropType = "strawberry"
      }
      else if (num === 8) {
        cropType = "tomato"
      }
      else if (num === 9) {
        cropType = "corn"
      }
      else if (num === 10) {
        cropType = "blueberry"
      }
      else if (num === 11) {
        cropType = "beans"
      }
      else {
        cropType = "carrot"
      }
      addCrop(key, cropType, 0);
      console.log("planting seed");
      console.log(cropType)
      seeds--;
    }
  } 
  else if (farmTiles[key] && crop[key] && planting) {
    if (crop[key] !== false) {
        crop[key] = false;
        seeds++;
        console.log("seed refund")
    }
  }


  // clicked path tile
  if (!pathTiles[key]) {
    if (placingPathTiles) {
      if (!houses[key] && !rocks[key] && !trees[key] && !deadtrees[key] && !water[key]) {
        pathTiles[key] = true;
      }
    }
  }
  else if (pathTiles[key]){
    if (placingPathTiles) {
      pathTiles[key] = false;
    }
  } 
  
  // clicked house
  if (!housesPosition[key] && !houses[key]) {
    if (placingHouse) {
        let canPlaceHouse = true;
        for (let xOffset = -4; xOffset < 8; xOffset++) {
            for (let yOffset = -4; yOffset < 8; yOffset++) {
                const adjacentKey = [key[0] + xOffset, key[1] - yOffset]; // Assuming y-axis increases downwards
                if (houses[adjacentKey] || rocks[adjacentKey] || trees[adjacentKey] || deadtrees[adjacentKey] || water[adjacentKey]) {   
                    // If any adjacent cell contains one of the objects, we can't place the house
                    canPlaceHouse = false;
                    break; // No need to check further, exit the loop
                }
            }
            if (!canPlaceHouse) {
                break; // No need to check further, exit the loop
            }
        }
        if (canPlaceHouse) {
            console.log('Can place house');
            housesPosition[key] = true;
            housesType[key] = 0;
        } else {
            console.log('Too Close to Another Object');
        }
    }
  }
  if (houses[key]) {
    if (placingHouse) {
      for (let i0 = -3; i0 < 4; i0++) {
        for (let j0 = -3; j0 < 4; j0++) {
          houses[[key[0] + i0, key[1] - j0]] = false;
          housesPosition[[key[0] + i0, key[1] - j0]] = false;
          housesType[[key[0] + i0, key[1] - j0]] = -1;
          removeObstacle([key[0] + i0, key[1] - j0]);
        }
      }
    }
  }

  // upgrade house
  if (houses[key]) {
    if (upgradeHouse) {
      for (let i0 = -3; i0 < 4; i0++) {
        for (let j0 = -3; j0 < 4; j0++) {
          if(housesPosition[[key[0] + i0, key[1] - j0]]){
            housesType[[key[0] + i0, key[1] - j0]]++;
            housesType[[key[0] + i0, key[1] - j0]] = housesType[[key[0] + i0, key[1] - j0]] % 4;
          }
        }
      }
    }
  }
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  noStroke();
  
  let biomeType = getBiomeType(i, j);
  let row = 0;
  let col = 0;

  if (XXH.h32("tile:" + [i, j], worldSeed) % 21 == 0) {
    col = 1;
  }
  else if (XXH.h32("tile:" + [i, j], worldSeed) % 22 == 0) {
    col = 2;
  }
  else if (XXH.h32("tile:" + [i, j], worldSeed) % 23 == 0) {
    col = 3;
  }
  
  // different noise for path and farm plots
  if ((XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) && (biomeType == "pathTile" || biomeType == "farmTile")) {
    col = 1;
  }
  else if ((XXH.h32("tile:" + [i, j], worldSeed) % 5 == 0) && (biomeType == "pathTile" || biomeType == "farmTile")) {
    col = 2;
  }
  else if ((XXH.h32("tile:" + [i, j], worldSeed) % 6 == 0) && (biomeType == "pathTile" || biomeType == "farmTile")) {
    col = 3;
  }

  // Determine row based on biome type
  switch (biomeType) {
    case "farmTile":
      row = 10;
      break;
    case "pathTile":
      row = 14;
      break;
    case "water":
      row = 12;
      break;
    case "desert":
      row = 6;
      break;
    case "grassland":
      row = 0;
      break;
    case "mountain":
      row = 3;
      break;
    case "snow":
      row = 9;
      break;
  }

  if (biomeType === "water") {
    water[[i, j]] = true;
  }

  image(biomeTilesheet, 0, 0, 33, 33, 32 * col, 32 * row, 32, 32);

  applyAutotiling(i, j);

  push();

  beginShape();
  vertex(-tw, -th); // Top-left corner
  vertex(tw, -th);  // Top-right corner
  vertex(tw, th);   // Bottom-right corner
  vertex(-tw, th);  // Bottom-left corner
  endShape(CLOSE);

  
  // image(biomeTilesheet, 0, 0, 32.75, 32.75, 32 * col, 32 * row, 32, 32);

  let n = clicks[[i - 1, j - 1]] | 0;
  if (n % 2 == 1) {
    // beginShape();
    // fill(240, 200, 255);
    
    // translate(-tw, -th)
    // vertex(0, 0); // Top-left corner
    // vertex(tw, 0); // Top-right corner
    // vertex(tw, th); // Bottom-right corner
    // vertex(0, th); // Bottom-left corner
    // endShape(CLOSE);
  }

  pop();
}


function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  translate(0, 0); // Center the tile around the cursor
  vertex(0, 0); // Top-left corner
  vertex(tw, 0); // Top-right corner
  vertex(tw, th); // Bottom-right corner
  vertex(0, th); // Bottom-left corner
  endShape(CLOSE);

  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  text("tile " + [i, j], tw/2, th/2); // Center the text within the tile
}


function p3_drawAfter(i, j) {
  // trees, stone
  let orCol = 0;
  let orRow = 0;
  let hCol = 0;
  let hRow = 0;

  // Check adjacent tiles
  // Check adjacent and diagonal tiles
  const directions = [
    // Radius 1
    [1, 0],   // Right
    [-1, 0],  // Left
    [0, 1],   // Down
    [0, -1],  // Up
    [1, 1],   // Diagonal: Bottom-right
    [-1, 1],  // Diagonal: Bottom-left
    [-1, -1], // Diagonal: Top-left
    [1, -1],  // Diagonal: Top-right
  
    // Radius 2
    [2, 0],   // Right
    [-2, 0],  // Left
    [0, 2],   // Down
    [0, -2],  // Up
    [2, 2],   // Diagonal: Bottom-right
    [-2, 2],  // Diagonal: Bottom-left
    [-2, -2], // Diagonal: Top-left
    [2, -2],  // Diagonal: Top-right
  
    // Additional combinations within radius 2
    [2, 1],   // Right, then Down
    [2, -1],  // Right, then Up
    [-2, 1],  // Left, then Down
    [-2, -1], // Left, then Up
    [1, 2],   // Down, then Right
    [-1, 2],  // Down, then Left
    [1, -2],  // Up, then Right
    [-1, -2], // Up, then Left
  ];
  
  if (XXH.h32("tile:" + [i, j], worldSeed) % 50 == 0 && getBiomeType(i, j) === "grassland") {
    let isValidPosition = true;
    for (let [dx, dy] of directions) {
        const x = i + dx;
        const y = j + dy;
        if (treePosition[[x, y]] || deadtreePosition[[x, y]] || rockPosition[[x, y]] || getBiomeType(x, y) === "water") {
            isValidPosition = false;
            break; // Exit loop early since we found an adjacent or diagonal tile occupied by a tree
        }
    }
    if (isValidPosition) {
        treePosition[[i, j]] = true;
    } else {
        treePosition[[i, j]] = false; // Reset current tile to false if adjacent or diagonal tile is occupied by a tree
    }
  }
  else if (XXH.h32("tile:" + [i, j], worldSeed) % 51 == 0 && getBiomeType(i, j) === "desert") {
    let isValidPosition = true;
    for (let [dx, dy] of directions) {
        const x = i + dx;
        const y = j + dy;
        if (treePosition[[x, y]] || deadtreePosition[[x, y]] || rockPosition[[x, y]] || getBiomeType(x, y) === "water") {
            isValidPosition = false;
            break; // Exit loop early since we found an adjacent or diagonal tile occupied by a deadtree
        }
    }
    if (isValidPosition) {
        deadtreePosition[[i, j]] = true;
    } else {
        deadtreePosition[[i, j]] = false; // Reset current tile to false if adjacent or diagonal tile is occupied by a deadtree
    }
  }
  else if (XXH.h32("tile:" + [i, j], worldSeed) % 52 == 0 && getBiomeType(i, j) === "mountain") {
    let isValidPosition = true;
    for (let [dx, dy] of directions) {
        const x = i + dx;
        const y = j + dy;
        if (treePosition[[x, y]] || deadtreePosition[[x, y]] || rockPosition[[x, y]] || getBiomeType(x, y) === "water") {
            isValidPosition = false;
            break; // Exit loop early since we found an adjacent or diagonal tile occupied by a rock
        }
    }
    if (isValidPosition) {
        rockPosition[[i, j]] = true;
    } else {
        rockPosition[[i, j]] = false; // Reset current tile to false if adjacent or diagonal tile is occupied by a rock
    }
  }

  if (rockPosition[[i, j]] === true) {
    if (rocks[[i, j]] !== false) {
      orCol = 2;
      orRow = 0;
      for (let i0 = 0; i0 < 2; i0++) {  // Loop to cover 2x2 area
          for (let j0 = 0; j0 < 2; j0++) {  // Loop to cover 2x2 area
              rocks[[i + i0, j + j0]] = true;
          }
      }
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32); // This is fine, assuming it's just a visual representation
    }
    else {
      orCol = 0;
      orRow = 1;
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32);
    }
  }

  if (treePosition[[i, j]] === true) {
    if (trees[[i, j]] !== false) {
      orCol = 0;
      orRow = 0;
      for (let i0 = 0; i0 < 2; i0++) {  // Loop to cover 2x2 area
          for (let j0 = 0; j0 < 2; j0++) {  // Loop to cover 2x2 area
              trees[[i + i0, j + j0]] = true;
          }
      }
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32); // This is fine, assuming it's just a visual representation
    }
    else {
      orCol = 0;
      orRow = 1;
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32);
    }
  }

  if (deadtreePosition[[i, j]] === true) {
    if (deadtrees[[i, j]] !== false) {
      orCol = 1;
      orRow = 0;
      for (let i0 = 0; i0 < 2; i0++) {  // Loop to cover 2x2 area
          for (let j0 = 0; j0 < 2; j0++) {  // Loop to cover 2x2 area
              deadtrees[[i + i0, j + j0]] = true;
          }
      }
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32); // This is fine, assuming it's just a visual representation
    }
    else {
      orCol = 0;
      orRow = 1;
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32);
    }
  }

  if (fences[[i, j]] === true) {
    if (fences[[i, j]] !== false) {
      let col = 6;
      let row = 13;
      image(biomeTilesheet, 0, 0, 32.75, 32.75, 32 * col, 32 * row, 32, 32);
    }
    else {
      let col = 0;
      let row = 1;
      image(biomeTilesheet, 0, 0, 32.75, 32.75, 32 * col, 32 * row, 32, 32);
    } 
  }

  if (stonePaths[[i, j]] === true) {
    if (stonePaths[[i, j]] !== false) {
      let col = 10;
      let row = 13;
      image(biomeTilesheet, 0, 0, 32.75, 32.75, 32 * col, 32 * row, 32, 32);
    }
    else {
      let col = 0;
      let row = 1;
      image(biomeTilesheet, 0, 0, 32.75, 32.75, 32 * col, 32 * row, 32, 32);
    }
  }
  
  // plant crop
  let cropInfo = getCrop([i, j]);
  if (cropInfo !== undefined) {
    if (crop[[i, j]] !== false) {
      let col;
      let row;
      if (cropInfo.cropTypeID === "carrot") {
        col = 3;
        row = 0;
      }
      else if (cropInfo.cropTypeID === "parsnip") {
        col = 3;
        row = 1;
      }
      else if (cropInfo.cropTypeID === "potato") {
        col = 3;
        row = 2;
      }
      else if (cropInfo.cropTypeID === "cauliflower") {
        col = 3;
        row = 3;
      }
      else if (cropInfo.cropTypeID === "eggplant"){
        col = 3;
        row = 4;
      }
      else if (cropInfo.cropTypeID === "radish") {
        col = 3;
        row = 5;
      }
      else if (cropInfo.cropTypeID === "pumpkin") {
        col = 3;
        row = 6;
      }
      else if (cropInfo.cropTypeID === "strawberry") {
        col = 3;
        row = 7;
      }
      else if (cropInfo.cropTypeID === "tomato") {
        col = 7;
        row = 0;
      }
      else if (cropInfo.cropTypeID === "corn") {
        col = 7;
        row = 1;
      }
      else if (cropInfo.cropTypeID === "blueberry") {
        col = 7;
        row = 2;
      }
      else if (cropInfo.cropTypeID === "beans") {
        col = 7;
        row = 3;
      }

      if (col === 7) {
        image(cropTilesheet, 0, -40, 32, 64, 32 * col, 64 * row, 32, 64);
      }
      else {
        image(cropTilesheet, 0, -8, 32, 32, 32 * col, 32 * row, 32, 32);
      }
    }
    else {
      let col = 0;
      let row = 1;
      image(biomeTilesheet, 0, 0, 32, 32, 32 * col, 32 * row, 32, 32);
    }
  }

  if (housesPosition[[i, j]] === true) {
    hCol = 1;
    hRow = 1;
    for (let i0 = 0; i0 < 4; i0++) {
      for (let j0 = 0; j0 < 4; j0++) {
        houses[[i + i0, j - j0]] = true;
        rocks[[i + i0, j - j0]] = false;
        trees[[i + i0, j - j0]] = false;
        deadtrees[[i + i0, j - j0]] = false;
        rockPosition[[i + i0, j - j0]] = false;
        treePosition[[i + i0, j - j0]] = false;
        deadtreePosition[[i + i0, j - j0]] = false;
      }
    }
    
    drawHouse(housesType[[i, j]]);  
  }

  else if (housesPosition[[i, j]] !== true){
    drawHouse(-1)
  }

  applyFenceAutotiling(i, j);

}

// draws the bottom half of the rock and trees again
function p3_drawAfter2(i, j) {
  // trees, stone
  let orCol = 0;
  let orRow = 0;
  let hCol = 0;
  let hRow = 0;

  if (rockPosition[[i, j]] === true) {
    if (rocks[[i, j]] !== false) {
      orCol = 2;
      orRow = 0;
      image(overworldResourcesTilesheet, 0, 0, 64, 32, orCol * 32, orRow * 32, 32, 16);
    }
    else {
      orCol = 0;
      orRow = 1;
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32);
    }
  }

  if (treePosition[[i, j]] === true) {
    if (trees[[i, j]] !== false) {
      orCol = 0;
      orRow = 0;
      image(overworldResourcesTilesheet, 0, 0, 64, 32, orCol * 32, orRow * 32, 32, 16);
    }
    else {
      orCol = 0;
      orRow = 1;
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32);
    }
  }

  if (deadtreePosition[[i, j]] === true) {
    if (deadtrees[[i, j]] !== false) {
      orCol = 1;
      orRow = 0;
      image(overworldResourcesTilesheet, 0, 0, 64, 32, orCol * 32, orRow * 32, 32, 16);
    }
    else {
      orCol = 0;
      orRow = 1;
      image(overworldResourcesTilesheet, 0, 0, 64, 64, orCol * 32 , orRow * 32, 32, 32);
    }  
  }
  
  // plant crop if player on tile
  let cropInfo = getCrop([i, j]);
  if (cropInfo !== undefined) {
    if (crop[[i, j]] !== false && (playerPosition[0] === i && playerPosition[1] === j - 1)) {
      let col;
      let row;
      if (cropInfo.cropTypeID === "carrot") {
        col = 3;
        row = 0;
      }
      else if (cropInfo.cropTypeID === "parsnip") {
        col = 3;
        row = 1;
      }
      else if (cropInfo.cropTypeID === "potato") {
        col = 3;
        row = 2;
      }
      else if (cropInfo.cropTypeID === "cauliflower") {
        col = 3;
        row = 3;
      }
      else if (cropInfo.cropTypeID === "eggplant"){
        col = 3;
        row = 4;
      }
      else if (cropInfo.cropTypeID === "radish") {
        col = 3;
        row = 5;
      }
      else if (cropInfo.cropTypeID === "pumpkin") {
        col = 3;
        row = 6;
      }
      else if (cropInfo.cropTypeID === "strawberry") {
        col = 3;
        row = 7;
      }
      else if (cropInfo.cropTypeID === "tomato") {
        col = 7;
        row = 0;
      }
      else if (cropInfo.cropTypeID === "corn") {
        col = 7;
        row = 1;
      }
      else if (cropInfo.cropTypeID === "blueberry") {
        col = 7;
        row = 2;
      }
      else if (cropInfo.cropTypeID === "beans") {
        col = 7;
        row = 3;
      }

      if (col === 7) {
        image(cropTilesheet, 0, -40, 32, 64, 32 * col, 64 * row, 32, 64);
      }
      else {
        image(cropTilesheet, 0, -8, 32, 32, 32 * col, 32 * row, 32, 32);
      }
    }
    else {
      let col = 0;
      let row = 1;
      image(biomeTilesheet, 0, 0, 32, 32, 32 * col, 32 * row, 32, 32);
    }
  }
}

function applyAutotiling(i, j) {
  // First pass to apply autotiling
  let autotileCoords = getAutotileCoords(i, j);
  if (autotileCoords) {
    for (let i = 0; i < autotileCoords.length; i++) {
      let [col, row] = autotileCoords[i];
      image(biomeTilesheet, 0, 0, 33, 33, 32 * col, 32 * row, 32, 32);
    }
  }
}

function applyFenceAutotiling(i, j) {
  if (fences[[i, j]]) {
    let top = fences[[i, j - 1]];
    let bottom = fences[[i, j + 1]];
    let left = fences[[i - 1, j]];
    let right = fences[[i + 1, j]];

    let tileNeighbors = [];

    if (left) {
      tileNeighbors.push([7, 12]);
    } 

    if (right) {
      tileNeighbors.push([5, 12]);
    }

    if (bottom) {
      tileNeighbors.push([7, 14]);
    }
    
    if (top) {
      tileNeighbors.push([5, 14]);
    } 

    if (top && bottom) {
      tileNeighbors.push([7, 14]);
    }

    // Draw the appropriate tiles based on the tileNeighbors array
    for (let [col, row] of tileNeighbors) {
      image(biomeTilesheet, 0, 0, 32.75, 32.75, 32 * col, 32 * row, 32, 32);
    }
  }
}

function getBiomeType(i, j) {
  let noiseVal = noise(i * 0.05, j * 0.05);
  if (farmTiles[[i, j]]) {
    return "farmTile";
  } else if (pathTiles[[i, j]]) {
    return "pathTile";
  } else if (noiseVal < 0.2) {
    return "water";
  } else if (noiseVal < 0.4) {
    return "desert";;
  } else if (noiseVal < 0.6) {
    return "grassland";
  } else if (noiseVal < 0.8) {
    return "mountain";
  } else {
    return "grassland";
  }
}

function getAutotileCoords(i, j) {
  let neighbors = {
    topLeft: getBiomeType(i - 1, j - 1),
    top: getBiomeType(i, j - 1),
    topRight: getBiomeType(i + 1, j - 1),
    left: getBiomeType(i - 1, j),
    right: getBiomeType(i + 1, j),
    bottomLeft: getBiomeType(i - 1, j + 1),
    bottom: getBiomeType(i, j + 1),
    bottomRight: getBiomeType(i + 1, j + 1),
  };

  let tileNeighbors = [];

  if (getBiomeType(i, j) !== "grassland") {
    if (neighbors.top === "grassland") {
      tileNeighbors.push([6, 0]);
    } 
    
    if (neighbors.bottom === "grassland") {
      tileNeighbors.push([6, 2]);
    } 
    
    if (neighbors.left === "grassland") {
      tileNeighbors.push([5, 1]);
    } 
    
    if (neighbors.right === "grassland") {
      tileNeighbors.push([7, 1]);
    }
  }

  if (getBiomeType(i, j) !== "desert") {
    if (neighbors.top === "desert" && getBiomeType(i, j) !== "grassland") {
      tileNeighbors.push([6, 6]);
    } 
    
    if (neighbors.bottom === "desert" && getBiomeType(i, j) !== "grassland") {
      tileNeighbors.push([6, 8]);
    } 
    
    if (neighbors.left === "desert" && getBiomeType(i, j) !== "grassland") {
      tileNeighbors.push([5, 7]);
    } 
    
    if (neighbors.right === "desert" && getBiomeType(i, j) !== "grassland") {
      tileNeighbors.push([7, 7]);
    }
  }

  if (getBiomeType(i, j) !== "mountain") {
    if (neighbors.top === "mountain" && getBiomeType(i, j) !== "grassland" && getBiomeType(i, j) !== "desert") {
      tileNeighbors.push([6, 3]);
    } 
    
    if (neighbors.bottom === "mountain" && getBiomeType(i, j) !== "grassland" && getBiomeType(i, j) !== "desert") {
      tileNeighbors.push([6, 5]);
    } 
    
    if (neighbors.left === "mountain" && getBiomeType(i, j) !== "grassland" && getBiomeType(i, j) !== "desert") {
      tileNeighbors.push([5, 4]);
    } 
    
    if (neighbors.right === "mountain" && getBiomeType(i, j) !== "grassland" && getBiomeType(i, j) !== "desert") {
      tileNeighbors.push([7, 4]);
    }
  }
  return tileNeighbors;
}

function getResourceInfo() {
  return [wood, stone, seeds, gathering, rocks, trees, deadtrees, houses, water, fences];
}

function startGathering() {
  startMillis = millis();
  gathering = true;
}

function updateGathering() {
  if (gathering) {
    const elapsedTime = millis() - startMillis;
    if (elapsedTime >= gatheringDuration) {
      gathering = false;
    }
  }
}

function drawHouse(houseType) {
  let col = 1;
  let row = 1

  if (houseType === 0) {
    col = 1;
    row = 1;
    image(housesTilesheet, 0, -32 * 3, 128, 128, col * 32 , row * 32, 32, 32);
  }
  else if (houseType === 1) {
    col = 0;
    row = 0;
    image(housesTilesheet, 0, -32 * 3, 128, 128, col * 32 , row * 32, 32, 32);
  }
  else if (houseType === 2) {
    col = 0;
    row = 1;
    image(housesTilesheet, 0, -32 * 3, 128, 128, col * 32 , row * 32, 32, 32);
  }
  else if (houseType === 3) {
    col = 1;
    row = 0;
    image(housesTilesheet, 0, -32 * 3, 128, 128, col * 32 , row * 32, 32, 32);
  }
  else {
    image(housesTilesheet, 0, 0, 1, 1, 0, 0, 1, 1);
  }
}

// Function to add a crop with a given key, cropType, and stage
function addCrop(key, cropType, growthStage) {
  crop[key] = { 
    cropTypeID: cropType, 
    growthStageID: growthStage
  };
}

function getCrop(key) {
  let cropInfo = crop[key];
  if (cropInfo) {
    return {
      cropTypeID: cropInfo.cropTypeID,
      growthStageID: cropInfo.growthStageID,
    };
  }
  else {
    return undefined;
  }
}

function action(newState) {
  placingHouse = false;
  upgradeHouse = false;
  placingPathTiles = false;
  placingFarmTiles = false;
  placingFence = false;
  placingStonePaths = false
  planting = false;

  if (newState === 'placingHouse') {
    placingHouse = true;
  } else if (newState === 'upgradeHouse') {
    upgradeHouse = true;
  } else if (newState === 'placingPathTiles') {
    placingPathTiles = true;
  } else if (newState === 'placingFarmTiles') {
    placingFarmTiles = true;
  } else if (newState === 'placingFence') {
    placingFence = true;
  } else if (newState === 'placingStonePaths') {
    placingStonePaths = true;
  } else if (newState === 'planting') {
    planting = true;
  }
}