from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings
from app.dependencies import (
    get_ingest_state,
    get_ingestion_service,
    get_rag_service,
    get_settings_store,
    get_vector_store,
    runtime_settings,
)
from app.schemas import (
    AppSettings,
    ChatRequest,
    ChatResponse,
    DocumentListResponse,
    HealthResponse,
    IngestRequest,
    IngestResponse,
)
from app.services.ingestion import IngestState, IngestionService
from app.services.llm import LLMProviderError
from app.services.rag import RagService
from app.services.settings_store import SettingsStore
from app.services.vector_store import VectorStore

app = FastAPI(
    title="Psychology Notes RAG API",
    description="Local-first RAG API for indexing study notes and answering questions.",
    version="0.1.0",
)

settings = runtime_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health(runtime: Settings = Depends(runtime_settings)) -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=app.version,
        vector_store_ready=True,
        documents_root=str(runtime.documents_root),
    )


@app.get("/settings", response_model=AppSettings)
def read_settings(store: SettingsStore = Depends(get_settings_store)) -> AppSettings:
    return store.get()


@app.put("/settings", response_model=AppSettings)
def update_settings(
    settings_update: AppSettings,
    store: SettingsStore = Depends(get_settings_store),
) -> AppSettings:
    return store.put(settings_update)


@app.post("/ingest", response_model=IngestResponse)
def ingest(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
    service: IngestionService = Depends(get_ingestion_service),
    store: SettingsStore = Depends(get_settings_store),
    state: IngestState = Depends(get_ingest_state),
) -> IngestResponse:
    if state.running:
        raise HTTPException(status_code=409, detail="Ingestion is already running.")
    app_settings = store.get()
    background_tasks.add_task(service.ingest, app_settings, request.folder_path, request.force_reindex)
    return IngestResponse(accepted=True, message="Ingestion started.")


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    rag: RagService = Depends(get_rag_service),
    store: SettingsStore = Depends(get_settings_store),
) -> ChatResponse:
    try:
        return await rag.chat(request.question, store.get())
    except LLMProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/documents", response_model=DocumentListResponse)
def documents(
    vector_store: VectorStore = Depends(get_vector_store),
    state: IngestState = Depends(get_ingest_state),
) -> DocumentListResponse:
    docs = vector_store.documents()
    return DocumentListResponse(
        documents=docs,
        total_documents=len(docs),
        total_chunks=sum(document.chunks for document in docs),
        last_ingest_message=state.last_message,
        ingest_running=state.running,
    )


@app.delete("/documents", response_model=DocumentListResponse)
def clear_documents(
    vector_store: VectorStore = Depends(get_vector_store),
    state: IngestState = Depends(get_ingest_state),
) -> DocumentListResponse:
    vector_store.clear()
    state.last_message = "All indexed documents were removed."
    return DocumentListResponse(
        documents=[],
        total_documents=0,
        total_chunks=0,
        last_ingest_message=state.last_message,
        ingest_running=state.running,
    )
