
- turbolinks look more in details https://www.npmjs.com/package/turbolinks#loading-your-applications-javascript-bundle

- how to handle assets

- need hot reload
    + could use https://www.npmjs.com/package/light-server to hot reload
    + compile only necessary

- typescript

- stop using pragmatic since issues are not solved
    -> create a copy called jsx-renderer

- deploy: zeit (server function), heroku, netlify, aws?




- support asset <img src={require(`../${'blah'}/radkajs.png`)} alt=""/>
```json
 {
    "type": "CallExpression",
    "callee": {
        "type": "Identifier",
        "name": "require"
    },
    "arguments": [
        {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "object": {
                    "type": "StringLiteral",
                    "value": "../"
                },
                "property": {
                    "type": "Identifier",
                    "name": "concat"
                },
                "computed": false,
                "optional": null
            },
            "arguments": [
                {
                    "type": "StringLiteral",
                    "extra": {
                        "rawValue": "blah",
                        "raw": "'blah'"
                    },
                    "value": "blah"
                },
                {
                    "type": "StringLiteral",
                    "value": "/radkajs.png"
                }
            ],
            "trailingComments": [],
            "leadingComments": [],
            "innerComments": []
        }
    ]
}
```