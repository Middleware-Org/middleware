/* **************************************************
 * Imports
 **************************************************/
import { create } from "zustand";

/* **************************************************
 * Types
 **************************************************/
type AuthorsListState = {
  isOpen: boolean;
  toggleOpen: () => void;
  closeOpen: () => void;
};

/* **************************************************
 * Store
 **************************************************/
export const useAuthorsList = create<AuthorsListState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  closeOpen: () => set({ isOpen: false }),
}));

