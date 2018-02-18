
import { touched, noTouch } from './input.js';
import { snakeInfo } from './infoString.js';



var canvas = document.getElementById("canvasnake"),
    ctx = canvas.getContext("2d");

/**
   * Resizes the canvasnake game.
   * TODO: Resize the rest of the page.
   */
export function reSize(ui, value) {

    var canvas = document.getElementById("canvasnake"),
        ctx = canvas.getContext("2d");

    if (canvas) {
        canvas.width = (canvas.width * value);
        canvas.height = (canvas.height * value);
    }

    ui.textSize *= value;
    ui.cellSize *= value;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8 * value;
    ctx.shadowOffsetY = 2 * value;
    ui.redrawGameOver = true;
}


// Paint a square slightly smaller than cSize to make a 1px border around the edge
function paintCell(ui, color, x, y) {
    ctx.fillStyle = color;
    ctx.fillRect(
        x * ui.cellSize + 1 * ui.scale,
        y * ui.cellSize + 1 * ui.scale,
        ui.cellSize - 2 * ui.scale,
        ui.cellSize - 2 * ui.scale
    );
}



// Paint a square slightly smaller than paintCell
function paintSmallCell(ui, color, x, y) {
    ctx.fillStyle = color;
    ctx.fillRect(
        x * ui.cellSize + 3 * ui.scale,
        y * ui.cellSize + 3 * ui.scale,
        ui.cellSize - 6 * ui.scale,
        ui.cellSize - 6 * ui.scale
    );
}



function drawTongueSection(ui, head, offsetX, offsetY, x, y, w, h) {
    ctx.fillRect(
        ((head.x + offsetX) * ui.cellSize + x * ui.scale),
        ((head.y + offsetY) * ui.cellSize + y * ui.scale),
        w * ui.scale,
        h * ui.scale
    );
}



function drawSnake(ui, snake) {

    var cSize = ui.cellSize,
        sf = ui.scale;

    // Render tongue
    if (!snake.dead) { // Only show tongue if not dead
      var head = snake.coords[0];
      ctx.fillStyle = ui.textColor; // orangeRed
      if (snake.direction === 'N') {
        drawTongueSection( ui, head, 0, 0,  6, -7, 3, 6);
        drawTongueSection( ui, head, 0, 0,  4,-10, 3, 6);
        drawTongueSection( ui, head, 0, 0,  8,-10, 3, 6);
      }
      if (snake.direction === 'E') {
        drawTongueSection( ui, head, 1, 0,  1,  6, 6, 3);
        drawTongueSection( ui, head, 1, 0,  4,  4, 6, 3);
        drawTongueSection( ui, head, 1, 0,  4,  8, 6, 3);
      }
      if (snake.direction === 'S') {
        drawTongueSection( ui, head, 0, 1,  6,  1, 3, 6);
        drawTongueSection( ui, head, 0, 1,  4,  4, 3, 6);
        drawTongueSection( ui, head, 0, 1,  8,  4, 3, 6);
      }
      if (snake.direction === 'W') {
        drawTongueSection( ui, head, 0, 0, -7,  6, 6, 3);
        drawTongueSection( ui, head, 0, 0,-10,  4, 6, 3);
        drawTongueSection( ui, head, 0, 0,-10,  8, 6, 3);
      }
    }

    // Render snake bodies
    for (var coordsI = 0; coordsI < snake.coords.length; coordsI++) {
    //for(var i = 0; i<snakeArray.length; i++) {
      var segment = snake.coords[coordsI];
      //console.log(segment);
      //console.log("Rendering snake " + snakeI + ", segment: " + coordsI + ", at coords: " + segment.x + segment.y);
      paintCell(ui, (snake.color), segment.x, segment.y);
    }

    // Render AI heads
    if (snake.ai.difficulty !== "no AI") { // Only show fancy head if not dead and is an AI

      // White hole (would need to fill color if background not white)
      ctx.clearRect(snake.coords[0].x * cSize + 5*sf, snake.coords[0].y * cSize + 5*sf, 5*sf, 5*sf);

      // Black antenna
      ctx.fillStyle = "black";
      if (snake.direction === 'N' || snake.direction === 'S') {
        ctx.fillRect(snake.coords[0].x * cSize - 2*sf, snake.coords[0].y * cSize + 4*sf, 3*sf, 2*sf); // Up Dot
        ctx.fillRect(snake.coords[0].x * cSize - 4*sf, snake.coords[0].y * cSize + 8*sf, 5*sf, 2*sf); // Down Dot
      } else {
        ctx.fillRect(snake.coords[0].x * cSize + 4*sf, snake.coords[0].y * cSize - 2*sf, 2*sf, 3*sf); // L Dot
        ctx.fillRect(snake.coords[0].x * cSize + 8*sf, snake.coords[0].y * cSize - 4*sf, 2*sf, 5*sf); // R Dot
      }

      if (!snake.dead) {
        // Red bits: end of antenna, eye.
        ctx.fillStyle = ui.textColor; // (orangered)
        if (snake.direction === 'N' || snake.direction === 'S') {
          ctx.fillRect(snake.coords[0].x * cSize + 6*sf, snake.coords[0].y * cSize + 4*sf, 3*sf, 7*sf); // Eye
          ctx.fillRect(snake.coords[0].x * cSize - 4*sf, snake.coords[0].y * cSize + 4*sf, 2*sf, 2*sf); // L Dot
          ctx.fillRect(snake.coords[0].x * cSize - 6*sf, snake.coords[0].y * cSize + 8*sf, 2*sf, 2*sf); // R Dot
        } else {
          ctx.fillRect(snake.coords[0].x * cSize + 4*sf, snake.coords[0].y * cSize + 6*sf, 7*sf, 3*sf); // Eye
          ctx.fillRect(snake.coords[0].x * cSize + 4*sf, snake.coords[0].y * cSize - 4*sf, 2*sf, 2*sf); // L Dot
          ctx.fillRect(snake.coords[0].x * cSize + 8*sf, snake.coords[0].y * cSize - 6*sf, 2*sf, 2*sf); // R Dot
        }
      }

    }

}



