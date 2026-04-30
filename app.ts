import express from "express";
import cors from "cors";
import membersRouter from "./endpoints/Members";
import tasksRouter from "./endpoints/Tasks";
import { Category } from "../shared/types";

const categories: Category[] = ["UX", "frontend-dev", "backend-dev"];

export const app = express();

app.use(express.json())
app.use(cors());
app.use("/members", membersRouter);
app.use("/tasks", tasksRouter);
app.get("/categories", (_req, res) => {
  res.json(categories);
});