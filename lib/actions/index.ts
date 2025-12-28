/* **************************************************
 * Actions - Export centralizzato
 *
 * Tutte le server actions dell'applicazione sono esportate da qui
 * per facilitare l'import nei componenti e negli hook.
 ************************************************** */

export {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
  deleteArticlesAction,
  publishArticleAction,
  unpublishArticleAction,
} from "./article.actions";

export {
  createAuthorAction,
  updateAuthorAction,
  deleteAuthorAction,
  deleteAuthorsAction,
} from "./author.actions";

export {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  deleteCategoriesAction,
} from "./category.actions";

export {
  createIssueAction,
  updateIssueAction,
  deleteIssueAction,
  deleteIssuesAction,
  publishIssueAction,
  unpublishIssueAction,
} from "./issue.actions";

export {
  createPageAction,
  updatePageAction,
  deletePageAction,
  deletePagesAction,
} from "./page.actions";

export {
  createPodcastAction,
  updatePodcastAction,
  deletePodcastAction,
  deletePodcastsAction,
  publishPodcastAction,
  unpublishPodcastAction,
} from "./podcast.actions";

export {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  deleteUsersAction,
} from "./user.actions";
