

/* === ARRAY STUFF === */

/**
* Swaps two elements in an array around. Example:
* myArray = [x, y, z];
* myArray.swap(0, 2);
* myArray === [z, y, x];
* @param   {int} a - Index of 1st element.
* @param   {int} b - Index of 2nd element.
* @returns {array} - The array with the elements in the new order.
*/
Array.prototype.swap = function (a, b) {
    var tmp = this[a];
    this[a] = this[b];
    this[b] = tmp;
    return this;
};

/**
 * Return a random element from an array.
 * @returns {[[Type]]} [[Description]]
 */
Array.prototype.random = function() {
    return this[Math.trunc(Math.random() * this.length)];
};

Float32Array.prototype.random = function() {
    return this[Math.trunc(Math.random() * this.length)];
};

Array.prototype.randomIndex = function() {
    return Math.trunc(Math.random() * this.length);
};

Float32Array.prototype.randomIndex = function() {
    return Math.trunc(Math.random() * this.length);
};

Array.prototype.last = function() {
    return this[this.length - 1];
};

Float32Array.prototype.first = function() {
    return this.slice(0, 1);
};

/**
 * Return all the values of an array added together.
 * @returns {number, string} [[Description]]
 */
Array.prototype.sum = function() {
  return this.reduce((previous, current) => previous + current);
};

/**
 * Return the average of all of the values in an array.
 * @returns {number} [[Description]]
 */
Array.prototype.avg = function () {
  return this.sum() / this.length;
};

/**
 * Shuffles the elements of an array in place and returns the array.
 * 
 * Uses a modern adaptation of the Fisher-Yates shuffle algorithm.
 */
Array.prototype.shuffle = function() {
    var i, j;
    for (i = this.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};


Array.prototype.maxIndex = function() {
    return this.indexOf(Math.max(...this));
};
Array.prototype.minIndex = function() {
    return this.indexOf(Math.min(...this));
};



/* === GENERAL === */

/**
* @returns {Boolean} Yay or nay.
*/
export function coinToss() {
    return (Math.floor(Math.random() * 2)) ? true : false;
}

/**
 * Does the opposite of Math.abs().
 * I.e. takes a number and randomly returns either the + or - of it.
 */
export function unAbs(number) {
  return number * (Math.random() < 0.5 ? -1 : 1);
}

/**
 * Check if something is even.
 *
 * Potential input types and what is evaluated:
 *     number  : Its parity (unless NaN).
 *     string  : If parsable to a number, that number's parity.
 *             : If not parsable to a number, the parity of the string's length.
 *     Array   : The parity of its length.
 *     object  : The parity of the number of it's enumerable own properties.
 *     boolean : Treated as 1 and 0, so returns false for true, and true for false.
 *     null    : Returns true as null is similar to 0.
 *
 * @throws  {TypeError} The input cannot be NaN.
 * @param   {number|string|Array|object} arg
 * @returns {boolean} true if even, false if odd.
 */
export function isEven(arg) {

    if (Array.isArray(arg)) {
        return arg.length % 2 === 0;
    }

    let number = Math.abs(arg);
    if (typeof number === "number" && !Number.isNaN(number)) {
        return number % 2 === 0;
    }

    if (typeof arg === "string") {
        return arg.length % 2 === 0;
    }

    if (typeof arg === "object") {
        return Object.keys(arg).length % 2 === 0;
    }

    if (isNaN(arg)) {
        throw new TypeError("Input cannot be NaN");
    }

}

/**
 * Check if something is odd.
 *
 * Potential input types and what is evaluated:
 *     number  : Its parity (unless NaN).
 *     string  : If parsable to a number, that number's parity.
 *             : If not parsable to a number, the parity of the string's length.
 *     Array   : The parity of its length.
 *     object  : The parity of the number of it's enumerable own properties.
 *     boolean : Treated as 1 and 0, so returns true for true, and false for false.
 *     null    : Returns false as null is similar to 0.
 *
 * @throws  {TypeError} The input cannot be NaN.
 * @param   {number|string|Array|object} arg
 * @returns {boolean} true if odd, false if even.
 */
export function isOdd(arg) {

    if (Array.isArray(arg)) {
        return arg.length % 2 === 1;
    }

    let number = Math.abs(arg);
    if (typeof number === "number" && !Number.isNaN(number)) {
        return number % 2 === 1;
    }

    if (typeof arg === "string") {
        return arg.length % 2 === 1;
    }

    if (typeof arg === "object") {
        return Object.keys(arg).length % 2 === 1;
    }

    if (isNaN(arg)) {
        throw new TypeError("Input cannot be NaN");
    }

}



/* === COLORS === */

/**
 * Returns a random hex color string. E.g. "#f9da05".
 * @returns {string} Hex color string
 */
export function randomColor() {
    return '#'+(Math.random() * 0xFFFFFF << 0).toString(16);
}

/**
 * Returns a hex color string which is an average of multiple input colors.
 * @param   {Array}  colors Array of hex color strings.
 * @returns {string} Hex color string.
 */
export function combineColors(colors) {
    var output = "#";
    for(var i = 1; i < 6; i += 2) {
        let ints = [];
        colors.forEach(color => {
            ints.push(parseInt(color.substring(i, i + 2), 16));
        });
        let hex = Math.trunc(ints.avg()).toString(16);
        output = output + ('0' + hex).slice(-2);
    }
    return output;
}
