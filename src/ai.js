
import { check as checkCollision } from './collision.js';
import { coinToss } from './lib.js';



function updateFoodDistance(snakeHead, foods) {

    var foodI,
        first = true,
        tmpFoodDistance = {x: 0, y: 0, total: 0, closest: 0},
        foodDistance = {x: 0, y: 0, total: 0, closest: 0};

    foods.forEach(function(food) {

      // Distance from food
      tmpFoodDistance.x = food.x - snakeHead.x;
      tmpFoodDistance.y = food.y - snakeHead.y;
      tmpFoodDistance.total = Math.abs(tmpFoodDistance.x) + Math.abs(tmpFoodDistance.y);

      // If first food being looked at, or food is closer than previously closest food:
      if ((first) || (tmpFoodDistance.total < foodDistance.total)) {
        tmpFoodDistance.closest = foodI;
        // TODO copy the value of tmpFoodDistance all at once to snake.foodDistance?
        foodDistance = {
          x: tmpFoodDistance.x,
          y: tmpFoodDistance.y,
          total: tmpFoodDistance.total,
          closest: tmpFoodDistance.closest
        };

        // The next food looked at won't be the first being looked at. (It makes sense!)
        first = false;
      }

    });

    return foodDistance;

}



// Currently probably only works with nicely rounded (even) board size:
function updateCenterDistance(snakeHead, board) {

    var centerDist = {x: 0, y: 0, total: 0};

    //console.log("Middle cell is X:" + board.w / 2 + ", Y:" + board.h / 2);

    centerDist.x = (board.w / 2) - snakeHead.x;
    centerDist.y = (board.h / 2) - snakeHead.y;
    centerDist.total = Math.abs(centerDist.x) + Math.abs(centerDist.y);

    return centerDist;

}



function updateBlocked(snakeHead, board, snakes) {

    // Sets all the blocked values to false so can be recalculated:
    var blocked = {N: false, E: false, S: false, W: false};

    // Check if blocked by walls:
    if (checkCollision(snakeHead.x, snakeHead.y - 1, board)) { blocked.N = true; }
    if (checkCollision(snakeHead.x + 1, snakeHead.y, board)) { blocked.E = true; }
    if (checkCollision(snakeHead.x, snakeHead.y + 1, board)) { blocked.S = true; }
    if (checkCollision(snakeHead.x - 1, snakeHead.y, board)) { blocked.W = true; }

    // Check if blocked by snakes (including itself):
    snakes.forEach(function(snake) {
        //console.log("Checking for " + snake.name + "'s potential collision with " + snakes[snakeI].name);
        if (checkCollision(snakeHead.x, snakeHead.y - 1, snake.coords)) { blocked.N = true; }
        if (checkCollision(snakeHead.x + 1, snakeHead.y, snake.coords)) { blocked.E = true; }
        if (checkCollision(snakeHead.x, snakeHead.y + 1, snake.coords)) { blocked.S = true; }
        if (checkCollision(snakeHead.x - 1, snakeHead.y, snake.coords)) { blocked.W = true; }
    });

    return blocked;

}



/**
 * Update AI-related variables. Includes properties that human
 * players have that the AI needs to look at.
 */
export function update(snake, game) {

    var enemySnakeI,
        snakes = game.snakes;

    snake.foodDistance = updateFoodDistance(snake.coords[0], game.foodArray);

    snake.centerDistance = updateCenterDistance(snake.coords[0], game.board);

    snake.blocked = updateBlocked(snake.coords[0], game.board, game.snakes);

    // Update properties that only the AI needs:
    if (snake.ai !== "no AI") {

      // Check if snake is the last snake alive and if it's winning (higher score)
      snake.ai.alone = true;
      snake.winning = true;
      for (enemySnakeI = 0; enemySnakeI < snakes.length; enemySnakeI++) {
        if (snakes[enemySnakeI] !== snake) { // I.e. snake being looked at isn't itself.
          if (snakes[enemySnakeI].dead === false) {
            snake.ai.alone = false;
          }
          if (snakes[enemySnakeI].score >= snake.score) {
            snake.winning = false;
          }
        }
      }

      // If the snake hasn't eaten in a long time, it becomes "determined" to get to
      // the food, potentially turning off parts of it's collision avoidance.
      snake.ai.determined = (snake.movesSinceNommed > 100 ? true : false);

      // If the snake hasn't eaten in a VERY long time, it becomes "dizzy" and stops
      // being able to pick a new direction to go in (probably leading to it's death).
      snake.ai.dizzy = (snake.movesSinceNommed > 300 ? true : false);

    }

}



