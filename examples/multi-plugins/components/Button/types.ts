import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary';

/**
 * Button component props interface
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Text or element to display while loading
   * If not provided, only the spinner will be shown
   */
  loadingText?: ReactNode;

  /**
   * The content to display inside the button
   */
  children: ReactNode;

  /**
   * Whether the button is disabled
   * When isLoading is true, button is automatically disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Test ID for testing purposes
   */
  testId?: string;
}
