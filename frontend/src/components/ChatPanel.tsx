import { Bot, MessageCircle, Send, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';

import type { ChatMessage } from '../types';
import { Button, Card, Input } from './ui';

type Props = {
  messages: ChatMessage[];
  loading: boolean;
  onAsk: (question: string) => Promise<void>;
};

export function ChatPanel({ messages, loading, onAsk }: Props) {
  const [question, setQuestion] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }
    await onAsk(question);
    setQuestion('');
  }

  return (
    <Card className="flex min-h-[680px] flex-col p-0">
      <div className="border-b border-border/60 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ask your notes</h2>
            <p className="text-sm text-muted-foreground">
              Answers include the excerpts Chroma retrieved from your local documents.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-auto bg-gradient-to-b from-muted/40 to-transparent p-5">
        {messages.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary">
              <Bot className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">Ready when your notes are indexed</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Try asking in Polish, for example: “Znajdź mi informacje na temat stylu
              odrzucającego”.
            </p>
          </div>
        ) : null}
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={message.role === 'user' ? 'ml-auto max-w-[86%]' : 'mr-auto max-w-[92%]'}
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span
                className={
                  message.role === 'user'
                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'
                    : 'flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                }
              >
                {message.role === 'user' ? (
                  <UserRound className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </span>
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div
              className={
                message.role === 'user'
                  ? 'rounded-[1.4rem] rounded-tr-md bg-primary p-4 text-primary-foreground shadow-lg shadow-blue-500/20'
                  : 'rounded-[1.4rem] rounded-tl-md border border-border/70 bg-white/80 p-4 shadow-sm dark:bg-slate-950/30'
              }
            >
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            </div>
            {message.sources?.length ? (
              <div className="mt-3 space-y-2">
                {message.sources.map((source, sourceIndex) => (
                  <details
                    key={`${source.filename}-${sourceIndex}`}
                    className="group rounded-2xl border border-border/60 bg-white/60 p-3 text-xs shadow-sm transition open:bg-white/90 dark:bg-white/5 dark:open:bg-white/10"
                  >
                    <summary className="cursor-pointer list-none font-semibold text-muted-foreground group-open:text-foreground">
                      Source: {source.filename}
                    </summary>
                    <p className="mt-2 rounded-xl bg-muted/70 p-3 leading-5 text-muted-foreground">
                      {source.excerpt}
                    </p>
                  </details>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <form className="flex gap-3 border-t border-border/60 p-4" onSubmit={submit}>
        <Input
          aria-label="Question"
          placeholder="Ask a question about your psychology notes..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="min-h-12"
        />
        <Button disabled={loading} className="h-12 px-5">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">{loading ? 'Thinking...' : 'Send'}</span>
        </Button>
      </form>
    </Card>
  );
}
