from app.config import Settings
from app.schemas import AppSettings, ChatResponse, SourceChunk
from app.services.embeddings import get_embedding_service
from app.services.llm import LLMProviderError, build_llm_client
from app.services.vector_store import VectorStore


MAX_CONTEXT_SOURCES = 3
MAX_EXCERPT_CHARS = 650


class RagService:
    def __init__(self, runtime: Settings, vector_store: VectorStore) -> None:
        self.runtime = runtime
        self.vector_store = vector_store

    async def chat(self, question: str, app_settings: AppSettings) -> ChatResponse:
        embedder = get_embedding_service(app_settings.embedding_model)
        question_vector = embedder.embed([question])[0]
        sources = self.vector_store.query(question_vector, app_settings.retrieval_k)
        context = _build_context(sources)
        llm = build_llm_client(
            provider=app_settings.llm_provider,
            model=app_settings.llm_model,
            ollama_base_url=self.runtime.ollama_base_url,
            openai_api_key=self.runtime.openai_api_key,
            anthropic_api_key=self.runtime.anthropic_api_key,
        )
        try:
            answer = await llm.answer(question, context)
        except LLMProviderError as exc:
            answer = _fallback_answer(str(exc), sources)
        return ChatResponse(answer=answer, sources=sources)


def _build_context(sources: list[SourceChunk]) -> str:
    selected = sources[:MAX_CONTEXT_SOURCES]
    return "\n\n".join(
        f"Source: {source.filename}\nExcerpt:\n{source.excerpt[:MAX_EXCERPT_CHARS]}"
        for source in selected
    )


def _fallback_answer(error: str, sources: list[SourceChunk]) -> str:
    excerpts = "\n".join(
        f"- {source.filename}: {source.excerpt[:220].replace(chr(10), ' ')}"
        for source in sources[:MAX_CONTEXT_SOURCES]
    )
    return (
        "Lokalny model językowy nie zdążył przygotować odpowiedzi, ale wyszukiwanie "
        "znalazło poniższe fragmenty notatek.\n\n"
        f"Powód: {error}\n\n"
        f"Najbardziej pasujące fragmenty:\n{excerpts}"
    )
