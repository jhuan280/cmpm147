// project.js - purpose and description here

// This project was inspired off the meme trend that was popular back in the late 2010's where various news articles would display headlines featuring 
// a template along the lines of, "Florida Man (inserts crazy headline)". 
// Example of a Florida Man article:
// https://www.cbsnews.com/miami/news/drunk-florida-man-crashes-lawn-mower-police-car/

// Author: Jackie Huang
// Date: 4/7/2024

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
  }
}

function main() {
  // // create an instance of the class
  // let myInstance = new MyProjectClass("value1", "value2");

  // // call a method on the instance
  // myInstance.myMethod();

  const fillers = {
    location: ["Arby's", "Wendy's", "KFC", "McDonald's", "Pizza Hut", "Taco Bell"],
    weapon: ["Alligator", "Beaver", "Goat", "Monkey", "Horse", "Bird"],
    name: ["Ronald", "Jim", "Bob", "Bill", "Steve", "Henry"],
    mod: ["Fire", "Ice", "Lightning", "Sharpness", "Life Steal", "Looting"],
    motive: ["was hungry", "was angry", "was impatient in the drive-thru", "was depressed", "was jealous of other people's orders", "allowed his intrusive thoughts to take over"],
    date: ["June 26, 2024", "Dec 21, 2024", "Apr 14, 2024", "Dec 10, 2024", "May 31, 2024", "May 7, 2024"],
    city: ["Miami", "Orlando", "Tampa", "Tallahassee", "Jacksonville", "Fort Lauderdale"],
    
    
    // adventurer: ["My dude", "Bro", "WesBot", "Adventurer", "Traveller", "Fellow", "Citizen", "Ashen One", "Dragonborn", "Cool person", "Tarnished", "勇者", "$adventurer and $adventurer", "$adventurer, $adventurer, and $adventurer", "Geoff"],
    // pre: ["Fra", "Tro", "Gre", "Pan", "Ast", "Ara"],
    // post: ["gria", "ston", "gott","-on-the-lee", "ora", "Ara", "uwu"],
    // people: ["kindly", "meek", "brave", "wise", "sacred", "cherished", "honored", "forgotten", "apathetic", "mystic", "orca", "帥氣"],
    // item: ["axe", "staff", "book", "cloak", "shield", "club", "sword", "magic gloves", "galvel", "fists", "mace", "potato"],
    // num: ["two", "three", "eleven", "so many", "too many", "an unsatisfying number of", "barely any", "an unspecified amount of", "surely a satisfactory number of"],
    // looty: ["gleaming", "valuable", "esteemed", "rare", "exalted", "scintillating", "kinda gross but still usefull", "complete garbage"],
    // loots: ["coins", "chalices", "ingots", "hides", "victory points", "gems","scrolls", "bananas", "noodles", "goblins", "CS Majors", "college credits"],
    // baddies: ["orcs", "glubs", "fishmen", "cordungles", "mountain trolls", "college professors", "dragon", "evil $adventurer", "agents of chaos"],
    // message: ["call", "txt", "post", "decree", "shoutz", "tweets", "choiche", "hearkens", "harkening", "harkenening", "harkenenening", "...wait, no! Come back", "Watermelon"],
    
  };
  
  const template = `
  
  Attention citizens of America, we bring to you live, ground-breaking news about a local Florida Man. On $date, local Florida Man, $name, has been accused
  
  of attacking a cashier in the drive-thru of a local $city-based $location with a/an $weapon, which looked to be enhanced by $mod; with the
  
  main motive being because he $motive.
  
  `;
  
  // const template = `$adventurer, heed my $message!
  
  // I have just come from $pre$post where the $people folk are in desperate need. Their town has been overrun by $baddies. You must venture forth at once, taking my $item, and help them.
  
  // It is told that the one who can rescue them will be awarded with $num $looty $loots. Surely this must tempt one such as yourself!
  // `;
  
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    box.innerText = story;
  }
  
  /* global clicker */
  clicker.onclick = generate;
  
  generate();


}

// let's get this party started - uncomment me
main();