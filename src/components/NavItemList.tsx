import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import { useDispatch } from "react-redux";
import { addCategoryThunk, reorderCategoriesThunk, delCategoryThunk } from "../store/dataSlice";
import { TCategory, TPages } from "../types/recipe";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import i18n from "../i18n";

  const isRTL = i18n.dir() === "rtl";
// A sortable item component using dnd‑kit
type TSortableProps = {
  item: TCategory;
  index: number;
  onSelect: (item: any) => void;  
  editCategories?: boolean; 
  translatedCategory?: string;
  delCategoryCallback: (id: string) => void;
};
function SortableItem(props:TSortableProps) {
  const { item, index, onSelect, editCategories, translatedCategory, delCategoryCallback } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Compute recipe count for this category
  const recipeCount = item.itemPages?.length || 0;

  // Get the image URL from the first recipe in the category, if available
  const firstRecipeImage =
    item.itemPages && item.itemPages.length > 0
      ? item.itemPages[0].imageUrl
      : "https://placehold.co/40x40?text=No+Image";

  return (
    <li
      ref={setNodeRef}
      style={style}
      dir={isRTL ? "rtl" : "ltr"}
      className="nav-item flex items-center justify-start nowrap" // added "nav-item" class
      {...attributes}
      {...listeners}
    >
      {editCategories && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (window.confirm("Delete ? `" + translatedCategory + "`")) {
                delCategoryCallback(item._id);
              }
            }}
          >
            🗑
          </button>
          ☰
        </>
      )}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelect(item);
        }}
        className="flex-1 flex items-center"
      >
        {editCategories && index + 1 + ". "}
        <img
          src={firstRecipeImage}
          alt="Category"
          style={{
            width: "40px",
            height: "40px",
            marginRight: "0.5rem",
            marginLeft: "0.5rem",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        {translatedCategory || item.category}{" "}
        <span
          className="text-gray-500 ml-2"
        >
          ({recipeCount})
        </span>
      </a>

    </li>
  );
}
type TProps = {
  pages: TPages;
  onSelect: (item: any) => void;
  editCategories?: boolean;
  onOrderChange?: (newOrder: any[]) => void;
  setReorder?: (value: boolean) => void;
};

export default function NavItemList(props:TProps) {
  const { pages, onSelect, editCategories, onOrderChange, setReorder } = props;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Initialize items with a unique _id and default priority 
  const initializeItems = ():TPages =>
    pages.map((item, index) => ({
      ...item,
      _id: item._id || (Date.now() + Math.random()).toString(),
      priority: item.priority !== undefined ? item.priority : index + 1,
    }));

  const [items, setItems] = useState<TPages>(initializeItems());
  const [translatedCategories, setTranslatedCategories] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [newCat, setNewCat] = useState(false);

  // Sync items with pages when pages change
  useEffect(() => {
    setItems(initializeItems());
  }, [pages]);

  // Translate category names
  useEffect(() => {
    const translateCategories = async () => {
      if (pages.length === 0) return;
      const translations = await Promise.all(
        pages.map((item) => translateDirectly(item.category, i18n.language))
      );
      setTranslatedCategories(translations);
    };
    translateCategories();
  }, [pages, i18n.language]);

  const handleAddItem = () => {
    setNewCat(false);
    if (inputValue.trim() === "") return;
    const newItem:TCategory = {
      _id: (Date.now() + Math.random()).toString(),
      category: inputValue.trim(),
      createdAt: dayjs().format("DD-MM-YYYY"),
      itemPages: [],
      priority: items.length + 1,
    };
    // Dispatch redux thunk to add category instead of calling storage directly
    dispatch(addCategoryThunk(inputValue.trim()));
    setItems([...items, newItem]);
    setInputValue("");
  };

  // Callback when drag ends: update order, set new priorities, persist via redux
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag ended", active, over);
    if (!over) return; // No item was dropped
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      let newItems = arrayMove(items, oldIndex, newIndex);
      // Update each item's priority based on its new index
      newItems = newItems.map((item, idx) => ({ ...item, priority: idx + 1 }));
      console.log("Moved items", newItems);
      setItems(newItems);
      dispatch(reorderCategoriesThunk(newItems));
      // Notify parent if needed
      onOrderChange && onOrderChange(newItems);
     setReorder&& setReorder(true);
    }
  };

  // Callback to delete an item from state using redux thunk
  const handleDelCategory = (id: string) => {
    const categoryToDelete = items.find((i) => i._id === id)?.category || "";
    dispatch(delCategoryThunk({ categoryId: id, categoryName: categoryToDelete }));
    setItems((prevItems) => prevItems.filter((i) => i._id !== id));
  };

  // Sort items by priority before rendering
  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);

  return (
    <>
      <DndContext sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedItems.map((item) => item._id)} strategy={verticalListSortingStrategy}>
          {sortedItems.map((item, index) => (
            <SortableItem
              key={item._id}
              item={item}
              index={index}
              onSelect={onSelect}
              editCategories={editCategories}
              translatedCategory={translatedCategories[index]}
              delCategoryCallback={handleDelCategory}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!newCat && (
        <div className="nav-item flex items-center justify-start" >
          <a href="#" onClick={() => setNewCat(true)}>
            + {t("addCategory")}
          </a>
        </div>
      )}
      {newCat && (
        <input
          type="text"
          placeholder={t("addCategory")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddItem();
            }
          }}
          className="mt-2 p-2 border rounded w-full"
        />
      )}
    </>
  );
}
