import { info } from 'logol';
import { error } from 'logol';

import getUptime from '../api/uptime';
import getCounter from '../api/counter';

// import getUptime from 'api/uptime';
// import getCounter from 'api/counter';

console.log('load index.script.js');

export const handleClick = async (param) => {
    error('bad');
    console.log('click me', param);
    // info('yo', await getUptime());
    const { uptime } = await getUptime();
    document.querySelector('h1').textContent = `${uptime}`;
};

export function yo() {
    console.log('yo');
}

document.querySelector('#login-btn').onclick = () => handleClick(123);

getCounter().then(
    (count) => (document.querySelector('#counter').textContent = `${count}`),
);
