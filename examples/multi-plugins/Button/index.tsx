import React, { forwardRef, useState, useEffect } from 'react';
import { ButtonProps } from './types';
import { getButtonStyles, createSpinnerAnimation, spinnerStyles } from './styles';

/**
 * Spinner component displayed during loading state
 */
const Spinner: React.FC = () => {
  useEffect(() => {
    createSpinnerAnimation();
  }, []);

  return (
    <span
      style={spinnerStyles}
      aria-hidden="true"
      data-testid="button-spinner"
    />
  );
};

/**
 * Button component with variant support, loading state, and full accessibility
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button onClick={handleClick}>Click me</Button>
 *
 * // Secondary button
 * <Button variant="secondary">Secondary</Button>
 *
 * // Loading state
 * <Button loading>Loading...</Button>
 *
 * // Disabled button
 * <Button disabled>Disabled</Button>
 *
 * // With all props
 * <Button
 *   variant="primary"
 *   loading={isLoading}
 *   disabled={isDisabled}
 *   onClick={handleClick}
 *   className="custom-class"
 * >
 *   Submit
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      loading = false,
      disabled = false,
      children,
      onClick,
      className = '',
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Combine base styles with state-specific styles
    const buttonStyles = getButtonStyles(
      variant,
      disabled,
      loading,
      isHovered,
      isActive
    );

    // Determine if button should be disabled
    const isDisabled = disabled || loading;

    // Handle click event
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick(event);
      }
    };

    // Handle mouse enter
    const handleMouseEnter = () => {
      if (!isDisabled) {
        setIsHovered(true);
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsActive(false);
    };

    // Handle mouse down
    const handleMouseDown = () => {
      if (!isDisabled) {
        setIsActive(true);
      }
    };

    // Handle mouse up
    const handleMouseUp = () => {
      setIsActive(false);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={buttonStyles}
        className={`button button--${variant} ${className}`.trim()}
        aria-busy={loading}
        aria-disabled={isDisabled}
        data-testid={`button-${variant}`}
        {...rest}
      >
        {loading && <Spinner />}
        <span>{children}</span>
      </button>
    );
  }
);

// Display name for debugging
Button.displayName = 'Button';

export default Button;
export { type ButtonProps } from './types';
export type { ButtonVariant } from './types';
