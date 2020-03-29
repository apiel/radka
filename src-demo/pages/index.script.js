import { info } from 'logol';

export const handleClick = (param) => {
    info('yo');
    console.log('click me', param);
}

export function yo() {
    console.log('yo');
}