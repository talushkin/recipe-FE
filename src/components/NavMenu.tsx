import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; // ✅ Step 1
import { TPages, TCategory } from "../types/recipe"; // Adjust the import path as needed
type Tprops = {
  isOpen: boolean;      
  onSelect: (item: any) => void;
  pages: TPages; // Adjust the type as needed
  desktop?: boolean;
  reorder?: boolean;
}

export default function NavMenu(props:Tprops) {
  const { isOpen, onSelect, pages, desktop } = props;
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [reorder, setReorder] = useState(false);
  const [orderedPages, setOrderedPages] = useState<null|TPages>(pages);

  const navigate = useNavigate(); // ✅ Step 2

  useEffect(() => {
    setOrderedPages(pages);
  }, [pages]);

  const handleOrderChange = (newOrder:TPages) => {
    setOrderedPages(newOrder);
  };

  const handleSelectCategory = (item:TCategory) => {
    onSelect(item);
    setEditCategories(false);
    setReorder(false);
    
    // ✅ Step 3: Navigate to the new route
    if (item?.category) {
      const categoryEncoded = encodeURIComponent(item.category);
      navigate(`/recipes/${categoryEncoded}`);
    }
  };

  return (
    <div className={`nav ${isOpen || reorder || desktop ? "show" : "hide"}`}>
      <NavItemList
        editCategories={editCategories}
        pages={orderedPages}
        onSelect={handleSelectCategory}
        onOrderChange={handleOrderChange}
        setReorder={setReorder}
      />
<Button
        variant="contained"
        onClick={() => setEditCategories(!editCategories)}
        sx={{
          
          backgroundColor: 'black',
          "&:hover": {
            backgroundColor: 'blue',
            "& .MuiSvgIcon-root": {
              color: 'black',
            },
          },
        }}
      >{t("changeOrder")}
      </Button>
    </div>
  );
}