/**
 * Write line(s) of text to canvas.
 * @param {int}    size   - Font size. E.g. "textSize * 2" or "16".
 * @param {String} xAlign - Horizontal positioning of the text. Possible values: |left   cen|ter    right|
 * @param {String} yAlign - Vertical positioning of the text. Possible values: "top"   -middle-   _bottom_
 * @param {String} output - The text to display. Use "<br>"s to create newlines.
 * @param {int}    x      - Horizontal location of text.
 * @param {int}    y      - Vertical location of text.
 */
function write(ui, size, xAlign, yAlign, output, x, y) {

    ctx.fillStyle = (ui.textColor);
    ctx.font = (size + "px silkscreen");
    ctx.textAlign = (xAlign);
    ctx.textBaseline = (yAlign);

    var lineHeight = ctx.measureText("M").width * 1.2,
        lines = output.split("<br>"),
        l;

    for (l = 0; l < lines.length; l++) {
        ctx.fillText(lines[l], x, y);
        y += lineHeight;
    }

}



export function render(game) {

    var snakeI,
        snakes = game.snakes,
        ui = game.ui,
        textSizeM = ui.textSize,
        textSizeL = ui.textSize * 2,
        sf = ui.scale,
        w = canvas.width,
        h = canvas.height;

    // Clear entire canvas:
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food:
    for(var j = 0; j < game.foodArray.length; j++) {
        var f = game.foodArray[j];
        paintCell(ui, f.color, f.x, f.y);
    }

    // Draw snakes:
    // Could use some sort of forEach
    for (snakeI = 0; snakeI < snakes.length; snakeI++) {
        drawSnake(game.ui, snakes[snakeI]);
    }

    // Draw scores:
    for (snakeI = 0; snakeI < snakes.length; snakeI++) {
        write(
            ui,
            textSizeM,
            "left",
            "bottom",
            ("Score: " +snakes[snakeI].score),
            (snakeI * 100 * sf + 4 * sf),
            canvas.height - 2 * sf
        );
    }

    // Draw highscore:
    write(
        ui,
        textSizeM,
        "right",
        "bottom",
        ("Highscore: " +game.highScore),
        canvas.width - 5 * sf ,
        canvas.height - 2 * sf
    );

    // Draw debug squares:
    for(var iDebug = 0; iDebug < game.debugSquares.length; iDebug++) {
        paintSmallCell("pink", game.debugSquares[iDebug].x, game.debugSquares[iDebug].y);
    }


    // If you died this update, stop touch, start it again after 0.5s, and show dead message.
    if (game.results.winner && (game.state.finalUpdate && !game.state.gameOver) || (game.ui.redrawEnd && game.state.gameOver)) {
        game.ui.redrawEnd = false;
        var qrContainer = document.getElementById("qrContainerHid");
        if (qrContainer) {
            qrContainer.removeEventListener("touchstart", touched);
            qrContainer.addEventListener   ("touchstart", noTouch);
            setTimeout(function() {
                qrContainer.removeEventListener("touchstart", noTouch);
                qrContainer.addEventListener   ("touchstart", touched);
            }, 500);
        }
        var winningSnake = game.results.winner,
            winnerText = "",
            draw = false,
            theScores = "";
        if (game.snakes.length === 1) {
            winnerText = ("You dead, score: " + game.snakes[0].score);
        } else {
            // TODO: Improve > 1 player mode score display so it doesn't go off edges if too long

          if (!game.results.draw) {
            winnerText = (winningSnake.name + " Wins!");
          } else {
            winnerText = "Draw!";
          }
          for (snakeI = 0; snakeI < game.snakes.length; snakeI++) {
            theScores += (game.snakes[snakeI].name + ": " + game.snakes[snakeI].score + "<br>");
          }
        }
        theScores += ("Press space or tap to restart");
        write(ui, textSizeL, "center", "bottom", winnerText, w/2, h/2);
        write(ui, textSizeM, "center", "top", theScores, w/2, h/2);
        //updateInterval = 500;
        game.state.gameOver = true; // To make sure text only rendered once after death.

        if (snakes.length === 2) {
          if (snakes[0].score > snakes[1].score) game.wins.AI1++;
          if (snakes[0].score < snakes[1].score) game.wins.AI2++;
        }

        //if (game.settings.autoRepeat === true) newGame();
        // TODO: Reimplement autoRepeat

      }

      // Print the snake properties to two big textboxes:
      if (game.settings.debug) {
          var snakeInfoLeft, snakeInfoRight;
          if (snakes[0]) document.getElementById("snakeInfoLeft").innerHTML = snakeInfo(snakes[0], game.state.paused, game.wins);
          if (snakes[1]) document.getElementById("snakeInfoRight").innerHTML = snakeInfo(snakes[1], game.state.paused, game.wins);
      }

}



export function toggleDebug(debug) {
    var infoBoxLeft = document.getElementById("snakeInfoLeft");
    var infoBoxRight = document.getElementById("snakeInfoRight");

    if (debug) {
        infoBoxLeft.style.display = "none";
        infoBoxRight.style.display = "none";
    } else {
        infoBoxLeft.style.display = "inline-block";
        infoBoxRight.style.display = "inline-block";
    }

    debug = !debug;

}
