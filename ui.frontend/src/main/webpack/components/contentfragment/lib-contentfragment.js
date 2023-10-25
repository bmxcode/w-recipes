"use strict";

/**
 * Replace things that look like content fragment image references with img elements
 * @param {Element} [element] Element containing content fragment fields
 */
export function decorateImages(element) {
    const cfElSelector = '.cmp-contentfragment__element';
    const valueSelector = '.cmp-contentfragment__element-value';

    // Adjust the DOM, in this case injecting an img node and settings its source to the content fragment's picture URL
    const cfEls = element.querySelectorAll(cfElSelector);
    cfEls.forEach((cfEl) => {
        const cfValueEl = cfEl.querySelector(valueSelector);
        const cfValue = cfValueEl.innerHTML.trim();
        if (cfValue && cfValue.indexOf('/content/dam') === 0 && cfValue.indexOf(' ') === -1) {
            const pictureEl = document.createElement("img");

            pictureEl.setAttribute("class", "cmp-contentfragment__image");
            pictureEl.setAttribute("src", cfValue);

            cfValueEl.replaceChildren(pictureEl);
        }
    });
}
