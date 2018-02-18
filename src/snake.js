
import { coinToss } from './lib.js';



export function Snake(name, color, speed, ai, controls, direction, coords) {

    // General properties
    this.name = name || "player X";
    this.score = 0;
    this.dead = false;
    this.controls = controls || "none";
    this.color = color || "black";

    // Location & movement properties
    this.speed = speed || 200;
    this.direction = direction;
    this.newDirection = '';
    this.coords = coords;

    // AI-related properties
    // .ai properties are ones that human players DO NOT have, so
    // AIs cannot use (cannot "see") .ai properties of other snakes.
    this.ai = ai || {difficulty: "no AI"}; // Contains avoidance.
    this.ai.dizzy = false;
    this.ai.determined = false;
    this.ai.alone = false;
    this.blocked = {N: false, E: false, S: false, W: false};
    // Distance between head & closest food, & it's index:
    this.foodDistance = {x: 0, y: 0, total: 0, closest: 0};
    this.movesSinceNommed = 0;
    this.winning = false;
    this.extraMoves = 0;

}



Snake.prototype.updateDirection = function() {

    var d = this.direction,
        nd = this.newDirection;

    // If there is a change in direction:
    if (d !== nd) {
        //console.log("updating direction of snake, old direction: " +d);
        switch (nd) {
            case 'N': if (d !== 'S') { d = 'N'; } break;
            case 'W': if (d !== 'E') { d = 'W'; } break;
            case 'S': if (d !== 'N') { d = 'S'; } break;
            case 'E': if (d !== 'W') { d = 'E'; } break;
        }
        //console.log("snakes new direction: " + d);
        this.direction = d;  // TODO: See if this is needed
    }

};



/**
* Figures out the order of the snakes size/score wise, with the biggest snake at
* the start of the array, through to the smallest snake at the end. If two snakes have
* equal scores, a cointoss decides the order of those two.
* @returns {Array of ints} Ordered set. E.g. [0,2,1].
*/
export function order(snakes) {

    // TODO: Proper error or a better way of getting an order.
    if (!snakes) return false;

    var snakeOrder = [], // E.g [1,0,2] if snake[1] is 1st, snake[0] is 2nd, snake[2] is 3rd.
        snakeI,
        snakeJ,
        s1, s2; // Temporarily storing the two Scores of the two snakes

    // Add all of the alive snakes to a set. E.g. [0,2] if there are 3 snakes but the 2nd is dead:
    for (snakeI = 0; snakeI < snakes.length; snakeI++) {
      if (!snakes[snakeI].dead) { snakeOrder.push(snakeI); }
    }

    // Perform a bubble sort on the snakeOrder set to order from highest to lowest score:
    for (snakeI = 0; snakeI < snakeOrder.length - 1; snakeI++) {
      for (snakeJ = 0; snakeJ < snakeOrder.length - 1; snakeJ++) {

        s1 = snakes[snakeOrder[snakeJ]].score;
        s2 = snakes[snakeOrder[snakeJ+1]].score;

        // If order is wrong, or if 2 snakes have same score (maybe), flip them around.
        if (s1 < s2 || ((s1 === s2) && (coinToss()))) {
          snakeOrder.swap(snakeJ, snakeJ + 1);
        }

      }
    }

    // Return ordered set:
    return snakeOrder;
}
