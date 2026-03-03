import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "postgres",
  database: process.env.PG_DATABASE || "ragdb",
});

export async function insertDocument(content: string, embedding: number[]) {
console.log('content', content)
console.log('embedding', embedding)
  await pool.query(
    'insert into documents (content, embedding) values ($1, $2::vector)',
    [content, JSON.stringify(embedding)]
  );
}

export async function matchDocuments(
  queryEmbedding: number[],
  matchCount: number = 5
) {
  const res = await pool.query(
    `
    select
      id,
      content,
      1 - (embedding <=> $1) as similarity
    from documents
    where embedding <=> $1 < 1
    order by embedding <=> $1
    limit $2
    `,
    [JSON.stringify(queryEmbedding), matchCount]
  );

  return res.rows;
}
