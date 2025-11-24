/* **************************************************
 * Git Operation Events
 *
 * Utility functions to emit events when Git operations succeed.
 * The MergeButton component listens to these events to refresh the merge status.
 **************************************************/

/**
 * Emit an event when a Git operation succeeds
 * This triggers the MergeButton to check for new changes
 */
export function emitGitOperationSuccess() {
  // Dispatch a custom event that MergeButton listens to
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("git-operation-success"));
  }
}
