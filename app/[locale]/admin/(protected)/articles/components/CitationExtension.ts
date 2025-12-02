/* **************************************************
 * Imports
 **************************************************/
import { Node, mergeAttributes } from "@tiptap/core";

/* **************************************************
 * Citation Extension
 **************************************************/
export const Citation = Node.create({
  name: "citation",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "inline",

  inline: true,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      citationId: {
        default: null,
        parseHTML: (element) => {
          const id = element.getAttribute("data-citation-id");
          return id || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.citationId) {
            return {};
          }
          return {
            "data-citation-id": String(attributes.citationId),
          };
        },
      },
      citationText: {
        default: null,
        parseHTML: (element) => {
          const text = element.getAttribute("data-citation-text");
          return text || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.citationText) {
            return {};
          }
          return {
            "data-citation-text": String(attributes.citationText),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-citation-id]",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const citationId = node?.attrs?.citationId || HTMLAttributes?.citationId || "?";
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class:
          "citation inline-flex items-center justify-center min-w-[1.5em] h-[1.5em] px-1 mx-1 text-xs font-semibold bg-tertiary/20 text-tertiary border border-tertiary rounded cursor-pointer hover:bg-tertiary/30",
        "data-citation-id": citationId,
        "data-citation-text": node?.attrs?.citationText || HTMLAttributes?.citationText || "",
      }),
      `[${citationId}]`,
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("span");
      dom.className =
        "citation inline-flex items-center justify-center min-w-[1.5em] h-[1.5em] px-1 mx-1 text-xs font-semibold bg-tertiary/20 text-tertiary border border-tertiary rounded cursor-pointer hover:bg-tertiary/30";
      dom.setAttribute("data-citation-id", node.attrs.citationId || "");
      dom.setAttribute("data-citation-text", node.attrs.citationText || "");
      dom.contentEditable = "false";

      const updateIndex = () => {
        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (pos !== undefined && pos !== null) {
          // Conta tutte le citazioni prima di questa posizione
          let index = 0;
          editor.state.doc.descendants((n, nodePos) => {
            if (n.type.name === "citation" && nodePos < pos) {
              index++;
            }
          });
          dom.textContent = `[${index + 1}]`;
        } else {
          dom.textContent = `[${node.attrs.citationId || "?"}]`;
        }
      };

      // Calcola l'indice iniziale
      updateIndex();

      // Aggiorna l'indice quando il documento cambia
      const updateHandler = () => {
        updateIndex();
      };

      editor.on("update", updateHandler);
      editor.on("selectionUpdate", updateHandler);

      return {
        dom,
        contentDOM: null,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }
          dom.setAttribute("data-citation-id", updatedNode.attrs.citationId || "");
          dom.setAttribute("data-citation-text", updatedNode.attrs.citationText || "");
          updateIndex();
          return true;
        },
        destroy: () => {
          editor.off("update", updateHandler);
          editor.off("selectionUpdate", updateHandler);
        },
      };
    };
  },
});
