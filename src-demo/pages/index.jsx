import { jsx, page } from '../../dist/lib';
import { Hello } from '../components/Hello';
import Item from './item/[id]';

function Login() {
    return (
        <section>
            <Hello name="abc" num={{ count: 123 }} />
            <input type="text" placeholder="email" />
            <input type="password" placeholder="password" />
            <button>Log In</button>
            <a href={Item.link({ id: 3, b: 'c' })}>link</a>
        </section>
    );
}

export default page(Login);
