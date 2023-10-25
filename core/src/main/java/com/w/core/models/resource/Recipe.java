package com.w.core.models.resource;

import lombok.AccessLevel;
import lombok.Getter;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.List;

import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.sling.models.annotations.DefaultInjectionStrategy.OPTIONAL;

@Getter
@Model(
        adaptables = Resource.class,
        defaultInjectionStrategy = OPTIONAL
)
public class Recipe {

    @Getter(AccessLevel.NONE)
    @SlingObject
    private Resource currentResource;

    //

    @Inject
    @Named("jcr:content/root/container/container/recipe/jcr:title")
    @Default(values = EMPTY)
    private String title;

    @Inject
    @Named("jcr:content/root/container/container/recipe/fileReference")
    @Default(values = EMPTY)
    private String image;

    @Inject
    @Named("jcr:content/root/container/container/recipe/prep")
    @Default(values = EMPTY)
    private String prepTime;

    @Inject
    @Named("jcr:content/root/container/container/recipe/cook")
    @Default(values = EMPTY)
    private String cookTime;

    @Inject
    @Named("jcr:content/root/container/container/recipe/serves")
    @Default(values = EMPTY)
    private String serves;

    @Inject
    @Named("jcr:content/root/container/container/recipe/difficulty")
    @Default(values = EMPTY)
    private String difficulty;

    @Getter(AccessLevel.NONE)
    @Inject
    @ChildResource(name = "jcr:content/root/container/container/recipe/ingredients")
    private final List<RecipeIngredient> ingredients = new ArrayList<>();

    @Inject
    @Named("jcr:content/root/container/container/recipe/method")
    @Default(values = EMPTY)
    private String method;

    @Inject
    @Named("jcr:content/root/container/container/recipe/categories")
    private final List<String> categories = new ArrayList<>();

    //
    ////
    //

    public String getName() {
        return currentResource.getName();
    }

    public List<String> getIngredients() {
        List<String> ingredientsList = new ArrayList<>();
        ingredients.forEach(ingredient -> ingredientsList.add(ingredient.getIngredient()));
        return ingredientsList;
    }

}
