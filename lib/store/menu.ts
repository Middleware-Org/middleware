/* **************************************************
 * Imports
 **************************************************/
import { create } from "zustand";

/* **************************************************
 * Types
 **************************************************/
type MenuState = {
  isOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
};

/* **************************************************
 * Store
 **************************************************/
export const useMenu = create<MenuState>((set) => ({
  isOpen: false,
  toggleMenu: () => set((state) => ({ isOpen: !state.isOpen })),
  closeMenu: () => set({ isOpen: false }),
}));

