import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Task, TaskInput, UserProfile } from "./types";

export type AppContextValue = {
  user: UserProfile | null;
  isAuthLoading: boolean;
  tasks: Task[];
  apiStatus: "checking" | "connected" | "offline";
  notice: string;
  search: string;
  setSearch: (value: string) => void;
  showNotice: (message: string) => void;
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
  updateProfile: (profile: UserProfile) => void;
  refreshTasks: () => Promise<void>;
  saveTask: (input: TaskInput, taskId?: string) => Promise<void>;
  setTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProviders");
  return context;
}
