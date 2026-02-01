from pathlib import Path


def load_policy_docs(docs_dir: str = "policy_docs") -> list:
    docs = []
    for file_path in Path(docs_dir).glob("*.txt"):
        with open(file_path, "r") as f:
            content = f.read()
        docs.append({
            "source": file_path.name,
            "content": content
        })
    return docs


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list:
    words = text.split()
    chunks = []
    i = 0

    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap

    return chunks


def create_chunked_docs(docs_dir: str = "policy_docs") -> list:
    docs = load_policy_docs(docs_dir)
    chunked = []

    for doc in docs:
        chunks = chunk_text(doc["content"])

        for i, chunk in enumerate(chunks):
            chunked.append({
                "chunk_id": f"{doc['source']}__chunk_{i}",
                "source": doc["source"],
                "text": chunk
            })

    return chunked


if __name__ == "__main__":
    chunks = create_chunked_docs()
    for c in chunks:
        print(f"[{c['chunk_id']}] {c['text'][:80]}...")
    print(f"\nTotal chunks: {len(chunks)}")