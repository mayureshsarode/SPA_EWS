import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { api } from "../lib/api";

export type Role = "student" | "faculty" | "admin" | null;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: { id: string; code: string; name: string };
  studentProfile?: any;
  facultyProfile?: any;
  [key: string]: any;
}

interface AuthContextType {
  role: Role;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: try to restore session from cookie via GET /api/auth/me
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const data = await api("/auth/me");
      setUser(data.user);
      setRole(data.user.role.toLowerCase() as Role);
    } catch {
      // No valid session — user needs to log in
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string, selectedRole: Role): Promise<AuthUser> {
    setError(null);
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      setUser(data.user);
      // Map ADMIN/SUPER_ADMIN to "admin" for frontend routing
      const frontendRole = data.user.role === "STUDENT" ? "student"
        : data.user.role === "FACULTY" ? "faculty"
        : "admin";
      setRole(frontendRole);
      return data.user;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ role, user, loading, error, login, logout }}>
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
