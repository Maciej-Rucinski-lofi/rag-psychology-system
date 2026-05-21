import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChatPanel } from './ChatPanel';

describe('ChatPanel', () => {
  it('submits a user question', async () => {
    const onAsk = vi.fn().mockResolvedValue(undefined);
    render(<ChatPanel messages={[]} loading={false} onAsk={onAsk} />);

    await userEvent.type(screen.getByLabelText(/question/i), 'What is memory?');
    await userEvent.click(screen.getByRole('button'));

    expect(onAsk).toHaveBeenCalledWith('What is memory?');
  });
});
