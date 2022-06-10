/* eslint-disable no-unused-expressions */
/* global describe it */

import init from '../../../blocks/aside/aside.js';
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { cleanVariations } from '../../../scripts/scripts.js';

const mock = await readFile({ path: './aside.mock.html' });
document.body.innerHTML = mock;
cleanVariations(document.body);

const types = ["simple", "split"];

describe('aside', () => {
    const asides = document.querySelectorAll('.aside');
    asides.forEach((aside) => {
        init(aside);

        const typeIndex = types.findIndex(v => aside.classList.contains(v));
        const type = typeIndex >= 0 ? types[typeIndex] : "default";

        describe(`aside ${type}`, () => {
            it('has a heading', () => {
                const heading = aside.querySelector('.heading-XL');
                expect(heading).to.exist;
            })

            it('has a body', () => {
                const body = aside.querySelector('.body-S');
                expect(body).to.exist;
            })

            if (type === "default") {
                it('has an image', () => {
                    const image = aside.querySelector('.image');
                    expect(image).to.exist;
                })
            }

            if (type === types[1]) {
                it('has a background image', () => {
                    const body = aside.querySelector('.background');
                    expect(body).to.exist;
                })
            }

        });
    });
});
