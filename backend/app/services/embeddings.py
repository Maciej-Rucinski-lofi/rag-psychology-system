from functools import lru_cache

from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """Local embedding wrapper.

    Embeddings turn text into vectors so Chroma can search by meaning instead of
    exact keywords. The default model is small enough for laptops and runs locally.
    """

    def __init__(self, model_name: str) -> None:
        self.model = SentenceTransformer(model_name)

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        vectors = self.model.encode(texts, normalize_embeddings=True)
        return [vector.tolist() for vector in vectors]


@lru_cache
def get_embedding_service(model_name: str) -> EmbeddingService:
    return EmbeddingService(model_name)
