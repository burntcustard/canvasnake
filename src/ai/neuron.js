
import { softsign, ReLU } from './functions.js';



export function Neuron(weights) {
    this.weights = weights;  // E.g. [0.5, 0.4, 0.3]
    this.inputs = new Float32Array(Math.max(1, weights.length - 1));
    this.activationFunction = softsign;
}

Neuron.prototype.activate = function(inputs) {
    
    let netInput = 0;
    this.inputs.set(inputs);
    
    if (this.inputs.length > 1) {
        for (let i = 1; i < this.weights.length; i++) {
            netInput += this.weights[i] * this.inputs[i-1];
        }
        // Add bias:
        netInput += this.weights[0];
    } else {
        //netInput = this.inputs[0] * 2;
        // Switched to just pass-through inputs:
        this.output = Math.round(inputs[0] * 1e2) / 1e2;
        return inputs[0];
    }

    //neuron.outputPreAct = Math.round(netInput * 1e2) / 1e2;
    netInput = this.activationFunction(netInput);
    
    // this.output is just set for viewing, the return value is actually used:
    this.output = Math.round(netInput * 1e2) / 1e2;
    return netInput;
};