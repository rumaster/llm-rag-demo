import dotenv from 'dotenv';
dotenv.config();

import OpenAI from "openai";
import { createEmbedding } from "./embed.ts";
import { matchDocuments } from "./db.ts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const question = process.argv.slice(2).join(" ");

if (!question) {
  console.error("Usage: npm run ask \"Your question here\"");
  process.exit(1);
}

console.log('Question:', question)

async function ask(question: string) {
  const queryEmbedding = await createEmbedding(question);

  const data = await matchDocuments(queryEmbedding, 5);

  if (data.length === 0) {
    console.log("No relevant documents found.");
    return;
  }

  const context = data.map(d => d.content).join("\n\n");
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "Answer using provided context only."
      },
      {
        role: "user",
        content: `
Context:
${context}

Question:
${question}
`
      }
    ]
  });

  console.log("\nAnswer:\n", completion.choices[0].message.content);
}

ask(question).catch(err => {
  console.error("Error during ask:", err);
  process.exit(1);
});
