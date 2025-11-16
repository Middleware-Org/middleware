import { ReactNode } from "react";

export type TypographyProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};
