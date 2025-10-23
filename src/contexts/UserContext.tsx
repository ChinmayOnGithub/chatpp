import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface UserContextType {
  username: string | null;
  setUsername: (name: string) => void;
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [username, setUsernameState] = useState<string | null>(null);

  // Load username from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsernameState(stored);
  }, []);

  // Wrapper to update state AND localStorage
  const setUsername = (name: string) => {
    setUsernameState(name);
    localStorage.setItem("username", name);
  };



  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};
