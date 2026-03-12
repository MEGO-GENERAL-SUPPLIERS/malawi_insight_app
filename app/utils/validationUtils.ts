/**
 * Utility functions for string and value format validation
 * Author: Your Excellency Emmanuel Zaph Nyondo 👑
 */

export interface PasswordStrengthResult {
  score: number;
  label: string; 
  color: string; 
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

//================ FUNCTIONS ====================

export const validationUtils = {
  /** ✅ Check if a string is camelCase */
  isCamelCased(str: string): boolean {
    return /^[a-z]+(?:[A-Z][a-z]*)*$/.test(str.trim());
  },

  /** ✅ Check if a string is snake_case */
  isSnakeCased(str: string): boolean {
    return /^[a-z]+(?:_[a-z]+)*$/.test(str.trim());
  },

  /** ✅ Check if a string contains only letters and numbers */
  isAlphaNumeric(str: string): boolean {
    return /^[A-Za-z0-9]+$/.test(str.trim());
  },

   /** ✅ Check if a string contains only letters, numbers, and spaces */
  isAlphaNumericWithSpaces(str: string): boolean {
    return /^[A-Za-z0-9 ]+$/.test(str.trim());
  },

  /** ✅ Check if a string contains only letters (A–Z, a–z) */
  isOnlyLetters(str: string): boolean {
    return /^[A-Za-z]+$/.test(str.trim());
  },

  /** ✅ Check if a string has no spaces */
  isStringWithoutSpaces(str: string): boolean {
    return /^\S+$/.test(str);
  },

  /* string that is valid*/
  isValidInput(str: string): boolean {
    const trimmed = str.replace(/^\s*/, "").replace(/\s*$/, "");
    return trimmed.length > 0;
  },

  /** ✅ Check if a value is an integer number */
  isNumber(value: any): boolean {
    if (value === null || value === undefined) return false;
    return /^-?\d+$/.test(String(value).trim());
  },

  /** ✅ Check if a value is a decimal number (integer or fractional) */
  isDecimal(value: any): boolean {
    if (value === null || value === undefined) return false;
    return /^-?\d+(\.\d+)?$/.test(String(value).trim());
  },

  /** ✅ Check if a string is a valid ISO or human-readable date */
  isValidDate(str: string): boolean {
    if (!str || typeof str !== "string") return false;
    const date = new Date(str);
    return !isNaN(date.getTime());
  },

  /** ✅ Check if a string starts with an uppercase letter */
  startsWithUppercase(str: string): boolean {
    return /^[A-Z]/.test(str.trim());
  },

  /** ✅ Check if a string is empty or only whitespace */
  isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
  },

  /** ✅ Sanitize and normalize a string (trim + single space between words) */
  normalizeSpaces(str: string): string {
    return str.trim().replace(/\s+/g, " ");
  },

  /** ✅ Check if a string is a valid email address */
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  },

  /**
   * ✅ Check if a string is a valid international phone number
   * Example: +265999123456, +14155552671, etc.
   * Must start with + and 7–15 digits
   */
  isValidInternationalNumber(number: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(number.trim());
  },

  /**
   * ✅ Check if a string is a valid Malawian phone number
   * Supports formats:
   * - 0999123456
   * - +265999123456
   * - 265999123456
   */
  isValidMalawianNumber(number: string): boolean {
    const normalized = number.replace(/\s|-/g, "");
    return (
      /^0(88|89|98|99)\d{6}$/.test(normalized) || // local format
      /^\+265(88|89|98|99)\d{6}$/.test(normalized) || // +265 international
      /^265(88|89|98|99)\d{6}$/.test(normalized) // without +
    );
  },

  validatePassword(password: string): PasswordStrengthResult {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const metCount = Object.values(requirements).filter(Boolean).length;

    let score = 0; 
    let label = "Very Weak";
    let color = 'bg-gray-300';

    if(password.length > 0){
      if(metCount === 1) {
        score = 1;
        label = 'Weak';
        color = 'bg-red-500';
      } else if(metCount === 2) {
        score = 2;
        label = 'Fair';
        color = 'bg-yellow-500';
      } else if(metCount === 3) {
        score = 3;
        label = 'Good';
        color = 'bg-blue-500';
      } else if(metCount >= 4) {
        score = 4;
        label = 'Strong';
        color = 'bg-green-500';
      }
    }

    return { score, label, color, requirements };
  },

  checkPasswordMatch(newPass: string, confirmPass: string): boolean{
    if(!confirmPass) return true;
    return newPass === confirmPass;
  },

  validateCurrentPassword(password: string): string | null {
    if(password) return 'Current password is required';
    return null;
  },

  validateNewPassword(password: string): string | null {
    if(!password) return 'New password is required';
    if(password.length < 8) return 'Password must be at least 8 characters';
    return null;
  }
};
