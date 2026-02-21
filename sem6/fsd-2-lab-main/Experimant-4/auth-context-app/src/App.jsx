import { useContext } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

function App() {
  const { isLoggedIn } = useContext(AuthContext);

  return <div>{isLoggedIn ? <Dashboard /> : <Login />}</div>;
}

export default App;
