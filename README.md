# RADKA.js

Radka is a transpiler to generate static html websites using JSX without React. CSS and VanillaJs become more and more powerful providing a lot of features, slowly the complexity of tools like React and Angular become questionable. Static html pages are as well coming back to the trend, with some frameworks like Gastby or NextJs, mainly to improve SEO and performance. Unfortunately those frameworks are heavily dependent on React. Is React really meant to generate HTML on the server? Why would we have to deal with `useState`, `useEffect` and all those things for state management on the server? Of course, some part of the React logic is also used in the browser, for the dynamic part of the UI but all this logic can easily be done in CSS and VanillaJs, especially since WebComponent is available.

Radka is a set of popular libraries packed together. Under the hood it is using Babel with the JSX transpiler from React, JSX pragmatic from Paypal and Parcel to generate the bundle. The routing concept is inspired by NextJs.

## Getting started

Create a new npm project and install radka library:

```shell
npm init
npm install radka --dev
```

Now create a folder `src/pages`. This folder will contain the pages. Now create a file `src/pages/index.page.jsx`:

```jsx
import { jsx, page } from 'radka';

function Main() {
    return (
        <div>
            <h1>Main page</h1>
            <p>This is an example</p>
        </div>
    );
}

export default page(Main);
```

Every jsx files should import `jsx` from `radka` library, like you would do with React. This is necessary to be able to transform JSX to javascript after being transpiled by Babel.

Let's create another page but with dynamic content. Create a file `src/pages/pet/[type].page.jsx`:

```jsx
import { jsx, page } from 'radka';

function Pet({ type, description }) {
    return (
        <div>
            <h1>Pet {type}</h1>
            <p>{description}</p>
        </div>
    );
}

export default page(Pet, [
    {
        type: 'dog',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
        type: 'cat',
        description: 'Excepteur sint occaecat cupidatat non proident.',
    },
]);
```

This jsx file will generate 2 pages, `/pet/dog.html` and `/pet/cat.html`.

We can add a link to the homepage:

```jsx
import { jsx, page } from 'radka';
import Main from '../index.page.jsx';

function Pet({ type, description }) {
    return (
        <div>
            <h1>Pet {type}</h1>
            <p>{description}</p>
            <p><a href={Main.link()}>Go to homepage</a></p>
        </div>
    );
}
...
```

Each page return a link function, providing the url to access the page. So if the page change of path, the route will be automatically updated.

Now let's create a script to inject in the page. Create a file `src/pages/index.script.js`:

```js
document.querySelector('h1').onmouseover = () => {
    document.querySelector('h1').style.background = 'grey';
};
document.querySelector('h1').onmouseout = () => {
    document.querySelector('h1').style.background = 'transparent';
};
```

To inject this script in the index page, you have 2 options, either import the script like you would import a css file in React `import './index.script';` or use the `<Import>` tag from radka library:

```jsx
import { jsx, page, Import } from 'radka';

// either use this method or the Import tag
// import './index.script';

function Main() {
    return (
        <div>
            <h1>Main page</h1>
            <p>This is an example</p>
            <Import src={require.resolve('./index.script.js')} />
        </div>
    );
}

export default page(Main);
```

Instead to inject the code directly in the page, you might want to have a share javascript between all pages. For this you can create a bundle. Create a new file `src/bundle/index.js`:

```js
import './index.css';

console.log('This is a shared script.');
```

As you can see, in this example, we are also importing a css file. This is to include the CSS inside the shared bundle.

We are still missing a way to create some shared component. Create a file `src/components/Hello.jsx`:

```jsx
import { jsx } from 'radka';

export function Hello({ name }) {
    return <p>Hello {name}.</p>;
}
```

Import this component in a page:

```jsx
import { jsx, page } from 'radka';
import { Hello } from '../components/Hello';

function Main() {
    return (
        <div>
            <h1>Main page</h1>
            <p>This is an example</p>
            <Hello name="Alex" />
        </div>
    );
}

export default page(Main);
```

In case you need fragment like `React.fragment`, you can use `Fragment` from the `radka` library:

```jsx
import { jsx, Fragment } from 'radka';

export function Hello({ name }) {
    return (
        <Fragment>
            <p>Hello {name}.</p>
            <p>Line 2.</p>
        </Fragment>
    );
}
```
