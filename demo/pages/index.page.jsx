import { join } from 'path';

import { jsx, page, Import } from '../../dist/lib';
import { Hello } from '../components/Hello';
import Item from './item/[id].page';

// inject script in html as a script tag
import './index.script';
import './index.css';

function Home() {
    const myTestAssetFolder = '..' + '/' + 'assets' + '/';
    return (
        <section>
            <h1>Homepage</h1>
            {/* <Import src={require.resolve('./index.script.js')} /> */}
            <Hello name="abc" num={{ count: 123 }} />
            <input type="text" placeholder="email" />
            <input type="password" placeholder="password" />
            <button id="login-btn">Log In</button>
            <a href={Item.link({ id: 3 })}>link</a>
            <a href={Item.link({ id: 2 })}>link</a>
            <p id="counter">none</p>
            <img src={require('../assets/radkajs.png')} alt=""/>
            <img src={require('..' + '/' + 'assets' + '/' + 'radkajs.png')} alt=""/>
            <img src={require(myTestAssetFolder + 'radkajs.png')} alt=""/>
            <img src={require(join('..', '/', 'assets', '/', 'radkajs.png'))} alt=""/>
        </section>
    );
}

export default page(Home);
