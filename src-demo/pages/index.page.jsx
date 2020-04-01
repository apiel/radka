import { jsx, page, Import } from '../../dist/lib';
import { Hello } from '../components/Hello';
import Item from './item/[id].page';
import { readFileSync } from 'fs-extra';

// inject script in html as a script tag
import './index.script';

function Login() {
    return (
        <section>
            {/* <Import src={require.resolve('./index.script.js')} /> */}
            <Hello name="abc" num={{ count: 123 }} />
            <input type="text" placeholder="email" />
            <input type="password" placeholder="password" />
            <button id="login-btn">Log In</button>
            <a href={Item.link({ id: 3 })}>link</a>
            <a href={Item.link({ id: 2 })}>link</a>
        </section>
    );
}

export default page(Login);
