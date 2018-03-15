
/*jshint loopfunc: true*/


import { combineColors, randomColor } from './lib.js';


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



function sigmoid(t) {
    return 1/(1+Math.exp(-t));
}



/**
 * Generates a random number between 0 and 1, favouring around 0.5.
 * @returns {[[Type]]} [[Description]]
 */
function randomClamped() {
    return sigmoid(Math.random()-0.5);
}



function Neuron(weights) {
    
    this.weights = weights;  // E.g. [0.5, 0.4, 0.3]
    this.inputs = Array(weights.length - 1).fill(0);  // E.g. [0, 0]
    
}



/**
 * [[Description]]
 * @param {number} inputs          Number of input neurons.
 * @param {number} hiddenLayers    Number of middle/hidden layers.
 * @param {number} neuronsPerLayer Number of neurons per hidden layer.
 * @param {number} outputs         Number of output neurons.
 */
function Genome(inputs, hiddenLayers, neuronsPerLayer, outputs, weights) {
    
    this.fitness = 0;
    this.weights = weights || [];
    
    // Weights haven't been specified so randomly generate some:
    if (!this.weights.length) {
        let numOfWeights = 0;
        numOfWeights += (inputs + 1) * neuronsPerLayer;
        numOfWeights += (neuronsPerLayer + 1) * (hiddenLayers - 1);
        numOfWeights += (outputs + 1) * neuronsPerLayer;
        for (var i = 0; i < numOfWeights; i++) {
            this.weights.push(randomClamped());
        }
    }
    
}



function NeuralNet({
    genome,
    inputs = 6,
    hiddenLayers = 1,
    neuronsPerLayer,
    outputs = 4,
    population
} = {}) {
    
    neuronsPerLayer = neuronsPerLayer || inputs * 2;
    
    this.genome = genome = genome || new Genome(
        inputs,
        hiddenLayers,
        neuronsPerLayer,
        outputs
    );
    
    this.numInputs = inputs;
    this.numOutputs = outputs;
    this.numHiddenLayers = hiddenLayers;
    this.numNeuronsPerHiddenLayer = neuronsPerLayer;
    this.population = population;
    this.color = randomColor();
    this.layers = [];
    var cWeight = 0;  // Index of the _c_urrent weight being used.
    
    function newLayer(numNeurons, inputsPerNeuron) {
        let layer = [];
        for (let i = 0; i < numNeurons; i++) {
            let weights = [];
            weights.push(genome.weights[cWeight++]);      // Bias
            for (let j = 1; j <= inputsPerNeuron; j++) {  // Other weights
                weights.push(genome.weights[cWeight++]);
            }
            layer.push(new Neuron(weights));
        }
        return layer;
    }
    
    // Add first layer hidden layer with the number of inputs to each
    // neuron set as the number of inputs to the neural network:
    this.layers.push(newLayer(neuronsPerLayer, this.numInputs));
    
    // Add other hidden layer(s) with the number of inputs to each
    // neuron set as the number of neurons per hidden layer:
    for (let i = 0; i < hiddenLayers - 1; i++) {
        let hiddenLayer = newLayer(neuronsPerLayer, neuronsPerLayer);
        this.layers.push(hiddenLayer);
    }
    
    // Add output layer with the number of inputs to each neuron
    // set as the number of neurons per hidden layer:
    this.layers.push(newLayer(this.numOutputs, neuronsPerLayer));
    
    //console.log(this.layers);
         
}



/**
 * Calculate the outputs from a set of inputs.
 * @param {[[Type]]} inputs [[Description]]
 */
NeuralNet.prototype.update = function(inputs) {
    
    var outputs = [];
    var cWeight = 0;  // Index of the _c_urrent weight being used.
    
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i] > 1 || inputs[i] < 0) {
            inputs[i] = sigmoid(inputs[i]);
        }
    }
    
    this.layers.forEach(layer => {
        
        // Inputs are the initial inputs, or outputs of the previous layer
        if (outputs.length === 0) {
            inputs = inputs;
        } else {
            inputs = outputs.slice();
            outputs = [];
        }
        
        // For each neuron sum the (inputs * weights)
        layer.forEach(neuron => {
            let netInput = 0;
            
            neuron.inputs = inputs;
            
            // Add in the bias (i.e. weight[0])
            netInput += neuron.weights[0];
            
            // Sum weights * inputs
            for (let i = 1; i < neuron.weights.length; i++) {
                netInput += neuron.weights[i] * inputs[i-1];
                //console.log(inputs[i-1]);
            }
            
            //console.log(netInput);
            neuron.output = netInput / neuron.weights.length;
            outputs.push(netInput / neuron.weights.length);
            
        });
        
        //console.log(outputs);
        
    });
    
    //console.log(outputs);
    this.outputs = outputs;
    
};


/**
 * Mutates a neural network's genome (i.e. mutates a chromosome).
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
NeuralNet.prototype.mutate = function(amount = 0.5, tendancy = 0.1) {
    
    this.genome.weights.forEach(weight => {
        if (Math.random < tendancy) {
            weight = weight * (1 - amount) + Math.random() * amount;
        }
    });
    
    this.color = randomColor();
    
};



/**
 * Create a child from the genomes of one or more parents.
 * @param {Array} parents [[Description]]
 */
