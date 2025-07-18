import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import RecipeDialog from "./RecipeDialog";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
// import { generateImage } from "./imageAI"; // unused
import { useDispatch } from "react-redux";
import { addRecipeThunk, delRecipeThunk, updateRecipeThunk } from "../store/dataSlice";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import type { Category, Recipe } from "../utils/storage";
import type { AppDispatch } from "../store/store";

// --- Types ---
interface MainContentProps {
  selectedCategory: Category;
  selectedRecipe: Recipe | null;
  addRecipe: any;
  desktop: boolean;
  isDarkMode: boolean;
}

// Removed unused SortableRecipe component

const MainContent: React.FC<MainContentProps> = ({
  selectedCategory,
  selectedRecipe,
  addRecipe,
  desktop,
  isDarkMode,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [page, setPage] = useState<number>(1);
  const [translatedCategory, setTranslatedCategory] = useState<string>(selectedCategory?.translatedCategory?.[0] || selectedCategory?.category);
  const itemsPerPage = 8;
  const [openView, setOpenView] = useState<boolean>(!!selectedRecipe);
  const [openAdd, setOpenAdd] = useState<boolean>(!!addRecipe);
  const [openFill, setOpenFill] = useState<boolean>(false);
  const [viewedItem, setViewedItem] = useState<Recipe>(selectedRecipe || { title: "", ingredients: "", preparation: "" });
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    preparation: "",
  });
  // Removed unused: setEditOrder
  // Remove all usage of editOrder
  const [rowJustify, setRowJustify] = useState<string>(
    window.innerWidth <= 770
      ? "center"
      : (i18n.dir && i18n.dir() === "rtl")
      ? "flex-end"
      : "flex-start"
  );
  const [recipes, setRecipes] = useState<Recipe[]>(selectedCategory?.itemPage || []);
  const navigate = useNavigate();

  useEffect(() => {
    setOpenView(!!selectedRecipe);
    setViewedItem(selectedRecipe || { title: "", ingredients: "", preparation: "" });
  }, [selectedRecipe, setOpenView, setViewedItem]);

  useEffect(() => {
    const itemPage = selectedCategory?.itemPage || [];
    const translated = selectedCategory?.translatedCategory?.[0] || selectedCategory?.category;
    setRecipes(itemPage);
    setTranslatedCategory(translated);
  }, [selectedCategory, setRecipes, setTranslatedCategory]);

  // Translate category name
  useEffect(() => {
    const category = selectedCategory?.category;
    const translatedArr = selectedCategory?.translatedCategory;
    const lang = i18n.language;
    const translateCategory = async () => {
      if (category && lang !== "en") {
        if (Array.isArray(translatedArr) && translatedArr.length > 0) {
          setTranslatedCategory(translatedArr[0]);
          return;
        }
        const translated = await translateDirectly(category, lang);
        setTranslatedCategory(translated);
      } else {
        setTranslatedCategory(category);
      }
    };
    translateCategory();
  }, [selectedCategory, i18n, setTranslatedCategory]);

