
import { randomWeightedLow } from './functions.js';
import { unAbs } from '../lib/misc.js';

/**
 *
 * Population: A group of many snakes.
 * Snake: An individual AI snake (a phenotype).
 * Genome: A specific set of weights that define the AI.
 * NeuralNet: A structure of layers of neurons (a "brain").
 *  - also referred to as an "organism".
 * Layer: A set of neurons - Input, Hidden, or Output.
 * Neuron: A node / brain cell type thing.
 *
 */

export const settings = Object.freeze({

    debug: true,           // Set to false to remove debugging properties.
    populationSize: 100,   // Number of organisms. Ideally an even integer.
    roundsPerOrganism: 10, // Min number of rounds a snake plays per refresh.
    topology: [5, 10, 3],  // Number of layers and neurons per layer.
    cullRatio: 0.7,        // % of chromosomes to kill at the end of a round.

    startWeight:    () => 0,
    newWeight:      () => unAbs(randomWeightedLow(3)),

    // The number of neuron weights that are mutated in every new snake. If the
    // semi-random number for an individual is <= 0, that snake is not mutated.
    mutationAmount: () => Math.max(Math.floor(randomWeightedLow() * 9 - 1), 0),

    // The likelyhood of an action to occur on a weight that's being mutated.
    // Order is important as they line up with functions in Genome.mutate().
    mutations: {
        new: 0.8,
        max: 0,
        min: 0,
        pos: 0,
        neg: 0,
        flip: 0.2,
        zero: 0,
        rand: 0
    }

});
