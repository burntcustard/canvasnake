
/*global toggleAutoRepeat, selectGameMode*/



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
            case  78: input = "N";     break;
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

    var gameRepeat = game.settings.autoRepeat;

    game.step = false;
    switch (input) {

        // Game mode selection
        case "1" : selectGameMode("Single Player");       break;
        case "2" : selectGameMode("Single Player vs AI"); break;
        case "3" : selectGameMode("Two Player");          break;
        case "4" : selectGameMode("Three Player");        break;
        case "5" : selectGameMode("AI vs AI");            break;
        case "6" : selectGameMode("Crazy AI");            break;
        case "7" : selectGameMode("Custom");              break;

        // Other
        case "SPACE" : newGame(game); game.state.paused = false; break;
        case "P"     : game.state.paused = !game.state.paused; break;
        case "N"     : game.step = true; game.state.paused = false; break;
        case "?"     : toggleDebug(game.settings); break;
        case "R"     : toggleAutoRepeat(); break;
        case "]"     : game.settings.ssaa.increment(); break;
        case "["     : game.settings.ssaa.decrement(); break;

    }

    game.snakes.forEach(function(snake) {
        if (!snake.dead) {
            if (snake.controls.indexOf("WASD") > -1) {
              switch (input) {
                case "W" : snake.newDirection = "N"; break;
                case "A" : snake.newDirection = "W"; break;
                case "S" : snake.newDirection = "S"; break;
                case "D" : snake.newDirection = "E"; break;
              }
            }
            if (snake.controls.indexOf("IJKL") > -1) {
              switch (input) {
                case "I" : snake.newDirection = "N"; break;
                case "J" : snake.newDirection = "W"; break;
                case "K" : snake.newDirection = "S"; break;
                case "L" : snake.newDirection = "E"; break;
              }
            }
            if (snake.controls.indexOf("arrows") > -1) {
              switch (input) {
                case "UP"   : snake.newDirection = "N"; break;
                case "LEFT" : snake.newDirection = "W"; break;
                case "DOWN" : snake.newDirection = "S"; break;
                case "RIGHT": snake.newDirection = "E"; break;
              }
            }
            if (snake.controls.indexOf("touch") > -1) {
              switch (input) {
                case "tUP"   : snake.newDirection = "N"; break;
                case "tLEFT" : snake.newDirection = "W"; break;
                case "tDOWN" : snake.newDirection = "S"; break;
                case "tRIGHT": snake.newDirection = "E"; break;
              }
            }
        }
    });

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
