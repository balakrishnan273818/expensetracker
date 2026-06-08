# rag/retrieval/context_builder.py

def build_context(similar_transactions: list, debug: bool = False) -> str:
    """
    Convert retrieved transactions into LLM-friendly context

    Input:
        similar_transactions: list of dicts

    Output:
        formatted string for prompt
    """

    if not similar_transactions:
        return ""

    context_lines = []

    for tx in similar_transactions:

        line = (
            f"Description: {tx.get('description')} | "
            f"Type: {tx.get('type')} | "
            f"Category: {tx.get('category')} | "
            f"Subcategory: {tx.get('subcategory')} | "
            f"Mode: {tx.get('mode')}"
        )

        context_lines.append(line)

    context = "\n".join(context_lines)

    if debug:
        return {
            "num_examples": len(similar_transactions),
            "context": context
        }

    return context