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

export type Article = {
  id: string;
  slug: string;
  title: string;
  date: string;
  last_update: string;
  authorId: string;
  categoryId: string;
  issueId?: string;
  in_evidence: boolean;
  published: boolean;
  excerpt: string;
  content: string;
  podcastId?: string;
  createdBy: string;
};

export type Issue = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  color: string;
  date: string;
  last_update: string;
  published: boolean;
  articlesOrder: string[];
  showOrder: boolean;
  createdBy: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdBy: string;
};

export type Author = {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdBy: string;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  createdBy: string;
};

export type Podcast = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  last_update: string;
  audio: string;
  audio_chunks: string;
  issueId?: string;
  published: boolean;
  createdBy: string;
};
