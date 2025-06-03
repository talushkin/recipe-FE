import "../styles.css";
import React, { useState, useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import NavMenu from "../components/NavMenu";
import MainContent from "../components/MainContent";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../components/themes";
import GlobalStyle from "../components/GlobalStyle";
import { TRecipe, TRecipes } from "../types/recipe"; // Adjust the import path as needed
import * as store from "../utils/storage"; // adjust path if needed
type Tprops = {
  selectedRecipe?: TRecipe,
  newRecipe?:boolean,            
  recipes: TRecipes | null; // Recipes can be null initially,
  setRecipes: React.Dispatch<React.SetStateAction<TRecipes | null>>
  selected: TRecipe | null; // Selected can also be null initially,
  setSelected:  React.Dispatch<React.SetStateAction<TRecipe | null>>,
};

export default function Main(props:Tprops) {
  const { recipes, setRecipes, selected, setSelected, selectedRecipe, newRecipe } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [desktop, setDesktop] = useState(window.innerWidth > 768); // Check if desktop

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

  console.log({recipesFromHome: recipes});

  if (!recipes) return null; // Wait until recipes are loaded
  if (!recipes?.site?.pages) return null;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle />

        <div className="TOP">
          <HeaderBar
            desktop={desktop}
            toggleDarkMode={() => setIsDarkMode((prev) => !prev)}
            logo={"https://vt-photos.s3.amazonaws.com/recipe-app-icon-generated-image.png"}
            onHamburgerClick={handleHamburgerClick} // Pass the function here
            pages={recipes?.site?.pages}
            isDarkMode={isDarkMode}
          />
        </div>
        <div className="container-fluid ps-0 pe-0">
          <div className="flex-column flex-md-row ps-0 pe-0 row">
            <div
              className="nav-menu col-12 col-md-auto ps-0 pe-0"
              style={{ width: desktop ? '400px' : '100%' }}
            >
              <NavMenu
                pages={recipes?.site?.pages}
                isOpen={menuOpen || desktop}
                onSelect={(item:TRecipe) => {
                  console.log("Selected item:", item);
                  setSelected(item);
                  if (!desktop) setMenuOpen(false);
                }}
                editCategories={false}
                data={recipes}
                desktop={desktop}
                language={i18n.language}
              />
            </div>

            <div className="main-content col">
              {selected && (
                <MainContent
                  selected={selected}
                  selectedRecipe={selectedRecipe}
                  addRecipe={newRecipe}
                  data={recipes}
                  desktop={desktop}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          </div>
        </div>


      </div>
    </ThemeProvider>
  );
}