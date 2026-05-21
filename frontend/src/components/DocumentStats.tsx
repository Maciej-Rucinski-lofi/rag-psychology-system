import { FileText, RefreshCw, Trash2 } from 'lucide-react';

import type { DocumentListResponse } from '../types';
import { Badge, Button, Card } from './ui';

type Props = {
  documents: DocumentListResponse | null;
  loading?: boolean;
  onIngest: (force: boolean) => void;
  onClear: () => void;
};

export function DocumentStats({ documents, loading = false, onIngest, onClear }: Props) {
  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Indexed notes</h2>
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Loading indexed notes...'
                : `${documents?.total_documents ?? 0} documents · ${documents?.total_chunks ?? 0} chunks`}
            </p>
          </div>
        </div>
        <Badge
          className={
            documents?.ingest_running
              ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200'
          }
        >
          {loading ? 'Loading' : documents?.ingest_running ? 'Indexing' : 'Ready'}
        </Badge>
      </div>
      {documents?.last_ingest_message ? (
        <p className="rounded-2xl border border-border/60 bg-muted/60 p-3 text-sm leading-5 text-muted-foreground">
          {documents.last_ingest_message}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <Button onClick={() => onIngest(false)} disabled={documents?.ingest_running}>
          <RefreshCw className="mr-2 h-4 w-4" /> Index mounted folder
        </Button>
        <Button
          onClick={() => onIngest(true)}
          disabled={documents?.ingest_running}
          className="bg-slate-800 text-white shadow-slate-900/20 dark:bg-white dark:text-slate-950"
        >
          Re-index all
        </Button>
        <Button onClick={onClear} className="bg-rose-600 text-white shadow-rose-500/20 sm:col-span-2">
          <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
      <div className="max-h-72 space-y-2 overflow-auto pr-1">
        {documents?.documents.map((document) => (
          <div
            key={document.id}
            className="rounded-2xl border border-border/70 bg-white/60 p-3 text-sm shadow-sm transition hover:border-primary/40 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="line-clamp-1 font-semibold">{document.filename}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{document.chunks} chunks</span>
              <span className="rounded-full bg-muted px-2 py-0.5 font-semibold uppercase">
                {document.extension.replace('.', '')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
