"use strict";
import {decorateImages} from "./lib-contentfragment";

(function() {

    const processedFlag = 'data-cmp-recipe-processed';
    const recipeCfSelector = '.cmp-contentfragment[data-cmp-contentfragment-model="w-recipes/models/recipes"]:not([' + processedFlag + '="true"])';

    const contributorSelector = ".cmp-contentfragment--contributor " +
        ".cmp-contentfragment[data-cmp-contentfragment-model=\"wknd/models/contributor\"]:not([data-cmp-contributor-processed='true'])";

    const pictureSelector = ".cmp-contentfragment__element--pictureReference " +
        ".cmp-contentfragment__element-value";

    function applyComponentStyles(responsiveGridEl) {
        responsiveGridEl.querySelectorAll(recipeCfSelector).forEach(function (cf) {
            // Mark the content fragment as processed, since we don't want to accidentally apply the JS adjustments multiple times
            cf.setAttribute(processedFlag, true);
            // Adjust the DOM
            decorateImages(cf);
        });
    }

    // Since mutation observers can only watch a single node (and not a node list), we'll register a mutation observer for each responsive grid
    // on the page, as we are no sure which responsive grid a contributor-style content fragment might be added to.
    document.querySelectorAll(".responsivegrid").forEach(function(responsiveGridEl) {
        // Initialize the component styles on page load
        applyComponentStyles(responsiveGridEl);

        // Attach a mutation observer to handle drag and drop in page editor and the styling/authoring of components
        // This is only required in the context of authoring, and could be split out to only execute in the context of the Page Editor.
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === "childList") {
                    applyComponentStyles(responsiveGridEl);
                }
            });
        });

        // Observe changes to nodes under each responsive grid on the page
        observer.observe(responsiveGridEl,
            { attributes: false, childList: true, characterData: false, subtree: true });
    });
})();