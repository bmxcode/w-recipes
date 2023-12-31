"use strict";
import {decorateImages} from './lib-contentfragment';

(function() {

    const processedFlag = 'data-cmp-recipe-processed';
    const recipeCfSelector = '.cmp-contentfragment[data-cmp-contentfragment-model="w-recipes/models/recipes"]'
                                + ':not([' + processedFlag + '="true"])';
    const methodElSelector = '.cmp-contentfragment__element.cmp-contentfragment__element--method';
    const cfElValueSelector = '.cmp-contentfragment__element-value';
    const headingsSelector = 'h1,h2,h3,h4,h5,h6';
    const elSelectPrefix = '.cmp-contentfragment__element--';

    function createStepContainer(methodContainer, stepNo) {
        const stepContainer = document.createElement('div');
        stepContainer.classList.add('cmp-contentfragment__recipe-method-container__step');
        const stepHeading = document.createElement('h2');
        stepHeading.classList.add('cmp-contentfragment__recipe-method-container__step--heading');
        stepHeading.insertAdjacentText('afterbegin', 'Step ' + stepNo);
        stepContainer.append(stepHeading);
        const stepMethod = document.createElement('div');
        stepMethod.classList.add('cmp-contentfragment__recipe-method-container__step--method');
        stepContainer.append(stepMethod);
        methodContainer.append(stepContainer);
        return stepContainer;
    }

    function decorateMethod(element) {
        const methodEl = element.querySelector(methodElSelector);
        const methodElValue = methodEl.querySelector(cfElValueSelector);

        const methodContainer = document.createElement('div');
        methodContainer.classList.add('cmp-contentfragment__recipe-method-container');

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

        const headings = methodElValue.querySelectorAll('.cmp-contentfragment__recipe-method-container__step--heading');
        headings.forEach((heading) => {
            heading.insertAdjacentText('beforeend', ' of ' + headings.length);
        });
    }

    function decorateLayout(element) {
        const mainImage = element.querySelector('.cmp-contentfragment__element--mainImage');

        const summaryContainer = document.createElement('div');
        summaryContainer.classList.add('cmp-contentfragment__recipe-summary-container');
        const detailsContainer = document.createElement('div');
        detailsContainer.classList.add('cmp-contentfragment__recipe-details-container');

        mainImage.after(summaryContainer);
        summaryContainer.after(detailsContainer);

        const summaryItems = element.querySelectorAll(elSelectPrefix + 'prep, ' + elSelectPrefix +  'cook, ' 
                                                        + elSelectPrefix + 'serves, ' + elSelectPrefix + 'difficulty');
        [...summaryItems].forEach((item) => {
            summaryContainer.append(item);
        });

        const detailsItems = element.querySelectorAll(elSelectPrefix + 'ingredients, ' + elSelectPrefix + 'method, ' 
                                                        + elSelectPrefix + 'categories');
        [...detailsItems].forEach((item) => {
            detailsContainer.append(item);
        });
    }

    function decorateCategories(element) {
        const categoriesContainer = document.createElement('div');
        categoriesContainer.classList.add('cmp-contentfragment__recipe-categories-container');

        const categoryItems = [...element.childNodes];
        categoryItems.forEach((item) => {
            if (item.nodeType !== 3) {
                // Not a text node
                return;
            }

            const parts = item.nodeValue.trim().split('/');
            if (parts.length < 3) {
                // Invalid category
                return;
            }

            const category = parts[parts.length - 1];
            const categoryEl = document.createElement('div');
            categoryEl.classList.add('cmp-contentfragment__recipe-category');
            categoryEl.innerText = category;
            categoriesContainer.append(categoryEl);
        });

        element.replaceChildren(categoriesContainer);
    }

    function applyComponentStyles(responsiveGridEl) {
        responsiveGridEl.querySelectorAll(recipeCfSelector).forEach(function (cf) {
            // Mark the content fragment as processed, since we don't want to apply the JS adjustments multiple times
            cf.setAttribute(processedFlag, true);
            cf.classList.add('cmp-contentfragment__recipe');
            // Adjust the DOM
            decorateImages(cf);
            decorateMethod(cf);
            decorateLayout(cf);
            decorateCategories(cf.querySelector('.cmp-contentfragment__element--categories ' + cfElValueSelector));
        });
    }

    // Since mutation observers can only watch a single node (and not a node list), we'll register a mutation observer
    // for each responsive grid on the page, as we are no sure which responsive grid a recipe content fragment might 
    // be added to.
    document.querySelectorAll('.responsivegrid').forEach(function(responsiveGridEl) {
        // Initialize the component styles on page load
        applyComponentStyles(responsiveGridEl);

        // Attach a mutation observer to handle drag and drop in page editor and the styling/authoring of components
        // This is only required in the context of authoring, and could be split out to only execute in the context of
        // the Page Editor.
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
