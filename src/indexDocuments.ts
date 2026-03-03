import { chunkText } from "./chunk.ts";
import { createEmbedding } from "./embed.ts";
import { insertDocument } from "./db.ts";
import fs from "fs";

async function run() {
  const text = fs.readFileSync("./data/docs.txt", "utf8");

  const chunks = chunkText(text);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);

    await insertDocument(chunk, embedding);

    console.log("Inserted chunk");
  }
}

run();
