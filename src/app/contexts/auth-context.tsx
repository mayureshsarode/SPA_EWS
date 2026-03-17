import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { students, faculties, Student, Faculty } from "../data/mock-data";

export type Role = "student" | "faculty" | "admin" | null;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "System Admin";
}

export type AuthUser = Student | Faculty | AdminUser | null;

interface AuthContextType {
  role: Role;
  user: AuthUser;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USER: AdminUser = {
  id: "A001",
  name: "Admin Smith",
  email: "admin@university.edu",
  role: "System Admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<AuthUser>(null);

  // Load from localeStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("spa_role") as Role;
    if (savedRole) {
      handleLogin(savedRole, false);
    }
  }, []);

  const handleLogin = (newRole: Role, save = true) => {
    setRole(newRole);
    if (save) localStorage.setItem("spa_role", newRole || "");

    switch (newRole) {
      case "student":
        setUser(students[0]);
        break;
      case "faculty":
        setUser(faculties[0]);
        break;
      case "admin":
        setUser(ADMIN_USER);
        break;
      default:
        setUser(null);
        if (save) localStorage.removeItem("spa_role");
    }
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem("spa_role");
  };

  return (
    <AuthContext.Provider value={{ role, user, login: handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
