"use client";

/* **************************************************
 * Imports
 **************************************************/
import { RefreshCw, Eye, EyeOff } from "lucide-react";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils/classes";

import styles from "./PasswordInputStyles";
import { adminFormCopy } from "../../components/adminFormCopy";

/* **************************************************
 * Types
 **************************************************/
type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

/* **************************************************
 * Password Strength Calculator
 **************************************************/
function calculatePasswordStrength(password: string): {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
} {
  if (!password) {
    return { strength: "weak", score: 0, feedback: [] };
  }

  let score = 0;
  const feedback: string[] = [];

  // Lunghezza
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Almeno 8 caratteri");
  }

  // Maiuscole
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Aggiungi lettere maiuscole");
  }

  // Minuscole
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Aggiungi lettere minuscole");
  }

  // Numeri
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Aggiungi numeri");
  }

  // Caratteri speciali
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Aggiungi caratteri speciali");
  }

  // Varietà (non tutti caratteri uguali)
  if (new Set(password).size >= 6) {
    score += 1;
  }

  let strength: PasswordStrength;
  if (score >= 6) {
    strength = "very-strong";
  } else if (score >= 4) {
    strength = "strong";
  } else if (score >= 2) {
    strength = "medium";
  } else {
    strength = "weak";
  }

  return { strength, score, feedback };
}

/* **************************************************
 * Password Generator
 **************************************************/
function generateSecurePassword(): string {
  const length = 16;
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*"; // Solo caratteri speciali comuni e semplici

  // Pool principale: lettere e numeri (80% del totale)
  const mainChars = uppercase + lowercase + numbers;
  // Pool secondario: caratteri speciali (20% del totale)
  const specialChars = special;

  function randomIndex(max: number): number {
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    return randomArray[0] % max;
  }

  function pick(source: string): string {
    return source[randomIndex(source.length)];
  }

  let password = "";

  // Assicurati che la password contenga almeno un carattere di ogni tipo
  password += pick(uppercase);
  password += pick(lowercase);
  password += pick(numbers);
  password += pick(special);

  // Riempi il resto: 80% lettere/numeri, 20% caratteri speciali
  const remainingLength = length - password.length;
  const specialCount = Math.floor(remainingLength * 0.2); // 20% caratteri speciali
  const mainCount = remainingLength - specialCount; // Resto lettere/numeri

  for (let i = 0; i < mainCount; i++) {
    password += pick(mainChars);
  }

  for (let i = 0; i < specialCount; i++) {
    password += pick(specialChars);
  }

  // Mescola la password (Fisher-Yates)
  const chars = password.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

/* **************************************************
 * Password Input Component
 **************************************************/
export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  className,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const strengthData = calculatePasswordStrength(value);
  const isStrongEnough =
    strengthData.strength === "strong" || strengthData.strength === "very-strong";

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateSecurePassword();
    onChange(newPassword);
  }, [onChange]);

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-blue-500",
    "very-strong": "bg-green-500",
  };

  const strengthLabels = {
    weak: adminFormCopy.userPassword.weak,
    medium: adminFormCopy.userPassword.medium,
    strong: adminFormCopy.userPassword.strong,
    "very-strong": adminFormCopy.userPassword.veryStrong,
  };

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.inputWrapper}>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={cn(
            styles.input,
            !isStrongEnough && value.length > 0 ? styles.inputError : undefined,
          )}
          autoComplete="new-password"
        />
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleGeneratePassword}
            className={styles.generateButton}
            title={adminFormCopy.userPassword.generateSecure}
            aria-label={adminFormCopy.userPassword.generateSecure}
          >
            <RefreshCw className={styles.generateIcon} />
          </button>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.toggleButton}
            title={
              showPassword
                ? adminFormCopy.userPassword.hidePassword
                : adminFormCopy.userPassword.showPassword
            }
            aria-label={
              showPassword
                ? adminFormCopy.userPassword.hidePassword
                : adminFormCopy.userPassword.showPassword
            }
          >
            {showPassword ? (
              <EyeOff className={styles.toggleIcon} />
            ) : (
              <Eye className={styles.toggleIcon} />
            )}
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <div className={styles.strengthContainer}>
          <div className={styles.strengthBar}>
            <div
              className={cn(styles.strengthBarFill, strengthColors[strengthData.strength])}
              style={{
                width: `${(strengthData.score / 7) * 100}%`,
              }}
            />
          </div>
          <div className={styles.strengthInfo}>
            <span
              className={cn(
                styles.strengthLabel,
                !isStrongEnough ? styles.strengthLabelError : undefined,
              )}
            >
              {strengthLabels[strengthData.strength]}
            </span>
            {!isStrongEnough && (
              <span className={styles.strengthWarning}>
                {adminFormCopy.userPassword.minStrongWarning}
              </span>
            )}
          </div>
          {strengthData.feedback.length > 0 && !isStrongEnough && (
            <ul className={styles.feedbackList}>
              {strengthData.feedback.map((item, index) => (
                <li key={index} className={styles.feedbackItem}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* **************************************************
 * Export strength checker for form validation
 **************************************************/
export function isPasswordStrongEnough(password: string): boolean {
  const { strength } = calculatePasswordStrength(password);
  return strength === "strong" || strength === "very-strong";
}
