export type TRecipe = {
  _id?: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  ingredients: string[];
  preparation: string;
  imageUrl?: string;
  prepareTimeMinutes?: number;
  createdAt?: string; 
  updatedAt?: string;

}

export type TCategory = {
  _id: string;
  category?: string;    
  categoryName?: string;
  itemPages: TItemPage[];
  imageUrl?: string;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}
export type TRecipes = {
  site: {
    pages: TRecipe[];
  }
};

export type TItemPage = {
  _id: string;
  title: string;    
  ingredients: string;
  preparation: string;
  imageUrl?: string;
  createdAt?: string;
}



export type TPages = TCategory[]
