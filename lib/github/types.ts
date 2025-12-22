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
  podcast?: string;
};

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

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Author = {
  slug: string;
  name: string;
  description: string;
};

export type Page = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
};

export type Podcast = {
  slug: string;
  title: string;
  description: string;
  audio: string;
  audio_chunks: string;
  duration?: number;
  published: boolean;
  date: string;
};
