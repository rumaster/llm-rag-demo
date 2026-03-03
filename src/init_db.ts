import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "postgres",
  database: process.env.PG_DATABASE || "ragdb",
});

async function initDb() {
  await pool.query(`
    create extension if not exists vector;
    create extension if not exists pgcrypto;

    create table if not exists documents (
      id uuid primary key default gen_random_uuid(),
      content text,
      metadata jsonb,
      embedding vector(1536)
    );

    create index if not exists idx_documents_embedding on documents
    using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);
  `);

  console.log("Database initialized");
  await pool.end();
}

initDb().catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
