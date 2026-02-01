from sentence_transformers import SentenceTransformer
from vector_store import store_is_empty, add_to_store
from chunker import create_chunked_docs

MODEL_NAME = "all-MiniLM-L6-v2"

_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_and_store(docs_dir: str = "policy_docs"):
    model = get_model()

    if not store_is_empty():
        print("Store already has data. Skipping.")
        print("Delete vector_store_data/ folder to re-embed.")
        return

    chunks = create_chunked_docs(docs_dir)
    print(f"Chunked {len(chunks)} pieces from policy docs.")

    texts = [c["text"] for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)

    add_to_store(
        ids=[c["chunk_id"] for c in chunks],
        embeddings=embeddings.tolist(),
        documents=texts,
        metadatas=[{"source": c["source"]} for c in chunks]
    )

    print(f"Stored {len(chunks)} chunks in vector store.")


if __name__ == "__main__":
    embed_and_store()