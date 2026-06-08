# rag/pipeline/transaction_pipeline.py

from rag.feature.feature_extractor import extract_features
from rag.retrieval.retriever import retrieve_similar
from rag.retrieval.context_builder import build_context
from rag.llm.prompt_builder import build_prompt
from rag.llm.llm_client import call_llm
from rag.recurrence.recurrence_detector import detect_recurrence


# ==============================
# CORE PIPELINE
# ==============================

def process_transaction(tx: dict, debug: bool = False) -> dict:
    """
    Core RAG transaction pipeline

    Input:
        tx = {
            "date": str,
            "description": str,
            "amount": float,
            "bank": str
        }

    Output:
        {
            "type": str,
            "direction": str,
            "mode": str,
            "merchant": str,
            "category": str,
            "subcategory": str,
            "recurrence": str
        }

    Debug mode:
        returns intermediate steps
    """

    debug_data = {}

    try:
        # =====================================
        # 1. FEATURE EXTRACTION
        # =====================================
        features = extract_features(tx)

        if debug:
            debug_data["features"] = features

        # =====================================
        # 2. BUILD QUERY (for embedding/search)
        # =====================================
        query = _build_query(tx, features)

        if debug:
            debug_data["query"] = query

        # =====================================
        # 3. RETRIEVE SIMILAR TRANSACTIONS
        # =====================================
        similar = retrieve_similar(query, top_k=5)

        if debug:
            debug_data["retrieved"] = similar

        # =====================================
        # 4. BUILD CONTEXT
        # =====================================
        context = build_context(similar)

        if debug:
            debug_data["context"] = context

        # =====================================
        # 5. BUILD PROMPT
        # =====================================
        prompt = build_prompt(tx, features, context)

        if debug:
            debug_data["prompt"] = prompt

        # =====================================
        # 6. LLM CALL
        # =====================================
        llm_output = call_llm(prompt)

        if debug:
            debug_data["llm_output_raw"] = llm_output

        # =====================================
        # 7. POST PROCESS
        # =====================================
        structured = _post_process(llm_output, features)

        if debug:
            debug_data["structured_output"] = structured

        # =====================================
        # 8. RECURRENCE DETECTION
        # =====================================
        recurrence = detect_recurrence(tx, structured)

        structured["recurrence"] = recurrence

        if debug:
            debug_data["recurrence"] = recurrence

        # =====================================
        # FINAL OUTPUT
        # =====================================
        if debug:
            return {
                "final": structured,
                "debug": debug_data
            }

        return structured

    except Exception as e:

        if debug:
            return {
                "error": str(e),
                "input": tx,
                "debug": debug_data
            }

        # fallback minimal output
        return {
            "type": "expense",
            "direction": "debit" if tx.get("amount", 0) < 0 else "credit",
            "mode": "unknown",
            "merchant": "UNKNOWN",
            "category": "Others",
            "subcategory": "Miscellaneous",
            "recurrence": "none"
        }


# ==============================
# INTERNAL HELPERS
# ==============================

def _build_query(tx, features):
    """
    Converts transaction into embedding-friendly query
    """

    return f"""
    Description: {features.get('cleaned_description')}
    Amount: {tx.get('amount')}
    Direction: {features.get('direction')}
    Mode: {features.get('mode')}
    Bank: {tx.get('bank')}
    """


def _post_process(llm_output: dict, features: dict):
    """
    Ensures clean structured output
    """

    # Defensive parsing
    result = {
        "type": llm_output.get("type", "expense"),
        "merchant": llm_output.get("merchant", "UNKNOWN"),
        "category": llm_output.get("category", "Others"),
        "subcategory": llm_output.get("subcategory", "Miscellaneous"),
        "direction": features.get("direction"),
        "mode": features.get("mode")
    }

    # Normalize
    result["type"] = result["type"].lower()
    result["category"] = result["category"].title()
    result["subcategory"] = result["subcategory"].title()

    return result