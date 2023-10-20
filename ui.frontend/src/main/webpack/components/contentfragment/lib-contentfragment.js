"use strict";

/**
 * Replace things that look like content fragment image references with img elements
 * @param {Element} [element] Element containing content fragment fields
 */
export function decorateImages(element) {
    console.log("Decorate called", element);
    const cfElSelector = '.cmp-contentfragment__element';
    const valueSelector = '.cmp-contentfragment__element-value';

    // Adjust the DOM, in this case injecting an img node and settings its source to the the content fragment's picture URL
    let cfEls = element.querySelectorAll(cfElSelector);
    cfEls.forEach((cfEl) => {
        console.log("Processing", cfEl);
        let cfValueEl = cfEl.querySelector(valueSelector);
        let cfValue = cfValueEl.innerHTML.trim();
        if (cfValue && cfValue.indexOf('/content/dam') === 0 && cfValue.indexOf(' ') === -1) {
            var pictureEl = document.createElement("img");

            pictureEl.setAttribute("class", "cmp-contentfragment__image");
            pictureEl.setAttribute("src", cfValue);

            cfValueEl.replaceChildren(pictureEl);
            console.log("Replaced value", cfEl);
        }
    });
}