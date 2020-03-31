import { info } from 'logol';
import { error } from 'logol';

console.log('load index.script.js');

export const handleClick = param => {
    info('yo');
    error('bad');
    console.log('click me', param);
};

export function yo() {
    console.log('yo');
}

document.querySelector('#login-btn').onclick = () => handleClick(123);
