import { fetchAuthSession } from "aws-amplify/auth";
import { apiClient } from "../../lib/api-client";
import { API_VERSION_PREFIX } from "../../lib/config";

export type ApiTaskStatus = "todo" | "in_progress" | "done";
export type ApiTaskPriority = "low" | "medium" | "high";

export type TaskRecord = {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status: ApiTaskStatus;
  priority: ApiTaskPriority;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope<T> = { data: T };
type TaskListResult = { items: TaskRecord[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };

async function accessToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

export async function getTasks(): Promise<TaskRecord[]> {
  const token = await accessToken();
  const response = await apiClient.get<ApiEnvelope<TaskListResult>>(`${API_VERSION_PREFIX}/tasks`, { accessToken: token });
  return response.data.items;
}

export async function createTask(input: {
  title: string; description: string; status: ApiTaskStatus; priority: ApiTaskPriority; dueDate: string | null;
}): Promise<TaskRecord> {
  const token = await accessToken();
  const response = await apiClient.post<ApiEnvelope<TaskRecord>>(`${API_VERSION_PREFIX}/tasks`, input, { accessToken: token });
  return response.data;
}

export async function updateTask(taskId: string, input: Partial<{
  title: string; description: string; status: ApiTaskStatus; priority: ApiTaskPriority; dueDate: string | null;
}>): Promise<TaskRecord> {
  const token = await accessToken();
  const response = await apiClient.patch<ApiEnvelope<TaskRecord>>(`${API_VERSION_PREFIX}/tasks/${encodeURIComponent(taskId)}`, input, { accessToken: token });
  return response.data;
}

export async function removeTask(taskId: string): Promise<void> {
  const token = await accessToken();
  await apiClient.delete<void>(`${API_VERSION_PREFIX}/tasks/${encodeURIComponent(taskId)}`, { accessToken: token });
}

export function toUiStatus(status: ApiTaskStatus): "To do" | "In progress" | "Done" {
  return status === "in_progress" ? "In progress" : status === "done" ? "Done" : "To do";
}

export function toApiStatus(status: "To do" | "In progress" | "Done"): ApiTaskStatus {
  return status === "In progress" ? "in_progress" : status === "Done" ? "done" : "todo";
}

export function toUiPriority(priority: ApiTaskPriority): "Low" | "Medium" | "High" {
  return priority === "low" ? "Low" : priority === "high" ? "High" : "Medium";
}

export function toApiPriority(priority: "Low" | "Medium" | "High"): ApiTaskPriority {
  return priority.toLowerCase() as ApiTaskPriority;
}

export function fromApiTask(task: TaskRecord) {
  const rawDate = task.dueDate ? new Date(task.dueDate) : null;
  return {
    id: task._id || task.id || "",
    title: task.title,
    description: task.description || "",
    status: toUiStatus(task.status),
    priority: toUiPriority(task.priority),
    due: rawDate && !Number.isNaN(rawDate.getTime()) ? [
      rawDate.getFullYear(),
      String(rawDate.getMonth() + 1).padStart(2, "0"),
      String(rawDate.getDate()).padStart(2, "0")
    ].join("-") : "",
    // Project and assignee are not part of the current backend task schema.
    project: "General",
    assignee: "ME",
  };
}
