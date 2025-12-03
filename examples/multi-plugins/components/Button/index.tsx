import React, { forwardRef, useMemo, useEffect } from 'react';
import { ButtonProps, ButtonVariant } from './types';
import { createButtonStyles, spinnerStyles, globalAnimationStyles } from './styles';

/**
 * Spinner component for loading state
 */
const Spinner: React.FC = () => {
  useEffect(() => {
    // Inject global animation styles if not already present
    const styleId = 'button-spinner-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = globalAnimationStyles;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Cleanup is optional - you might want to keep it for multiple buttons
    };
  }, []);

  return (
    <span
      style={spinnerStyles}
      role="status"
      aria-label="Loading"
      data-testid="button-spinner"
    />
  );
};

/**
 * Button Component
 *
 * A flexible button component with support for multiple variants, loading states, and accessibility.
 *
 * Features:
 * - Two visual variants: primary (filled) and secondary (outlined)
 * - Loading state with spinner animation
 * - Proper accessibility attributes (aria-busy, aria-disabled)
 * - Full TypeScript support with strict typing
 * - CSS-in-JS styling with proper hover/active/focus states
 * - Disabled state handling (automatic during loading)
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 *
 * // Secondary variant
 * <Button variant="secondary">
 *   Cancel
 * </Button>
 *
 * // Loading state with text
 * <Button isLoading loadingText="Saving...">
 *   Save
 * </Button>
 *
 * // Loading state with spinner only
 * <Button isLoading>
 *   Submit
 * </Button>
 *
 * // Disabled button
 * <Button disabled>
 *   Disabled Button
 * </Button>
 *
 * // With ref forwarding
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * <Button ref={buttonRef}>
 *   Ref Button
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      isLoading = false,
      loadingText,
      disabled = false,
      children,
      onClick,
      type = 'button',
      className = '',
      testId,
      style,
      ...rest
    },
    ref
  ) => {
    // Determine final disabled state (disabled if isLoading or explicitly disabled)
    const isDisabled = disabled || isLoading;

    // Memoize styles to avoid unnecessary recalculations
    const buttonStyles = useMemo(
      () => createButtonStyles(variant, isLoading, isDisabled),
      [variant, isLoading, isDisabled]
    );

    // Combine with any custom styles
    const finalStyles: React.CSSProperties = {
      ...buttonStyles,
      ...style,
    };

    // Handle click - prevent if loading or disabled
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    // Determine what to show in the button
    const buttonContent = isLoading ? (
      <>
        <Spinner />
        {loadingText && <span>{loadingText}</span>}
        {!loadingText && <span style={{ visibility: 'hidden' }}>{children}</span>}
      </>
    ) : (
      children
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        style={finalStyles}
        className={className}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        data-testid={testId}
        {...rest}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant };
