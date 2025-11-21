/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import styles from "./styles";
import { useIssuesList } from "@/lib/store/issuesList";

/* **************************************************
 * MobileIssuesToggle Component
 **************************************************/
export default function MobileIssuesToggle() {
  const { isOpen, toggleOpen } = useIssuesList();

  const buttonText = isOpen ? "Chiudi" : "Mostra Uscite";
  const buttonVariant = isOpen ? "secondary" : "primary";
  const buttonTextClass = isOpen ? styles.buttonTextClosed : styles.buttonTextOpen;

  return (
    <Button onClick={toggleOpen} variants={buttonVariant}>
      <MonoTextLight className={buttonTextClass}>{buttonText}</MonoTextLight>
    </Button>
  );
}
