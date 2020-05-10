# RADKA.js

Radka is a transpiler to generate static html websites using JSX without React. CSS and VanillaJs become more and more powerful providing a lot of features, slowly the complexity of tools like React and Angular become questionable. Static html pages are as well coming back to the trend, with some frameworks like Gatsby or NextJs, mainly to improve SEO and performance. Unfortunately those frameworks are heavily dependent on React. Is React really meant to generate HTML on the server? Why would we have to deal with `useState`, `useEffect` and all those things for state management on the server? Of course, some part of the React logic is also used in the browser, for the dynamic part of the UI but all this logic can easily be done in CSS and VanillaJs, especially since WebComponent is available.

Radka is a set of popular libraries packed together. Under the hood it is using Babel with the JSX transpiler from React, JSX pragmatic from Paypal, Turbolinks and Parcel to generate the bundle. The routing concept is inspired by NextJs.

## Getting started

Create a new npm project and install radka library:

```shell
npm init
npm install radka --dev
```

Create a folder `src/pages`. This folder will contain the pages. Create a file `src/pages/index.page.jsx`:

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

Every jsx file should import `jsx` from `radka` library, like you would do with React. This is necessary to be able to transform JSX to javascript after being transpiled by Babel.

Now you can transpile the jsx file. In you npm folder run:

```
npx radka
```

This will create a new `site` folder containing the generated html files.

You can use `npx radka server` to run a server for your site.

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
import Main from '../index.page';

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

Each page returns a link function, providing the url to access the page. So if the page changes its path, the route will be automatically updated.

For pages with dynamic content, you can pass the props with in the link `Pet.link({type: 'dog'})`.

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

// either use this method or the <Import /> tag
// when using this method, it's important to don't had the extension to the import '.js' or '.ts'
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

> **Note:** when importing a js or a ts file with the `import` method, don't use the extension `.js` or `.ts` in the path, e.g.: `import './index.script';`

Instead of injecting the code directly in the page, you might want to have a shared javascript file between all pages. For this you can create a bundle. Create a new file `src/bundle/index.js`:

```js
import './index.css';

console.log('This is a shared script.');
```

As you can see, in this example, we are also importing a css file. This is to include the CSS inside the shared bundle.

If you don't want your CSS to be part of the bundle, you can inject the CSS directly in the page, in the same way as you do with React:

```jsx
import { jsx, page, Import } from 'radka';
import './Main.css';

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

We are still missing a way to create some shared components. Create a file `src/components/Hello.jsx`:

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

## Folder and file structure

-   pages are in `src/pages`
    -   page file should end by `.page.jsx`
    -   page can be named with `[name]` to create dynamic path e.g. `src/pages/[id].page.jsx`
-   components are in `src/components`
-   bundle files are in `src/bundle`
-   injected script files for pages and components must finish by `.script.js`

# API routes

API routes provide a straightforward solution to build your API with Radka.js.

Any file inside the **root** of the folder `src/api` will be treated as an API endpoint. You don't need to create any server or request. Just import the api function in your frontend script and call it directly. The only requirement, is to make your function returning a Promise. All the mapping between the frontend and the backend will be automatically be generated.

For example, create a file `src/api/uptime.js`:

```js
// This function return the time since the server started
// It is an async function even if doesn't contain any await
export async function getUptime() {
    return process.uptime();
}
```

Now, in the file `src/pages/index.script.js`:

```js
import { getUptime } from '../api/uptime';

// everytime your mouse pass over the page title, the server uptime will be updated
document.querySelector('h1').onmouseover = async () => {
    document.querySelector('h1').textContent = await getUptime();
};
```

To understand how it works under the hood, see [isomor](https://github.com/apiel/isomor).

## Assets

To use assets with Radka.js, simply use `require` in the jsx component. For example, if you have an image located in `src/images/example.png`, to load it in the page `src/pages/index.page.js` do:

```jsx
import { jsx, page } from 'radka';
import { join } from 'path';

function Main() {
    return (
        <div>
            <h1>Main page</h1>
            <p>This is an example</p>
            <img src={require('../images/example.png')} alt="" />
            or
            <img src={require(join('..', 'images', 'example.png'))} alt="" />
        </div>
    );
}

export default page(Main);
```

## Hot reloading

In development mode, it might be useful to reload automatically page while you are updating the source code. To do this, you can use hot reloading:

```
npx radka dev
```

This will watch files and automatically rebuild when a change is detected. It will also run a server, so you can access your pages without to setup your own environment. Everything should be ready out of the box for dev purpose.

By default, RADKA.js rebuild the whole site when dev mode start. You can skip rebuild, by adding the parameter `--skipRebuild`.

> Hot reloading is still work in progress and not very simple, right now it is quiet slow. We still need to find some way to run properly Parcel in dev mode and to improve the babel transpiling. Of course, some help would be really welcome on this topic.

In some previous example, we have been speak about pages with dynamic content. For those use-case it might important to only load a fragment of data in dev mode, instead to load the full dataset. To solve this, there a global variable available to know if we are in dev mode `global.DEV`:

```jsx
//...
function Pet({ type, description }) {
    return (
        <div>
            <h1>Pet {type}</h1>
            <p>{description}</p>
        </div>
    );
}

export default page(Pet, getMyPetsFromDb(global.DEV && { limit: 3 }));
```

## Preloading pages

RADKA.js is using [turbolinks](https://github.com/turbolinks/turbolinks) to preload pages. Turbolinks makes navigating your web application faster. Get the performance benefits of a single-page application without the added complexity of a client-side JavaScript framework.

Turbolinks is activated by default but can be deactivated: `npx radka --turbolinks=false`.

Using this feature can have some unexpected side effect, see [here](https://www.npmjs.com/package/turbolinks#building-your-turbolinks-application)

> Turbolinks is fast because it doesn’t reload the page when you follow a link. Instead, your application becomes a persistent, long-running process in the browser. This requires you to rethink the way you structure your JavaScript.
>
> In particular, you can no longer depend on a full page load to reset your environment every time you navigate. The JavaScript window and document objects retain their state across page changes, and any other objects you leave in memory will stay in memory.
>
> With awareness and a little extra care, you can design your application to gracefully handle this constraint without tightly coupling it to Turbolinks.
