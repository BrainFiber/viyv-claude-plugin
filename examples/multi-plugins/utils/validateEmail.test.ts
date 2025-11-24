import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  isValidEmail,
  getEmailDomain,
  getEmailLocalPart,
  type EmailValidationOptions,
} from './validateEmail';

describe('validateEmail', () => {
  describe('Valid Email Addresses', () => {
    it('should validate standard email addresses', () => {
      expect(validateEmail('user@example.com')).toEqual({ isValid: true });
      expect(validateEmail('john.doe@example.com')).toEqual({ isValid: true });
      expect(validateEmail('test@subdomain.example.com')).toEqual({ isValid: true });
    });

    it('should validate emails with numbers', () => {
      expect(validateEmail('user123@example.com')).toEqual({ isValid: true });
      expect(validateEmail('123user@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user@example123.com')).toEqual({ isValid: true });
    });

    it('should validate emails with special characters in local part', () => {
      expect(validateEmail('user+tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user.name@example.com')).toEqual({ isValid: true });
      expect(validateEmail("user!def@example.com")).toEqual({ isValid: true });
      expect(validateEmail('user#tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user$tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user%tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail("user&tag@example.com")).toEqual({ isValid: true });
      expect(validateEmail("user'tag@example.com")).toEqual({ isValid: true });
      expect(validateEmail('user*tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user=tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user?tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user^tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user_tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user`tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user{tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user|tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user}tag@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user~tag@example.com')).toEqual({ isValid: true });
    });

    it('should validate emails with hyphens in domain', () => {
      expect(validateEmail('user@my-company.com')).toEqual({ isValid: true });
      expect(validateEmail('user@sub-domain.example.com')).toEqual({ isValid: true });
    });

    it('should validate emails with multiple subdomains', () => {
      expect(validateEmail('user@mail.subdomain.example.com')).toEqual({ isValid: true });
      expect(validateEmail('user@a.b.c.d.example.com')).toEqual({ isValid: true });
    });

    it('should validate emails with various TLDs', () => {
      expect(validateEmail('user@example.co')).toEqual({ isValid: true });
      expect(validateEmail('user@example.io')).toEqual({ isValid: true });
      expect(validateEmail('user@example.org')).toEqual({ isValid: true });
      expect(validateEmail('user@example.net')).toEqual({ isValid: true });
      expect(validateEmail('user@example.info')).toEqual({ isValid: true });
      expect(validateEmail('user@example.co.uk')).toEqual({ isValid: true });
      expect(validateEmail('user@example.com.au')).toEqual({ isValid: true });
    });

    it('should trim whitespace and validate', () => {
      expect(validateEmail('  user@example.com  ')).toEqual({ isValid: true });
      expect(validateEmail('\tuser@example.com\n')).toEqual({ isValid: true });
    });

    it('should validate single character local parts', () => {
      expect(validateEmail('a@example.com')).toEqual({ isValid: true });
    });
  });

  describe('Invalid Email Addresses - Format Issues', () => {
    it('should reject emails without @ symbol', () => {
      const result = validateEmail('userexample.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject emails with multiple @ symbols', () => {
      const result = validateEmail('user@@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject emails with @ at the start', () => {
      const result = validateEmail('@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject emails with @ at the end', () => {
      const result = validateEmail('user@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject emails with spaces in the middle', () => {
      const result = validateEmail('user name@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject emails with domain starting with hyphen', () => {
      const result = validateEmail('user@-example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject emails with domain ending with hyphen', () => {
      const result = validateEmail('user@example-.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });
  });

  describe('Invalid Email Addresses - Domain Issues', () => {
    it('should reject emails without TLD', () => {
      const result = validateEmail('user@example');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email domain must have a valid TLD');
    });

    it('should reject emails with single character TLD', () => {
      const result = validateEmail('user@example.c');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email TLD must be at least 2 characters');
    });
  });

  describe('Invalid Email Addresses - Local Part Issues', () => {
    it('should reject emails with local part starting with dot', () => {
      const result = validateEmail('.user@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email local part cannot start or end with a dot');
    });

    it('should reject emails with local part ending with dot', () => {
      const result = validateEmail('user.@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email local part cannot start or end with a dot');
    });

    it('should reject emails with consecutive dots in local part', () => {
      const result = validateEmail('user..name@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email local part cannot contain consecutive dots');
    });

    it('should reject emails with local part exceeding 64 characters', () => {
      const longLocalPart = 'a'.repeat(65);
      const result = validateEmail(`${longLocalPart}@example.com`);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email local part cannot exceed 64 characters');
    });
  });

  describe('Empty and Null Handling', () => {
    it('should reject empty strings by default', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email cannot be empty');
    });

    it('should reject whitespace-only strings by default', () => {
      const result = validateEmail('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email cannot be empty');
    });

    it('should allow empty strings when allowEmpty option is true', () => {
      const result = validateEmail('', { allowEmpty: true });
      expect(result.isValid).toBe(true);
    });

    it('should allow whitespace-only strings when allowEmpty option is true', () => {
      const result = validateEmail('   ', { allowEmpty: true });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Type Checking', () => {
    it('should reject null', () => {
      const result = validateEmail(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a string');
    });

    it('should reject undefined', () => {
      const result = validateEmail(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a string');
    });

    it('should reject numbers', () => {
      const result = validateEmail(12345);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a string');
    });

    it('should reject objects', () => {
      const result = validateEmail({ email: 'user@example.com' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a string');
    });

    it('should reject arrays', () => {
      const result = validateEmail(['user@example.com']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a string');
    });

    it('should reject booleans', () => {
      const result = validateEmail(true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email must be a string');
    });
  });

  describe('Length Validation', () => {
    it('should reject emails exceeding default max length (254)', () => {
      const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(186) + '.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email exceeds maximum length of 254 characters');
    });

    it('should accept emails within default max length', () => {
      const email = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
    });

    it('should respect custom maxLength option', () => {
      const result = validateEmail('user@example.com', { maxLength: 10 });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email exceeds maximum length of 10 characters');
    });
  });

  describe('Domain Restrictions', () => {
    describe('Allowed Domains', () => {
      it('should accept emails from allowed domains', () => {
        const options: EmailValidationOptions = {
          allowedDomains: ['example.com', 'company.org'],
        };
        expect(validateEmail('user@example.com', options)).toEqual({ isValid: true });
        expect(validateEmail('user@company.org', options)).toEqual({ isValid: true });
      });

      it('should reject emails from non-allowed domains', () => {
        const options: EmailValidationOptions = {
          allowedDomains: ['example.com'],
        };
        const result = validateEmail('user@other.com', options);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Email domain 'other.com' is not in the allowed list");
      });

      it('should handle case-insensitive domain matching for allowed domains', () => {
        const options: EmailValidationOptions = {
          allowedDomains: ['EXAMPLE.COM'],
        };
        expect(validateEmail('user@example.com', options)).toEqual({ isValid: true });
        expect(validateEmail('user@EXAMPLE.COM', options)).toEqual({ isValid: true });
      });

      it('should not apply allowed domains restriction when array is empty', () => {
        const options: EmailValidationOptions = {
          allowedDomains: [],
        };
        expect(validateEmail('user@any-domain.com', options)).toEqual({ isValid: true });
      });
    });

    describe('Blocked Domains', () => {
      it('should reject emails from blocked domains', () => {
        const options: EmailValidationOptions = {
          blockedDomains: ['spam.com', 'blocked.org'],
        };
        const result1 = validateEmail('user@spam.com', options);
        expect(result1.isValid).toBe(false);
        expect(result1.error).toBe("Email domain 'spam.com' is blocked");

        const result2 = validateEmail('user@blocked.org', options);
        expect(result2.isValid).toBe(false);
        expect(result2.error).toBe("Email domain 'blocked.org' is blocked");
      });

      it('should accept emails from non-blocked domains', () => {
        const options: EmailValidationOptions = {
          blockedDomains: ['spam.com'],
        };
        expect(validateEmail('user@example.com', options)).toEqual({ isValid: true });
      });

      it('should handle case-insensitive domain matching for blocked domains', () => {
        const options: EmailValidationOptions = {
          blockedDomains: ['SPAM.COM'],
        };
        const result = validateEmail('user@spam.com', options);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Email domain 'spam.com' is blocked");
      });

      it('should not apply blocked domains restriction when array is empty', () => {
        const options: EmailValidationOptions = {
          blockedDomains: [],
        };
        expect(validateEmail('user@any-domain.com', options)).toEqual({ isValid: true });
      });
    });

    describe('Combined Domain Restrictions', () => {
      it('should apply both allowed and blocked domain rules', () => {
        const options: EmailValidationOptions = {
          allowedDomains: ['company.com', 'example.com'],
          blockedDomains: ['example.com'],
        };
        // company.com is allowed and not blocked
        expect(validateEmail('user@company.com', options)).toEqual({ isValid: true });

        // example.com is in allowed list but blocked - should fail (blocked takes precedence)
        const result = validateEmail('user@example.com', options);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Email domain 'example.com' is blocked");
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle emails with IP addresses in brackets', () => {
      // Note: Our current implementation does not support IP addresses
      const result = validateEmail('user@[192.168.1.1]');
      expect(result.isValid).toBe(false);
    });

    it('should handle emails with quoted local parts', () => {
      // Note: Our current implementation does not support quoted strings
      const result = validateEmail('"user name"@example.com');
      expect(result.isValid).toBe(false);
    });

    it('should handle very long valid emails at boundary', () => {
      // 64 char local part + @ + domain that brings total to 254
      const localPart = 'a'.repeat(64);
      const domain = 'b'.repeat(185) + '.com';
      const email = `${localPart}@${domain}`;
      expect(email.length).toBe(254);
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
    });

    it('should handle unicode characters in domain', () => {
      // Note: IDN (Internationalized Domain Names) are not supported in basic form
      const result = validateEmail('user@例え.jp');
      expect(result.isValid).toBe(false);
    });

    it('should handle valid email with all allowed special characters', () => {
      const result = validateEmail("user.name+tag!#$%&'*=?^_`{|}~@example.com");
      expect(result.isValid).toBe(true);
    });
  });
});

describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('john.doe@company.org')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('getEmailDomain', () => {
  it('should extract domain from valid emails', () => {
    expect(getEmailDomain('user@example.com')).toBe('example.com');
    expect(getEmailDomain('user@subdomain.example.com')).toBe('subdomain.example.com');
    expect(getEmailDomain('USER@EXAMPLE.COM')).toBe('example.com');
  });

  it('should return lowercase domain', () => {
    expect(getEmailDomain('user@EXAMPLE.COM')).toBe('example.com');
    expect(getEmailDomain('user@Example.Com')).toBe('example.com');
  });

  it('should return null for invalid emails', () => {
    expect(getEmailDomain('invalid')).toBeNull();
    expect(getEmailDomain('')).toBeNull();
    expect(getEmailDomain('user@')).toBeNull();
  });

  it('should handle whitespace', () => {
    expect(getEmailDomain('  user@example.com  ')).toBe('example.com');
  });
});

describe('getEmailLocalPart', () => {
  it('should extract local part from valid emails', () => {
    expect(getEmailLocalPart('user@example.com')).toBe('user');
    expect(getEmailLocalPart('john.doe@example.com')).toBe('john.doe');
    expect(getEmailLocalPart('user+tag@example.com')).toBe('user+tag');
  });

  it('should preserve case in local part', () => {
    expect(getEmailLocalPart('User@example.com')).toBe('User');
    expect(getEmailLocalPart('John.Doe@example.com')).toBe('John.Doe');
  });

  it('should return null for invalid emails', () => {
    expect(getEmailLocalPart('invalid')).toBeNull();
    expect(getEmailLocalPart('')).toBeNull();
    expect(getEmailLocalPart('@example.com')).toBeNull();
  });

  it('should handle whitespace', () => {
    expect(getEmailLocalPart('  user@example.com  ')).toBe('user');
  });
});

describe('Real-world Email Scenarios', () => {
  it('should validate common email providers', () => {
    expect(isValidEmail('user@gmail.com')).toBe(true);
    expect(isValidEmail('user@yahoo.com')).toBe(true);
    expect(isValidEmail('user@outlook.com')).toBe(true);
    expect(isValidEmail('user@hotmail.com')).toBe(true);
    expect(isValidEmail('user@icloud.com')).toBe(true);
    expect(isValidEmail('user@protonmail.com')).toBe(true);
  });

  it('should validate corporate email patterns', () => {
    expect(isValidEmail('john.smith@company.com')).toBe(true);
    expect(isValidEmail('jsmith@department.company.com')).toBe(true);
    expect(isValidEmail('john_smith@company.co.uk')).toBe(true);
    expect(isValidEmail('j.smith@my-company.com')).toBe(true);
  });

  it('should validate emails with plus addressing', () => {
    expect(isValidEmail('user+newsletter@gmail.com')).toBe(true);
    expect(isValidEmail('user+shopping@example.com')).toBe(true);
    expect(isValidEmail('user+tag+subtag@example.com')).toBe(true);
  });

  it('should reject commonly malformed emails', () => {
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('user@com')).toBe(false);
    expect(isValidEmail('user.@example.com')).toBe(false);
    expect(isValidEmail('.user@example.com')).toBe(false);
    expect(isValidEmail('user..name@example.com')).toBe(false);
    expect(isValidEmail('user name@example.com')).toBe(false);
    expect(isValidEmail('user\t@example.com')).toBe(false);
  });
});
