import { info } from 'logol';
import { error } from 'logol';

import { getUptime } from '../api/uptime';

console.log('load index.script.js');

export const handleClick = async (param) => {
    error('bad');
    console.log('click me', param);
    info('yo', await getUptime());
};

export function yo() {
    console.log('yo');
}

document.querySelector('#login-btn').onclick = () => handleClick(123);
