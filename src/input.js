
import newGame from './newGame.js';
import { toggleDebug, reScale } from './view.js';


// Touchscreen variables:
var qrCode = document.getElementById("qrCode"),
    // Get the coordinates (i.e. offset) of the element that receives touch events
    touchBox = qrCode.getBoundingClientRect(),
    touch = {x: 0, y: 0};



export function get(game, document, canvas) {

    var hwTouchX, // Magic number to make touch controls work.
        w = canvas.width,
        h = canvas.height,
        input;    // Human key / touch input string.

    // Touchscreen (works on any size rectangle):
    if (touch.x > 0) {
        game.paused = false;
        hwTouchX = (h / w) * touch.x;
        if (        touch.y <  hwTouchX     )  {
            if (    touch.y < -hwTouchX + h )  { input = "tUP";    }
            else /* touch.y > -hwTouchX + h */ { input = "tRIGHT"; }
        } else { /* touch.y >  hwTouchX     */
            if (    touch.y > -hwTouchX + h )  { input = "tDOWN";  }
            else /* touch.y < -hwTouchX + h */ { input = "tLEFT";  }
        }
        // If direction = "dead" (i.e. dead screen has been shown):
        if ( game.state.gameOver ) { newGame(); }
        touch = {x:0, y:0};
        handleInput(input, game);
        //return input;
    }

    // Keyboard input:
    // document.onkeydown overwrites previously assigned handlers (i.e. old
    // document.onkeydowns) rather than creating new ones, so reassigning this every loop is okay-ish!
    document.onkeydown = function (key) {
        switch (key.which) {
            // NWSE
            case  87: input = 'W';     break;
            case  65: input = 'A';     break;
            case  83: input = 'S';     break;
            case  68: input = 'D';     break;
            case  73: input = 'I';     break;
            case  74: input = 'J';     break;
            case  75: input = 'K';     break;
            case  76: input = 'L';     break;
            case  38: input = "UP";    break;
            case  37: input = "LEFT";  break;
            case  40: input = "DOWN";  break;
            case  39: input = "RIGHT"; break;

            // Game mode selection
            case  48: input = "0";     break;
            case  49: input = "1";     break;
            case  50: input = "2";     break;
            case  51: input = "3";     break;
            case  52: input = "4";     break;
            case  53: input = "5";     break;
            case  54: input = "6";     break;
            case  55: input = "7";     break;
            case  56: input = "8";     break;
            case  57: input = "9";     break;

            // Other
            case  32: input = "SPACE"; break;
            case  80: input = "P";     break;
            case 187: input = "+";     break;
            case 191: input = "?";     break;
            case  82: input = "R";     break;
            case 219: input = "[";     break;
            case 221: input = "]";     break;

        }

        if (input) {
            key.preventDefault();
            if (game.settings.debug) { console.log("Keypress detected: " + input); }
            handleInput(input, game);
            //return input;
        } else {
            if (game.settings.debug) { console.log("Unknown keypress detected: " + key.which); }
        }

    };

}



function handleInput(input, game) {

    var snakeI,
        snakes = game.snakes,
        gameRepeat = game.settings.autoRepeat;

    //console.log("Doing something with input");
    game.step = false;
    switch (input) {

        // Game mode selection
        case "0" : game.settings.gameMode = "singleplayer";      break;
        case "1" : game.settings.gameMode = "singleplayerVsAI";  break;
        case "2" : game.settings.gameMode = "2 player";          break;
        case "3" : game.settings.gameMode = "3 player";          break;
        case "4" : game.settings.gameMode = "2 AI";              break;
        case "5" : game.settings.gameMode = "crazy AI";          break;
        case "6" : game.settings.gameMode = "custom";            break;

        // Other
        case "SPACE" : newGame(game); game.paused = false; break;
        case "P"     : game.paused = !game.paused; break;
        case "+"     : game.step = true; game.paused = false; break;
        case "?"     : toggleDebug(game.settings); break;
        case "R"     : toggleAutoRepeat(game.settings); break;
        case "]"     : if (game.ui.scale < 4) { game.ui.scale *= 2; reScale(game.ui, 2); } break;
        case "["     : if (game.ui.scale > 1) { game.ui.scale /= 2; reScale(game.ui, 0.5); } break;

    }

    for (snakeI = 0; snakeI < snakes.length; snakeI++) {
      if (!snakes[snakeI].dead) {
        //console.log("snake " + snakeI + " isn't dead, trying to move with " + snakes[snakeI].controls);
        if (snakes[snakeI].controls.indexOf("WASD") > -1) {
          switch (input) {
            case "W" : snakes[snakeI].newDirection = "N"; break;
            case "A" : snakes[snakeI].newDirection = "W"; break;
            case "S" : snakes[snakeI].newDirection = "S"; break;
            case "D" : snakes[snakeI].newDirection = "E"; break;
          }
        }
        if (snakes[snakeI].controls.indexOf("IJKL") > -1) {
          switch (input) {
            case "I" : snakes[snakeI].newDirection = "N"; break;
            case "J" : snakes[snakeI].newDirection = "W"; break;
            case "K" : snakes[snakeI].newDirection = "S"; break;
            case "L" : snakes[snakeI].newDirection = "E"; break;
          }
        }
        if (snakes[snakeI].controls.indexOf("arrows") > -1) {
          switch (input) {
            case "UP"   : snakes[snakeI].newDirection = "N"; break;
            case "LEFT" : snakes[snakeI].newDirection = "W"; break;
            case "DOWN" : snakes[snakeI].newDirection = "S"; break;
            case "RIGHT": snakes[snakeI].newDirection = "E"; break;
          }
        }
        if (snakes[snakeI].controls.indexOf("touch") > -1) {
          switch (input) {
            case "tUP"   : snakes[snakeI].newDirection = "N"; break;
            case "tLEFT" : snakes[snakeI].newDirection = "W"; break;
            case "tDOWN" : snakes[snakeI].newDirection = "S"; break;
            case "tRIGHT": snakes[snakeI].newDirection = "E"; break;
          }
        }
      }
    }

}



// Allow touch events:
export function touched(event) {
    event.preventDefault();
    touch = {
      x: event.targetTouches[0].pageX - touchBox.left,
      y: event.targetTouches[0].pageY - touchBox.top
    };
    //if (game.settings.debug) { console.log("Touch input: " + touch.x + ", " + touch.y); }
}



// Prevent touch events:
export function noTouch(event) { event.preventDefault(); }



// Toggle auto-restarting
function toggleAutoRepeat(settings) {
    settings.autoRepeat = !settings.autoRepeat;
    if (settings.debug) console.log("Game auto-repeat: " + settings.autoRepeat);
}
