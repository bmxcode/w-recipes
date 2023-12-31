package com.w.core.workflows;

import com.adobe.cq.dam.cfm.ContentElement;
import com.adobe.cq.dam.cfm.ContentFragment;
import com.adobe.cq.dam.cfm.ContentFragmentException;
import com.adobe.cq.dam.cfm.FragmentData;
import com.adobe.cq.dam.cfm.FragmentTemplate;
import com.adobe.granite.workflow.WorkflowException;
import com.adobe.granite.workflow.WorkflowSession;
import com.adobe.granite.workflow.exec.WorkItem;
import com.adobe.granite.workflow.exec.WorkflowProcess;
import com.adobe.granite.workflow.metadata.MetaDataMap;
import com.w.core.models.resource.Recipe;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.osgi.service.component.annotations.Component;

@Slf4j
@Component(
        service = WorkflowProcess.class,
        property = {
                "process.label=Convert Recipe Page to CF"
        })
public class ConvertRecipePageToCFProcess implements WorkflowProcess {

    //

    public static final String PROCESS_ARGS = "PROCESS_ARGS";
    private static final String ARG_CF_PATH = "cf_path";

    private static final String CF_TEMPLATE_MODEL = "/conf/w-recipes/settings/dam/cfm/models/recipes";

    //

    @Override
    public void execute(WorkItem workItem, WorkflowSession workflowSession, MetaDataMap args) throws WorkflowException {

        // get the payload path
        String payloadPath = workItem.getWorkflowData().getPayload().toString();

        // get & validate the CF path
        String cfRootPath = this.getProcessArgumentValueByName(args, ARG_CF_PATH);
        if (StringUtils.isEmpty(cfRootPath)) {
            throw new WorkflowException("No root path configured");
        }

        // get the resource resolver
        ResourceResolver rr = workflowSession.adaptTo(ResourceResolver.class);
        if (rr == null) {
            throw new WorkflowException("Could not instantiate a Resource Resolver");
        }

        // get the payload resource
        Resource recipePageResource = rr.getResource(payloadPath);
        if (recipePageResource == null) {
            throw new WorkflowException("Invalid workflow payload path: " + payloadPath);
        }

        // adapt the payload resource to a recipe
        Recipe recipe = recipePageResource.adaptTo(Recipe.class);
        if (recipe == null) {
            throw new WorkflowException("Could not adapt payload [" + payloadPath + "] to Recipe");
        }

        ContentFragment contentFragment = createRecipeContentFragment(rr, cfRootPath, recipe);

        // add each element
        this.addFragmentDataToCF(contentFragment, "title", recipe.getTitle());
        this.addFragmentDataToCF(contentFragment, "mainImage", recipe.getImage());
        this.addFragmentDataToCF(contentFragment, "prep", recipe.getPrepTime());
        this.addFragmentDataToCF(contentFragment, "cook", recipe.getCookTime());
        this.addFragmentDataToCF(contentFragment, "serves", recipe.getServes());
        this.addFragmentDataToCF(contentFragment, "difficulty", recipe.getDifficulty());
        this.addFragmentDataToCF(contentFragment, "ingredients", recipe.getIngredients().toArray(String[]::new));
        this.addFragmentDataToCF(contentFragment, "method", recipe.getMethod());
        this.addFragmentDataToCF(contentFragment, "categories", recipe.getCategories().toArray(String[]::new));

    }


    /**
     * Adds the Data (Object) to the Recipe Content Fragment Element for the Element Name.
     *
     * @param contentFragment the Recipe Content Fragment
     * @param elementName     the element name to update
     * @param value           the value to add to the element name.
     * @throws WorkflowException if there are issues when adding data to the element.
     */
    private void addFragmentDataToCF(ContentFragment contentFragment, String elementName, Object value) throws WorkflowException {
        try {
            // get the content element
            ContentElement element = contentFragment.getElement(elementName);

            // get the fragment data
            FragmentData fragmentData = element.getValue();

            // set the fragment data back to the element
            fragmentData.setValue(value);
            element.setValue(fragmentData);

        } catch (ContentFragmentException e) {
            throw new WorkflowException("Unable to add [" + value + "] to element [" + elementName + "]", e);
        }
    }

    /**
     * Creates a Recipe Content Fragment from a Recipe Page.
     *
     * @param rr         the resource resolver
     * @param cfRootPath the content fragment parent folder path
     * @param recipe     the Recipe that will be created to a content fragment shell.
     * @return a content fragment named after the Recipe
     * @throws WorkflowException for all null checks and issues creating a content fragment.
     */
    private ContentFragment createRecipeContentFragment(ResourceResolver rr, String cfRootPath, Recipe recipe)
            throws WorkflowException {

        // get the cf parent folder resource
        Resource cfParentFolderResource = rr.getResource(cfRootPath);
        if (cfParentFolderResource == null) {
            throw new WorkflowException("Invalid CF parent folder path: " + cfRootPath);
        }

        // get the resource for the fragment template model
        Resource fragmentTemplateModelResource = rr.getResource(CF_TEMPLATE_MODEL);
        if (fragmentTemplateModelResource == null) {
            throw new WorkflowException("Invalidate Fragment Template Model at path: " + CF_TEMPLATE_MODEL);
        }

        // get the fragment template from the fragment template model
        FragmentTemplate fragmentTemplate = fragmentTemplateModelResource.adaptTo(FragmentTemplate.class);
        if (fragmentTemplate == null) {
            throw new WorkflowException("Could not adapt Resource to Fragment Template: " + CF_TEMPLATE_MODEL);
        }

        // create and return the new content fragment
        try {
            return fragmentTemplate.createFragment(cfParentFolderResource, recipe.getName(), recipe.getTitle());
        } catch (ContentFragmentException e) {
            throw new WorkflowException("Error creating content fragment", e);
        }
    }


    /**
     * Retrieves a Process Argument value by the name that is provided. The process Argument format is<br/>
     * `argumentName=value(|argumentName=value...)`
     *
     * @param metaDataMap  the Workflow MetaData Map
     * @param argumentName the Name of the defined argument.
     * @return a String value defined for the Argument Name
     */
    private String getProcessArgumentValueByName(MetaDataMap metaDataMap, String argumentName) {
        // get the arguments as a string
        String processArguments = metaDataMap.get(PROCESS_ARGS, String.class);

        if (StringUtils.isNotBlank(processArguments)) {
            // split each variable
            String[] arguments = StringUtils.split(processArguments, "|");

            // loop and extract
            for (String argument : arguments) {
                if (argument.startsWith(argumentName + "=")) {
                    return StringUtils.substringAfterLast(argument, "=");
                }
            }
        }
        return StringUtils.EMPTY;
    }

}
