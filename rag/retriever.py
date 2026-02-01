from embedder import get_model
from vector_store import query_store


def retrieve_relevant_policies(query: str, top_k: int = 3) -> list:
    model = get_model()

    query_embedding = model.encode([query])[0].tolist()

    results = query_store(query_embedding, n_results=top_k)

    chunks = []
    for i in range(len(results["documents"][0])):
        chunks.append({
            "text": results["documents"][0][i],
            "source": results["metadatas"][0][i]["source"],
            "distance": results["distances"][0][i]
        })

    return chunks


def build_context(permissions: list) -> str:
    all_chunks = []

    for perm in permissions:
        query = perm.split(".")[-1].replace("_", " ").lower()
        query = f"{query} permission policy"

        chunks = retrieve_relevant_policies(query, top_k=2)
        all_chunks.extend(chunks)

    seen = set()
    unique_chunks = []
    for c in all_chunks:
        if c["source"] not in seen:
            seen.add(c["source"])
            unique_chunks.append(c)

    context = "\n\n---\n\n".join(
        f"[Source: {c['source']}]\n{c['text']}"
        for c in unique_chunks
    )

    return context


if __name__ == "__main__":
    test_query = "What are the rules for SMS permissions?"
    results = retrieve_relevant_policies(test_query)

    for r in results:
        print(f"Source: {r['source']} | Distance: {r['distance']:.3f}")
        print(f"Text: {r['text'][:150]}...")
        print("---")