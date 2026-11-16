import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User, UserProfile } from "../types";
import { neon } from "../lib/neon";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  saveProfile: (
    profile: Omit<UserProfile, "userId" | "updatedAt">,
  ) => Promise<void>;
  generatePlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [neonUser, setNeonUser] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const result = await neon?.auth?.getSession();
        if (result && result?.data?.user) {
          setNeonUser(result?.data?.user);
        } else {
          setNeonUser(null);
        }
      } catch (err) {
        setNeonUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  // refreshData memoize
  const refreshData = useCallback(async () => {
    if(!neonUser || isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    try {
      // Fetch profile
      // const profileData = 

      // Fetch Plan
      const planData = await api.getCurrentPlan(neonUser?.id).catch(()=> null);
      if(planData) {

      }

    } catch(err){
      console.error("Error refreshing data", err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Save Profile
  async function saveProfile(
    profileData: Omit<UserProfile, "userId" | "updatedAt">,
  ) {
    if (!neonUser) {
      throw new Error("User must be authenticated to save profile");
    }

    await api.saveProfile(neonUser?.id, profileData);
  }

  // Generate Plan
  async function generatePlan() {
    if (!neonUser) {
      throw new Error("User must be authenticated to generate plan");
    }

    await api.generatePlan(neonUser?.id);
  }

  return (
    <AuthContext.Provider value={{ user: neonUser, isLoading, saveProfile, generatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
