import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from './lib/api';
import { ChatPanel } from './components/ChatPanel';
import { DocumentStats } from './components/DocumentStats';
import { SettingsPanel } from './components/SettingsPanel';
import { Badge, Button } from './components/ui';
import type { AppSettings, ChatMessage, DocumentListResponse, HealthResponse } from './types';

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [documents, setDocuments] = useState<DocumentListResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    const [healthResult, settingsResult, documentsResult] = await Promise.all([
      api.health(),
      api.settings(),
      api.documents(),
    ]);
    setHealth(healthResult);
    setSettings(settingsResult);
    setDocuments(documentsResult);
  }

  async function runIngest(force: boolean) {
    setNotice(null);
    const response = await api.ingest(settings?.documents_path, force);
    setNotice(response.message);
    window.setTimeout(() => void refresh(), 1500);
  }

  async function clearDocuments() {
    setDocuments(await api.clearDocuments());
  }

  async function saveSettings() {
    if (!settings) return;
    setSettings(await api.saveSettings(settings));
    setNotice('Settings saved.');
  }

  async function ask(question: string) {
    setLoading(true);
    setMessages((current) => [...current, { role: 'user', content: question }]);
    try {
      const response = await api.chat(question);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.answer, sources: response.sources },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'The assistant could not answer. Check backend logs.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Psychology Notes RAG</h1>
            <p className="text-muted-foreground">
              Local document search with cited AI answers for study notes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{health?.status === 'ok' ? 'API healthy' : 'API unknown'}</Badge>
            <Button className="bg-slate-700" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>
        {notice ? <div className="rounded-xl border bg-card p-3 text-sm">{notice}</div> : null}
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <ChatPanel messages={messages} loading={loading} onAsk={ask} />
          <aside className="space-y-6">
            <DocumentStats documents={documents} onIngest={runIngest} onClear={clearDocuments} />
            <SettingsPanel settings={settings} onChange={setSettings} onSave={saveSettings} />
          </aside>
        </div>
      </div>
    </main>
  );
}
