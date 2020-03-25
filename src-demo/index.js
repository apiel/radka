import { node, html } from "jsx-pragmatic";

function Login({ prefilledEmail }) {
  return (
    <section>
      <input type="text" placeholder="email" value={prefilledEmail} />
      <input type="password" placeholder="password" />
      <button>Log In</button>
    </section>
  );
}

function render() {
  return (<Login prefilledEmail="foo@bar.com" />).render(html());
}

render();

/*
// pragma is radka.node
// radka.bind({ node }); ?

import { page } from 'radka';

export default page(Login);
// return a render
// and a link
*/
