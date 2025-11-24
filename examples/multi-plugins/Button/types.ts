import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Variant type for the Button component
 */
export type ButtonVariant = 'primary' | 'secondary';

/**
 * Props interface for the Button component
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Whether the button is in a loading state
   * Shows spinner and disables the button
   * @default false
   */
  loading?: boolean;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * The content to display inside the button
   */
  children: ReactNode;

  /**
   * Optional click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Optional CSS class name
   */
  className?: string;
}
