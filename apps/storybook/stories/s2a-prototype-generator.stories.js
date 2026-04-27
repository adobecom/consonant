import { html } from 'lit';

export default {
  title: 'S2A/Prototype Generator',
  tags: ['!test', '!autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
    backgrounds: { disable: true },
    controls: { disable: true },
    actions: { disable: true },
  },
};

export const Generator = {
  name: 'Generator',
  render: () => html`
    <iframe
      src="http://localhost:4002"
      style="width:100%;height:100vh;border:none;display:block"
      title="S2A Prototype Generator"
    ></iframe>
  `,
};
