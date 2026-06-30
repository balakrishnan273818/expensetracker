-- ============================================================
-- RAG: pgvector setup for transaction embeddings
-- Run this once against your Neon database.
-- Neon supports pgvector natively — no extra configuration needed.
-- ============================================================

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to transactions
--    all-MiniLM-L6-v2 (HF) and all-minilm (Ollama) both produce 384-dim vectors.
--    If you switch models, change the dimension here and rebuild the index.
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. IVFFlat index for fast approximate nearest-neighbour search.
--    'lists' should be roughly sqrt(expected row count).
--    Re-create this index after a large backfill for best performance.
CREATE INDEX IF NOT EXISTS idx_transactions_embedding
    ON transactions
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
