import "../styles.css";
import React, { useState, useEffect } from "react";

interface HomePageProps {

}

export default function Hooks(props: HomePageProps) {
  const { setSelectedRecipe, selectedRecipe, newRecipe, recipes, selectedCategory, setSelectedCategory } = props;
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { i18n } = useTranslation() as { i18n: I18nType };
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [desktop, setDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

  const toggleDarkMode = (): void => {
    setIsDarkMode((prev) => !prev);
  };

  const handleHamburgerClick = (): void => {
    if (desktop) {
      setMenuOpen(true);
      return;
    }
  }

    return (<></>)
}

