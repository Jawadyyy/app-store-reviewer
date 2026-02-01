import json
import os
import numpy as np

STORE_DIR = "./vector_store_data"
STORE_FILE = os.path.join(STORE_DIR, "store.json")


def init_store():
    if not os.path.exists(STORE_DIR):
        os.makedirs(STORE_DIR)


def save_store(data: dict):
    init_store()
    with open(STORE_FILE, "w") as f:
        json.dump(data, f)


def load_store() -> dict:
    if not os.path.exists(STORE_FILE):
        return {"ids": [], "embeddings": [], "documents": [], "metadatas": []}
    with open(STORE_FILE, "r") as f:
        return json.load(f)


def store_is_empty() -> bool:
    store = load_store()
    return len(store["ids"]) == 0


def add_to_store(ids: list, embeddings: list, documents: list, metadatas: list):
    store = load_store()
    store["ids"].extend(ids)
    store["embeddings"].extend(embeddings)
    store["documents"].extend(documents)
    store["metadatas"].extend(metadatas)
    save_store(store)


def query_store(query_embedding: list, n_results: int = 3) -> dict:
    store = load_store()

    if len(store["embeddings"]) == 0:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    # Cosine similarity
    query_vec = np.array(query_embedding)
    store_vecs = np.array(store["embeddings"])

    # Normalize
    query_norm = query_vec / np.linalg.norm(query_vec)
    store_norms = store_vecs / np.linalg.norm(store_vecs, axis=1, keepdims=True)

    # Similarity scores
    similarities = np.dot(store_norms, query_norm)

    # Get top results (highest similarity)
    top_indices = np.argsort(similarities)[::-1][:n_results]

    documents = [store["documents"][i] for i in top_indices]
    metadatas = [store["metadatas"][i] for i in top_indices]
    distances = [1 - similarities[i] for i in top_indices]  # Convert to distance

    return {
        "documents": [documents],
        "metadatas": [metadatas],
        "distances": [distances]
    }