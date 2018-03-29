
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
    populationSize: 40,    // Probably has to be even.
    roundsPerOrganism: 10, // Number of rounds an organism MUST participate in.
    numInputs: 5,          // 
    numHiddenLayers: 1,
    numOutputs: 3,
    numNeuronsPerLayer: 10,
    baseFitness: 100,      // Base fitness of each chromosome.
    cullRatio: 0.6,        // % of chromosomes to kill at end of round.
    mutationRate: 0.3,     // % of children to mutate
});