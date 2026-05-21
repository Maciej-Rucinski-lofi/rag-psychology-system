import type { AppSettings } from '../types';
import { Button, Card, Input } from './ui';

type Props = {
  settings: AppSettings | null;
  onChange: (settings: AppSettings) => void;
  onSave: () => void;
};

export function SettingsPanel({ settings, onChange, onSave }: Props) {
  if (!settings) {
    return <Card>Loading settings...</Card>;
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Docker users should mount notes into <code>/documents</code> and keep paths inside that
          folder.
        </p>
      </div>
      <label className="block space-y-1 text-sm">
        <span>Documents path</span>
        <Input
          value={settings.documents_path}
          onChange={(event) => onChange({ ...settings, documents_path: event.target.value })}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1 text-sm">
          <span>Chunk size</span>
          <Input
            type="number"
            value={settings.chunk_size}
            onChange={(event) => onChange({ ...settings, chunk_size: Number(event.target.value) })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Overlap</span>
          <Input
            type="number"
            value={settings.chunk_overlap}
            onChange={(event) =>
              onChange({ ...settings, chunk_overlap: Number(event.target.value) })
            }
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Top K</span>
          <Input
            type="number"
            value={settings.retrieval_k}
            onChange={(event) => onChange({ ...settings, retrieval_k: Number(event.target.value) })}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span>LLM provider</span>
          <select
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
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
        <label className="block space-y-1 text-sm">
          <span>Model</span>
          <Input
            value={settings.llm_model}
            onChange={(event) => onChange({ ...settings, llm_model: event.target.value })}
          />
        </label>
      </div>
      <Button onClick={onSave}>Save settings</Button>
    </Card>
  );
}
