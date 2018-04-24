
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
    populationSize: 40,    // Number of organisms. Probably has to be even.
    roundsPerOrganism: 10, // Min number of rounds a snake plays per refresh.
    topology: [5, 20, 3],  // Number of layers and neurons per layer. ai2: 902.
    cullRatio: 0.75,       // % of chromosomes to kill at end of round.
    newWeight: () => unAbs(randomWeightedLow(3)),
    mutationAmount: () => Math.max(Math.floor(randomWeightedLow() * 9 - 1), 0)
});
