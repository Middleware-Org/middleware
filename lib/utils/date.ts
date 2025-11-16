export const formatDateByLang = (date: string, lang: "it", isMobile?: boolean) => {
  if (isMobile) {
    switch (lang) {
      case "it":
        return new Date(date).toLocaleDateString("it-IT", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      default:
        return new Date(date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
    }
  }
  switch (lang) {
    case "it":
      return new Date(date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    default:
      return new Date(date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  }
};
