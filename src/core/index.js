import {aligner} from './aligner.js';
import {sequencer} from './sequencer.js';

const data = [
    {
        length: 6.5,
        number: 1,
    },
    {
        length: 40,
        number: 1,
    },
    {
        length: 50,
        number: 2,
    },
    {
        length: 10,
        number: 6,
    },
    {
        length: 9,
        number: 2,
    },
    {
        length: 0.5,
        number: 1,
    },
];

const result = sequencer(aligner(data), {limit: 100, saw: 1});

console.log('RESULT:', result);