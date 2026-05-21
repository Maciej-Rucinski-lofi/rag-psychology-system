# Troubleshooting

## Docker Cannot Mount My Windows Folder

Use an absolute path in `.env`:

```text
DOCUMENTS_HOST_PATH=C:\Users\macie\Documents\psychology-notes
```

Then restart:

```powershell
docker compose down
docker compose up --build
```

## Ollama Says The Model Is Missing

Open a terminal and pull the model inside the Ollama container:

```powershell
docker compose exec ollama ollama pull mistral
```

For quick UI testing without a real model, set this in `.env`:

```text
LLM_PROVIDER=mock
```

## Ingestion Is Slow

The first run downloads the embedding model and computes vectors for every chunk.
Later runs skip unchanged files by checking each file's SHA-256 hash.

## The Assistant Gives Weak Answers

Try these steps:

- Add more specific notes.
- Re-index after changing files.
- Increase `retrieval_k` in Settings.
- Ask a narrower question.