function getDirectionTo(currentDirection, targetDistX, targetDistY) {

    var newDirection;

    switch (currentDirection) {

        case 'N': {
            if (targetDistX < 0) { newDirection = 'W'; }
            if (targetDistX > 0) { newDirection = 'E'; }
            if (targetDistY < 0) { newDirection = 'N'; }  // Wiggling without this.
            if (targetDistY > 0 && targetDistX === 0) {
                newDirection = coinToss() ? 'W' : 'E';  // Order doesn't matter.
            }
        } break;

        case 'E': {
            if (targetDistY > 0) { newDirection = 'S'; }
            if (targetDistY < 0) { newDirection = 'N'; }
            if (targetDistX > 0) { newDirection = 'E'; }
            if (targetDistX < 0 && targetDistX === 0) {
                newDirection = coinToss() ? 'S' : 'N';
            }
        } break;

        case 'S': {
            if (targetDistX > 0) { newDirection = 'E'; }
            if (targetDistX < 0) { newDirection = 'W'; }
            if (targetDistY > 0) { newDirection = 'S'; }
            if (targetDistY < 0 && targetDistX === 0) {
                newDirection = coinToss() ? 'E' : 'W';
            }
        } break;

        case 'W': {
            if (targetDistY < 0) { newDirection = 'N'; }
            if (targetDistY > 0) { newDirection = 'S'; }
            if (targetDistX < 0) { newDirection = 'W'; }
            if (targetDistX > 0 && targetDistX === 0) {
                newDirection = coinToss() ? 'N' : 'S';
            }
        } break;

    }

    return newDirection;

}



/**
* Sets a snakes new direction to tell it to go towards the food whose coordinates are
* held in snake.foodDistance (probably the closest food).
* @param {Object} snake - The hungry hungry snake.
*/
function goTowardsFood(snake) {

    snake.newDirection = getDirectionTo(
        snake.direction,
        snake.foodDistance.x,
        snake.foodDistance.y
    );

}



/**
 * Sets a snakes new direction to tell it to go towards the center of the game board.
 * @param {Object} snake - The lazy snake.
 */
