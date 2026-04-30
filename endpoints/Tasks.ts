import { Request, Response, Router } from "express";
import { randomUUID } from "crypto";
import { readDb, writeDb } from "../services/fileService";
import { Category, Task } from "../../shared/types";

const allowedCategories: Category[] = ["UX", "frontend-dev", "backend-dev"];

export async function getTasks(_req: Request, res: Response) {
  const db = await readDb();
  res.json(db.tasks);
}

export async function createTask(req: Request, res: Response) {
  const { title, description, category } = req.body as {
    title?: string;
    description?: string;
    category?: Category;
  };

  if (!title || !description || !category) {
    return res.status(400).json({ message: "title, description and category are required" });
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ message: "invalid category" });
  }

  const db = await readDb();

  const newTask: Task = {
    id: randomUUID(),
    title,
    description,
    category,
    status: "New",
    timestamp: new Date().toISOString()
  };

  db.tasks.push(newTask);
  await writeDb(db);

  res.status(201).json(newTask);
}

export async function assignTask(req: Request, res: Response) {
  const { id } = req.params;
  const { memberId } = req.body as { memberId?: string };

  if (!memberId) {
    return res.status(400).json({ message: "memberId is required" });
  }

  const db = await readDb();
  const task = db.tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ message: "task not found" });
  }

  if (task.status !== "New") {
    return res.status(400).json({ message: "only new tasks can be assigned" });
  }


  const member = db.members.find((m) => m.id === memberId);

  if (!member) {
    return res.status(404).json({ message: "member not found" });
  }

  if (member.category !== task.category) {
    return res.status(400).json({ message: "member category must match task category" });
  }

  task.assignedTo = member.id;
  task.status = "Ongoing";

  await writeDb(db);
  res.json(task);
  
}


export async function markTaskDone(req: Request, res: Response) {
  const { id } = req.params;

  const db = await readDb();
  const task = db.tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ message: "task not found" });
  }

  if (task.status !== "Ongoing") {
    return res.status(400).json({ message: "only ongoing tasks can be marked done" });
  }

  task.status = "Completed";
  await writeDb(db);

  res.json(task);
}

export async function deleteTask(req: Request, res: Response) {
  const { id } = req.params;

  const db = await readDb();
  const task = db.tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ message: "task not found" });
  }

  if (task.status !== "Completed") {
    return res.status(400).json({ message: "only completed tasks can be deleted" });
  }

  db.tasks = db.tasks.filter((item) => item.id !== id);
  await writeDb(db);

  res.status(204).send();
}

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id/assign", assignTask);
router.patch("/:id/done", markTaskDone);
router.delete("/:id", deleteTask);

export default router;