// Removed unused sensors and handleRecipeDragEnd

  const handleAddRecipe = async (recipe: Recipe) => {
    let newRecipeData: Recipe = {
      title: recipe?.title,
      ingredients: recipe?.ingredients,
      preparation: recipe?.preparation,
      categoryId: selectedCategory?._id,
      imageUrl: recipe?.imageUrl || "",
      category: selectedCategory?.category,
    };
    if (i18n.language !== "en") {
      try {
        const [titleEn, ingredientsEn, preparationEn] = await Promise.all([
          translateDirectly(newRecipeData.title, "en"),
          translateDirectly(newRecipeData.ingredients, "en"),
          translateDirectly(newRecipeData.preparation, "en"),
        ]);
        newRecipeData = {
          ...newRecipeData,
          title: titleEn,
          ingredients: ingredientsEn,
          preparation: preparationEn,
        };
      } catch (e) {}
    }
    try {
      await dispatch(addRecipeThunk({ recipe: newRecipeData, category: selectedCategory }) as any).unwrap();
      setRecipes([...recipes, newRecipeData]);
    } catch (error: any) {
      console.error("Error adding recipe:", error.response?.data || error.message);
    }
    setNewRecipe({ title: "", ingredients: "", preparation: "" });
    setOpenAdd(false);
    setOpenView(false);
  };

  const handleUpdateRecipe = async (updatedRecipe: Recipe) => {
    updatedRecipe._id = viewedItem?._id;
    updatedRecipe.categoryId = selectedCategory?._id;
    updatedRecipe.category = selectedCategory?.category;
    try {
      await dispatch(updateRecipeThunk(updatedRecipe) as any).unwrap();
      setRecipes((prevRecipes) =>
        prevRecipes.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );
      setOpenView(false);
    } catch (error: any) {
      console.error("Error updating recipe:", error.response?.data || error.message);
    }
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    if (!recipe._id) return;
    if (window.confirm(t("Are you sure you want to delete this recipe? ID:" + recipe._id + " " + recipe.title))) {
      dispatch(delRecipeThunk(recipe._id) as any)
        .unwrap()
        .then(() => {
          setRecipes((prevRecipes) =>
            prevRecipes.filter((r) => r._id !== recipe._id)
          );
        })
        .catch((err: any) => {
          console.error("Error deleting recipe:", err);
        });
    }
  };

  const totalItems = recipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = recipes.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setViewedItem(recipe);
    setOpenView(true);
    if (recipe && selectedCategory?.category && recipe?.title) {
      const categoryEncoded = encodeURIComponent(selectedCategory?.category);
      const titleEncoded = encodeURIComponent(recipe?.title);
      navigate(`/recipes/${categoryEncoded}/${titleEncoded}`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setRowJustify(
        window.innerWidth <= 770
          ? "center"
          : (i18n.dir && i18n.dir() === "rtl")
          ? "flex-end"
          : "flex-start"
      );
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [i18n]);

  const handleCloseDialog = () => {
    setOpenView(false);
    setOpenAdd(false);
    if (selectedCategory?.category) {
      const categoryEncoded = encodeURIComponent(selectedCategory.category);
      navigate(`/recipes/${categoryEncoded}`);
    }
  };
  return (
    <div className="main">
      <>
        <div
          className="main-title"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              flexBasis: "100%",
              textAlign: "center",
              color: isDarkMode ? "white" : "inherit",
              fontSize:
                translatedCategory && translatedCategory.length > 24
                  ? "1.2rem"
                  : "2rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100vw",
              lineHeight: translatedCategory && translatedCategory.length > 24
                  ? "1.2rem"
                  : "2rem",
                  marginTop: "1rem",
            }}
            title={translatedCategory}
          >
            {translatedCategory}
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              width: "100%",
              maxWidth: "800px",
              margin: "0 auto"
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenAdd(true)}
              sx={{
                minWidth: "56px",
                minHeight: "56px",
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 0,
                fontWeight: "bold",
                fontSize: "0.85rem",
                gap: "0.25rem",
                backgroundColor: "darkgreen",
                "&:hover": {
                  backgroundColor: "#145214",
                },
              }}
              title={t("addRecipe")}
            >
              <AddIcon sx={{ fontSize: 28 }} />
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setOpenFill(true);
                setOpenAdd(true);
              }}
              sx={{
                minWidth: "56px",
                minHeight: "56px",
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 0,
                fontWeight: "bold",
                fontSize: "0.85rem",
                gap: "0.25rem",
                backgroundColor: "darkgreen",
                "&:hover": {
                  backgroundColor: "#145214",
                },
              }}
              title={`AI ${t("addRecipe")}`}
            >
              <AddIcon sx={{ fontSize: 20, mr: 0.5 }} />
              <SmartToyIcon sx={{ fontSize: 24 }} />
            </Button>
          </div>
        </div>
        <p style={{ flexBasis: "100%", textAlign: "center" }}>
          {t("page")} {page}, {t("recipes")} {startIndex + 1}–{endIndex} {t("of")} {totalItems}
        </p>
        {totalPages > 1 && (
          <div className="pagination-container" style={{ direction: i18n.dir && i18n.dir() === "rtl" ? "rtl" : "ltr" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: (theme) => (isDarkMode ? "white" : "inherit"),
                  direction: i18n.dir && i18n.dir() === "rtl" ? "ltr" : "ltr",
                },
                "& .Mui-selected": {
                  backgroundColor: isDarkMode ? "#fff" : "",
                  color: isDarkMode ? "#222" : "",
                },
              }}
              dir={i18n.dir && i18n.dir() === "rtl" ? "ltr" : "ltr"}
            />
          </div>
        )}
        <div
          className="row d-flex"
          style={{
            justifyContent: rowJustify,
          }}
        >
          {currentItems.map((item, index) => {
            let colClass = "col-12 col-sm-8 col-md-6 col-lg-3";
            return (
              <div
                key={index}
                className={`${colClass} mb-4 d-flex`}
                style={{
                  justifyContent: rowJustify,
                }}
                onClick={() => handleSelectRecipe(item)}
              >
                <CaseCard
                  index={startIndex + index + 1}
                  item={item}
                  category={selectedCategory?.category}
                  isDarkMode={isDarkMode}
                />
              </div>
            );
          })}
        </div>
        <RecipeDialog
          open={openView}
          onClose={handleCloseDialog}
          type="view"
          recipe={viewedItem}
          onSave={(recipe: Recipe) => {
            viewedItem?._id ? handleUpdateRecipe(recipe) : handleAddRecipe(recipe);
          }}
          onDelete={(recipe: Recipe) => {
            handleDeleteRecipe(recipe);
          }}

          targetLang={i18n.language}
        />
        <RecipeDialog
          open={openAdd}
          autoFill={openFill}
          onClose={handleCloseDialog}
          type="add"
          recipe={newRecipe}
          categoryName={selectedCategory?.category}
          onSave={(recipe: Recipe) => {
            handleAddRecipe(recipe);
          }}
          targetLang={i18n.language}
        />
      </>
    </div>
  );
};

export default MainContent;
