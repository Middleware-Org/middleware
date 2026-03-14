import sanitizeHtml, { type IOptions } from "sanitize-html";

const baseAllowedTags = [
  "p",
  "br",
  "hr",
  "div",
  "span",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "blockquote",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const richHtmlOptions: IOptions = {
  allowedTags: baseAllowedTags,
  allowedAttributes: {
    "*": ["class", "id"],
    a: ["href", "name", "target", "rel", "class", "id", "style"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding", "class", "id"],
    span: ["class", "id", "data-citation-id", "data-citation-text"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel", "data"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  allowedStyles: {
    a: {
      "font-size": [/^\d+(\.\d+)?em$/],
      "vertical-align": [/^super|sub$/],
      "text-decoration": [/^none|underline$/],
    },
  },
  transformTags: {
    a: (tagName, attribs) => {
      const nextAttribs = { ...attribs };
      if (nextAttribs.target === "_blank") {
        nextAttribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs: nextAttribs };
    },
  },
};

const inlineHtmlOptions: IOptions = {
  allowedTags: ["a", "strong", "em", "b", "i", "u", "s", "code", "br", "span"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (tagName, attribs) => {
      const nextAttribs = { ...attribs };
      if (nextAttribs.target === "_blank") {
        nextAttribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs: nextAttribs };
    },
  },
};

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, richHtmlOptions);
}

export function sanitizeInlineHtml(html: string): string {
  return sanitizeHtml(html, inlineHtmlOptions);
}
