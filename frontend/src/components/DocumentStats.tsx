import { RefreshCw, Trash2 } from 'lucide-react';

import type { DocumentListResponse } from '../types';
import { Badge, Button, Card } from './ui';

type Props = {
  documents: DocumentListResponse | null;
  onIngest: (force: boolean) => void;
  onClear: () => void;
};

export function DocumentStats({ documents, onIngest, onClear }: Props) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Indexed notes</h2>
          <p className="text-sm text-muted-foreground">
            {documents?.total_documents ?? 0} documents, {documents?.total_chunks ?? 0} chunks
          </p>
        </div>
        <Badge>{documents?.ingest_running ? 'Indexing' : 'Ready'}</Badge>
      </div>
      {documents?.last_ingest_message ? (
        <p className="rounded-lg bg-muted p-3 text-sm">{documents.last_ingest_message}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onIngest(false)} disabled={documents?.ingest_running}>
          <RefreshCw className="mr-2 h-4 w-4" /> Index mounted folder
        </Button>
        <Button
          onClick={() => onIngest(true)}
          disabled={documents?.ingest_running}
          className="bg-slate-700"
        >
          Re-index all
        </Button>
        <Button onClick={onClear} className="bg-red-600">
          <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
      <div className="max-h-52 space-y-2 overflow-auto">
        {documents?.documents.map((document) => (
          <div key={document.id} className="rounded-lg border p-3 text-sm">
            <div className="font-medium">{document.filename}</div>
            <div className="text-muted-foreground">
              {document.chunks} chunks · {document.extension}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
