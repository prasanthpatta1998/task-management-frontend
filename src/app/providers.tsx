import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { fetchUserAttributes, getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";
import { createTask, fromApiTask, getTasks, removeTask, toApiPriority, toApiStatus, updateTask } from "../features/tasks/task-api";
import { checkApiHealth } from "../services/api-health";
import { isCognitoConfigured } from "../lib/cognito";
import { AppContext } from "./context";
import type { AppContextValue } from "./context";
import type { Task, TaskInput, UserProfile } from "./types";

export function AppProviders({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isCognitoConfigured);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [apiStatus, setApiStatus] = useState<AppContextValue["apiStatus"]>("checking");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const noticeTimeout = useRef<number | undefined>(undefined);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.clearTimeout(noticeTimeout.current);
    noticeTimeout.current = window.setTimeout(() => setNotice(""), 2800);
  }, []);

  const refreshTasks = useCallback(async () => {
    const serverTasks = await getTasks();
    setTasks(serverTasks.map(fromApiTask));
  }, []);

  useEffect(() => {
    let active = true;
    checkApiHealth()
      .then(() => { if (active) setApiStatus("connected"); })
      .catch(() => { if (active) setApiStatus("offline"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!isCognitoConfigured) {
      return () => { active = false; };
    }

    void (async () => {
      try {
        await getCurrentUser();
        const attributes = await fetchUserAttributes().catch(() => ({ email: "", name: "" }));
        if (active) {
          setUser({
            email: attributes.email || "",
            name: attributes.name || attributes.email?.split("@")[0] || "My workspace",
          });
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsAuthLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getTasks()
      .then((serverTasks) => {
        if (active) setTasks(serverTasks.map(fromApiTask));
      })
      .catch((error: unknown) => {
        if (active) showNotice(error instanceof Error ? `Could not load tasks: ${error.message}` : "Could not load tasks.");
      });
    return () => { active = false; };
  }, [user, showNotice]);

  const saveTask = useCallback(async (input: TaskInput, taskId?: string) => {
    const apiInput = {
      title: input.title,
      description: input.description,
      status: toApiStatus(input.status),
      priority: toApiPriority(input.priority),
      dueDate: input.due ? new Date(`${input.due}T12:00:00`).toISOString() : null,
    };
    if (taskId) {
      await updateTask(taskId, apiInput);
      showNotice("Task updated");
    } else {
      await createTask(apiInput);
      showNotice("Task created");
    }
    await refreshTasks();
  }, [refreshTasks, showNotice]);

  const setTaskStatus = useCallback(async (taskId: string, status: Task["status"]) => {
    await updateTask(taskId, { status: toApiStatus(status) });
    await refreshTasks();
  }, [refreshTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    await removeTask(taskId);
    setTasks((current) => current.filter((task) => task.id !== taskId));
    showNotice("Task deleted");
  }, [showNotice]);

  const updateProfile = useCallback((profile: UserProfile) => {
    setUser(profile);
    showNotice("Profile updated");
  }, [showNotice]);

  const signOut = useCallback(async () => {
    try {
      await amplifySignOut();
    } finally {
      setUser(null);
      setTasks([]);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthLoading,
    tasks,
    apiStatus,
    notice,
    search,
    setSearch,
    showNotice,
    setUser,
    updateProfile,
    refreshTasks,
    saveTask,
    setTaskStatus,
    deleteTask,
    signOut,
  }), [user, isAuthLoading, tasks, apiStatus, notice, search, showNotice, updateProfile, refreshTasks, saveTask, setTaskStatus, deleteTask, signOut]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}