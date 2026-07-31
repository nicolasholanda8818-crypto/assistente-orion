import os
import chromadb
from chromadb.config import Settings

class VectorMemory:
    """
    Sistema de Memória Vetorial (RAG) para busca semântica em documentos e PDFs.
    """
    def __init__(self, db_path="orion_vector_db"):
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(name="orion_knowledge")

    def add_document(self, doc_id: str, text: str, metadata: dict = None):
        """Divide o texto em blocos (chunks) e adiciona ao banco vetorial."""
        chunks = self._chunk_text(text, chunk_size=500)
        documents = []
        ids = []
        metadatas = []

        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            ids.append(f"{doc_id}_chunk_{i}")
            metadatas.append(metadata or {"source": doc_id})

        if documents:
            self.collection.add(
                documents=documents,
                ids=ids,
                metadatas=metadatas
            )

    def search_relevant(self, query: str, n_results: int = 3) -> str:
        """Busca os trechos mais relevantes do banco vetorial com base na pergunta."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        if not results or not results['documents'] or not results['documents'][0]:
            return "Nenhuma informação relevante encontrada na base vetorial."

        return "\n\n---\n\n".join(results['documents'][0])

    def _chunk_text(self, text: str, chunk_size: int = 500) -> list:
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunks.append(" ".join(words[i:i + chunk_size]))
        return chunks
