import { jsx, page } from '../../../../dist/lib';

function Product({ id, color }) {
    return (
        <div>
            <h1>
                Product {color} {id}
            </h1>
        </div>
    );
}

export default page(Product, () => ({
    propsList: [
        { id: '1', color: 'red' },
        { id: '2', color: 'blue' },
    ],
    next: () => ({ propsList: [{ id: '3', color: 'green' }] }),
}));
