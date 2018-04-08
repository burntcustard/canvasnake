
/**
 * If the game has a collection of data about a population
 * then download it as a Comma Separated Values file.
 */
export function downloadCSV() {
    if (!window.game.ai ||
        !window.game.ai.population ||
        !window.game.ai.population.csv) {
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    window.game.ai.population.csv.forEach(row => {
        csvContent += row.join(",") + "\r\n";
    });
    let encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}



/**
 * Adds population performance data to the populations csv object.
 * @param {object} population [[Description]]
 */
export function update(population) {
    if (!population.csv) {
        population.csv = [
            Object.keys(population.settings),
            Object.values(population.settings),
            [],
            //["Best genome recent:", decode(population.bestGenomeCurrent)],
            //["Best genome ever:"  , decode(population.bestGenomeEver)],
            //[],
            ["generation", "average", "best", "worst", "total", "runTime"]
        ];
    }
    population.csv.push([
        population.genCounter,
        population.fitness.avg,
        population.fitness.best,
        population.fitness.worst,
        population.fitness.total,
        population.runTime
    ]);
}
