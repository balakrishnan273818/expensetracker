# rag/retrieval/retriever.py

from rag.retrieval.vector_store import retrieve_similar


def retrieve_similar_transactions(query: str, top_k: int = 5, debug: bool = False):
    """
    Retrieve semantically similar transactions

    Input:
        query: processed query string
        top_k: number of results

    Output:
        List of relevant transaction metadata
    """

    raw_results = retrieve_similar(query, k=top_k, debug=debug)

    # If debug from vector_store → unwrap
    if debug and isinstance(raw_results, dict):
        results = raw_results.get("results", [])
    else:
        results = raw_results

    # ----------------------------------------
    # CLEAN + FILTER RESULTS
    # ----------------------------------------
    filtered = []

    for r in results:
        meta = r.get("meta", {})

        # Basic sanity check
        if not meta:
            continue

        if not meta.get("category"):
            continue

        filtered.append({
            "description": meta.get("description"),
            "category": meta.get("category"),
            "subcategory": meta.get("subcategory"),
            "type": meta.get("type"),
            "mode": meta.get("mode"),
            "amount": meta.get("amount"),
            "distance": r.get("distance")
        })

    # ----------------------------------------
    # SORT (closest first)
    # ----------------------------------------
    filtered = sorted(filtered, key=lambda x: x["distance"])

    if debug:
        return {
            "query": query,
            "raw_count": len(results),
            "filtered_count": len(filtered),
            "results": filtered
        }

    return filtered