import React, { useEffect, useState } from "react";
import i18n from "./i18n.js";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom"; // <-- add useParams
import RecipeCategory from "./Pages/RecipeCategory.jsx";
import RecipeDetail from "./Pages/RecipeDetail";
import AddRecipe from "./Pages/AddRecipe";
import HomePage from "./Pages/HomePage";
import "./styles.css";
import { CircularProgress, Box } from "@mui/material"; // Add this import

// Import Redux Provider and store
import { Provider } from "react-redux";
import * as storage from "./utils/storage"; // adjust path if needed
import store from "./store/store.js"

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

function App() {
  const [recipes, setRecipes] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const navigate = useNavigate();
  const params = useParams(); // <-- get params

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      const data = await storage.loadData(false);
      setRecipes(data);

      // Check if category or recipe name exists in URL
      const categoryParam = params.category;
      const titleParam = params.title;

      if (data?.site?.pages && data.site.pages.length > 0) {
        let initialCategory = data.site.pages[0];
        if (categoryParam) {
          const foundCat = data.site.pages.find(
            (cat) => encodeURIComponent(cat.category) === categoryParam
          );
          if (foundCat) initialCategory = foundCat;
        }
        setSelectedCategory(initialCategory);

        // If recipe title exists in URL, find and set it
        if (titleParam && initialCategory.itemPage) {
          const foundRecipe = initialCategory.itemPage.find(
            (rec) => encodeURIComponent(rec.title) === titleParam
          );
          if (foundRecipe) setSelectedRecipe(foundRecipe);
        }
      }

      setLoading(false); // Stop loading
    };
    fetchData();
  }, [params.category, params.title]);

  useEffect(() => {
    //console.log("recipes", recipes);
  }, [recipes]);

  useEffect(() => {
    document.body.dir = i18n.language === "he" || i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Add this effect to navigate to the recipe URL when selectedRecipe changes
  useEffect(() => {
    console.log("selectedRecipe changed:", selectedRecipe);
    if (selectedRecipe && selectedRecipe.title && selectedRecipe.category) {
      navigate(
        `/recipes/${encodeURIComponent(selectedRecipe.category)}/${encodeURIComponent(selectedRecipe.title)}`
      );
    }
  }, [selectedRecipe, navigate]);

  return (
    <>
      {loading && (
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 2000,
            background: "#fffce8",
          }}
        >
          <CircularProgress size={64} />
        </Box>
      )}
      {!loading && recipes && (
        <Routes>
          <Route path="/"
            element={<HomePage
              recipes={recipes}
              setRecipes={setRecipes}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />} />
          <Route path="/recipes/:category"
            element={<RecipeCategory
              recipes={recipes}
              setRecipes={setRecipes}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />} />
          <Route path="/recipes/:category/:title"
            element={<RecipeDetail
              recipes={recipes}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              setSelected={setSelected}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
            />} />
          <Route path="/recipes/:category/add"
            element={<AddRecipe
              recipes={recipes}
              setRecipes={setRecipes}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
            />} />
        </Routes>
      )}
    </>
  )
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <App />
        </Router>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);
