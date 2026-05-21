import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AppSettings } from '../types';
import { SettingsPanel } from './SettingsPanel';

const settings: AppSettings = {
  documents_path: '/documents',
  chunk_size: 800,
  chunk_overlap: 150,
  retrieval_k: 5,
  embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
  llm_provider: 'mock',
  llm_model: 'mock',
};

describe('SettingsPanel', () => {
  it('saves settings', async () => {
    const onSave = vi.fn();
    render(<SettingsPanel settings={settings} onChange={vi.fn()} onSave={onSave} />);

    await userEvent.click(screen.getByRole('button', { name: /save settings/i }));

    expect(onSave).toHaveBeenCalled();
  });
});
