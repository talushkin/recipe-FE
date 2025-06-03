import React, { useState, useEffect, CSSProperties } from "react";
import CaseCard from "./CaseCard";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import RecipeDialog from "./RecipeDialog";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import { generateImage } from "./imageAI";
import { useDispatch } from "react-redux";
import { addRecipeThunk, delRecipeThunk, updateRecipeThunk } from "../store/dataSlice";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useNavigate } from "react-router-dom";
import { TRecipe, TRecipes, TPages, TCategory } from "../types/recipe";


type TMainProps = { 

  selected: TRecipe | null;
  selectedRecipe?: TRecipe | null;
  addRecipe?: boolean;
  isDarkMode?: boolean;
};

export default function MainContent(mainProps: TMainProps) {
  const { selected, selectedRecipe, addRecipe, isDarkMode } = mainProps;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [translatedCategory, setTranslatedCategory] = useState(selected?.category);
  const itemsPerPage = 8;
  const [openView, setOpenView] = useState(selectedRecipe || false);
  const [openAdd, setOpenAdd] = useState(addRecipe || false);
  const [openFill, setOpenFill] = useState(false);
  const [viewedItem, setViewedItem] = useState(selectedRecipe || null);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    preparation: "",
  });
  const [editOrder, setEditOrder] = useState(false);

  // Assume recipes are stored in selected.itemPage
  const [recipes, setRecipes] = useState<TPages|null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setOpenView(selectedRecipe? true : false);
  }, [selectedRecipe]);



  // Translate category name
  useEffect(() => {
    const translateCategory = async () => {
      if (selected?.category && i18n.language !== "en") {
        const translated = await translateDirectly(selected.category, i18n.language);
        setTranslatedCategory(translated);
      } else {
        setTranslatedCategory(selected?.category);
      }
    };
    translateCategory();
  }, [selected?.category, i18n.language]);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );


  const handleAddRecipe = async (recipe:TRecipe) => {
console.log("Adding recipe:", recipe);
    const newRecipeData : TCategory = {

      categoryId: selected?._id,
      imageUrl: recipe?.imageUrl || "",
      category: selected?.category,
    };
    console.log("Adding recipe:", newRecipeData);
    try {
      const response = await dispatch(
        addRecipeThunk({ recipe: newRecipeData, category: selected })
      ).unwrap();
      console.log("Recipe added:", response);
      setRecipes([...recipes, newRecipeData]);
    } catch (error) {
      console.error("Error adding recipe:", error.response?.data || error.message);
    }

    setNewRecipe({ title: "", ingredients: "", preparation: "" });
    setOpenAdd(false);
    setOpenView(false);
  };

  // New function: Update existing recipe
  const handleUpdateRecipe = async (updatedRecipe) => {
    updatedRecipe._id = viewedItem._id; // Ensure we have the correct ID
    updatedRecipe.categoryId = selected?._id; // Ensure we have the correct category ID
    updatedRecipe.category = selected?.category; // Ensure we have the correct category name
    console.log("Updating recipe:", updatedRecipe);
    try {
      const response = await dispatch(updateRecipeThunk(updatedRecipe)).unwrap();
      console.log("Recipe updated:", response);
      setRecipes((prevRecipes) =>
        prevRecipes.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );
      setOpenView(false);
    } catch (error) {
      console.error("Error updating recipe:", error.response?.data || error.message);
    }
  };

  // Function to delete a recipe using Redux and update local state
  const handleDeleteRecipe = (recipe: TRecipe, id:String) => {
    if (window.confirm(t("Are you sure you want to delete this recipe? ID:" + id + " " + recipe.title))) {
      dispatch(delRecipeThunk(id))
        .unwrap()
        .then(() => {
          setRecipes((prevRecipes) =>
            prevRecipes.filter((r) => r._id !== recipe._id)
          );
        })
        .catch((err) => {
          console.error("Error deleting recipe:", err);
        });
    }
  };

  const totalItems = recipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = recipes.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

const handleSelectRecipe = (recipe) => {
  console.log("Selected recipe:", recipe);
  setViewedItem(recipe);
  setOpenView(true);
  if (recipe && selected?.category && recipe?.title) {
    const categoryEncoded = encodeURIComponent(selected?.category);
    const titleEncoded = encodeURIComponent(recipe?.title);
    navigate(`/recipes/${categoryEncoded}/${titleEncoded}`);
    console.log("Navigating to:", `/recipes/${categoryEncoded}/${titleEncoded}`);
  }
};

  return (
    <div className="main">
      <div
        className="main-title"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{  flexBasis: "100%", textAlign: "center" , color: isDarkMode ? "white" : "inherit",}}>
          {translatedCategory}
        </div>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAdd(true)}
            sx={{
              width: "400 px",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {t("addRecipe")}
          </Button>
                    <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setOpenFill(true); 
              setOpenAdd(true)
            }}
            sx={{
              width: "400 px",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            AI {t("addRecipe")}
          </Button>
          {/* <Button
            variant="outlined"
            color="secondary"
            onClick={() => setEditOrder((prev) => !prev)}
            sx={{
              flexGrow: 1,
              width: "100%",
            }}
          >
            {t("editOrder")}
          </Button> */} 
      </div>
      <p style={{ flexBasis: "100%", textAlign: "center" }}>
        {t("page")} {page}, {t("recipes")} {startIndex + 1}–{endIndex} {t("of")} {totalItems}
      </p>
      {totalPages > 1 && (
        <div className="pagination-container">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: (theme) => theme.mode === "dark" ? "white" : "inherit",
              },
            }}
          />
        </div>
      )}
(
        <div className="row d-flex justify-content-center">
          {currentItems.map((item, index) => {
            let colClass = "col-12 col-sm-8 col-md-6 col-lg-3";
            if (currentItems.length === 1) {
              colClass = "col-12";
            } else if (currentItems.length === 2) {
              colClass = "col-sm-6";
            }
            return (
              <div
                key={index}
                className={`${colClass} mb-4 d-flex justify-content-center`}
                onClick={() => handleSelectRecipe(item)}
              >
                <CaseCard index={startIndex + index + 1} item={item} category={selected?.category} isDarkMode={isDarkMode} />
              </div>
            );
          })}
        </div>
      )}
      <RecipeDialog
        open={openView}
        onClose={() => setOpenView(false)}
        type="view"
        recipe={viewedItem}
        onSave={(recipe) => {
          // If editing an existing recipe, call update; otherwise, add new.
          console.log("Saving recipe:", recipe, viewedItem?._id);
          viewedItem?._id ? handleUpdateRecipe(recipe) : handleAddRecipe(recipe);
        }}
        onDelete={(recipe: TRecipe, id:string) => {
          console.log("Deleting recipe:", recipe, id);
          handleDeleteRecipe(recipe);
        }}
        targetLang={i18n.language}
      />
      <RecipeDialog
        open={openAdd}
        autoFill={openFill}
        onClose={() => setOpenAdd(false)}
        type="add"
        recipe={newRecipe}
        categoryName={selected?.category}
        onSave={(recipe) => {
          console.log("Saving recipe:", recipe, viewedItem?._id);
          handleAddRecipe(recipe);
        }}
        targetLang={i18n.language}
      />
    </div>
  );
}
