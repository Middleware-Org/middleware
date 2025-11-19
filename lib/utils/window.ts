export const scrollToTop = () => {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const scrollToElement = (elementId: string, offset: number = 100) => {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    });
  }
};

export const scrollToElementInContainer = (
  elementId: string,
  containerSelector: string,
  offset: number = 100,
) => {
  const element = document.getElementById(elementId);
  const container = document.querySelector(containerSelector);

  if (element && container) {
    const elementPosition = element.offsetTop - offset;
    container.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    });
  }
};
