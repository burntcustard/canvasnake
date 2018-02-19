
import * as food from './food.js';
import * as input from './input.js';
import newGame from './newGame.js';
import { check as checkCollision } from './collision.js';
import { render } from './view.js';
import { Snake as Snake, order as orderSnakes } from './snake.js';
import * as ai from './ai.js';
import { snakeInfo as snakeInfo } from './infoString.js';



var canvasnakeRunning = false;



function canvasnake() {

  // Global-ish variables (too many?):

    var game = {

        // Game settings:
        settings: {
            debug: false,        // Enable/disables console log messages.
            autoRepeat:  false,  // Restarts the game automatically when gameover occurs.
            gameMode: "singleplayerVsAI" // Initial gamemode is 1 human player against 1 AI.
        },

        // Game state variables:
        state: {
            finalUpdate: false,  // Becomes true when all snakes are dead.
            gameOver:    false,
            paused:      false
        },

        // Customizable user interface variables for bigger font etc.
        ui: {
            textSize: 16,  // Base font size. Large font is "textSize * 2"
            cellSize: 15,  // Diameter of square cell in grid in pixels
            scale: 1,      // "Scale factor" used to scale (1x, 2x, size etc.)
            bgColor: "white",
            textColor: "orangered",
            redrawEnd: false  // Used to indicate that the game over message should be redrawn.
        },

        results: {
            winner: null,
            draw: false
        },


        // Other stuff. TODO: Cleanup into catagories if needed
        step: false,  // Runs one "turn" (all players move one cell) then pauses.
        updateInterval: 0, // How frequently the turns occur in ms (lower number = faster).
        board: {w: 0, h: 0}, // Current grid/board setup is 0 to 29 (inclusive), so 30x30

        highScore: 0,   // Holds the highest score accomplished on that PC/web browers.
        snakes: [],     // Array of snake objects that are on the board (human player snakes and/or AI snakes).
        foodArray: [],  // Array of foods that are on the board
        debugSquares: [],

        gameLoop: null,

        wins: {AI1: 0, AI2: 0}

    };


  var

    //gameLoop, // Holds the looping function that repeats.
    canvas = document.getElementById("canvasnake"),
    ctx = canvas.getContext("2d");

    //nommedFood; // The index of the food that's been eaten in the foodArray.

    game.ui.canvas = canvas;
    game.ui.ctx = ctx;



  game.mainLoopFunc = function mainLoop() {

  // - INPUT - //

    var //input,    // Human key / touch input string.
        snakeI,   // Counter.
        snakeJ,   // Counter.
        snake,    // Current snake being examined.
        //hwTouchX, // Magic number to make touch controls work.
        nx, ny,   // "Next x & y" variables for storing new location of a snakes head.
        //w = canvas.width,
        //h = canvas.height,
        snakeOrder = orderSnakes(game.snakes);

    // Clear debug squares array so they can be repopulated this turn:
    if (!game.step) { game.debugSquares = []; }

    // This actually creates a listener function which then does something with any inputs that are detected:
    input.get(game, document, canvas);  // TODO: Figure out if whole document has to be used?)

      if (!game.state.gameOver || game.ui.redrawEnd) {

      // - UPDATE - //

      if (!game.state.paused) {

        game.debugSquares = [];

        // Effectively each snake "taking it's turn".
        // The BIGGER SNAKE will update first and win in a head-on collision.
        for (snakeI = 0 ; snakeI < snakeOrder.length; snakeI++) {
          snake = game.snakes[snakeOrder[snakeI]];

          // If the snake has a direction (game started?)
          if ((snake.direction) && (snake.dead === false)) {

            if (game.settings.debug) { console.log("Updating " + snake.name + "'s snake"); }

            // Update AI (even though it's done for both snakes at end of round?)
            ai.update(snake, game);

            // Pick direction for AI controlled snakes
            if ((snake.ai.difficulty !== "no AI" && snake.ai.dizzy === false) &&
                !(snake.ai.alone && snake.winning && snake.ai.suicideOnWin)) {
              ai.chooseDirection(snake, game);
            }

            // Update which way the snake is going:
            snake.updateDirection();

            // Put position of head in "next x & y" variables:
            nx = snake.coords[0].x;
            ny = snake.coords[0].y;

            // Move head around:
            switch (snake.direction) {
              case 'N': ny--; break;
              case 'E': nx++; break;
              case 'S': ny++; break;
              case 'W': nx--; break;
            }

            // Increment how many moves since the snake last nommed some food:
            snake.movesSinceNommed++;

            // Bad collisions that might kill the snake:
            // With wall:
            if ( checkCollision(nx, ny, game.board) ) {
              if (game.settings.debug) { console.log("Snake " + snakeI + " collided with a wall, ouch!"); }
              if (game.settings.debug) { console.log(snake); }
              snake.dead = true;
            }
            else
            {
              // With self or other snakes:
              for (snakeJ = 0; snakeJ < game.snakes.length; snakeJ++) {
                if (checkCollision(nx, ny, game.snakes[snakeJ].coords)) {
                  if (game.settings.debug) { console.log("Snake " + snakeI + " ran into snake " + snakeJ + ", derp."); }
                  if (game.settings.debug) { console.log(snake); }
                  snake.dead = true;
                }
              }
            }

            // If the previous collision checks didn't kill the snake, check if it's colliding with food:
            if (!snake.dead) {
                var foodNommed = checkCollision(nx, ny, game.foodArray);
                if (foodNommed) {
                    food.eat(snake, foodNommed, game);
                    if (snake.score > game.highScore) {
                        localStorage.highScore = game.highScore = snake.score;
                    }
                } else {
                    snake.coords.pop(); // Remove last tail segment.
                }
                snake.coords.unshift({ x: nx, y: ny }); // New head
            }

          }
        }
        if (game.step) { game.state.paused = true; }

        // Update the AI data (again, so that when displayed it shows correct values for the
        // games current state, rather than the games state BEFORE the last snake moved. Also
        // check if the game needs to be ended (all snakes dead):
        game.state.finalUpdate = true;
        for (snakeI = 0; snakeI < game.snakes.length; snakeI++) {

          snake = game.snakes[snakeI];

          if (!snake.dead) {
            // Do any TURN SENSITIVE (i.e. only once per turn) AI updates here.
            game.state.finalUpdate = false;
            ai.update(snake, game);
          }

        }

        if (game.state.finalUpdate) {
            // Figure out who won
            game.results.winner = game.snakes[0];
            for (snakeI = 1; snakeI < game.snakes.length; snakeI++) {
                if (game.snakes[snakeI].score > game.results.winner.score) {
                    game.results.winner = game.snakes[snakeI];
                    game.results.draw = false;
                } else if (game.snakes[snakeI].score === game.results.winner.score) {
                    game.results.draw = true;
                }
            }
        }

      }

      // - END UPDATE - //

      // - RENDER - //

    render(game);
          
    
    if (game.state.gameOver && game.settings.autoRepeat === true) {
        newGame(game);
    }

      // Set game speed (will be different only if you ate something, but not worth if-ing)
      game.updateInterval = 0;
      for (snakeI = 0; snakeI < game.snakes.length; snakeI++) {
        game.updateInterval += game.snakes[snakeI].speed;
      }
      game.updateInterval = (game.updateInterval / game.snakes.length);
      clearInterval(game.gameLoop);
      game.gameLoop = setInterval(game.mainLoopFunc, game.updateInterval);
    }
  };



  // Check if the canvas' size is set correctly:
  if (canvas.width % game.ui.cellSize === 0 || canvas.height % game.ui.cellSize === 0) {
    game.board.w = canvas.width / game.ui.cellSize;
    game.board.h = canvas.height / game.ui.cellSize;
  } else {
    throw new Error("Canvas width and height must be divisible by " + game.ui.cellSize + " without remainder.");
  }

  // Give the stuff being drawn on the canvas a shadow:
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  // Assign touch event (for touch controls) to faded QR code logo if it exists... soon.
  var qrContainer = document.getElementById("qrCode");
  setTimeout(function() {
    qrContainer.addEventListener ("touchstart", input.touched);
  }, 2500); // The delay is so that.. I have no fucking idea. Plz send help.


  // Assign the highscore as whatever is set in the browsers local storage:
  if (!localStorage.highScore) { game.highScore = 0; } else { game.highScore = localStorage.highScore; }

  // Start a new game!
  newGame(game);

}



