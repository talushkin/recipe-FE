import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import type { Category, Recipe, SiteData } from "../utils/storage";

interface RecipeDetailProps {
  selectedRecipe: Recipe | null;
  newRecipe?: boolean;
  recipes: SiteData;
  setRecipes: (recipes: SiteData) => void;
  setSelectedCategory: (cat: Category | null) => void;
  selectedCategory: Category | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
}

export default function RecipeDetail(props: RecipeDetailProps) {
  const { selectedRecipe, newRecipe, recipes, setRecipes, setSelectedCategory, selectedCategory, setSelectedRecipe } = props;
  const { category, title } = useParams<{ category?: string; title?: string }>();
  const categories = recipes.categories || [];
  const selectedCategoryData = categories.find(
    (cat: Category) => cat?.category?.toLowerCase() === category?.toLowerCase()
  ) || null;
  const selectedRecipeData = selectedCategoryData?.itemPage.find(
    (recipe: Recipe) => recipe?.title?.toLowerCase() === title?.toLowerCase()
  ) || null;
  React.useEffect(() => {
    setSelectedCategory(selectedCategoryData);
    setSelectedRecipe(selectedRecipeData);
  }, [category, title]);
  return (
    <HomePage
      selectedCategory={selectedCategoryData}
      setSelectedCategory={setSelectedCategory}
      selectedRecipe={selectedRecipeData}
      setSelectedRecipe={setSelectedRecipe}
      newRecipe={null}
      recipes={recipes}
      setRecipes={setRecipes}
    />
  );
}
