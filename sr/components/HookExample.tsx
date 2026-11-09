import React, { useEffect } from "react";

const HookExample = () => {
  useEffect(() => {
    console.log("rendered");

    return () => {
      console.log("unmounted");
    };
  }, []);

  return <div>hookexample</div>;
};

export default HookExample;
