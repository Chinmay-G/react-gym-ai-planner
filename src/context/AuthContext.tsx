import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TrainingPlan, User, UserProfile } from "../types";
import { neon } from "../lib/neon";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  plan: TrainingPlan | null;
  isLoading: boolean;
  saveProfile: (
    profile: Omit<UserProfile, "userId" | "updatedAt">,
  ) => Promise<void>;
  generatePlan: () => Promise<void>;
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
  isGenerating: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [neonUser, setNeonUser] = useState<any>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const isRefreshingRef = useRef(false);

  const [isGenerating, setIsGenerating] = useState(false);

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

  useEffect(() => {
    async function callBack() {
      if (!isLoading) {
        if (neonUser?.id) {
          await refreshData();
        } else {
          setPlan(null);
        }
        setIsLoading(false);
      }
    }
    callBack();
  }, [neonUser?.id, isLoading]);

  // refreshData memoize
  const refreshData = useCallback(async () => {
    if (!neonUser || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      // Fetch profile
      // const profileData =

      // Fetch Plan
      const planData = await api.getCurrentPlan(neonUser?.id).catch(() => null);
      console.log("PLAN DATA: ", planData);
      if (planData) {
        setPlan({
          id: planData.id,
          userId: planData.userId,
          overview: planData.planJson.overview,
          weeklySchedule: planData.planJson.weeklySchedule,
          progression: planData.planJson.progression,
          version: planData.version,
          createdAt: planData.createdAt,
        });
      }
    } catch (err) {
      console.error("Error refreshing data", err);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [neonUser?.id]);

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

    try {
      setIsGenerating(true);
      await api.generatePlan(neonUser?.id);
      console.log('Plan generated !');
      await refreshData();
    } catch(err) {} finally { setIsGenerating(false) }
  }

  return (
    <AuthContext.Provider
      value={{
        user: neonUser,
        plan,
        isLoading,
        saveProfile,
        generatePlan,
        refreshData,
        isRefreshing: isRefreshing,
        isGenerating
      }}
    >
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
