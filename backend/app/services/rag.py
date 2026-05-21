from app.config import Settings
from app.schemas import AppSettings, ChatResponse
from app.services.embeddings import get_embedding_service
from app.services.llm import build_llm_client
from app.services.vector_store import VectorStore


class RagService:
    def __init__(self, runtime: Settings, vector_store: VectorStore) -> None:
        self.runtime = runtime
        self.vector_store = vector_store

    async def chat(self, question: str, app_settings: AppSettings) -> ChatResponse:
        embedder = get_embedding_service(app_settings.embedding_model)
        question_vector = embedder.embed([question])[0]
        sources = self.vector_store.query(question_vector, app_settings.retrieval_k)
        context = "\n\n".join(
            f"Source: {source.filename}\nExcerpt:\n{source.excerpt}" for source in sources
        )
        llm = build_llm_client(
            provider=app_settings.llm_provider,
            model=app_settings.llm_model,
            ollama_base_url=self.runtime.ollama_base_url,
            openai_api_key=self.runtime.openai_api_key,
            anthropic_api_key=self.runtime.anthropic_api_key,
        )
        answer = await llm.answer(question, context)
        return ChatResponse(answer=answer, sources=sources)
