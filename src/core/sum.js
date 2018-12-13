export function sum(array) {
    if (array.length === 0) return 0;
    return array.reduce((accumulator, current) => accumulator + current.length, 0);
}