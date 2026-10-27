export type TaskStatus = "To do" | "In progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  title: string;
  project: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  assignee: string;
  description: string;
};

export type UserProfile = {
  name: string;
  email: string;
};

export type TaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
};
