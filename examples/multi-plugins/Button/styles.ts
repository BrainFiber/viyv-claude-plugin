import { CSSProperties } from 'react';
import { ButtonVariant } from './types';

/**
 * Base button styles
 */
export const baseButtonStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '1.5',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

/**
 * Variant-specific styles
 */
export const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#007bff',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#6c757d',
    color: '#ffffff',
  },
};

/**
 * Hover state styles
 */
export const hoverStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#0056b3',
  },
  secondary: {
    backgroundColor: '#545b62',
  },
};

/**
 * Active state styles
 */
export const activeStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#003f87',
  },
  secondary: {
    backgroundColor: '#414548',
  },
};

/**
 * Disabled state styles
 */
export const disabledStyles: CSSProperties = {
  opacity: 0.6,
  cursor: 'not-allowed',
};

/**
 * Loading state styles
 */
export const loadingStyles: CSSProperties = {
  opacity: 0.8,
};

/**
 * Spinner styles
 */
export const spinnerStyles: CSSProperties = {
  display: 'inline-block',
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid rgba(255, 255, 255, 0.8)',
  borderRadius: '50%',
  animation: 'spin 0.6s linear infinite',
};

/**
 * Get combined styles for a button based on its state
 */
export const getButtonStyles = (
  variant: ButtonVariant = 'primary',
  disabled: boolean = false,
  loading: boolean = false,
  isHovered: boolean = false,
  isActive: boolean = false
): CSSProperties => {
  const styles: CSSProperties = {
    ...baseButtonStyles,
    ...variantStyles[variant],
  };

  if (disabled || loading) {
    Object.assign(styles, disabledStyles);
  }

  if (loading) {
    Object.assign(styles, loadingStyles);
  }

  if (!disabled && !loading) {
    if (isActive) {
      Object.assign(styles, activeStyles[variant]);
    } else if (isHovered) {
      Object.assign(styles, hoverStyles[variant]);
    }
  }

  return styles;
};

/**
 * Create a style tag with animation keyframes
 */
export const createSpinnerAnimation = (): void => {
  if (typeof document !== 'undefined') {
    const styleId = 'button-spinner-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
};
