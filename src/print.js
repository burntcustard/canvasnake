

export function generationDetails(pop) {
    
    let fitnessDiff = {
        total: pop.fitness.total - pop.oldFitness.total,
        avg: pop.fitness.avg - pop.oldFitness.avg,
        worst: pop.fitness.worst - pop.oldFitness.worst,
        best: pop.fitness.best - pop.oldFitness.best
    };

    /*
    //console.info("=================================");
    console.log("Generation: " + this.genCounter);
    console.log("  Fitness:");
    console.log("    Total: " + this.fitness.total + diffStr(fitnessDiff.total));
    console.log("    Average: " + this.fitness.avg + diffStr(fitnessDiff.avg));
    console.log("    Best: " + this.fitness.best + diffStr(fitnessDiff.best));
    console.log("    Worst: " + this.fitness.worst + diffStr(fitnessDiff.worst));
    console.log("  Run time: " + Math.round(this.runTime / 1000) + "s");
    console.log("=================================");
    */
    let genStr = "Gen" + (pop.genCounter.toString()).padStart(3, '0');
    let timeStr = (Math.round(pop.runTime / 1000) + "s").padStart(4);
    let avgStr = (pop.fitness.avg.toString()).padStart(6) + diffStr(fitnessDiff.avg).padEnd(8);
    let bestStr = (pop.fitness.best.toString()).padStart(6) + diffStr(fitnessDiff.best).padEnd(8);
    let worstStr = (pop.fitness.worst.toString()).padStart(6) + diffStr(fitnessDiff.worst).padEnd(8);
    //console.log("Gen: " + this.genCounter + timeStr + " Fitness:");
    if (pop.genCounter === 0) {
        console.log("       | Time |   Average    |     Best     |    Worst");
    }
    console.log(genStr+" | "+timeStr+" |"+ avgStr+"|"+bestStr+"|"+worstStr);
    
}



/**
 * Forces signing (+-) on a number, and returns
 * it as a string with surrounding brackets.
 * @param   {number} number [[Description]]
 * @returns {string} Output string with sign and brackets.
 */
function diffStr(number) {
    if(number > 0){
        return " (+" + number + ")";
    } else {
        return " ("  + number + ")";
    }
}
