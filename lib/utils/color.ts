export function lightenColor(hex: string, amount: number = 0.9): string {
  const normalizeHex = hex.replace("#", "");

  const num = parseInt(normalizeHex, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const lighten = (channel: number) => Math.round(channel + (255 - channel) * amount);

  const newR = lighten(r);
  const newG = lighten(g);
  const newB = lighten(b);

  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

export function getTextColor(hexBackground: string) {
  hexBackground = hexBackground.replace("#", "");

  if (hexBackground.length === 3) {
    hexBackground = hexBackground
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(hexBackground.substr(0, 2), 16);
  const g = parseInt(hexBackground.substr(2, 2), 16);
  const b = parseInt(hexBackground.substr(4, 2), 16);

  const [R, G, B] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  return luminance > 0.179
    ? {
        textColor: "text-black",
        backgroundColor: "bg-black",
        borderColor: "border-black",
        color: "#000000",
      }
    : {
        textColor: "text-white",
        backgroundColor: "bg-white",
        borderColor: "border-white",
        color: "#fff7f4",
      };
}
