package com.w.core.models.resource;

import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;

import javax.inject.Inject;
import javax.inject.Named;

import static org.apache.sling.models.annotations.DefaultInjectionStrategy.OPTIONAL;

@Getter
@Model(
        adaptables = Resource.class,
        defaultInjectionStrategy = OPTIONAL
)
public class RecipeIngredient {

    @Inject
    @Named("ingredient")
    @Default(values = StringUtils.EMPTY)
    private String ingredient;

}
