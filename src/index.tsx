import React, { useEffect, useState } from "react";
import i18n from "./i18n.js";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import ReactDOM, { Container } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecipeCategory from "./Pages/RecipeCategory";
import RecipeDetail from "./Pages/RecipeDetail";
import AddRecipe from "./Pages/AddRecipe";
import HomePage from "./Pages/HomePage";
import "./styles.css";

// Import Redux Provider and store
import { Provider } from "react-redux";
import * as storage from "./utils/storage"; // adjust path if needed
import store from "./store/store"
import { TRecipe, TRecipes } from "./types/recipe"; // Adjust the import path as needed

const rootElement = document.getElementById("root") as Container;
const root = ReactDOM.createRoot(rootElement);


function App() {
  const [recipes, setRecipes] = useState<null | TRecipes>(null); // Initialize recipes as null
  const [selected, setSelected] = useState<null | TRecipe>(null); // Initialize selected as null

  useEffect(() => {
    const fetchData = async () => {
      const data = await storage.loadData() as TRecipes; // Load data from storage
      setRecipes(data);
      if (!selected) {
        setSelected(data?.site?.pages[0]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("recipes", recipes);
  }, [recipes]);

  useEffect(() => {
    document.body.dir = i18n.language === "he" || i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <>
      {recipes && (
        <Routes>
          <Route path="/"
            element={<HomePage
              recipes={recipes}
              setRecipes={setRecipes}
              selected={selected}
              setSelected={setSelected}
            />} />
          <Route path="/recipes/:category"
            element={<RecipeCategory
              recipes={recipes}
              setRecipes={setRecipes}
              selected={selected}
              setSelected={setSelected}
            />} />
          <Route path="/recipes/:category/:title"
            element={<RecipeDetail
              recipes={recipes}
              setRecipes={setRecipes}
              selected={selected}
              setSelected={setSelected}
            />} />
          <Route path="/recipes/:category/add"
            element={<AddRecipe
              recipes={recipes}
              setRecipes={setRecipes}
              selected={selected}
              setSelected={setSelected}
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
