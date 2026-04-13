import { html } from 'lit';

export function TestProto1({ label = 'TestProto1' } = {}) {
  return html`<div class="test-proto-1">${label}</div>`;
}