function crossover(parents) {
    
    var weights = [];
    
    // Make all of the weights in the genome half way between parent values.
    for (let i = 0; i < parents[0].genome.weights.length; i++) {
        let total = 0;
        parents.forEach(parent => {
            total += parent.genome.weights[i];
        });
        weights.push(total /= parents.length);
    }
    
    // Create new chromosome (i.e. child neural network)
    var chromosome = new NeuralNet({
        genome: new Genome(
            parents[0].numInputs,
            parents[0].numHiddenLayers,
            parents[0].neuronsPerLayer,
            parents[0].numOutputs,
            weights
        ),
        population: parents[0].population
    });
    
    // The chromosomes color is the average of it's parents:
    var parentColors = [];
    parents.forEach(parent => {
        parentColors.push(parent.color);
    });
    chromosome.color = combineColors(parentColors);
    
    // Maybe mutate the child based off the population's mutation rate:
    if (Math.random() < parents[0].population.mutationRate) {
        chromosome.mutate();
    }
    
    return chromosome;
    
}


export function Population({
    numOfSnakes = 20,
    inputs = 6,
    hiddenLayers = 1,
    neuronsPerLayer,
    outputs = 4
} = {}) {
    
    // A bunch of neural nets:
    this.chromosomes = [];
    
    this.size = numOfSnakes;
    
    this.fitness = {
        total: 0,
        best: 0,
        avg: 0,
        worst: 0
    };
    
    // Probability that a chromosomes weights will mutate
    this.mutationRate = 0.3;
    
    // Probability of a chromosomes crossing over bits (???)
    // TODO: Make this do something? Maybe make cross overs not always take
    // bits from both parents?..
    this.crossoverRate = 0.7;
    
    // Generation counter:
    this.genCounter = 0;
    
    for (let i = 0; i < numOfSnakes; i++) {
        this.chromosomes.push(new NeuralNet({
            inputs: inputs,
            hiddenLayers: hiddenLayers,
            neuronsPerLayer: neuronsPerLayer,
            outputs: outputs,
            population: this
        }));
    }
    
    this.creationTime = performance.now();
    
}


/**
 * Updates the fitness properties of the population and sorts the chromosomes
 * from best to worst.
 */
Population.prototype.updateFitness = function() {
    
    // Sort the chromosomes by fitness highest to lowest:
    this.chromosomes.sort((a, b) => b.genome.fitness - a.genome.fitness);
    
    this.fitness.total = 0;
    this.chromosomes.forEach(chromosome => {
        this.fitness.total += chromosome.genome.fitness;
    });
    
    this.fitness.best = this.chromosomes[0].genome.fitness;
    this.fitness.worst = this.chromosomes[this.chromosomes.length-1].genome.fitness;
    
    this.fitness.avg = Math.trunc(this.fitness.total / this.chromosomes.length);
    
};


// Kill of x percent of the worst performing snakes
Population.prototype.cull = function(percent = 60) {
    
    var amountToKill = Math.trunc(this.chromosomes.length * (percent / 100));
    this.chromosomes.splice(this.chromosomes.length - amountToKill);
    //console.log("Culled "+amountToKill+" snakes, "+this.chromosomes.length+" remain.");
    
    // Reset the fitness of the remaining chromosomes:
    this.chromosomes.forEach(chromosome => {
        chromosome.genome.fitness = 0;
    });
    
};

// Gets the population back up to it's initial size by breeding
// couples (randomly selected) of the remaining snakes.
Population.prototype.breed = function() {
    
    var numOfNewChromosomes = 0;
    
    while (this.chromosomes.length < this.size) {
        this.chromosomes.push(crossover([
            this.chromosomes.random(),
            this.chromosomes.random()
        ]));
        numOfNewChromosomes++;
    }
    
    //console.log("Bred another " + numOfNewChromosomes + " snakes.");
    
};

// Forces signing on a number, returned as a string
function diffStr(number) {
    if(number > 0){
        return " (+" + number + ")";
    } else {
        return " ("  + number + ")";
    }
}

Population.prototype.refresh = function() {
    let previousFitness = JSON.parse(JSON.stringify(this.fitness));
    this.updateFitness();
    let fitnessDiff = {
        total: this.fitness.total - previousFitness.total,
        avg: this.fitness.avg - previousFitness.avg,
        worst: this.fitness.worst - previousFitness.worst,
        best: this.fitness.best - previousFitness.best
    };
    if (this.runTime === undefined) {
        this.endTime = performance.now();
        this.runTime = this.endTime - this.creationTime;
    } else {
        this.runTime = performance.now() - this.endTime;
        this.endTime = performance.now();
    }
    console.log("=================================");
    console.log("Generation: " + this.genCounter);
    console.log("  Fitness:");
    console.log("    Total: " + this.fitness.total + diffStr(fitnessDiff.total));
    console.log("    Average: " + this.fitness.avg + diffStr(fitnessDiff.avg));
    console.log("    Best: " + this.fitness.best + diffStr(fitnessDiff.best));
    console.log("    Worst: " + this.fitness.worst + diffStr(fitnessDiff.worst));
    console.log("  Run time: " + Math.round(this.runTime / 1000) + "s");
    console.log("=================================");
    this.genCounter++;
    //console.log("Starting generation: " + this.genCounter);
    this.cull();
    this.breed();
};

