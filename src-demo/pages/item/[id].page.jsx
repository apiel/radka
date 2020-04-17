import { jsx, page } from '../../../dist/lib';
import Home from '../index.page';

function Item({ id }) {
    return (
        <div>
            <h1>Item {id}</h1>
            <a href={Home.link()}>home</a>
        </div>
    );
}

export default page(
    Item,
    global.DEV
        ? [{ id: 1 }, { id: 2 }, { id: 3 }]
        : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
);
