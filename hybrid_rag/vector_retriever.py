import faiss
import numpy as np
import google.generativeai as genai
from langchain.text_splitter import RecursiveCharacterTextSplitter
import io

# This class assumes that the 'google.generativeai' library has been
# configured with an API key in the main application script.

class VectorStore:
    """
    Handles the creation of a searchable vector index from a given text.
    This includes chunking the text, generating embeddings, and building a FAISS index.
    """
    def __init__(self, text: str):
        """
        Initializes the VectorStore by processing the input text.
        """
        self.chunks = self._chunk_text(text)
        self.index = self._create_vector_index(self.chunks)

    def _chunk_text(self, text: str) -> list[str]:
        """
        Splits a large text into smaller, semantically meaningful chunks.
        """
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # The size of each chunk in characters
            chunk_overlap=100, # The number of characters to overlap between chunks
            length_function=len,
        )
        return text_splitter.split_text(text)

    def _embed_chunks(self, chunks: list[str]) -> np.ndarray:
        """
        Converts a list of text chunks into numerical vectors (embeddings).
        """
        try:
            # Use the standard embedding model for document retrieval
            result = genai.embed_content(
                model="models/embedding-001",
                content=chunks,
                task_type="RETRIEVAL_DOCUMENT"
            )
            return np.array(result['embedding'])
        except Exception as e:
            print(f"Error during text embedding: {e}")
            # Return an empty array with the correct shape to prevent crashes
            return np.empty((0, 768)) 

    def _create_vector_index(self, chunks: list[str]):
        """
        Creates a FAISS index from the embeddings for fast similarity searches.
        """
        embeddings = self._embed_chunks(chunks)
        if embeddings.shape[0] == 0:
            return None # Return None if no embeddings were generated
        
        # IndexFlatL2 is a simple and efficient index for L2 (Euclidean) distance
        d = embeddings.shape[1]
        index = faiss.IndexFlatL2(d)
        index.add(embeddings)
        return index

    def search(self, query: str, k: int = 3) -> list[str]:
        """
        Searches the index to find the top 'k' chunks most similar to the query.
        """
        if self.index is None or self.index.ntotal == 0:
            return [] # Return an empty list if the index is not valid or empty
        
        # Embed the user's query for searching, using the same model
        query_embedding_result = genai.embed_content(
            model="models/embedding-001",
            content=query,
            task_type="RETRIEVAL_QUERY"
        )
        query_embedding = np.array([query_embedding_result['embedding']])
        
        # Perform the search on the FAISS index
        distances, indices = self.index.search(query_embedding, k)
        
        # Return the original text chunks that correspond to the search results
        return [self.chunks[i] for i in indices[0]]

