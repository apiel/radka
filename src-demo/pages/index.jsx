import { jsx, page, Import } from '../../dist/lib';
import { Hello } from '../components/Hello';
import Item from './item/[id]';
import { readFileSync } from 'fs-extra';
// import { handleClick } from '../script';

function Login() {
    return (
        <section>
            <Import src={require.resolve(`../script/index.js`)} />
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
