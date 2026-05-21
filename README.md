# Psychology Notes RAG

A local-first RAG web app for asking questions about psychology study notes. It
indexes PDF, TXT, ODT, and ODS files, stores embeddings locally in ChromaDB, and
answers questions with source excerpts.

## Quick Start On Windows

Install Docker Desktop, then run:

```powershell
docker compose up --build
```

Open:

- Frontend: <http://localhost:5173>
- Backend API docs: <http://localhost:8000/docs>

To mount your own notes folder, copy `.env.example` to `.env` and set:

```text
DOCUMENTS_HOST_PATH=C:\Users\macie\Documents\psychology-notes
```

You can also use:

```powershell
.\start.ps1 -DocumentsPath "C:\Users\macie\Documents\psychology-notes"
```

## What The App Does

1. Reads supported documents from the mounted `/documents` folder.
2. Splits long files into overlapping chunks.
3. Converts chunks into local embeddings with `sentence-transformers/all-MiniLM-L6-v2`.
4. Stores vectors and metadata in persistent ChromaDB storage.
5. Retrieves the most relevant chunks for each question.
6. Sends the question and retrieved excerpts to an LLM.
7. Shows the answer with source filenames and excerpts.

## Model Options

The default provider is Ollama with `mistral`.

Before asking real questions, pull the model:

```powershell
docker compose exec ollama ollama pull mistral
```

For testing without a model, set `LLM_PROVIDER=mock` in `.env`.

Cloud providers are optional:

- `LLM_PROVIDER=openai` with `OPENAI_API_KEY`
- `LLM_PROVIDER=anthropic` with `ANTHROPIC_API_KEY`

## Project Structure

```text
backend/       FastAPI API and RAG services
frontend/      React + TypeScript + Tailwind UI
docs/          Architecture, API examples, troubleshooting
sample-data/   Small notes for the first run
docker-compose.yml
start.ps1
stop.ps1
reset.ps1
```

## Development

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
pytest
```

Frontend:

```powershell
cd frontend
npm install
npm test
npm run dev
```

## Useful Commands

```powershell
.\stop.ps1
.\reset.ps1
docker compose logs -f backend
docker compose logs -f frontend
```

## More Documentation

- [Architecture](docs/architecture.md)
- [API examples](docs/api.md)
- [Troubleshooting](docs/troubleshooting.md)
