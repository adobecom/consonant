/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
* Icon Block - v0.0.1
*/

import { decorateButtons, decorateIcons, decorateTextDaa, decorateBlockDaa, decorateBlockBg } from "../../scripts/decorate.js";

function decorateContent(el, styles) {
    if (el) {
        const text = el.querySelector('h1, h2, h3, h4, h5, h6')?.closest('div');
        text?.classList.add('text');
        const headings = text?.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const heading = headings?.[headings.length - 1];
        heading?.classList.add(styles[1]);
        heading?.nextElementSibling.classList.add(styles[2]);
        heading?.previousElementSibling?.classList.add(styles[0]);
        el.querySelector(':scope > div:not([class])')?.classList.add('image');
        decorateTextDaa(text, heading);
    }
}

export default function init(el) {
    decorateBlockDaa(el);
    const children = el.querySelectorAll(':scope > div');
    if (children.length > 1) {
        if (children[0].childNodes.length) decorateBlockBg(el, children[0]);

        const container = document.createElement('div');
        container.classList.add('foreground', 'container');
        el.appendChild(container);

        const blocks = el.querySelectorAll(':scope > div:not([class])');
        const headingClass = el.classList.contains('vertical') ? 'heading-S' : 'heading-XL';
        const contentClasses = ['icon-area', headingClass, 'body-M'];

        [...blocks].forEach(block => {
            decorateContent(block, contentClasses);
            decorateButtons(block);
            container.insertAdjacentElement('beforeEnd', block.children[0]);
            block.remove();
        });
        decorateIcons(el, false);
    }
}