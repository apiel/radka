import { jsx, Import, Fragment } from '../../dist/lib';

export function Hello({ name, num }) {
    return (
        <Fragment>
            <Import src={require.resolve('./Hello.script.js')} />
            <p>
                Hello world {name} {num.count}
            </p>
        </Fragment>
    );
}
