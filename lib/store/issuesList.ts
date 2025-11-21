/* **************************************************
 * Imports
 **************************************************/
import { create } from "zustand";

/* **************************************************
 * Types
 **************************************************/
type IssuesListState = {
  isOpen: boolean;
  toggleOpen: () => void;
  closeOpen: () => void;
};

/* **************************************************
 * Store
 **************************************************/
export const useIssuesList = create<IssuesListState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  closeOpen: () => set({ isOpen: false }),
}));

