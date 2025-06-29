import "../styles.css";
import React, { useState, useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import NavMenu from "../components/NavMenu";
import MainContent from "../components/MainContent";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../components/themes";
import GlobalStyle from "../components/GlobalStyle";
import { useNavigate } from "react-router-dom";
import FooterBar from "../components/FooterBar";
import type { Category, Recipe, SiteData } from "../utils/storage";

interface HomePageProps {
  setSelectedRecipe: (recipe: Recipe | null) => void;
  selectedRecipe: Recipe | null;
  newRecipe?: Recipe | null;
  recipes: SiteData;
  setRecipes: (recipes: SiteData) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
}

export default function Main(props: HomePageProps) {
  const { setSelectedRecipe, selectedRecipe, newRecipe, recipes, setRecipes, selectedCategory, setSelectedCategory } = props;
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [desktop, setDesktop] = useState<boolean>(window.innerWidth > 768); // Check if desktop
  const navigate = useNavigate();

  // Add toggleDarkMode function
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Define the handleHamburgerClick function
  const handleHamburgerClick = () => {
    console.log("Hamburger clicked", desktop);
    console.log("menuOpen", menuOpen);
    if (desktop) {
      setMenuOpen(true); // Always open on desktop
      return;
    }
    setMenuOpen((prevMenuOpen) => !prevMenuOpen); // Toggle the menu state
    if (!menuOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top when opening
      console.log("Should show the menu", menuOpen);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.innerWidth > 768); // Update desktop state based on window width
    };
    handleResize(); // Initial check on mount
    window.addEventListener("resize", handleResize); // Add event listener for window resize
  }, [window.innerWidth]);

  // Helper to detect mobile
  const isMobile = !desktop;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle />

        <div className="TOP">
          <HeaderBar
            desktop={desktop}
            logo={recipes.header?.logo}
            onHamburgerClick={handleHamburgerClick}
            categories={recipes.categories}
            isDarkMode={isDarkMode}
            setSelectedCategory={setSelectedCategory}
            setSelectedRecipe={setSelectedRecipe}
            selectedRecipe={selectedRecipe}
            newRecipe={newRecipe}
          />
        </div>
        <div className="container-fluid ps-0 pe-0">
          <div className="flex-column flex-md-row ps-0 pe-0 row">
            <div
              className="nav-menu col-12 col-md-auto ps-0 pe-0"
              style={{ width: desktop ? '270px' : '100%' }}
            >
              <NavMenu
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                categories={recipes.categories}
                isOpen={menuOpen}
                onSelect={setSelectedCategory}
                desktop={desktop}
                language={i18n.language}
                onHamburgerClick={handleHamburgerClick}
              />
            </div>

            <div className="main-content col">
              {selectedCategory && (
                <MainContent
                  selectedCategory={selectedCategory}
                  selectedRecipe={selectedRecipe}
                  addRecipe={newRecipe}
                  desktop={desktop}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          </div>
        </div>
        {/* Sticky FooterBar only on mobile */}
        {isMobile && (
          <FooterBar
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            language={i18n.language}
            i18n={i18n}
          />
        )}
      </div>
    </ThemeProvider>
  );
}