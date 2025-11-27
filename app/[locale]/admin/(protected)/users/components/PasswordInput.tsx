"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useState, useCallback } from "react";
import { RefreshCw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import styles from "./PasswordInputStyles";

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

  let password = "";

  // Assicurati che la password contenga almeno un carattere di ogni tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Riempi il resto: 80% lettere/numeri, 20% caratteri speciali
  const remainingLength = length - password.length;
  const specialCount = Math.floor(remainingLength * 0.2); // 20% caratteri speciali
  const mainCount = remainingLength - specialCount; // Resto lettere/numeri

  for (let i = 0; i < mainCount; i++) {
    password += mainChars[Math.floor(Math.random() * mainChars.length)];
  }

  for (let i = 0; i < specialCount; i++) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }

  // Mescola la password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
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
    weak: "Debole",
    medium: "Media",
    strong: "Forte",
    "very-strong": "Molto Forte",
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
            title="Genera password sicura"
            aria-label="Genera password sicura"
          >
            <RefreshCw className={styles.generateIcon} />
          </button>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.toggleButton}
            title={showPassword ? "Nascondi password" : "Mostra password"}
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
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
                La password deve essere almeno &quot;Forte&quot;
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
