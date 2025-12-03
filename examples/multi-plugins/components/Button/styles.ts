import { CSSProperties } from 'react';
import { ButtonVariant } from './types';

export const createButtonStyles = (
  variant: ButtonVariant,
  isLoading: boolean,
  disabled: boolean
): CSSProperties => {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'inherit',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 200ms ease-in-out',
    border: 'none',
    outline: 'none',
    position: 'relative',
    minHeight: '36px',
  };

  const variantStyles: CSSProperties =
    variant === 'primary'
      ? {
          backgroundColor: '#2563eb',
          color: '#ffffff',
        }
      : {
          backgroundColor: 'transparent',
          color: '#2563eb',
          border: '2px solid #2563eb',
        };

  const stateStyles: CSSProperties =
    disabled || isLoading
      ? variant === 'primary'
        ? {
            backgroundColor: '#cbd5e1',
            color: '#94a3b8',
            opacity: 0.6,
          }
        : {
            borderColor: '#cbd5e1',
            color: '#94a3b8',
            opacity: 0.6,
          }
      : variant === 'primary'
        ? {
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
            '&:active': {
              backgroundColor: '#1e40af',
            },
            '&:focus': {
              outline: '2px solid #2563eb',
              outlineOffset: '2px',
            },
          }
        : {
            '&:hover': {
              backgroundColor: '#eff6ff',
            },
            '&:active': {
              backgroundColor: '#dbeafe',
            },
            '&:focus': {
              outline: '2px solid #2563eb',
              outlineOffset: '2px',
            },
          };

  return {
    ...baseStyles,
    ...variantStyles,
    ...stateStyles,
  };
};

export const spinnerStyles: CSSProperties = {
  display: 'inline-block',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  borderTop: '2px solid currentColor',
  borderRight: '2px solid transparent',
  animation: 'spin 0.8s linear infinite',
};

export const spinnerContainerStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
};

/**
 * Global styles for button animations
 * Add this to your global CSS or use it in a styled-components global style
 */
export const globalAnimationStyles = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
