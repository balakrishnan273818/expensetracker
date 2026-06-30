import os
import logging
import requests

logger = logging.getLogger(__name__)

# ── Cloud provider (used on Render when HF_API_KEY env var is set) ───────────
HF_API_KEY = os.environ.get("HF_API_KEY")
HF_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_EMBED_URL = f"https://api-inference.huggingface.co/models/{HF_EMBED_MODEL}"

# ── Local fallback (used when HF_API_KEY is absent — local dev with Ollama) ──
# Pull with: ollama pull all-minilm
# Same architecture as all-MiniLM-L6-v2, produces identical 384-dim vectors.
OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
OLLAMA_EMBED_MODEL = "all-minilm"

# Minimum cosine similarity to include a past transaction as a reference.
# Raise if you see bad matches; lower if too few examples are returned.
MIN_SIMILARITY = 0.65


# ── Helpers ───────────────────────────────────────────────────────────────────

def _mean_pool(arr):
    """
    Pure-Python mean pooling over the sequence dimension.

    HF feature-extraction endpoints can return:
      - 3-D list  [batch, seq_len, dim]  → mean-pool seq, take batch[0]
      - 2-D list  [batch, dim]           → take batch[0]
      - 1-D list  [dim]                  → return as-is
    """
    if not arr:
        return []

    # 3-D: [batch, seq, dim]
    if isinstance(arr[0], list) and isinstance(arr[0][0], list):
        token_embeddings = arr[0]           # [seq, dim]
        n = len(token_embeddings)
        dim = len(token_embeddings[0])
        return [
            sum(token_embeddings[i][d] for i in range(n)) / n
            for d in range(dim)
        ]

    # 2-D: [batch, dim]
    if isinstance(arr[0], list):
        return arr[0]

    # 1-D: [dim]
    return arr


# ── Embedding providers ───────────────────────────────────────────────────────

def _embed_via_hf(text: str):
    """Generate embedding via Hugging Face Inference API (cloud)."""
    try:
        response = requests.post(
            HF_EMBED_URL,
            headers={"Authorization": f"Bearer {HF_API_KEY}"},
            json={"inputs": text, "options": {"wait_for_model": True}},
            timeout=30
        )
        response.raise_for_status()
        return _mean_pool(response.json())

    except Exception as e:
        logger.warning("HF embedding failed: %s", e)
        return None


def _embed_via_ollama(text: str):
    """Generate embedding via local Ollama instance (dev fallback)."""
    try:
        response = requests.post(
            OLLAMA_EMBED_URL,
            json={"model": OLLAMA_EMBED_MODEL, "prompt": text},
            timeout=15
        )
        response.raise_for_status()
        return response.json().get("embedding")

    except Exception as e:
        logger.warning("Ollama embedding failed: %s", e)
        return None


# ── Public API ────────────────────────────────────────────────────────────────

def get_embedding(text: str):
    """
    Generate a 384-dim sentence embedding for the given text.

    Routing:
      - HF_API_KEY set  →  Hugging Face Inference API  (Render / cloud)
      - HF_API_KEY absent →  local Ollama              (development)

    Returns list[float] on success, None on failure.
    Both failure modes are silent so the categorisation pipeline degrades
    gracefully (RAG context is skipped, AI call proceeds without it).
    """
    if not text or not text.strip():
        return None

    text = text.strip()

    embedding = _embed_via_hf(text) if HF_API_KEY else _embed_via_ollama(text)

    if not embedding:
        logger.warning("Could not generate embedding for text=%r", text[:80])

    return embedding


def build_rag_context(similar_txns: list) -> str:
    """
    Format retrieved similar transactions as few-shot examples for the LLM prompt.
    Each item in similar_txns: (description, category, sub_category, similarity_score)
    """
    if not similar_txns:
        return ""

    lines = ["### Similar Past Transactions (use as reference):"]

    for description, category, sub_category, similarity in similar_txns:
        lines.append(
            f'Transaction: "{description}" '
            f'→ Category: {category}, Subcategory: {sub_category} '
            f'(match: {similarity:.0%})'
        )

    return "\n".join(lines)
