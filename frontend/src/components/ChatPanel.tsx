import { Send } from 'lucide-react';
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
    <Card className="flex min-h-[640px] flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Ask your notes</h2>
        <p className="text-sm text-muted-foreground">
          Answers include the excerpts Chroma retrieved from your local documents.
        </p>
      </div>
      <div className="flex-1 space-y-4 overflow-auto rounded-xl bg-muted/40 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Try: “What are the key ideas in cognitive behavioral therapy?”
          </p>
        ) : null}
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={message.role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[90%]'}
          >
            <div
              className={
                message.role === 'user'
                  ? 'rounded-xl bg-primary p-3 text-primary-foreground'
                  : 'rounded-xl border bg-card p-3'
              }
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>
            {message.sources?.length ? (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, sourceIndex) => (
                  <details key={`${source.filename}-${sourceIndex}`} className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      {source.filename}
                    </summary>
                    <p className="mt-1 rounded-lg border bg-background p-2">{source.excerpt}</p>
                  </details>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <Input
          aria-label="Question"
          placeholder="Ask a question about your psychology notes..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <Button disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
