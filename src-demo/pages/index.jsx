import { jsx, page } from '../../dist/lib';
import { Hello } from '../components/Hello';

function Login() {
    return (
        <section>
            <Hello name="abc" num="123" />
            <input type="text" placeholder="email" />
            <input type="password" placeholder="password" />
            <button>Log In</button>
        </section>
    );
}

export default page(Login);
