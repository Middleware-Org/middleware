/* **************************************************
 * Imports
 **************************************************/
import { create } from "zustand";

/* **************************************************
 * Types
 **************************************************/
type CategoriesListState = {
  isOpen: boolean;
  toggleOpen: () => void;
  closeOpen: () => void;
};

/* **************************************************
 * Store
 **************************************************/
export const useCategoriesList = create<CategoriesListState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  closeOpen: () => set({ isOpen: false }),
}));
