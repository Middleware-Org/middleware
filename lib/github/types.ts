/* **************************************************
 * Types
 ************************************************** */
export type GitHubFile = {
  name: string;
  path: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
};

/* **************************************************
 * Article Types
 ************************************************** */
export type Article = {
  slug: string;
  title: string;
  date: string;
  last_update: string;
  author: string;
  category: string;
  issue: string;
  in_evidence: boolean;
  published: boolean;
  excerpt: string;
  content: string;
  audio?: string;
  audio_chunks?: string;
  podcast?: string;
};

export type CreateArticleDto = Omit<Article, "slug" | "last_update">;
export type UpdateArticleDto = Partial<CreateArticleDto>;

/* **************************************************
 * Issue Types
 ************************************************** */
export type Issue = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  color: string;
  date: string;
  last_update: string;
  published: boolean;
};

export type CreateIssueDto = Omit<Issue, "slug" | "last_update">;
export type UpdateIssueDto = Partial<CreateIssueDto>;

/* **************************************************
 * Category Types
 ************************************************** */
export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type CreateCategoryDto = Omit<Category, "slug">;
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

/* **************************************************
 * Author Types
 ************************************************** */
export type Author = {
  slug: string;
  name: string;
  description: string;
};

export type CreateAuthorDto = Omit<Author, "slug">;
export type UpdateAuthorDto = Partial<CreateAuthorDto>;

/* **************************************************
 * Page Types
 ************************************************** */
export type Page = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
};

export type CreatePageDto = Omit<Page, "slug">;
export type UpdatePageDto = Partial<CreatePageDto>;

/* **************************************************
 * Podcast Types
 ************************************************** */
export type Podcast = {
  slug: string;
  title: string;
  description: string;
  date: string;
  last_update: string;
  audio: string;
  audio_chunks: string;
  cover?: string;
  published: boolean;
};

export type CreatePodcastDto = Omit<Podcast, "slug" | "last_update">;
export type UpdatePodcastDto = Partial<CreatePodcastDto>;

/* **************************************************
 * User Types (Database)
 ************************************************** */
export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserDto = Pick<User, "email" | "name" | "image">;
export type UpdateUserDto = Partial<CreateUserDto>;

/* **************************************************
 * Media Types
 ************************************************** */
export type Media = {
  url: string;
  pathname: string;
  contentType: string;
  uploadedAt: Date;
};

/* **************************************************
 * Action Response Types
 ************************************************** */
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