function goTowardsCenter(snake, board) {

    snake.newDirection = getDirectionTo(
        snake.direction,
        snake.centerDistance.x,
        snake.centerDistance.y
    );

}



  /**
   * Used to make a snake "look" around it at one cell to help determine which way to go.
   * Pushes cell it's looked at into the array debugSquares.
   * @param   {Object} snake - The obervant snake.
   * @param   {String} type  - Check for collisions with "snakes", "walls", or "" (meaning both).
   * @param   {int} x - Horizontal offset. E.g. "-1" to indicate 1 cell to the left of snakes head.
   * @param   {int} y - Vertical offset.
   * @returns {Boolean} - True if the specified snake & offsets collide with something bad.
   */
  function checkPotentialCollision(snake, type, x, y, game) {

    var xCoord = snake.coords[0].x + x,
        yCoord = snake.coords[0].y + y,
        enemySnakeI;

    if (game.settings.debug) {
      console.log(snake.name + " looking at coords: X:" + xCoord + " Y:" + yCoord);
      game.debugSquares.push({x: xCoord, y: yCoord});
    }

    if (type === "snakes" || !type) {
      if (checkCollision(xCoord, yCoord, snake.coords)) { return true; } // Check self first
      for (enemySnakeI = 0; enemySnakeI < game.snakes.length; enemySnakeI++) {
        if (game.snakes[enemySnakeI] !== snake) { // Don't check self again
          if (checkCollision(xCoord, yCoord, game.snakes[enemySnakeI].coords)) { return true; }
        }
      }
    }

    if (type === "walls" || !type) {
      if (checkCollision(xCoord, yCoord, game.board)) { return true; }
    }

    return false;

  }



  //╔═════════════════╗//
  //║            ▄▄▄  ║//
  //║  █         █ █  ║//
  //║  █▄▄▄▄ >> ▀▀ █  ║//
  //║         ▄▄█▀▀▀  ║//
  //╚═════════════════╝//
  /**
   * Detects 1 cell wide "tubes" that could potentially have dead ends (or might have them in the future
   * if a clever player tries to block the snake in). Uses the snakes new direction value and checks to
   * the left and right of where the snake will be after it's made it's next move. If there are obstacles
   * to the left AND the right then it would have entered a tube oh god no don't do that!
   * @param   {Object}  snake - The tube-avoiding snake.
   * @returns {Boolean} True if the snake was about to go into a tube.
   */
  function detectTube(snake, game) {

    var tubeLeftSide, tubeRightSide = false; // Initially assume no obstacles on left or right.

    switch (snake.newDirection) {
      case 'N': {
        tubeLeftSide  = checkPotentialCollision(snake, null, -1, -1, game);
        tubeRightSide = checkPotentialCollision(snake, null,  1, -1, game);
      } break;
      case 'E': {
        tubeLeftSide  = checkPotentialCollision(snake, null,  1, -1, game);
        tubeRightSide = checkPotentialCollision(snake, null,  1,  1, game);
      } break;
      case 'S': {
        tubeLeftSide  = checkPotentialCollision(snake, null,  1,  1, game);
        tubeRightSide = checkPotentialCollision(snake, null, -1,  1, game);
      } break;
      case 'W': {
        tubeLeftSide  = checkPotentialCollision(snake, null, -1,  1, game);
        tubeRightSide = checkPotentialCollision(snake, null, -1, -1, game);
      } break;
    }

    // If there is an obstacle on both sides:
    if (tubeLeftSide && tubeRightSide) {
      if (game.settings.debug) { console.log(snake.name + " avoiding going down the rabbit hole"); }
      return true;
    }

  }



  //╔═════════════════╗//
  //║       ██        ║//
  //║       ██  Snake ║//
  //║       ██  goes: ║//
  //║   ██<<██>>  ->  ║//
  //╚═════════════════╝//
  /**
   * Determines if an AI snake should go right or left (in relation to the direction of
   * the snake, NOT the board). Takes into account:
   *  - snake.ai.avoidance.snakes, if the snake should turn away from itself and other snakes.
   *  - snake.ai.avoidance.walls,  if the snake should turn away from the nearest wall.
   * Snake avoidance is prioritised, no wall checks are done if a snake has been found to avoid.
   * This reduces the likelyhood of the AI from tangling itself up,
   * because it discourages it from getting too close to obstacles.
   * If nothing is found to avoid, or there is an obstacle an equal distance
   * from the snake on the left and the right, a direction is chosen randomly.
   * @param   {Object}  snake - The claustrophobic snake.
   * @returns {Boolean} - True if the snake should turn right, false if it should turn left.
   */
  function shouldGoRight(snake, game) {

    var tmpGoLeft = false,
        tmpGoRight = false,
        viewDistance = { x: game.board.w / 2, y: game.board.h / 2 }, // How far snakes can "see".
        iNS, iNW,
        iES, iEW, // "iES" is "index East Snake", "iEW" is "index East Wall".
        iSS, iSW, // Used to loop through the a snakes view distance block by block,
        iWS, iWW; // looking for either a Snake or Wall to avoid.

    switch (snake.newDirection || snake.direction) {
      case 'N': {
        if (snake.ai.avoidance.snakes) {
          for (iNS = 1; iNS < viewDistance.x; iNS++) { // "iNS" is index North Snake
            if (!tmpGoRight && !tmpGoLeft) {
              tmpGoLeft  = checkPotentialCollision(snake, "snakes",  iNS, 0, game); // Go left if something found on right (+x coord)
              tmpGoRight = checkPotentialCollision(snake, "snakes", -iNS, 0, game); // Go right if something found on left (-x coord)
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found snake to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
        if (snake.ai.avoidance.walls) {
          for (iNW = 1; iNW < viewDistance.x; iNW++) { // "iNW" is index North Wall
            if (!tmpGoRight && !tmpGoLeft) { // Only do this if no snakes have been found to avoid!
              tmpGoLeft  = checkPotentialCollision(snake, "walls",  iNW, 0, game);
              tmpGoRight = checkPotentialCollision(snake, "walls", -iNW, 0, game);
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found wall to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
      } break;
      case 'E': {
        if (snake.ai.avoidance.snakes) {
          for (iES = 1; iES < viewDistance.y; iES++) {
            if (!tmpGoRight && !tmpGoLeft) {
              tmpGoLeft  = checkPotentialCollision(snake, "snakes", 0,  iES, game); // Go left if something found on right (+x coord)
              tmpGoRight = checkPotentialCollision(snake, "snakes", 0, -iES, game); // Go right if something found on left (-x coord)
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found snake to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
        if (snake.ai.avoidance.walls) {
          for (iEW = 1; iEW < viewDistance.y; iEW++) {
            if (!tmpGoRight && !tmpGoLeft) { // Only do this if no snakes have been found to avoid!
              tmpGoLeft  = checkPotentialCollision(snake, "walls", 0,  iEW, game);
              tmpGoRight = checkPotentialCollision(snake, "walls", 0, -iEW, game);
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found wall to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
      } break;
      case 'S': {
        if (snake.ai.avoidance.snakes) {
          for (iSS = 1; iSS < viewDistance.x; iSS++) {
            if (!tmpGoRight && !tmpGoLeft) {
              tmpGoLeft  = checkPotentialCollision(snake, "snakes", -iSS, 0, game); // Go left if something found on right (+x coord)
              tmpGoRight = checkPotentialCollision(snake, "snakes",  iSS, 0, game); // Go right if something found on left (-x coord)
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found snake to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
        if (snake.ai.avoidance.walls) {
          for (iSW = 1; iSW < viewDistance.x; iSW++) {
            if (!tmpGoRight && !tmpGoLeft) { // Only do this if no snakes have been found to avoid!
              tmpGoLeft  = checkPotentialCollision(snake, "walls", -iSW, 0, game);
              tmpGoRight = checkPotentialCollision(snake, "walls",  iSW, 0, game);
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found wall to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
      } break;
      case 'W': {
        if (snake.ai.avoidance.snakes) {
          for (iWS = 1; iWS < viewDistance.y; iWS++) {
            if (!tmpGoRight && !tmpGoLeft) {
              tmpGoLeft  = checkPotentialCollision(snake, "snakes", 0, -iWS, game); // Go left if something found on right (+x coord)
              tmpGoRight = checkPotentialCollision(snake, "snakes", 0,  iWS, game); // Go right if something found on left (-x coord)
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found snake to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
        if (snake.ai.avoidance.walls) {
          for (iWW = 1; iWW < viewDistance.y; iWW++) {
            if (!tmpGoRight && !tmpGoLeft) { // Only do this if no snakes have been found to avoid!
              tmpGoLeft  = checkPotentialCollision(snake, "walls", 0, -iWW, game);
              tmpGoRight = checkPotentialCollision(snake, "walls", 0,  iWW, game);
              if (game.settings.debug && (tmpGoRight || tmpGoLeft)) { console.log("Found wall to avoid, go: " + tmpGoLeft + "," + tmpGoRight); }
            }
          }
        }
      } break;
    }

    // Return true if going right is needed, false if left, else randomly turn right or left:
    if (tmpGoRight && !tmpGoLeft) { return true; }
    if (!tmpGoRight && tmpGoLeft) { return false; }
    return coinToss;

  }



  function avoidDirection(snake, avoid, game) {

    var goRight;

    if (!snake.ai.determined) {
      goRight = shouldGoRight(snake, game);
    } else {
      goRight = coinToss();
    }

    if (avoid === 'N') {
      if (goRight) {
        if (!snake.blocked.W) { snake.newDirection = 'W'; }
        if (!snake.blocked.S) { snake.newDirection = 'S'; }
        if (!snake.blocked.E) { snake.newDirection = 'E'; } // <-- Preferred direction
      } else {
        if (!snake.blocked.E) { snake.newDirection = 'E'; }
        if (!snake.blocked.S) { snake.newDirection = 'S'; }
        if (!snake.blocked.W) { snake.newDirection = 'W'; }
      }
      if (game.settings.debug) { console.log(snake.name + " avoiding N, switched to: " + snake.newDirection); }
    }
    if (avoid === 'E') {
      if (goRight) {
        if (!snake.blocked.N) { snake.newDirection = 'N'; }
        if (!snake.blocked.W) { snake.newDirection = 'W'; }
        if (!snake.blocked.S) { snake.newDirection = 'S'; }
      } else {
        if (!snake.blocked.S) { snake.newDirection = 'S'; }
        if (!snake.blocked.W) { snake.newDirection = 'W'; }
        if (!snake.blocked.N) { snake.newDirection = 'N'; }
      }
      if (game.settings.debug) { console.log(snake.name + " avoiding E, switched to: " + snake.newDirection); }
    }
    if (avoid === 'S') {
      if (goRight) {
        if (!snake.blocked.E) { snake.newDirection = 'E'; }
        if (!snake.blocked.N) { snake.newDirection = 'N'; }
        if (!snake.blocked.W) { snake.newDirection = 'W'; }
      } else {
        if (!snake.blocked.W) { snake.newDirection = 'W'; }
        if (!snake.blocked.N) { snake.newDirection = 'N'; }
        if (!snake.blocked.E) { snake.newDirection = 'E'; }
      }
      if (game.settings.debug) { console.log(snake.name + " avoiding S, switched to: " + snake.newDirection); }
    }
    if (avoid === 'W') {
      if (goRight) {
        if (!snake.blocked.S) { snake.newDirection = 'S'; }
        if (!snake.blocked.E) { snake.newDirection = 'E'; }
        if (!snake.blocked.N) { snake.newDirection = 'N'; }
      } else {
        if (!snake.blocked.N) { snake.newDirection = 'N'; }
        if (!snake.blocked.E) { snake.newDirection = 'E'; }
        if (!snake.blocked.S) { snake.newDirection = 'S'; }
      }
      if (game.settings.debug) { console.log(snake.name + " avoiding W, switched to: " + snake.newDirection); }
    }

  }



/**
 * Returns true if snakeA's head is closer to snakeA's closest food, than
 * snakeB's head to snakeB's closest food, otherwise returns false.
 * @param   {object}   snakeA Snake
 * @param   {object}   snakeB Snake
 * @returns {boolean}
 */
function closerToFood(snakeA, snakeB) {
    return snakeA.foodDistance.total < snakeB.foodDistance.total;
}



/**
  * Determines a new direction for the AI to turn.
  */
export function chooseDirection(snake, game) {

    if (!snake.ai.lazy) {

        goTowardsFood(snake);

    } else {

        let cba = false;

        // A lazy snake Can't Be Arsed (cba=true) to go to food if other snake/s are closer.
        // Lazy ai goes towards the center (+ shape) of the map if other snakes are closer to food.

        // Check if other snakes heads are closer to food
        game.snakes.forEach(function(otherSnake) {
            if (otherSnake !== snake && closerToFood(otherSnake, snake)) {
                cba = true;
            }
        });

        if (!cba || snake.ai.alone || game.foodArray.length > 1) {
            // This snake is closer than all other alive snakes to
            // single food, or there's more than 1 food, go get!
            if (game.settings.debug) {
                console.log(snake.name + " is NOT being lazy, and is going for food");
            }
            goTowardsFood(snake);
        } else {
            // This snake is further away from food, just go towards middle of board.
            if (game.settings.debug) {
                console.log(snake.name + " cba, and is just going to center");
            }
            goTowardsCenter(snake, game.board);
        }

    }

    if (snake.ai.avoidance !== "none") {

        // Check if you gonna crash and avoid it. Uses the snakes current direction
        // if there is no new direction (i.e. if newDirection is falsey).
        switch (snake.newDirection || snake.direction) {
            case 'N': if (snake.blocked.N) { avoidDirection(snake, 'N', game); } break;
            case 'E': if (snake.blocked.E) { avoidDirection(snake, 'E', game); } break;
            case 'S': if (snake.blocked.S) { avoidDirection(snake, 'S', game); } break;
            case 'W': if (snake.blocked.W) { avoidDirection(snake, 'W', game); } break;
        }

        // Check if you gonna go into a tube
        if (snake.ai.avoidance.tubes && !snake.ai.determined) {
            if (detectTube(snake, game)) {
                avoidDirection(snake, snake.newDirection, game);
            }
        }

    }

}
