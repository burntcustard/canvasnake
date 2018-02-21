
import * as food from './food.js';
import { order as orderSnakes } from './snake.js';
import * as ai from './ai.js';
import { check as checkCollision } from './collision.js';



export function update(game) {
    
    var snakeI,   // Counter.
        snakeJ,   // Counter.
        snake,    // Current snake being examined.
        nx, ny,   // "Next x & y" variables for storing new location of a snakes head.
        snakeOrder = orderSnakes(game.snakes);
    
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
                if (game.settings.debug) {
                    console.log("Snake " + snakeI + " collided with a wall, ouch!");
                }
                snake.dead = true;
            }
            else
            {
              // With self or other snakes:
                for (snakeJ = 0; snakeJ < game.snakes.length; snakeJ++) {
                    if (checkCollision(nx, ny, game.snakes[snakeJ].coords)) {
                        if (game.settings.debug) {
                            console.log("Snake " + snakeI + " ran into snake " + snakeJ + ", derp.");
                        }
                        snake.dead = true;
                    }
                }
            }

            // If the previous collision checks didn't kill the snake, check if it's colliding with food:
            if (!snake.dead) {
                var foodNommed = checkCollision(nx, ny, game.foodArray);
                if (foodNommed) {
                    foodNommed.getEatenBy(snake);
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
