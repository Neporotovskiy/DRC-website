export function closest(array, target, fractionDigits = 1) {
    let range = target;
    let enough = false;
    let result = 0;
    while (!enough) {
        if (range <= 0) enough = true;
        const value = array.find(item => Number(item.length) === Number(range.toFixed(fractionDigits)));
        if (typeof value !== 'undefined') {
            enough = true;
            result = value;
        }
        range = range - Math.pow(10, -fractionDigits);
    }
    return result;
}