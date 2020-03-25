import { jsx } from "radka";
import { Hello } from "../components/Hello";

function Login({ prefilledEmail }) {
  return (
    <section>
      <Hello />
      <input type="text" placeholder="email" value={prefilledEmail} />
      <input type="password" placeholder="password" />
      <button>Log In</button>
    </section>
  );
}

export default page(<Login prefilledEmail="foo@bar.com" />);
