
import * as input from './input.js';
import newGame from './newGame.js';
import { render } from './view.js';
import { update } from './update.js';
import { snakeInfo as snakeInfo } from './infoString.js';



window.canvasnake = function() {

    // Global-ish variables (too many?):
    var game = {

        settings: {
            debug: false,        // Enable/disables console log messages.
            autoRepeat:  false,  // Restarts the game automatically when gameover occurs.
            gameMode: "singleplayerVsAI" // Initial gamemode is 1 human player against 1 AI.
        },

        state: {
            finalUpdate: false,  // Becomes true when all snakes are dead.
            gameOver:    false,
            paused:      false
        },

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

    var canvas = document.getElementById("canvasnake"),
        ctx = canvas.getContext("2d");

    game.ui.canvas = canvas;
    game.ui.ctx = ctx;


    game.mainLoopFunc = function mainLoop() {

        var snakeI;

        // Clear debug squares array so they can be repopulated this turn:
        if (!game.step) { game.debugSquares = []; }

        // This actually creates a listener function which then does something with any inputs that are detected:
        input.get(game, document, canvas);  // TODO: Figure out if whole document has to be used?)

        if (!game.state.gameOver || game.ui.redrawEnd) {

            if (!game.state.paused) {
                update(game);
            }

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

};
