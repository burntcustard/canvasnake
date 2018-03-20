
/**
 *
 * Population: A group of many snakes
 * Snake: An individual AI snake (a phenotype)
 * Genome: A specific set of weights that define the AI
 * Chromosome: (Genotype) A genome that belongs to an individual.
 * NeuralNet: A structure of layers of neurons (a "brain").
 * Layer: A set of neurons.
 * Neuron: A node / brain cell type thing.
 *
 */

export const settings = Object.freeze({
    debug: true,           // Set to false to remove debugging properties.
    populationSize: 30,    // Probably has to be even.
    roundsPerChromo: 10,   // Number of rounds a chromosome MUST participate in.
    numInputs: 5,          // 
    numHiddenLayers: 1,
    numOutputs: 2,
    numNeuronsPerLayer: 20,
    baseFitness: 100,      // Base fitness of each chromosome.
    cullRatio: 0.6,        // % of chromosomes to kill at end of round.
    mutationRate: 0.4,     // % of children to mutate
    mutationTendancy: 0.1, // % of neurons to mutate (using number instead now).
    mutationNumber: 3,     // The number of neurons to mutate.
    mutationAmount: 0.8    // % to mutate weight by (currently hardcoded 0.5).
});