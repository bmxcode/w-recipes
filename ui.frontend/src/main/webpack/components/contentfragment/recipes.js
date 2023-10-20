"use strict";
import {decorateImages} from './lib-contentfragment';

(function() {

    const processedFlag = 'data-cmp-recipe-processed';
    const recipeCfSelector = '.cmp-contentfragment[data-cmp-contentfragment-model="w-recipes/models/recipes"]:not([' + processedFlag + '="true"])';
    const methodElSelector = '.cmp-contentfragment__element.cmp-contentfragment__element--method';
    const cfElTitleSelector = '.cmp-contentfragment__element-title'
    const cfElValueSelector = '.cmp-contentfragment__element-value'
    const headingsSelector = 'h1,h2,h3,h4,h5,h6';

    function createStepContainer(methodContainer, stepNo) {
        const stepContainer = document.createElement('div');
        stepContainer.classList.add('cmp-contentfragment__recipe-method-container__step');
        const stepHeading = document.createElement('h2');
        stepHeading.classList.add('cmp-contentfragment__recipe-method-container__step--heading');
        stepHeading.insertAdjacentText('afterbegin', 'Step ' + stepNo);
        stepContainer.append(stepHeading);
        const stepMethod = document.createElement('div');
        stepMethod.classList.add('cmp-contentfragment__recipe-method-container__step--method')
        stepContainer.append(stepMethod);
        methodContainer.append(stepContainer);
        return stepContainer;
    }

    function decorateMethod(element) {
        const methodEl = element.querySelector(methodElSelector);
        const methodElValue = methodEl.querySelector(cfElValueSelector);

        const methodContainer = document.createElement('div');
        methodContainer.classList.add('cmp-contentfragment__recipe-method-container')

        let stepNo = 1;
        let stepContainer = createStepContainer(methodContainer, stepNo++);
        let stepMethod = stepContainer.querySelector('.cmp-contentfragment__recipe-method-container__step--method');

        const methodContent = [...methodElValue.children];
        for (let i = 0; i < methodContent.length; i++) {
            let child = methodContent[i];
            if (!child.matches(headingsSelector)) {
                stepMethod.append(child);
            } else if (stepMethod.children.length !== 0) {
                // Previous step method is not empty. Increment to next step
                stepContainer = createStepContainer(methodContainer, stepNo++);
                stepMethod = stepContainer.querySelector('.cmp-contentfragment__recipe-method-container__step--method');
            }
        }

        methodElValue.replaceChildren(methodContainer);

        const stepHeadings = methodElValue.querySelectorAll('.cmp-contentfragment__recipe-method-container__step--heading');
        stepHeadings.forEach((heading) => {
            heading.insertAdjacentText('beforeend', ' of ' + stepHeadings.length);
        });
    }

    function applyComponentStyles(responsiveGridEl) {
        responsiveGridEl.querySelectorAll(recipeCfSelector).forEach(function (cf) {
            // Mark the content fragment as processed, since we don't want to accidentally apply the JS adjustments multiple times
            cf.setAttribute(processedFlag, true);
            // Adjust the DOM
            decorateImages(cf);
            decorateMethod(cf);
        });
    }

    // Since mutation observers can only watch a single node (and not a node list), we'll register a mutation observer for each responsive grid
    // on the page, as we are no sure which responsive grid a recipe content fragment might be added to.
    document.querySelectorAll('.responsivegrid').forEach(function(responsiveGridEl) {
        // Initialize the component styles on page load
        applyComponentStyles(responsiveGridEl);

        // Attach a mutation observer to handle drag and drop in page editor and the styling/authoring of components
        // This is only required in the context of authoring, and could be split out to only execute in the context of the Page Editor.
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    applyComponentStyles(responsiveGridEl);
                }
            });
        });

        // Observe changes to nodes under each responsive grid on the page
        observer.observe(responsiveGridEl,
            { attributes: false, childList: true, characterData: false, subtree: true });
    });
})();