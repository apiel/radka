import { jsx, page, Import } from '../../dist/lib';
import { Hello } from '../components/Hello';
import Item from './item/[id]';
import { readFileSync } from 'fs-extra';

function Login() {
    // should we move the script along page folder
    // and only create page for jsx/tsx files?
    // what about babel and transformation for borwser
    // also need a folder for bundle / should it be done with webpack?
    // will have as index.api.js for isomor
    return (
        <section>
            <Import src={require.resolve('./index.script.js')} />
            <Hello name="abc" num={{ count: 123 }} />
            <input type="text" placeholder="email" />
            <input type="password" placeholder="password" />
            <button onclick="handleClick(123)">Log In</button>
            <a href={Item.link({ id: 3, b: 'c' })}>link</a>
            <a href={Item.link({ id: 2, b: 'e' })}>link</a>
        </section>
    );
}

export default page(Login);
