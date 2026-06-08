# rag/retrieval/embedder.py

from sentence_transformers import SentenceTransformer

# Lazy-loaded singleton
_model = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")  # 384 dim
    return _model


def embed(text: str, debug: bool = False):
    """
    Convert text → embedding vector
    """

    model = _get_model()
    vector = model.encode(text)

    if debug:
        return {
            "text": text,
            "vector_dim": len(vector),
            "sample": vector[:5].tolist()
        }

    return vector