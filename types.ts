export type Category = "UX" | "frontend-dev" | "backend-dev";

export type TaskStatus = "New" | "Ongoing" | "Completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: TaskStatus;
  assignedTo?: string;
  timestamp: string;
}

export interface Member {
  id: string;
  name: string;
  category: Category;
}

export interface DbData {
  tasks: Task[];
  members: Member[];
}
