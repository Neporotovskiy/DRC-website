export function copy(array) {
    return array.map(item => ({ ...item }));
}