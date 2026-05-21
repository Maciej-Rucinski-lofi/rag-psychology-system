import { SlidersHorizontal } from 'lucide-react';

import type { AppSettings } from '../types';
import { Button, Card, Input } from './ui';

type Props = {
  settings: AppSettings | null;
  loading?: boolean;
  onChange: (settings: AppSettings) => void;
  onSave: () => void;
};

export function SettingsPanel({ settings, loading = false, onChange, onSave }: Props) {
  if (!settings) {
    return (
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading settings...' : 'Settings are unavailable right now.'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Tune retrieval and model behavior.
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
        Docker users should mount notes into <code className="font-semibold text-foreground">/documents</code>{' '}
        and keep paths inside that folder.
      </div>
      <label className="block space-y-2 text-sm font-medium">
        <span>Documents path</span>
        <Input
          value={settings.documents_path}
          onChange={(event) => onChange({ ...settings, documents_path: event.target.value })}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-2 text-sm font-medium">
          <span>Chunk size</span>
          <Input
            type="number"
            value={settings.chunk_size}
            onChange={(event) => onChange({ ...settings, chunk_size: Number(event.target.value) })}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          <span>Overlap</span>
          <Input
            type="number"
            value={settings.chunk_overlap}
            onChange={(event) =>
              onChange({ ...settings, chunk_overlap: Number(event.target.value) })
            }
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          <span>Top K</span>
          <Input
            type="number"
            value={settings.retrieval_k}
            onChange={(event) => onChange({ ...settings, retrieval_k: Number(event.target.value) })}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium">
          <span>LLM provider</span>
          <select
            className="w-full rounded-2xl border border-border/70 bg-white/80 px-3.5 py-2.5 text-sm outline-none ring-primary/20 transition focus:border-primary/60 focus:ring-4 dark:bg-slate-950/40"
            value={settings.llm_provider}
            onChange={(event) =>
              onChange({
                ...settings,
                llm_provider: event.target.value as AppSettings['llm_provider'],
              })
            }
          >
            <option value="ollama">Ollama</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="mock">Mock</option>
          </select>
        </label>
        <label className="block space-y-2 text-sm font-medium">
          <span>Model</span>
          <Input
            value={settings.llm_model}
            onChange={(event) => onChange({ ...settings, llm_model: event.target.value })}
          />
        </label>
      </div>
      <Button onClick={onSave} className="w-full">
        Save settings
      </Button>
    </Card>
  );
}
