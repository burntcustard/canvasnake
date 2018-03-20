
import { Snake } from './snake.js';


function cardinalToRelative(snakeDirection, input) {

    if (input.x !== undefined && input.y !== undefined) {

        let {x, y} = input;

        switch (snakeDirection) {
            case 'N': return({x:  x, y: -y});
            case 'E': return({x:  y, y:  x});
            case 'S': return({x: -x, y:  y});
            case 'W': return({x: -y, y: -x});
        }

    }

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

}

function softsign(t) {
    return t / (1+Math.abs(t));
}

// Convert from 0,1 to -1,1 (or similar.. both equal dist from 0 or it'll break).
function toRange(input, min, max) {
    return (input * max * 2) - min;
}

function getInputs(snake, game) {

    var inputs = [];

    var closestFood = cardinalToRelative(
        snake.direction,
        {x: snake.foodDist.x, y: snake.foodDist.y}
    );
    inputs.push(softsign(closestFood.x));
    inputs.push(softsign(closestFood.y));

    /*
    game.snakes.forEach(otherSnake => {
        if (snake !== otherSnake) {

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
        }
    });
    */
    /*
    var distanceToWall = cardinalToRelative(
        snake.direction,
        {
            x: game.board.w - snake.head.x,
            y: game.board.h - snake.head.y
        }
    );
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

    snake.ai.chromosome.update(getInputs(snake, game));

    var outputs = snake.ai.chromosome.outputs;
    var newDirection = snake.newDirection = null;
    var genome = snake.ai.chromosome.genome;
    if (snake.turnCounter === undefined) { snake.turnCounter = 0; }

    // Don't care about outputs that are below or equal to 0.5 threshold:
    for (let i = 0; i < outputs.length; i++) {
        if (outputs[i] <= 0) outputs[i] = NaN;
    }
    
    // Get the index of the highest of the Forward/Right/Backward/Left outputs
    // output is -1 if all of the whole outputs TypedArray is NaN
    var output = outputs.indexOf(Math.max(...outputs));
    switch (output) {
        case 0:
            newDirection = 'R';
            snake.turnCounter++;
        break;
        case 1:
            newDirection = 'L';
            snake.turnCounter--;
        break;
    }
    //console.log(snake.turnCounter);
    //genome.fitness -= Math.floor(Math.abs(snake.turnCounter)/4);
    snake.newDirection = relativeToCardinal(snake.direction, newDirection);
/*
    if (newDirection) {
        console.info("new direction picked: " + newDirection);
    }
*/
    // Reward for just staying alive:
    genome.fitness++;

    // Reward for going in a straight line (and being alive still):
    //if (!newDirection) genome.fitness++;

    if (snake.foodDist && snake.foodDist.oldTotal) {

        /*/ Reward for being near-ish food:
        if (snake.foodDist.total < 5) {
            genome.fitness += 5 - snake.foodDist.total;
        }//*/

        // Reward for going towards/away from food:
        if (snake.foodDist.total < snake.foodDist.oldTotal) {
            genome.fitness += 5;
            //console.log("Rewarding snake for going towards food");
        } else {
            genome.fitness -= 5;
            //console.log("Punishing snake for going away from food");
        }
    }

}


Snake.prototype.updateFitness = function(results) {

    var genome = this.ai.chromosome.genome;

    // Reward for eating any foods:
    genome.fitness += this.score * 100;
    
    //console.log("Turn counter on death: " + this.turnCounter);

    // Penalty for dying because of getting dizzy:
    //if (this.ai.dizzy) genome.fitness -= 10;

    // Reward for winning (and getting at least 1 food):
    //if (this === results.winner) genome.fitness += 100;
    
    // Penalty for losing. Important because some snakes might play more so
    // have a higher chance of winning randomly, so need the penalty chance too
    //if (this !== results.winner) genome.fitness -= 50;

};
