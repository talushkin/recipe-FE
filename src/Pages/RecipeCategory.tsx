import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import type { Category, Recipe, SiteData } from "../utils/storage";

interface RecipeCategoryProps {
  selectedRecipe: Recipe | null;
  newRecipe?: Recipe | null;
  recipes: SiteData;
  setRecipes: (recipes: SiteData) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
}

export default function RecipeCategory(props: RecipeCategoryProps) {
  const { selectedRecipe, newRecipe, recipes, setRecipes, selectedCategory, setSelectedCategory, setSelectedRecipe } = props;
  const { category } = useParams<{ category?: string }>();
  const categories = recipes.categories || [];
  const selectedCategoryData = categories.find(
    (cat: Category) => cat?.category?.toLowerCase() === category?.toLowerCase()
  ) || null;
  React.useEffect(() => {
    setSelectedCategory(selectedCategoryData);
  }, [category]);
  return <HomePage
    recipes={recipes}
    setRecipes={setRecipes}
    selectedCategory={selectedCategoryData}
    setSelectedCategory={setSelectedCategory}
    selectedRecipe={selectedRecipe}
    setSelectedRecipe={setSelectedRecipe}
    newRecipe={null}
  />;
}
