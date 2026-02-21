import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { userName, logout, loginCount } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <h2 className="welcome-message">Welcome, {userName}</h2>
      <p>You have logged in {loginCount} times.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
