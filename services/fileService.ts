import { promises as fs } from "fs";
import path from "path";
import { DbData } from "../types";

const dbFilePath = path.join(__dirname, "..", "data", "db.json");

const emptyDb: DbData = {
  tasks: [],
  members: []
};

export async function readDb(): Promise<DbData> {
  try {
    const raw = await fs.readFile(dbFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbData>;

    return {
      tasks: parsed.tasks ?? [],
      members: parsed.members ?? []
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      await writeDb(emptyDb);
      return emptyDb;
    }

    throw error;
  }
}

export async function writeDb(data: DbData): Promise<void> {
  await fs.mkdir(path.dirname(dbFilePath), { recursive: true });
  await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), "utf8");
}