


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



export function update(population) {
    // Add values to csv array for exporting:
    if (!population.csv) {
        population.csv = [
            Object.keys(population.settings),
            Object.values(population.settings),
            [],
            ["generation", "total", "average", "best", "worst", "runTime"]
        ];
    }
    population.csv.push([
        population.genCounter,
        population.fitness.total,
        population.fitness.avg,
        population.fitness.best,
        population.fitness.worst,
        population.runTime
    ]);
}