function removeQr(event) {
  event.preventDefault();
  var qrContainer = document.getElementById("qrContainer");
  //console.log("Hiding QR container because It's being poked");
  qrContainer.removeEventListener("touchstart", removeQr, false);
  qrContainer.removeEventListener("click", removeQr, false);
  qrContainer.setAttribute("id", "qrContainerHid");
  if (!canvasnakeRunning) {
    canvasnakeRunning = true;
    canvasnake();
  }
}



// Start game when the page loads and...
// Show the QR code when the link in the tab is clicked
function init() {
  var qrContainerHid = document.getElementById("qrContainerHid");
  if (qrContainerHid) qrContainerHid.setAttribute("id", "qrContainer");
  var qrContainer = document.getElementById("qrContainer");
  if (qrContainer) qrContainer.addEventListener("touchstart", removeQr);
  if (qrContainer) qrContainer.addEventListener("click", removeQr);
}



function shareScore() {
  var twitter = "https://twitter.com/home/?status=";
  //https://twitter.com/share?url=https%3A%2F%2Fdev.twitter.com%2Fweb%2Ftweet-button
  var tweetScore = "I scored "+localStorage.highScore+" at tiny.cc/canvasnake!";
  window.open(twitter+tweetScore,"_blank");
}



function toggleInfo() {
  var infoBox = document.getElementById("sliderInfoBox");
  if (infoBox) {
    infoBox.setAttribute("id", "sliderInfoBoxShow");
  } else {
    infoBox = document.getElementById("sliderInfoBoxShow");
    infoBox.setAttribute("id", "sliderInfoBox");
  }
}



window.onload = function() { init(); };
