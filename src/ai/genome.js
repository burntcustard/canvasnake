
import { randomColor } from '../lib/color.js';
import { settings } from './settings.js';
import { randomWeight, randomWeightedLow, clamp } from './functions.js';



/**
 * [[Description]]
 * @param {number} inputs          Number of input neurons.
 * @param {number} hiddenLayers    Number of middle/hidden layers.
 * @param {number} neuronsPerLayer Number of neurons per hidden layer.
 * @param {number} outputs         Number of output neurons.
 */
export function Genome(inputs, hiddenLayers, neuronsPerLayer, outputs, weights) {

    this.fitness = settings.baseFitness;
    this.color = randomColor();
    if (weights) {
        this.weights = weights;
    } else {
    // Weights haven't been specified so randomly generate some:
        let numOfWeights = inputs;  // One weight for each input neuron bias.
        numOfWeights += (inputs + 1) * neuronsPerLayer;
        numOfWeights += ((neuronsPerLayer + 1) * neuronsPerLayer) * (hiddenLayers - 1);
        numOfWeights += (neuronsPerLayer + 1) * outputs;
        // Make array of x length that's all initialized to 0 (super speedy):
        this.weights = new Float32Array(numOfWeights);
        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] = randomWeight();
        }
    }
    // Keep a record of the original "base" weights that the genome started
    // with. After a lot of mutating, this.weights should be quite different!
    this.baseWeights = this.weights.slice();
}

Genome.prototype.getMutatedWeights = function() {
    var mutatedWeights = [];
    for (let i = 0; i < this.weights.length; i++) {
        let weight = this.weights[i].toFixed(3).toString().padStart(6),
            baseWeight = this.baseWeights[i].toFixed(3).toString().padStart(6);
        if (weight !== baseWeight) {
            mutatedWeights.push(
                (i + " ").padStart(5) + weight + " -> " + baseWeight
            );
        }
    }
    return mutatedWeights;
};



/**
 * Mutates a neural network's genome (i.e. mutates an organism).
 * A random weight in the genome is chosen to mutate, and then a
 * replacement weight value is chosen. The mutation amount
 * @param {number} amount   How much the original weight value should
 *                          change. 0 meaning no change, 1 meaning the
 *                          old value is replaced with the new, 0.5
 *                          meaning that the replacement will be half
 *                          way in between the old and new values.
 * @param {number} tendancy How likely it is that a particular weight will be mutated.
 *                          E.g. 0.1 means on average, 1 in every 10 will mutate.
 */
Genome.prototype.mutate = function(
    amountToMutate = settings.mutationAmount,
    numberToMutate = settings.mutationNumber,
    tendancy = settings.mutationTendancy,
    flipWeightRate = 0, //0.001,     
    newWeightRate = 1,  //0.001,
    maxWeightRate = 0,  //0.001,
    minWeightRate = 0,  //0.001,
    zeroWeightRate = 0, //0.001,
    posWeightRate = 0, //0.05,
    negWeightRate = 0  //0.05
) {
    
    var threshold = new Float64Array(7);
    for (let i = 0; i < threshold.length; i++) threshold[i] += flipWeightRate;
    for (let i = 1; i < threshold.length; i++) threshold[i] += newWeightRate;
    for (let i = 2; i < threshold.length; i++) threshold[i] += maxWeightRate;
    for (let i = 3; i < threshold.length; i++) threshold[i] += minWeightRate;
    for (let i = 4; i < threshold.length; i++) threshold[i] += zeroWeightRate;
    for (let i = 5; i < threshold.length; i++) threshold[i] += posWeightRate;
    for (let i = 6; i < threshold.length; i++) threshold[i] += negWeightRate;
    
    /*
    let weightsDebug = [];
    for (let i = 0; i < this.weights.length; i++) {
        weightsDebug.push((i.toString()).padStart(3) + "| " + this.weights[i]);
    }
    //*/
    
    //this.weights.forEach((objectRef, i, weights) => {
    this.mutated = numberToMutate = 1 + Math.floor(randomWeightedLow() * 9);
    let i = this.weights.randomIndex();
    for (let j = 0; j < numberToMutate; j++) {
        if (++i === this.weights.length) i = 0;  // Increment/overflow.
        let chance = Math.random();
        if (chance < threshold[0]) {
            this.weights[i] = -this.weights[i];
        } else        
        if (chance < threshold[1]) {
            this.weights[i] = randomWeight();
        } else
        if (chance < threshold[2]) {
            this.weights[i] = +1.0;
        } else
        if (chance < threshold[3]) {
            this.weights[i] = -1.0;
        } else
        if (chance < threshold[4]) {
            this.weights[i] = 0.0;
        } else
        if (chance < threshold[5]) {
            this.weights[i] += randomWeightedLow(9);
            this.weights[i] = clamp(this.weights[i]);
        } else
        if (chance < threshold[6]) {
            this.weights[i] -= randomWeightedLow(9);
            this.weights[i] = clamp(this.weights[i]);
        }
    //});
    }
    /*
    for (let i = 0; i < this.weights.length; i++) {
        weightsDebug[i] +=  " | " + this.weights[i];
        console.log(weightsDebug[i]);
    }
    //*/
    
    //this.mutated = true;
    this.color = randomColor();

};



/**
 * Returns a copy of the genome with some bits removed, some
 * added, making it suitable for analysing and/or recreating.
 * @param   {object} population The population the genome belongs to.
 * @returns {object} Modified copy of the genome.
 */
Genome.prototype.save = function(population) {
    
    // A copy of the genome:
    let genome = JSON.parse(JSON.stringify(this));
    
    // Add the generation counter:
    genome.created = "gen" + this.genCounter;
    
    // Save neural network topology:
    genome.topology = [];
    population.organisms[0].layers.forEach(layer => {
        genome.topology.push(layer.length);
    });
    
    // Don't need the original starting weights of the saved genome
    delete genome.baseWeights;
    
    return genome;
};
