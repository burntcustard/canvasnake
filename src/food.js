
import {check as checkCollision} from './collision.js';


const type = {
    plus: {
        name: "plus",
        description: "Speeds up the game",
        color: "orangered",
        char: 'P',
        isFood: true
    },
    minus: {
        name: "minus",
        description: "Slows the game",
        color: "green",
        char: 'M',
        isFood: true
    },
    banana: {
        name: "banana",
        description: "Spawns 3 more foods simultaneously",
        color: "gold",
        char: 'B',
        isFood: true
    }
};


//╔══════════════════════════════╗//
//║        ■▀                    ║//
//║   ▄██▄█▄█▄          ╔═════╗  ║//
//║  ██████████    ▀▄   ║     ║  ║//
//║  █████████  ■■■■■█  ║   ■ ║  ║//
//║  ██████████    ▄▀   ╚═════╝  ║//
//║   ▀██▀▀██▀                   ║//
//╚══════════════════════════════╝//
export function create(amount, game) {
    var combinedScore = 0, // Current score of all the players added together.
        snakeI, snakeJ,    // Counters to loop through snakes.
        foodType,         // Type of food to be added.
        foodNumber,       // Random int between 1 and combinedScore.
        validFood,         // Boolean to check if the food is being created in a sensible location.
        newFood,           // Food object containing x,y coords and food type.
        failedFoodCount;   // Number of times the food was created in a stupid place.

    for (snakeI = 0; snakeI < game.snakes.length; snakeI++) {
        combinedScore = combinedScore + game.snakes[snakeI].score;
        //console.log("Combined score = " + combinedScore);
    }

    while (amount--) {
        // Default food is the "Plus speed" food:
        foodType = type.plus;
        // If it's not the first food of the game (i.e. a player has at least one point),
        // maybe change the food being created to "Minus speed" or "Banana" food:
        if (combinedScore > 0) {
            foodNumber = (Math.ceil(Math.random() * combinedScore));
            if (foodNumber % 5 === 0) { foodType = type.minus; }
            if (foodNumber % 7 === 0) { foodType = type.banana; }
            if (game.settings.debug) {
              console.log("Created " + foodType + " food with number: " + foodNumber + " at position: " + game.foodArray.length);
            }
        }

      // Place food in a random grid location on the canvas:
        do {
            validFood = true;
            newFood = Object.assign({}, foodType);
            newFood.x = Math.floor(Math.random() * game.board.w);
            newFood.y = Math.floor(Math.random() * game.board.h);
            for (snakeJ = 0; snakeJ < game.snakes.length; snakeJ++) {
                if (checkCollision(newFood.x, newFood.y, game.snakes[snakeJ].coords)) {
                    if (game.settings.debug) { console.log("Tried to put a food in a snake, whoops!"); }
                    validFood = false;
                }
            }
            if (validFood) {  // If it's not inside a snake, check if inside another food
                if (checkCollision(newFood.x, newFood.y, game.foodArray)) {
                    if (game.settings.debug) { console.log("Tried to put a food in a food, whoops!"); }
                    validFood = false;
                }
            }
            if (!validFood) { failedFoodCount++; }
            if (failedFoodCount > 99) { throw new Error("Failed to create new food. (╯°□°）╯︵ ┻━┻"); }
        } while (!validFood);

        // Put the newly created food element into the array of foods:
        game.foodArray.push(newFood);
    }
}



/**
* Makes eating a food do stuff, changes snakes speed & score, removes old food, create
* 3 foods if a banana food was nommed, or creates 1 food if there are no more foods left.
* @param {Object} snake - The hungry hungry snake.
* @param {Char}   food  - The type of food that's being eaten.
*/
export function eat(snake, food, game) {
    
    //console.log(food);

    var noOfNewFoods = 0; // The amount of new foods that's going to be added.

    switch (food.char) {
      case 'P': snake.speed = Math.round(snake.speed - snake.speed / 8); break;  // Speed up the snake.
      case 'M': snake.speed = Math.round(snake.speed + snake.speed / 4); break;  // Slow down the snake.
      case 'B': noOfNewFoods = +3; break;                                        // Add 3 foods to the board.
      default : throw new Error(
        snake.name + " tried to eat a " + food.name + " food, but doesn't really know what to do with it ¯\_(ツ)_/¯"
      );
    }

    // Add 1 to the snakes score (no matter what food was nommed):
    snake.score++;

    // Reset movesSinceNommed counter:
    snake.movesSinceNommed = 0;

    // Remove eaten food from the game:
    // game.nommedFood may or may not exist so er that needs sorting
    game.foodArray.splice(food, 1);

    // If there's no more food left on the board, and you're not banana'ing, spawn +1 food
    if ((game.foodArray.length === 0) && (noOfNewFoods === 0)) { noOfNewFoods++; }

    // Create the number of foods that was rather complicated-ly decided on:
    create(noOfNewFoods, game);

}
