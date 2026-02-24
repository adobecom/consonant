import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../../../packages/components/src/product-lockup/index.js';
import '../../../../packages/components/src/button-v2/index.js';

const meta: Meta = {
  title: 'Generated/Text Styles and v2 Button Components',
  id: 'text-styles-and-v2-button-components-7b6912e3',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <style>
      .file-tree {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #1e1e1e;
        color: #cccccc;
        padding: 0;
        font-size: 13px;
        line-height: 22px;
        user-select: none;
        width: 100%;
        max-width: 317px;
      }

      .file-tree-item {
        display: flex;
        align-items: center;
        padding: 0 8px;
        height: 22px;
        cursor: pointer;
        white-space: nowrap;
      }

      .file-tree-item:hover {
        background-color: #2a2d2e;
      }

      .file-tree-item.active {
        background-color: #37373d;
      }

      .file-tree-item.folder {
        font-weight: 400;
      }

      .file-tree-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-right: 4px;
        flex-shrink: 0;
      }

      .file-tree-icon::before {
        content: '▶';
        font-size: 9px;
        color: #cccccc;
      }

      .file-tree-icon.expanded::before {
        content: '▼';
      }

      .file-tree-icon.file::before {
        content: '';
      }

      .file-tree-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-tree-label.js-file {
        color: #f0db4f;
      }

      .file-tree-label.json-file {
        color: #cbcb41;
      }

      .file-tree-label.md-file {
        color: #519aba;
      }

      .file-tree-label.folder-name {
        color: #cccccc;
      }

      .file-tree-label.folder-name.special {
        color: #89d185;
      }

      .indent-0 { padding-left: 8px; }
      .indent-1 { padding-left: 24px; }
      .indent-2 { padding-left: 40px; }
    </style>

    <div class="file-tree">
      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon expanded"></span>
        <span class="file-tree-label folder-name">node_modules</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon expanded"></span>
        <span class="file-tree-label folder-name">packages</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon expanded"></span>
        <span class="file-tree-label folder-name">components</span>
      </div>

      <div class="file-tree-item folder indent-0 active">
        <span class="file-tree-icon expanded"></span>
        <span class="file-tree-label folder-name">src</span>
      </div>

      <div class="file-tree-item folder indent-1">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">button</span>
      </div>

      <div class="file-tree-item folder indent-1">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">button-v2</span>
      </div>

      <div class="file-tree-item folder indent-1">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">fonts</span>
      </div>

      <div class="file-tree-item folder indent-1">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">hero-marquee</span>
      </div>

      <div class="file-tree-item folder indent-1">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">marquee</span>
      </div>

      <div class="file-tree-item folder indent-1">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name special">product-lockup</span>
      </div>

      <div class="file-tree-item indent-1">
        <span class="file-tree-icon file"></span>
        <span class="file-tree-label js-file">index.js</span>
      </div>

      <div class="file-tree-item indent-0">
        <span class="file-tree-icon file"></span>
        <span class="file-tree-label json-file">package.json</span>
      </div>

      <div class="file-tree-item indent-0">
        <span class="file-tree-icon file"></span>
        <span class="file-tree-label json-file">project.json</span>
      </div>

      <div class="file-tree-item indent-0">
        <span class="file-tree-icon file"></span>
        <span class="file-tree-label md-file">README.md</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">tokens</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">legacy</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">scripts</span>
      </div>
    </div>
  `,
};

export const Collapsed: Story = {
  render: () => html`
    <style>
      .file-tree {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #1e1e1e;
        color: #cccccc;
        padding: 0;
        font-size: 13px;
        line-height: 22px;
        user-select: none;
        width: 100%;
        max-width: 317px;
      }

      .file-tree-item {
        display: flex;
        align-items: center;
        padding: 0 8px;
        height: 22px;
        cursor: pointer;
        white-space: nowrap;
      }

      .file-tree-item:hover {
        background-color: #2a2d2e;
      }

      .file-tree-item.folder {
        font-weight: 400;
      }

      .file-tree-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-right: 4px;
        flex-shrink: 0;
      }

      .file-tree-icon::before {
        content: '▶';
        font-size: 9px;
        color: #cccccc;
      }

      .file-tree-icon.file::before {
        content: '';
      }

      .file-tree-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-tree-label.folder-name {
        color: #cccccc;
      }

      .indent-0 { padding-left: 8px; }
    </style>

    <div class="file-tree">
      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">node_modules</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">packages</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">tokens</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">legacy</span>
      </div>

      <div class="file-tree-item folder indent-0">
        <span class="file-tree-icon"></span>
        <span class="file-tree-label folder-name">scripts</span>
      </div>
    </div>
  `,
};