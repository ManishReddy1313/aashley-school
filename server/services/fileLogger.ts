import fs from "fs/promises";
import path from "path";

const DATA_DIR = process.env.VERCEL ? "/tmp/data" : path.join(process.cwd(), "server", "data");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore error if directory exists
  }
}

export async function logSubmissionToFile(filename: string, data: any) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  let currentData: any[] = [];
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    currentData = JSON.parse(fileContent);
  } catch (err: any) {
    // If file doesn't exist or is invalid JSON, start with empty array
  }

  currentData.push({
    timestamp: new Date().toISOString(),
    ...data
  });

  await fs.writeFile(filePath, JSON.stringify(currentData, null, 2), "utf-8");
}
