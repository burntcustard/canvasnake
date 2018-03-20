
import { unAbs } from '../lib.js';



function sigmoid(t) {
    return 1/(1+Math.exp(-t));
}

function tanh(t) {
    return (Math.exp(t) - Math.exp(-t)) / (Math.exp(t) + Math.exp(-t));
}

export function ReLU(t) {
    return Math.max(0, t);
}

export function softsign(t) {
    return t / (1+Math.abs(t));
}

export function clamp(t) {
    if (t < -1) {
        return -1;
    } else
    if (t > 1) {
        return 1;
    }
    return t;
}


// Random number between 0 and 1 that's likely to be near 0:
// TODO: Graphs and/or codepen demo with graph.
// TODO: Performance tests cause this is funky and maybe slow.
export function randomWeightedLow(pullTo0 = 3) {
    return Math.min(...[...Array(pullTo0)].map(() => Math.random()));
}

/**
 * Generate a random weight between -1 and 1, favouring around 0.
 *  - TODO: Actually make it favour 0?...
 * @returns {number} [[Description]]
 */
export function randomWeight() {
    //return sigmoid(Math.random()*2-1) * 2 - 1;
    //return Math.random() * 2 - 1;
    return unAbs(randomWeightedLow());
}

