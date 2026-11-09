// import { useState } from "react";
import TaskTracker from "./TaskTracker";

const App = () => {
  // const [count, setCount] = useState<number>(0);
  // const [toggle, setToggle] = useState<boolean>(true);
  // const [inputValue, setinputValue] = useState<string>("");
  return (
    <>
      {/* <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
      <div>
        <input
          onChange={(e) => setinputValue(e.target.value)}
          type="text"
          placeholder="Type something"
        />
        <p className="text-black ">You typed: {inputValue} </p>
        {toggle && <HookExample />}
        <button onClick={() => setToggle(!toggle)}>Toggle</button>
      </div> */}
      <TaskTracker />
    </>
  );
};

export default App;
