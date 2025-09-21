import google.generativeai as genai

def route_query(query: str) -> str:
    """
    Uses an LLM to classify a user's query as either 'vector' or 'graph'.
    """
    # This assumes genai has been configured with an API key in the main script.
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    
    prompt = f"""
    You are a query routing specialist. Your job is to determine if a user's question is best answered by a semantic vector search or a knowledge graph search.
    - 'vector' search is best for broad, open-ended questions about topics, concepts, or summaries (e.g., "What does the document say about confidentiality?", "Summarize the termination clause.").
    - 'graph' search is best for specific, multi-hop questions about relationships between entities (e.g., "Who is responsible for what under the amended agreement?", "What is the payment amount associated with the Q3 deliverable?").

    Based on the following user query, respond with ONLY the word 'vector' or 'graph'.

    User Query: "{query}"
    """
    
    try:
        response = model.generate_content(prompt)
        route = response.text.strip().lower()
        # Ensure the response is one of the expected values, otherwise default to vector.
        return route if route in ["vector", "graph"] else "vector"
    except Exception as e:
        print(f"Error routing query: {e}")
        # Default to the most common search type on any failure.
        return "vector"

