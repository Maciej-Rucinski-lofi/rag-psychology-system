import { BrainCircuit, Moon, Sparkles, Sun } from 'lucide-react';
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
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setBootstrapping(true);

    const healthPromise = api.health().then(setHealth).catch(() => setHealth(null));
    const settingsPromise = api.settings().then(setSettings).catch(() => setSettings(null));
    const documentsPromise = api
      .documents()
      .then(setDocuments)
      .catch(() =>
        setDocuments({
          documents: [],
          total_documents: 0,
          total_chunks: 0,
          last_ingest_message: 'Could not load indexed documents. Try refreshing the page.',
          ingest_running: false,
        }),
      );

    await Promise.allSettled([healthPromise, settingsPromise, documentsPromise]);
    setBootstrapping(false);
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
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-black/20 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-blue-500/30">
                <BrainCircuit className="h-7 w-7" />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  Local-first psychology assistant
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Psychology Notes RAG
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Ask questions about your study notes and get answers with source excerpts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  health?.status === 'ok'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200'
                }
              >
                {health?.status === 'ok' ? 'API healthy' : 'API unknown'}
              </Badge>
              <Button
                aria-label="Toggle dark mode"
                className="h-11 w-11 bg-slate-900 px-0 text-white shadow-slate-900/20 dark:bg-white dark:text-slate-950"
                onClick={() => setDark((value) => !value)}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>
        {notice ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm font-medium text-primary shadow-lg shadow-blue-500/10">
            {notice}
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <ChatPanel messages={messages} loading={loading} onAsk={ask} />
          <aside className="space-y-6">
            <DocumentStats
              documents={documents}
              loading={bootstrapping && !documents}
              onIngest={runIngest}
              onClear={clearDocuments}
            />
            <SettingsPanel
              settings={settings}
              loading={bootstrapping && !settings}
              onChange={setSettings}
              onSave={saveSettings}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
