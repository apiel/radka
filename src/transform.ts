import { NODE_TYPE } from 'jsx-pragmatic';

export function transform(node: any) {
    // console.log('node', node);
    // if (node.type === NODE_TYPE.ELEMENT && node.name === 'script') {
    //     console.log('node', node);
    // }
    // node = transformEvent(node);
    return node;
}

// function transformEvent(node: any) {
//     const { props } = node;
//     if (props) {
//         for (const prop of Object.keys(props)) {
//             const val = props[prop];

//             if (prop.match(/^on[a-z]/) && typeof val === 'function') {
//                 console.log('Event', prop, node, val.name, val.toString());
//             }
//         }
//     }
//     return node;
// }
