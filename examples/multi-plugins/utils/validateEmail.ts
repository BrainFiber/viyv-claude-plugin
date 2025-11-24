/**
 * Email validation result object
 */
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Options for email validation
 */
export interface EmailValidationOptions {
  /** Allow empty strings (default: false) */
  allowEmpty?: boolean;
  /** Maximum length of the email (default: 254 - RFC 5321) */
  maxLength?: number;
  /** Allowed domains (if specified, only these domains are valid) */
  allowedDomains?: string[];
  /** Blocked domains (emails from these domains are invalid) */
  blockedDomains?: string[];
}

/**
 * Validates an email address according to RFC 5322 standards
 *
 * @param email - The email address to validate
 * @param options - Optional validation configuration
 * @returns EmailValidationResult with isValid boolean and optional error message
 *
 * @example
 * ```typescript
 * const result = validateEmail('user@example.com');
 * if (result.isValid) {
 *   console.log('Email is valid!');
 * } else {
 *   console.log('Invalid email:', result.error);
 * }
 * ```
 */
export function validateEmail(
  email: unknown,
  options: EmailValidationOptions = {}
): EmailValidationResult {
  const {
    allowEmpty = false,
    maxLength = 254,
    allowedDomains,
    blockedDomains,
  } = options;

  // Type check
  if (typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Email must be a string',
    };
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Empty check
  if (trimmedEmail === '') {
    if (allowEmpty) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: 'Email cannot be empty',
    };
  }

  // Length check
  if (trimmedEmail.length > maxLength) {
    return {
      isValid: false,
      error: `Email exceeds maximum length of ${maxLength} characters`,
    };
  }

  // Basic format validation using regex
  // This regex follows RFC 5322 standards with practical modifications
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  // Extract domain from email
  const atIndex = trimmedEmail.lastIndexOf('@');
  const domain = trimmedEmail.substring(atIndex + 1).toLowerCase();

  // Check if domain has at least one dot (TLD check)
  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: 'Email domain must have a valid TLD',
    };
  }

  // Extract TLD
  const tld = domain.split('.').pop() || '';

  // TLD must be at least 2 characters
  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Email TLD must be at least 2 characters',
    };
  }

  // Local part validation (before @)
  const localPart = trimmedEmail.substring(0, atIndex);

  // Local part cannot be empty
  if (localPart.length === 0) {
    return {
      isValid: false,
      error: 'Email local part cannot be empty',
    };
  }

  // Local part cannot exceed 64 characters (RFC 5321)
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email local part cannot exceed 64 characters',
    };
  }

  // Local part cannot start or end with a dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email local part cannot start or end with a dot',
    };
  }

  // Local part cannot have consecutive dots
  if (localPart.includes('..')) {
    return {
      isValid: false,
      error: 'Email local part cannot contain consecutive dots',
    };
  }

  // Allowed domains check
  if (allowedDomains && allowedDomains.length > 0) {
    const normalizedAllowedDomains = allowedDomains.map((d) => d.toLowerCase());
    if (!normalizedAllowedDomains.includes(domain)) {
      return {
        isValid: false,
        error: `Email domain '${domain}' is not in the allowed list`,
      };
    }
  }

  // Blocked domains check
  if (blockedDomains && blockedDomains.length > 0) {
    const normalizedBlockedDomains = blockedDomains.map((d) => d.toLowerCase());
    if (normalizedBlockedDomains.includes(domain)) {
      return {
        isValid: false,
        error: `Email domain '${domain}' is blocked`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Simple boolean check for email validity
 *
 * @param email - The email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: unknown): boolean {
  return validateEmail(email).isValid;
}

/**
 * Extracts the domain from an email address
 *
 * @param email - The email address
 * @returns The domain portion of the email, or null if invalid
 */
export function getEmailDomain(email: string): string | null {
  if (!isValidEmail(email)) {
    return null;
  }
  const atIndex = email.trim().lastIndexOf('@');
  return email.trim().substring(atIndex + 1).toLowerCase();
}

/**
 * Extracts the local part (username) from an email address
 *
 * @param email - The email address
 * @returns The local part of the email, or null if invalid
 */
export function getEmailLocalPart(email: string): string | null {
  if (!isValidEmail(email)) {
    return null;
  }
  const atIndex = email.trim().lastIndexOf('@');
  return email.trim().substring(0, atIndex);
}
