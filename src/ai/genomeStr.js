
import { Genome } from './genome.js';
import { weightToBase64, base64ToWeight } from './base64.js';
import { isName } from '../lib/misc.js';



/**
 * Returns a concise string containing a genomes important properties.
 *
 * Includes the following strings:
 *   - Name (optional), alphanumerical, spaces and _ only e.g. "My_genome 1"
 *   - Color, starting with '#' e.g. "#cc6600"
 *   - Fitness, starting with 'f:' e.g. "f:1500"
 *   - Topology, period separated values e.g. "5.10.3"
 *   - Weights, base64-likes starting with '+' or '-' e.g. "+45gD-FSh4+F8et..."
 *
 * Properties are separated by '|'. No spaces. Only topology can have commas.
 *
 * @param   {object} genome A Genome.
 * @returns {string} Encoded genome properties.
 */
export function encodeGenome(genome) {
    var optionalNameStr = genome.name ? genome.name + '|' : '';
    return (
        optionalNameStr,
        genome.color + '|' +
        'f:' + genome.fitness + '|' +
        genome.topology.toString().replace(/,/g, '.') + '|' +
        genome.weights.reduce((acc, cur) => {
            return acc + weightToBase64(cur);
        }, "")
    );
}



/**
 * Decodes an encoded genome information string and returns a new Genome.
 * @param   {string} encodedGenome The genome string to decode.
 * @returns {object} A new Genome.
 */
export function decodeGenome(encodedGenome) {

    if (!encodedGenome) {
        console.warn("Invalid genome string. Returning default genome.");
        encodedGenome = "#800080|f:4681|5.12.3|-6DTm-8YwU+67cD-KALn+GclC+6JGO-CBKC+8d_k+4utz-MkZa+2DLQ+FbMl-1gr_+APJF-4tNq-6zVi+FvQz-67kL+6WgH-1RUz+XkSc+4lp9-ChSW+15Ha+5A$k-8zrj-9h0w-2ZjW+DyTP-1Vhe+5o6e-3GWF+F7yk-1k5l-DCQB-GwIe-6cmU-D5$L+6J8M+N4jo-7dAZ-2PIT-2yB8-3n2R+44FP+TBuR-4HiK+49Hy+3roB-7F29+6vG3+PVp0-5Cf5+A6ua-E9TW-CMac-AnWA+1YdV-Nerv+2f5K+53X0+AUfZ+MvHE-Fah$+Mf2z-1K5G-QSGG-0fSi+1amw+16aO+JShj+4l3I-13q8-5Tiw+8cV0+K9Na+6VP3-1R06-II70+B0hZ-9U_c-0Wa4-IFvE+7OAz+5umy+7gLk-0cU4+2Dlx+EKgg-6UnO+4qJP-0E11+AoLL+8qfj-2NIg+9qxo-3VgU+DMMf-PjQV-HJNS+4pVX+0bnX-2iky+3Vn3+3Xsw+4ySU+3jnE-22bc-0Hjp+9Svd+M0kQ+3hG9-52qW+09YB-BzPV-2sdx";
    }

    var genome = {colorStr: "", topologyStr: "", weightsStr: "", weights: []};

    // Remove unwanted chars (add others within square brackets if required),
    // and split into array of color, topology, weights etc. properties:
    encodedGenome = encodedGenome.replace(/["]+/g, '').split('|');

    // Figure out which part (which array element) is which property:
    encodedGenome.forEach(property => { switch(true) {
        case isName(property)       : genome.name        = property; break;
        case property.includes('c:'):
        case property[0] === '#'    : property = property.replace('c:', '#');
                                      genome.colorStr    = property; break;
        case property.includes('.') : genome.topologyStr = property; break;
        case property[0] === '+'    :
        case property[0] === '-'    : genome.weightsStr  = property; break;
    }});

    // Convert weights string to array of floats:
    var current = "";
    genome.weightsStr.split('').forEach(char => {
        if (char === '+' || char === '-') {
            if (current.length) {
                genome.weights.push(base64ToWeight(current));
            }
            current = char;
        } else {
            current += char;
        }
    });
    // Add the last "trailing" (no end character) weight:
    genome.weights.push(base64ToWeight(current));

    return new Genome({
        name: genome.name,
        color: genome.colorStr,
        topology: genome.topologyStr.split('.').map(Number),
        weights: new Float32Array(genome.weights),
    });
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
