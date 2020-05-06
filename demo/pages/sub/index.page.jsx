import { jsx, page } from '../../../dist/lib';
import Login from '../index.page';

function Sub() {
    return (
        <div>
            <h1>Sub</h1>
            {/* <a href={Login.linkId}>home</a> */}
        </div>
    );
}

export default page(Sub);
