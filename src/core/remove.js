export function remove(array, target) {
    const targetIndex = array.findIndex(item => item.index === target.index);
    if (targetIndex >= 0) array.splice(targetIndex, 1);
}