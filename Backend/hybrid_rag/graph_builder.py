import google.generativeai as genai
import networkx as nx
import json
import re

def extract_graph_from_text(text: str) -> nx.Graph:
    """Uses Gemini to extract entities and relationships and builds a knowledge graph."""
    # This assumes genai has been configured with an API key in the main script.
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    
    prompt = f"""
    You are a legal knowledge graph extractor. Analyze the following legal text and extract key entities and their relationships.
    Entities can be 'Party', 'Clause', 'Date', 'Amount', 'Obligation', or 'Right'.
    Relationships should describe how entities are connected, for example: 'HAS_OBLIGATION', 'PAYS_AMOUNT', 'TERMINATES_ON_DATE', 'REFERENCES_CLAUSE'.

    Return your response as a single, valid JSON object with two keys: "entities" and "relationships".
    - "entities" should be a list of strings, where each string is the name of an entity (e.g., "Company ABC Inc.", "Termination Clause", "$50,000").
    - "relationships" should be a list of lists, where each inner list contains three strings: [source_entity, relationship_type, target_entity].

    Example:
    {{
        "entities": ["Company ABC Inc.", "Client XYZ Corp.", "Payment Obligation", "$50,000"],
        "relationships": [
            ["Client XYZ Corp.", "HAS_OBLIGATION", "Payment Obligation"],
            ["Payment Obligation", "IS_AMOUNT", "$50,000"]
        ]
    }}

    Legal Text: --- {text[:15000]} ---
    """
    def build_graph_from_response(response_text):
        json_str = response_text.strip().replace('```json', '').replace('```', '')
        graph_data = json.loads(json_str)

        G = nx.Graph()
        for entity in graph_data.get("entities", []):
            G.add_node(entity)
        
        for rel in graph_data.get("relationships", []):
            if isinstance(rel, list) and len(rel) == 3:
                G.add_edge(rel[0], rel[2], label=rel[1])
        
        return G

    try:
        response = model.generate_content(prompt)
        return build_graph_from_response(response.text)
    except Exception as e:
        print(f"Failed to build knowledge graph: {e}")
        return nx.Graph()

