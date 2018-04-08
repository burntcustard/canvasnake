
import { Snake } from './snake.js';
import { softsign } from './ai/functions.js';



/**
 * Converts a cardinal direction to a relative direction.
 *
 * For example if a food object is on the right of the game board
 * and the snake is on the left, travelling towards the food, the
 * cardinal direction's x value is swapped with the y.
 *
 * For example if a an obstacle is to the East of a snake which is travelling
 * North, the cardinal directions East (E) property is converted to Right (R).
 *
 * @param {string} snakeDirection A snakes direction string.
 * @param {object} input          An object with either:
 *                                 - x and y properties
 *                                 - N,E,S,W properties
 * @returns {object} The input converted to a relative direction object.
 */
function cardinalToRelative(snakeDirection, input) {

    // Cardinal x, y coordinates -> Relative x, y coordinates
    if (input.x !== undefined && input.y !== undefined) {
        let {x, y} = input;
        switch (snakeDirection) {
            case 'N': return({x:  x, y: -y});
            case 'E': return({x:  y, y:  x});
            case 'S': return({x: -x, y:  y});
            case 'W': return({x: -y, y: -x});
        }
    }

    // Cardinal North, East, South, West -> Relative Front, Right, Back, Left
    else if (input.N !== undefined) {
        let {N, E, S, W} = input;
        switch (snakeDirection) {
            case 'N': return({F: N, R: E, B: S, L: W});
            case 'E': return({F: E, R: S, B: W, L: N});
            case 'S': return({F: S, R: W, B: N, L: E});
            case 'W': return({F: W, R: N, B: E, L: S});
        }
    }

}



/**
 * Converts a relative direction string (F,R,B,L) to a cardinal direction
 * string (N,E,S,W), based off a snake's cardinal direction property.
 *
 * @param   {string} snakeDirection [[Description]]
 * @param   {string} direction      [[Description]]
 * @returns {string} [[Description]]
 */
function relativeToCardinal(snakeDirection, direction) {

    if (typeof(direction) === "string") {

        switch (snakeDirection) {
            case 'N':
                switch (direction) {
                    case 'F': return 'N';
                    case 'R': return 'E';
                    case 'B': return 'S';
                    case 'L': return 'W';
                }
            break;
            case 'E':
                switch (direction) {
                    case 'F': return 'E';
                    case 'R': return 'S';
                    case 'B': return 'W';
                    case 'L': return 'N';
                }
            break;
            case 'S':
                switch (direction) {
                    case 'F': return 'S';
                    case 'R': return 'W';
                    case 'B': return 'N';
                    case 'L': return 'E';
                }
            break;
            case 'W':
                switch (direction) {
                    case 'F': return 'W';
                    case 'R': return 'N';
                    case 'B': return 'E';
                    case 'L': return 'S';
                }
            break;
        }

    }

    // If nothing was converted:
    throw new TypeError("Input was not a valid relative direction string.");

}



function getInputs(snake, game) {

    var inputs = [];

    var closestFood = cardinalToRelative(
        snake.direction,
        {x: snake.foodDist.x, y: snake.foodDist.y}
    );
    inputs.push(softsign(closestFood.x));
    inputs.push(softsign(closestFood.y));


    game.snakes.forEach(otherSnake => {
        if (snake !== otherSnake) {
            /*
            let enemySnakeHead = cardinalToRelative(
                snake.direction,
                {x: otherSnake.head.x, y: otherSnake.head.y}
            );
            inputs.push(enemySnakeHead.x);
            inputs.push(enemySnakeHead.y);

            let closestFoodToEnemy = cardinalToRelative(
                snake.direction,
                {x: snake.foodDist.x, y: snake.foodDist.y}
            );
            inputs.push(closestFoodToEnemy.x);
            inputs.push(closestFoodToEnemy.y);
            */
        }
    });

    /*
    var distanceToWall = cardinalToRelative(snake.direction, {
        x: game.board.w - snake.head.x,
        y: game.board.h - snake.head.y
    });
    inputs.push(distanceToWall.x);
    inputs.push(distanceToWall.y);
    */

    var blocked = cardinalToRelative(snake.direction, snake.blocked);
    inputs.push((!!blocked.F | 0) * 2 - 1); // 8 - 4
    inputs.push((!!blocked.R | 0) * 2 - 1);
    inputs.push((!!blocked.L | 0) * 2 - 1);

    return new Float32Array(inputs);

}



export function chooseDirection(snake, game) {

    snake.ai.neuralNet.update(getInputs(snake, game));

    var outputs = snake.ai.neuralNet.outputs;
    var newDirection = snake.newDirection = null;
    var genome = snake.ai.neuralNet.genome;
    if (snake.turnCounter === undefined) { snake.turnCounter = 0; }

    // Get the index of the highest of the Forward/Right/Left outputs
    // output is 0 if all the outputs are 0 (or identical).
    var output = outputs.indexOf(Math.max(...outputs));
    switch (output) {
        case 0: newDirection = 'F'; break;
        case 1: newDirection = 'R'; break;
        case 2: newDirection = 'L'; break;
    }

    snake.newDirection = relativeToCardinal(snake.direction, newDirection);

    // Reward for just staying alive:
    genome.fitness++;

    // Reward for going towards/away from food:
    if (snake.foodDist && snake.foodDist.oldTotal) {
        if (snake.foodDist.total < snake.foodDist.oldTotal) {
            genome.fitness += 3;
        } else {
            genome.fitness -= 3;
        }
    }

}



Snake.prototype.updateFitness = function(results) {

    var genome = this.ai.neuralNet.genome;

    // Reward for eating any foods:
    genome.fitness += this.score * 20;

    // Reward for winning (and getting at least 1 food):
    if (this === results.winner) genome.fitness += 50;

};
