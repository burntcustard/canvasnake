
import { settings } from './settings.js';
import { Neuron } from './neuron.js';
import { Genome } from './genome.js';



// Not to be confused with _P_layer huehue. TODO: Documentation
// Holds a bunch of neurons
function Layer(name, inputs, numNeurons, inputsPerNeuron, genomeWeights, cWeight, to) {
    this.name = name;
    this.inputs = inputs;
    let layerWeights = genomeWeights.slice(cWeight.i, cWeight.i + to++);
    let weightsPerNeuron = inputsPerNeuron + 1;
    cWeight.i = to;  // Update current weight index for the next layer.
    //console.log("Number of weights in " + name + " layer: " + layerWeights.length);
    for (let i = 0; i < numNeurons * weightsPerNeuron; i += weightsPerNeuron) {
        let neuronWeights = layerWeights.slice(i, i + inputsPerNeuron + 1);
        //console.log(neuronWeights);
        this.push(new Neuron(neuronWeights));     // Generic neuron.
    }
    this.outputs = new Float32Array(numNeurons);
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
    
    var weightBoundLower = 0;
    var weightBoundUpper = numInputs;
    this.layers.push(new Layer(
        "Input",
        this.inputs,
        numInputs,
        0,               // 0 inputsPerNeuron implies there will be no inputs,
        genome.weights,  // but there will be, they're just not weighted.
        currentWeight,
        numInputs
    ));
    
    this.layers.push(new Layer(
        "Hidden0",
        this.layers[0].outputs,
        neuronsPerLayer,
        numInputs,
        genome.weights,
        currentWeight,
        neuronsPerLayer * (numInputs + 1)
    ));
    
    for (let i = 1; i < numHiddenLayers; i++) {
        this.layers.push(new Layer(
            "Hidden" + i,
            this.layers[i].outputs,
            neuronsPerLayer,
            neuronsPerLayer,
            genome.weights,
            currentWeight,
            i * neuronsPerLayer * (neuronsPerLayer + 1)
        ));
    }
    
    this.layers.push(new Layer(
        "Output",
        this.layers[this.layers.length-1].outputs,
        numOutputs,
        neuronsPerLayer,
        genome.weights,
        currentWeight,
        neuronsPerLayer * (numOutputs + 1)
    ));
    
    this.outputs = this.layers[this.layers.length-1].outputs;

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
                layer.outputs[i] = neuron.activate(layer.inputs.slice(
                        neuron.inputs.length * i,
                        neuron.inputs.length * (i + 1)
                ));
            } else {
                //console.log(neuronInputs);
                layer.outputs[i] = neuron.activate(layer.inputs);
            }
        });
        onInputLayer = false;
    });
};
