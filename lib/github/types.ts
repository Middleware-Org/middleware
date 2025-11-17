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
  author: string;
  category: string;
  issue: string;
  in_evidence: boolean;
  excerpt: string;
  content: string;
};

export type Issue = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  color: string;
  date: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  order?: number;
};

export type Author = {
  slug: string;
  name: string;
  description: string;
};

