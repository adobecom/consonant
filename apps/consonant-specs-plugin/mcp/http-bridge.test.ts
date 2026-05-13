import { describe, it, expect, vi } from 'vitest';

// We test the handler function in isolation — not the full server
async function handleBridgeRequest(
  body: { method: string; params: Record<string, unknown>; timeout?: number },
  sendCommand: (method: string, params: Record<string, unknown>, timeout?: number) => Promise<unknown>
): Promise<{ result: unknown } | { error: string }> {
  try {
    const result = await sendCommand(body.method, body.params, body.timeout);
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

describe('HTTP bridge handler', () => {
  it('returns { result } on success', async () => {
    const mockSendCommand = vi.fn().mockResolvedValueOnce({ ok: true });
    const result = await handleBridgeRequest({ method: 'figma_get_status', params: {} }, mockSendCommand);
    expect(result).toEqual({ result: { ok: true } });
  });

  it('returns { error } when sendCommand throws', async () => {
    const mockSendCommand = vi.fn().mockRejectedValueOnce(new Error('Plugin disconnected'));
    const result = await handleBridgeRequest({ method: 'figma_execute', params: {} }, mockSendCommand);
    expect(result).toEqual({ error: 'Plugin disconnected' });
  });
});
