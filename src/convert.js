/**
 * Float32Array:
 *     BYTES_PER_ELEMENT: 4 (Rather than 8 for normal JS numbers).
 *     
 *     
 *     
 *
 */


// The length of the fractional part to use for the floats:
const floatPrecision = 7;

const digitStr = 
//  0       8       16      24      32      40      48      56     63
//  v       v       v       v       v       v       v       v      v
   "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_";



function floatFractionToBinary(number) {
    
    // Example starting weight number:
    // 0.7853981852531433
    
    // Only work with positive integers:
    number = Math.abs(number);
    
    // Loose some precision to save complexity (also converts to string):
    number = number.toFixed(floatPrecision);
    // "0.7853982"
    
    // Make sure it's not too big, and
    // Chop the integer part (0) and the decimal point out:
    if (number >= 1) {
        number = 9999999;  // 0.9999999 but pre-parsed/sliced.
    } else {
        number = parseInt(number.slice(2));
    }
    // 785392
    
    // Convert from integer to binary-string:
    number = parseInt(number).toString(2);
    // "11101111101011110011110"
    
    // Make sure the padding/character number is correct:
    number = number.padStart(24,'0');
    // "011101111101011110011110"
    
    return number;
}



/**
 * Converts a weight from a single Float32 in the range
 * [-1,1] (inclusive) to a cusome base64-ish encoded string.
 * @param {number} weight [[Description]]
 */
export function weightToBase64(weight) {
    
    if (weight < -1 || weight > 1) {
        throw new RangeError("Weight must be in the range [-1.1]");
    }
    
    var binaryString = floatFractionToBinary(weight);
    var fixedLength = 24;  // Should === binaryString.length
    var base64Str = "";
    
    for (let i = 0; i < 4; i++) {
        let digitStrIndex = 0;
        for (let j = 0; j < 6; j++) {
            if (binaryString[fixedLength-1-j-(i*6)] === '1') {
                digitStrIndex += Math.pow(2, j);
            }
        }
        base64Str = digitStr[digitStrIndex] + base64Str;
    }
    
    // ±
    if (weight < 0) {
        return '-' + base64Str;
    } else {
        return '+' + base64Str;
    }
    
}



function bin2dec(number) {
    return number.split('').reverse().reduce(function(x, y, i) {
        return (y === '1') ? x + Math.pow(2, i) : x;
    }, 0);
}



export function base64ToWeight(base64) {
    
    var base64Length = 5;
    var weightStr = "";
    var weight = new Float32Array(1);
    
    var weightInt = 0;
    
    for (let i = 0; i < base64Length-1; i++) {
        //weightStr += digitStr.indexOf(base64[i]).toString(2).padStart(6,'0');
        //weightInt += digitStr.indexOf(base64[base64Length-1-i]) * Math.pow(64, i);
        let base64Char = digitStr.indexOf(base64[base64Length-1-i]);
        //console.log("base64Char: " + base64Char);
        let base64Value = base64Char * Math.pow(64, i);
        //console.log("base64Value: " + base64Value);
        weightInt += base64Value;
    }
    
    //console.log("weightInt: " + weightInt);
    
    // Pad the left to get digits in the right places:
    weightStr = weightInt.toString(10).padStart(floatPrecision, '0');
    
    //console.log("weightInt after padding: " + weightStr);
    
    if (base64[0] === '-') {
        weightStr = "-0." + weightStr;
    } else {
        weightStr = "+0." + weightStr;
    }
    
    weight[0] = weightStr;  // Automagic String -> Float32 parsing.
    return weight[0];
}



export function testConversions() {
    
    var testWeight = Math.random() * 2 - 1;
    console.log("Test weight: " + testWeight);
    var base64 = weightToBase64(testWeight);
    console.log("  Converted to base64: " + base64);
    var float32 = base64ToWeight(base64);
    console.log("  Converted back to float32: " + float32);
    
}
