// project.js - purpose and description here
// Author: Jackie Huang 
// Date: 4/19/2024

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
/* exported getInspirations, initDesign, renderDesign, mutateDesign */

let img; // Declare a global variable to store the loaded image

function getInspirations() {
  return [
    {
      name: "Google Chrome", 
      assetUrl: "https://cdn.glitch.global/136a247e-600f-4f6a-b511-bceadea33ab8/googlechrome.png?v=1715042384758",
      credit: "Google, 2008"
    },
    {
      name: "Microsoft Edge", 
      assetUrl: "https://cdn.glitch.global/136a247e-600f-4f6a-b511-bceadea33ab8/microsoftedge.png?v=1715042360591",
      credit: "Microsoft, 2015"
    },
    {
      name: "Bing", 
      assetUrl: "https://cdn.glitch.global/136a247e-600f-4f6a-b511-bceadea33ab8/bing.png?v=1715042374114",
      credit: "Microsoft Bing, 2009"
    },
    {
      name: "Fire Fox", 
      assetUrl: "https://cdn.glitch.global/136a247e-600f-4f6a-b511-bceadea33ab8/firefox.png?v=1715042379955",
      credit: "Mozilla Corporation, 2004"
    },
    {
      name: "Spotify", 
      assetUrl: "https://cdn.glitch.global/136a247e-600f-4f6a-b511-bceadea33ab8/spotify.png?v=1715144691229",
      credit: "Microsoft, 2015"
    },
    {
      name: "Discord", 
      assetUrl: "https://cdn.glitch.global/136a247e-600f-4f6a-b511-bceadea33ab8/discord.png?v=1715050203009",
      credit: "Discord Inc, 2005"
    },
  ];
}

function initDesign(inspiration) {
  let canvasWidth, canvasHeight;

  // Adjust the scaling factor for different images
  if (inspiration.name === "Fire Fox") {
    canvasWidth = inspiration.image.width / 13;
    canvasHeight = inspiration.image.height / 13;
  } else if (inspiration.name === "Bing") {
    canvasWidth = inspiration.image.width / 6;
    canvasHeight = inspiration.image.height / 6;
  } else {
    canvasWidth = inspiration.image.width / 8;
    canvasHeight = inspiration.image.height / 8;
  }
  $(".caption").text(inspiration.credit); // Set the caption text
  resizeCanvas(canvasWidth, canvasHeight);

  // add the original image to #original
  const imgHTML = `<img src="${inspiration.assetUrl}" style="width:${canvasWidth}px;">`
  $('#original').empty();
  $('#original').append(imgHTML);
  
  let design = {
    bg: 128,
    fg: []
  }
  
  // Increase the number of shapes to be added
  for(let i = 0; i < 800; i++) { // Adjust the loop count as needed
    design.fg.push({
      x: random(width),
      y: random(height),
      w: random(width/2, width), // Adjust the range for larger width
      h: random(height/2, height), // Adjust the range for larger height
      fill: random(255)
    });
  }

  // Load the image
  img = loadImage(inspiration.assetUrl);
  
  return design;
}




function renderDesign(design, inspiration) {
  // Clear the canvas
  clear();

  // Loop through each shape in the design
  for (let shape of design.fg) {
    // Get the color from the image at the current shape position
    let imgColor = img.get(shape.x * 8, shape.y * 8);

    // Set fill color using the image color
    fill(imgColor);

    // Set stroke color with reduced opacity
    stroke(0, 50); // Adjust alpha value (50 for example) to set the opacity

    // Randomly choose to draw either ellipse, rectangle, or triangle
    let randomChoice = random(1);
    if (randomChoice < 0.33) { // 33% chance for each shape
      // Draw ellipse
      ellipse(shape.x, shape.y, shape.w, shape.h);
    } else if (randomChoice < 0.66) { // 33% chance for each shape
      // Draw rectangle
      rect(shape.x - shape.w / 2, shape.y - shape.h / 2, shape.w, shape.h);
    } else {
      // Draw triangle
      triangle(shape.x - shape.w / 2, shape.y + shape.h / 2,
               shape.x + shape.w / 2, shape.y + shape.h / 2,
               shape.x, shape.y - shape.h / 2);
    }
  }
}


function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);
  for(let shape of design.fg) {
    shape.fill = mut(shape.fill, 0, 255, rate);
    shape.x = mut(shape.x, 0, width, rate);
    shape.y = mut(shape.y, 0, height, rate);
    shape.w = mut(shape.w, 0, width/2, rate);
    shape.h = mut(shape.h, 0, height/2, rate);
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}






// let's get this party started - uncomment me
//main();