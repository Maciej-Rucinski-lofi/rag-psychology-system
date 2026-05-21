# Architecture

This project is a local-first RAG application. The browser talks to a FastAPI
backend, and the backend owns all document parsing, indexing, retrieval, and model
calls.

```text
React UI -> FastAPI API -> loaders -> chunks -> embeddings -> ChromaDB
                         -> question embedding -> semantic search -> LLM -> answer
```

## Why This Shape

- React is used only for user interaction: chat, settings, health, and document status.
- FastAPI keeps the RAG pipeline in Python, where document parsing, embeddings, and ChromaDB are well supported.
- ChromaDB persists vectors in a Docker volume, so indexed notes survive restarts.
- Ollama is the default LLM provider because it can run locally. OpenAI and Anthropic are available through environment variables.

## RAG Concepts

RAG means Retrieval-Augmented Generation. Instead of asking a model to answer from
memory, the app first retrieves relevant chunks from your own notes and sends those
chunks with the question.

Embeddings are numeric representations of text. Similar meanings produce similar
vectors, which lets ChromaDB search by meaning.

Chunking splits long documents into smaller passages. This improves retrieval
because the model receives focused excerpts instead of entire files.

## Security Boundaries

The backend only indexes files inside the mounted `/documents` folder. Supported
extensions are `.pdf`, `.txt`, `.odt`, and `.ods`. Source documents are treated as
untrusted context, and the model prompt tells the assistant to ignore instructions
found inside those documents.
