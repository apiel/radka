import { jsx, page } from '../../../dist/lib';

function Item({ id }) {
    console.log('yoid', id);
    return (
        <div>
            <h1>Item {id}</h1>
        </div>
    );
}

export default page(Item, [
    { id: "1" },
    { id: "2" },
    { id: "3" },
]);
