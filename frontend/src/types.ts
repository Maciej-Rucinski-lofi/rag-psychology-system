export type AppSettings = {
  documents_path: string;
  chunk_size: number;
  chunk_overlap: number;
  retrieval_k: number;
  embedding_model: string;
  llm_provider: 'ollama' | 'openai' | 'anthropic' | 'mock';
  llm_model: string;
};

export type DocumentInfo = {
  id: string;
  filename: string;
  path: string;
  extension: string;
  sha256: string;
  chunks: number;
  indexed_at: string;
};

export type DocumentListResponse = {
  documents: DocumentInfo[];
  total_documents: number;
  total_chunks: number;
  last_ingest_message: string | null;
  ingest_running: boolean;
};

export type HealthResponse = {
  status: string;
  version: string;
  vector_store_ready: boolean;
  documents_root: string;
};

export type SourceChunk = {
  filename: string;
  path: string;
  excerpt: string;
  score: number | null;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceChunk[];
};
