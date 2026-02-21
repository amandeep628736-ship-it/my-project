import { useState } from "react";
import Counter from "./counter";

function App() {
   const [brand, setBrand] = useState("Ford");
  const [model, setModel] = useState("Mustang");
  const changeBrand = () => {
    setBrand("Toyota");
    console.log(brand);
  };

  const changeModel = () => {
    setModel("Camry");
    console.log(model);
  };

  return (
    <div>
      <h1>My Car</h1>
      <p>Brand: {brand}</p>
      <p>Model: {model}</p>
      <button onClick={changeBrand}>Change Brand</button>
      <button onClick={changeModel}>Change Model</button>
      <hr />
      <Counter />
    </div>
  );
}

export default App;