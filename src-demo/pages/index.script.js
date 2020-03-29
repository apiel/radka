import { info } from 'logol';
import { error } from 'logol';

export const handleClick = (param) => {
    info('yo');
    error('bad');
    console.log('click me', param);
}

export function yo() {
    console.log('yo');
}