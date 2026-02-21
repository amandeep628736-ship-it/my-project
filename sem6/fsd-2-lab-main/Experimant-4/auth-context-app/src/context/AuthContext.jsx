import { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState("aryan koundal");
  const [loginCount, setLoginCount] = useState(0);

  const login = (name) => {
    setIsLoggedIn(true);
    setUserName(name);
    setLoginCount(prev => prev + 1);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, login, logout, loginCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
