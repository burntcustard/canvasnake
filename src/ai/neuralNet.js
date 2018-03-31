
import { settings } from './settings.js';
import { Neuron } from './neuron.js';
import { Genome } from './genome.js';
import * as convert from '../convert.js';
import * as func from './functions.js';
import * as lib from '../lib.js';



// Not to be confused with _P_layer huehue. TODO: Documentation
// Holds a bunch of neurons
function Layer(
    name, inputs, numNeurons, inputsPerNeuron, genomeWeights, cWeight, to, activationFunc = func.softsign
) {
    this.name = name;
    this.inputs = inputs;
    let layerWeights = genomeWeights.slice(cWeight.i, cWeight.i + to);
    let weightsPerNeuron = inputsPerNeuron + 1;
    for (let i = 0; i < numNeurons * weightsPerNeuron; i += weightsPerNeuron) {
        let neuronWeights = layerWeights.slice(i, i + inputsPerNeuron + 1);
        let genomeLocation = cWeight.i + i;
        this.push(new Neuron(neuronWeights, genomeLocation, activationFunc));
    }
    this.outputs = new Float32Array(numNeurons);
    cWeight.i += to;  // Update current weight index for the next layer.
}
Layer.prototype = Array.prototype;



export function NeuralNet({
    genome,
    numInputs = settings.numInputs,
    numHiddenLayers = settings.numHiddenLayers,
    neuronsPerLayer = settings.numNeuronsPerLayer,
    numOutputs = settings.numOutputs,
    population
} = {}) {

    this.genome = genome = genome || new Genome(
        numInputs,
        numHiddenLayers,
        neuronsPerLayer,
        numOutputs
    );

    this.population = population;
    this.roundsPlayed = 0;
    this.layers = [];
    this.inputs = new Float32Array(numInputs);
    
    var currentWeight = {i: 0};
    
    //console.log(currentWeight);
    
    var weightBoundLower = 0;
    var weightBoundUpper = numInputs;
    this.layers.push(new Layer(
        "Input",
        this.inputs,
        numInputs,
        0,               // 0 inputsPerNeuron implies there will be no inputs,
        genome.weights,  // but there will be, they're just not weighted.
        currentWeight,
        numInputs,
        null  // No activation function for the input layer.
    ));
    
    for (let i = 0; i < numHiddenLayers; i++) {
        
        //console.log(currentWeight);
        
        // Num of inputs for the: 1st layer | following layers
        let layerNumInputs = !i ? numInputs : neuronsPerLayer;
        this.layers.push(new Layer(
            "Hidden" + i,
            this.layers[i].outputs,
            neuronsPerLayer,
            layerNumInputs,
            genome.weights,
            currentWeight,
            neuronsPerLayer * (layerNumInputs + 1)
        ));
    }
    
    //console.log(currentWeight);
    
    this.layers.push(new Layer(
        "Output",
        this.layers[this.layers.length-1].outputs,
        numOutputs,
        neuronsPerLayer,
        genome.weights,
        currentWeight,
        numOutputs * (neuronsPerLayer + 1),
        func.ReLU
    ));
    
    //console.log(currentWeight);
    
    this.outputs = this.layers[this.layers.length-1].outputs;
    
    // Create a one dimension array version of the list of neurons, which
    // contains references to (not duplicates of) the neurons in the layers
    var i = 0;
    this.neurons = [];
    for (let l = 0; l < this.layers.length; l++) {
        for (let n = 0; n < this.layers[l].length; n++) {
            this.neurons[i++] = this.layers[l][n];
        }
    }
    
    //*// Warn if there are any left over weights:
    if (currentWeight.i < genome.weights.length) {
        console.warn("Unused genome weights:");
        for (let i = currentWeight.i; i < genome.weights.length; i++) {
            console.log(genome.weights[i]);
        }
    }
    //*/
    
    //*// Warn if there weren't enough weights:
    if (currentWeight > genome.weights.length) {
        let numNeeded = currentWeight - genome.weights.length;
        console.warn("Needed " + numNeeded + " more genome weights");
    }

}



/**
 * Calculate the outputs from a set of inputs.
 * @param {[[Type]]} inputs [[Description]]
 */
NeuralNet.prototype.update = function(inputs) {

    this.inputs.set(inputs);
    var onInputLayer = true;

    this.layers.forEach(layer => {
        layer.forEach(function(neuron, i) {
            if (onInputLayer) {
                // In the input layer, each neuron gets just 1 input:
                layer.outputs[i] = neuron.activate(layer.inputs.slice(
                        neuron.inputs.length * i,
                        neuron.inputs.length * (i + 1)
                ));
            } else {
                // In the following layers, each neuron receives
                // every output from previous layer:
                layer.outputs[i] = neuron.activate(layer.inputs);
            }
        });
        onInputLayer = false;
    });
};



NeuralNet.prototype.encode = function() {
    
    var neuralNetStr = "";
    
    this.layers.forEach(layer => {
        layer.forEach(neuron => {
            neuron.weights.forEach(weight => {
                neuralNetStr += convert.weightToBase64(weight);
            });
            if (neuron !== layer.last()) neuralNetStr += '/';
        });
        if (layer !== this.layers.last()) neuralNetStr += '|';
    });
    
    return neuralNetStr;
};
