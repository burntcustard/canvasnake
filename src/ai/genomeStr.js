
import { Genome } from './genome.js';
import { weightToBase64, base64ToWeight } from './base64.js';



/**
 * [[Description]]
 * @param   {object}   genome [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
export function encodeGenome(genome) {
    return (
        genome.color + '|' +
        genome.topology.toString() + '|' +
        genome.weights.reduce((acc, cur) => {
            return acc + weightToBase64(cur);
        }, "")
    );
}

export function decodeGenome(genomeStr) {

    if (!genomeStr) {
        console.warn("Invalid genome string, creating random genome.");
        return new Genome();
    }

    var properties = ["color", "topology", "weights"],  // We don't actually use the last/weights one.
        property = properties.values(),
        currentStr = "",
        genomeInfo = {
            color: "",
            topology: [],
            weights: []
        };

    // Remove unwanted chars (add others within square brackets if required):
    genomeStr = genomeStr.replace(/["]+/g, '');

    genomeStr.split('').forEach(char => {
        switch (char) {
            case '+':
            case '-':
                if (currentStr.length) {
                    genomeInfo.weights.push(base64ToWeight(currentStr));
                }
                currentStr = char;
            break;
            case '|':
                switch (property.next().value) {
                    case "color":
                        genomeInfo.color = currentStr;
                    break;
                    case "topology":
                        genomeInfo.topology = currentStr.split(',').map(Number);
                    break;
                }
                currentStr = "";
            break;
            default:
                currentStr += char;
        }
    });

    // Add the last "trailing" (no end character) weight:
    genomeInfo.weights.push(base64ToWeight(currentStr));

    return new Genome(
        genomeInfo.topology,
        new Float32Array(genomeInfo.weights),
        genomeInfo.color
    );
}

/**
 * Example of a saved genome (basically JSON):
 *
 * color: "#F4HS56",
 * created: "gen61",
 * fitness: 1500,
 * mutated: 3,
 * topology: [5, 10, 10, 3],
 * weights: [
 *     +0.3454854,
 *     -0.5453944,
 * ],
 *
 * Example of saved compressed genome for text copy pasta:
 *
 * #2a5ab6|5,10,10,3|+AOsa-4nHG+5NFa-J4fe+ef9J
 *
 *  - Sections figured out automatically based on content.
 *  - Aim for >90% reduction in character count over saved genome JSON.
 *  - Probably going to be more like 60%.
 *
 */
