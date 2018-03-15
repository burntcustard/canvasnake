

/**
* Swaps two elements in an array around. Example:
* myArray = [x, y, z];
* myArray.swap(0, 2);
* myArray === [z, y, x];
* @param   {int} x - Index of 1st element.
* @param   {int} y - Index of 2nd element.
* @returns {array} - The array with the elements in the new order.
*/
Array.prototype.swap = function (x, y) {
    var tmp = this[x];
    this[x] = this[y];
    this[y] = tmp;
    return this;
};



/* === ARRAY STUFF === */

/**
 * Return a random element from an array.
 * @returns {[[Type]]} [[Description]]
 */
Array.prototype.random = function() {
    return this[Math.trunc(Math.random() * this.length)];
};

/**
 * Return all the values of an array added together.
 * @returns {number} [[Description]]
 */
Array.prototype.sum = function () {
  return this.reduce(function(previous, current) {
      return previous + current;
  }, 0);
};

/**
 * Return the average of all of the values in an array.
 * @returns {number} [[Description]]
 */
Array.prototype.avg = function () {
  return this.sum()/this.length; 
};



/**
* @returns {Boolean} Yay or nay.
*/
export function coinToss() {
    if (Math.floor((Math.random() * 2))) {
        return true;
    } else {
        return false;
    }
}



/* === COLORS === */

export function randomColor() {
    return '#'+(Math.random() * 0xFFFFFF << 0).toString(16);
}

export function combineColors(colors) {
    var output = "#";
    for(var i = 1; i < 6; i += 2) {
        let ints = [];
        colors.forEach(color => {
            ints.push(parseInt(color.substring(i, i + 2, 16)));
        });
        let hex = ints.avg().toString(16);
        output += ('0' + hex).slice(-2);
    }
    return output;
}