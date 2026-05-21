import { expect, test } from '@playwright/test';

test('indexes documents and asks a cited question with mocked API', async ({ page }) => {
  await page.route('**/api/health', async (route) => {
    await route.fulfill({ json: { status: 'ok', version: 'test', vector_store_ready: true, documents_root: '/documents' } });
  });
  await page.route('**/api/settings', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ json: await route.request().postDataJSON() });
      return;
    }
    await route.fulfill({
      json: {
        documents_path: '/documents',
        chunk_size: 800,
        chunk_overlap: 150,
        retrieval_k: 5,
        embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
        llm_provider: 'mock',
        llm_model: 'mock',
      },
    });
  });
  await page.route('**/api/documents', async (route) => {
    await route.fulfill({
      json: {
        documents: [{ id: '1', filename: 'cbt.txt', path: '/documents/cbt.txt', extension: '.txt', sha256: 'abc', chunks: 2, indexed_at: new Date().toISOString() }],
        total_documents: 1,
        total_chunks: 2,
        last_ingest_message: 'Indexed 1 document(s).',
        ingest_running: false,
      },
    });
  });
  await page.route('**/api/ingest', async (route) => {
    await route.fulfill({ json: { accepted: true, message: 'Ingestion started.' } });
  });
  await page.route('**/api/chat', async (route) => {
    await route.fulfill({
      json: {
        answer: 'CBT connects thoughts, feelings, and behavior.',
        sources: [{ filename: 'cbt.txt', path: '/documents/cbt.txt', excerpt: 'CBT studies automatic thoughts.', score: 0.1 }],
      },
    });
  });

  await page.goto('/');
  await expect(page.getByText('API healthy')).toBeVisible();
  await page.getByRole('button', { name: /index mounted folder/i }).click();
  await expect(page.getByText('Ingestion started.')).toBeVisible();
  await page.getByLabel(/question/i).fill('What is CBT?');
  await page.getByRole('button').last().click();
  await expect(page.getByText('CBT connects thoughts')).toBeVisible();
  await expect(page.getByText('cbt.txt')).toBeVisible();
});
