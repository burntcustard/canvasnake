
import * as csv from './export.js';
import * as print from '../print.js';
import { NeuralNet } from './neuralNet.js';
import { Genome } from './genome.js';
import { settings } from './settings.js';
import { combineColors } from '../lib.js';



export function Population({
    numOfSnakes = settings.populationSize,
    inputs = settings.numInputs,
    hiddenLayers = settings.numHiddenLayers,
    neuronsPerLayer = settings.numNeuronsPerLayer,
    outputs = settings.numOutputs
} = {}) {

    // Reference to the ai-nn settings global variable:
    this.settings = settings;

    // A bunch of neural nets:
    this.chromosomes = [];
    
    // A copy of the best even genome in the population
    this.bestGenome = {fitness: 0};

    // Nusmber of chromosomes within the population
    this.size = numOfSnakes;
    
    this.roundsPerChromo = settings.roundsPerChromo;

    this.fitness = {
        total: 0,
        best: 0,
        avg: 0,
        worst: 0
    };

    // Probability that a chromosomes weights will mutate
    this.mutationRate = settings.mutationRate;

    // Generation counter
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

Population.prototype.getMutants = function() {
    var mutantList = [];
    this.chromosomes.forEach(chromosome => {
        if (chromosome.genome.mutant) {
            mutantList.push(chromosome);
        }
    });
    return mutantList;
};


/**
 * Updates the fitness properties of the population and sorts the chromosomes
 * from best to worst.
 */
Population.prototype.updateFitness = function() {
    
    this.fitness.total = 0;
    
    this.chromosomes.forEach(c => {
        c.genome.fitness = Math.round(c.genome.fitness / c.roundsPlayed);
        this.fitness.total += c.genome.fitness;
    });
    
    // Sort the chromosomes by fitness from highest to lowest:
    this.chromosomes.sort((a, b) => b.genome.fitness - a.genome.fitness);
    
    this.fitness.best = this.chromosomes[0].genome.fitness;
    this.fitness.worst = this.chromosomes[this.size-1].genome.fitness;
    this.fitness.avg = Math.round(this.fitness.total / this.size);
    /*
    let resultsStr = "";
    this.chromosomes.forEach(c => {
        let oStr = c.old ? "o" : "";
        let mStr = c.genome.mutant ? "m, " : ", ";
        resultsStr += c.genome.fitness + oStr + mStr;
    });
    console.log(resultsStr);
    */
};

// Kill of x percent of the worst performing snakes
Population.prototype.cull = function(ratio = settings.cullRatio) {

    var amountToKill = Math.trunc(this.chromosomes.length * ratio);
    this.chromosomes.splice(this.chromosomes.length - amountToKill);
    //console.log("Culled "+amountToKill+" snakes, "+this.chromosomes.length+" remain.");
    
    //*/
    let survivorStr = "Gen" + (this.genCounter-1) + " survivors fitness: ";
    for (let i = 0; i < this.chromosomes.length; i++) {
        survivorStr += this.chromosomes[i].genome.fitness;
        if (this.chromosomes[i].genome.mutated) survivorStr += "m";
        survivorStr += " ";
    }
    console.log(survivorStr);
    //*/
    // Reset the fitness of the remaining chromosomes:
    this.chromosomes.forEach(chromosome => {
        chromosome.genome.fitness = settings.baseFitness;
        chromosome.roundsPlayed = 0;
        chromosome.old = true;
    });

};

// Gets the population back up to it's initial size by breeding
// the best snake by other (randomly selected) remaining snakes.
Population.prototype.breed = function() {

    //var numOfNewChromosomes = 0;

    while (this.chromosomes.length < this.size) {
        this.chromosomes.push(crossover([
            this.chromosomes[0],
            this.chromosomes.random()
        ]));
        //numOfNewChromosomes++;
    }

    //console.log("Bred another " + numOfNewChromosomes + " snakes.");

};

Population.prototype.updateBest = function() {
    let best = this.chromosomes[0];
    if (best.genome.fitness > this.bestGenome.fitness) {
        this.bestGenome = JSON.parse(JSON.stringify(best.genome));
        this.bestGenome.created = "generation " + this.genCounter;
        delete this.bestGenome.baseWeights;
    }
};

Population.prototype.refresh = function() {
    
    // Figure out new fitness values
    this.oldFitness = JSON.parse(JSON.stringify(this.fitness));
    
    // Calculate and order genome and population fitnesses:
    this.updateFitness();
    
    // Save the best chromosome for future shenanigans:
    this.updateBest();

    // Figure out how long the round took (in milliseconds)
    if (this.runTime === undefined) {
        this.endTime = performance.now();
        this.runTime = this.endTime - this.creationTime;
    } else {
        this.runTime = performance.now() - this.endTime;
        this.endTime = performance.now();
    }
    this.runTime = Math.round(this.runTime);

    // Update data that could be exported:
    csv.update(this);
    
    // Print a line to the console with info about the last generation:
    print.generationDetails(this);

    // Increment generation counter, kill some chromosomes, breed replacements:
    this.genCounter++;
    this.cull();
    this.breed();
};



/**
 * Create a child from the genomes of one or more parents.
 * @param {Array} parents [[Description]]
 */
function crossover(parents) {

    // For every weight of the child, randomly pick one of the parents weights:
    // Uses Float32s with no conversions to/from doubles so should be fast.
    var parentWeights = new Float32Array(parents.length);
    var genomeLength = parents[0].genome.weights.length;
    var childWeights = new Float32Array(genomeLength);
    
    /*// New way of picking weights:
    var crossoverPoints = new Uint8Array(1 + Math.ceil(Math.random() * 9));
    // Start at 1 because crossover always starts at 0 (TODO: Explain better).
    for (let i = 1; i < crossoverPoints.length; i++) {
        crossoverPoints[i] = Math.ceil(Math.random() * genomeLength);
    }
    //console.log(crossoverPoints);
    // Start w/random parent
    let parentCounter = Math.floor(Math.random() * parents.length);
    for (let i = 0; i < crossoverPoints.length; i++) {
        //console.log("crossoverPoints[i]: " + crossoverPoints[i]);
        for (let j = crossoverPoints[i]; j < crossoverPoints[i+1]; j++) {
            childWeights[j] = parents[parentCounter].genome.weights[j];
            //console.log("i: " + i + "j: " + j + ", parentCounter: " + parentCounter + ", weight: " + parents[parentCounter].genome.weights[j]);
        }
        parentCounter++;
        if (parentCounter === parents.length) parentCounter = 0;
    }
    //console.log(childWeights);
    
    //*/
    //*// Old way of picking weights:
    for (let i = 0; i < genomeLength; i++) {
        for (let j = 0; j < parents.length; j++) {
            parentWeights[j] = parents[j].genome.weights[i];
        }
        childWeights[i] = parentWeights.random();
    }
    //*/
    var genome = new Genome(
        parents[0].numInputs,
        parents[0].numHiddenLayers,
        parents[0].neuronsPerLayer,
        parents[0].numOutputs,
        childWeights
    );
    
    // Maybe mutate the child genome based off the population's mutation rate:
    if (Math.random() < parents[0].population.mutationRate) {
        //let oldWeights = genome.weights.slice();
        genome.mutate();
        /*
        let newWeights = genome.weights.slice();
        let numWeightsChanged = 0;
        console.log("Number of weights in snek: " + oldWeights.length);
        for (let i = 0; i < oldWeights.length; i++) {
            if (oldWeights[i] !== newWeights[i]) {
                console.log("Weight changed (old/new):");
                console.log(oldWeights[i]);
                console.log(newWeights[i]);
                numWeightsChanged++;
            }
        }
        console.log("Number of weights mutated: " + numWeightsChanged);
        //*/
    } else {
        // Non-mutant chromosomes are the average color of their parents:
        let parentColors = [];
        parents.forEach(parent => {
            parentColors.push(parent.genome.color);
        });
        genome.color = combineColors(parentColors);
    }

    // Create new chromosome (i.e. child neural network)
    return new NeuralNet({genome: genome, population: parents[0].population});
}
