import adminIt from "@/i18n/locales/it/admin.json";

const base = adminIt.error;

export const adminErrorCopy = {
  title: base.title,
  genericHeading: base.genericHeading,
  retry: base.retry,
  back: base.back,
  backToDashboard: base.backToDashboard,
  pages: {
    articles: "Errore nella pagina articoli",
    authors: "Errore nella pagina autori",
    categories: "Errore nella pagina categorie",
    issues: base.issuesPage,
    media: base.mediaPage,
    podcasts: "Errore nella pagina podcast",
    users: base.usersPage,
  },
} as const;
