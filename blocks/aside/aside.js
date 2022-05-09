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
* Aside - v0.0.1
*/

import { decorateBackground, decorateButtons, decorateContent, decorateIcons } from "../../scripts/decorate.js";

function decorateLayout(elems) {
    const foreground = elems[elems.length - 1];
    foreground.classList.add('foreground', 'container');
    if (elems.length > 1) decorateBackground(elems[0]);
    return foreground;
}

export default function init(el) {
    const children = el.querySelectorAll(':scope > div');
    const content = decorateLayout(children);
    const contentClasses = ['detail-M', 'heading-XL', 'body-S'];
    decorateContent(content, contentClasses);
    decorateButtons(content);
    decorateIcons(el, false);
}
