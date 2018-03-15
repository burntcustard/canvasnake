
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


function getInputs(snake, game) {
    
    var closestFood = cardinalToRelative(
        snake.direction,
        {x: snake.foodDist.x, y: snake.foodDist.y}
    );
    
    var blocked = cardinalToRelative(snake.direction, snake.blocked);
    
    //console.log("closestFood.x: "+closestFood.x+", closestFood.y: "+closestFood.y);
    //console.log("Blocked relative: "+blocked.F+blocked.R+blocked.B+blocked.L);
    
    return [
        closestFood.x,
        closestFood.y,
        !!blocked.F | 0,
        !!blocked.R | 0,
        !!blocked.B | 0,
        !!blocked.L | 0
    ];
    
}



export function chooseDirection(snake, game) {
    
    snake.ai.chromosome.update(getInputs(snake, game));
    
    var outputs = snake.ai.chromosome.outputs;
    var newDirection;
    var genome = snake.ai.chromosome.genome;
    
    // Get the index of the highest of the Forward/Right/Backward/Left outputs
    var output = outputs.indexOf(Math.max(...outputs));
    
    // Convert output index to relative direction then cardinal:
    switch (output) {
        case 0: newDirection = 'F'; break;
        case 1: newDirection = 'R'; break;
        case 2: newDirection = 'B'; break;
        case 3: newDirection = 'L'; break;
    }
    
    // Reward for just staying alive:
    //genome.fitness++;
    
    /*
    // Reward for going in a straight line:
    if (newDirection === 'F') genome.fitness++;
    */
    
    if (snake.foodDist && snake.foodDist.oldTotal) {
        
        /*
        // Reward for being near-ish food:
        if (snake.foodDist.total < 5) {
            genome.fitness += 5 - snake.foodDist.total;
        }*/
        
        // Reward for going towards/away from food:
        if (snake.foodDist.total < snake.foodDist.oldTotal) {
            genome.fitness += 5;
            //console.log("Rewarding snake for going towards food");
        } else {
            genome.fitness -= 5;
            //console.log("Punishing snake for going away from food");
        }
    }
    
    snake.newDirection = relativeToCardinal(snake.direction, newDirection);
    
}


Snake.prototype.updateFitness = function(results) {
    
    var genome = this.ai.chromosome.genome;
    
    // Reward for eating any foods:
    genome.fitness += this.score * 50;
    
    // Penalty for dying because of getting dizzy:
    if (this.ai.dizzy) genome.fitness -= 50;
    
    // Reward for winning (and getting at least 1 food):
    if (this.score && this === results.winner) genome.fitness += 100;
    
};