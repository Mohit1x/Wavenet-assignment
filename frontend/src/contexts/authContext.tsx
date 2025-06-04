import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export type UserType = {
  _id: string;
  userId: string | null;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER" | "UNIT_MANAGER"; // extend roles if needed
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date
  __v: number;
};

interface AuthContextType {
  user: UserType;
  loading: boolean;
  setUser: (user: UserType) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error: unknown) {
        console.log(error);
        setUser(null);
        toast.error("unauthorized");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
