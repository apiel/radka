export function transform(node: any) {
    // console.log('node', node);
    node = transformEvent(node);
    return node;
}

function transformEvent(node: any) {
    const { props } = node;
    if (props) {
        for (const prop of Object.keys(props)) {
            const val = props[prop];

            if (prop.match(/^on[a-z]/) && typeof val === 'function') {
                console.log('Event', prop, node, val.name, val.toString());
            }
        }
    }
    return node;
}

// node ElementNode {
//     type: 'element',
//     name: 'a',
//     props: { href: '%link%page-0%id=2;b=e%' },
//     children: [ TextNode { type: 'text', text: 'link' } ],
//     onRender: undefined
//   }
