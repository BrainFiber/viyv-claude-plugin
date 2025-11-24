import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './index';

/**
 * Test suite for Button component
 */
describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with primary variant by default', () => {
      render(<Button data-testid="btn">Primary</Button>);
      const button = screen.getByTestId('btn');
      expect(button).toHaveClass('button--primary');
    });

    it('should render with specified variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--secondary');
    });

    it('should render children content', () => {
      render(<Button>Test Content</Button>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Click
        </Button>
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button loading onClick={handleClick}>
          Click
        </Button>
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should display spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const spinner = screen.getByTestId('button-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should set aria-busy to true when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not display spinner when not loading', () => {
      const { queryByTestId } = render(<Button>Click me</Button>);
      const spinner = queryByTestId('button-spinner');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should set aria-busy to false when not loading', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('Disabled State', () => {
    it('should disable button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should set aria-disabled to true when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should set aria-disabled to false when not disabled', () => {
      render(<Button>Active</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'false');
    });

    it('should not be clickable when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Click
        </Button>
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should support primary variant', () => {
      const { container } = render(
        <Button variant="primary">Primary</Button>
      );
      const button = container.querySelector('.button--primary');
      expect(button).toBeInTheDocument();
    });

    it('should support secondary variant', () => {
      const { container } = render(
        <Button variant="secondary">Secondary</Button>
      );
      const button = container.querySelector('.button--secondary');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Button Types', () => {
    it('should render with button type by default', () => {
      render(<Button>Submit</Button>);
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.type).toBe('button');
    });

    it('should support submit type', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.type).toBe('submit');
    });

    it('should support reset type', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.type).toBe('reset');
    });
  });

  describe('Custom Attributes', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <Button className="custom-class">Custom</Button>
      );
      const button = container.querySelector('.custom-class');
      expect(button).toBeInTheDocument();
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>With Ref</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should accept additional HTML attributes', () => {
      render(
        <Button data-custom="value" aria-label="Custom Label">
          Custom
        </Button>
      );
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have spinner hidden from screen readers', () => {
      render(<Button loading>Loading</Button>);
      const spinner = screen.getByTestId('button-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('should announce loading state with aria-busy', () => {
      const { rerender } = render(<Button loading>Loading</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');

      rerender(<Button>Not Loading</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle disabled then enabled transitions', () => {
      const { rerender } = render(<Button disabled>Disabled</Button>);
      let button = screen.getByRole('button');
      expect(button).toBeDisabled();

      rerender(<Button>Enabled</Button>);
      button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should handle loading then loaded transitions', () => {
      const { rerender } = render(<Button loading>Loading</Button>);
      let button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();

      rerender(<Button>Loaded</Button>);
      button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(screen.queryByTestId('button-spinner')).not.toBeInTheDocument();
    });

    it('should preserve other HTML attributes', () => {
      render(
        <Button
          id="unique-id"
          data-testid="custom-test"
          title="Button Title"
        >
          Button
        </Button>
      );
      const button = screen.getByTestId('custom-test');
      expect(button).toHaveAttribute('id', 'unique-id');
      expect(button).toHaveAttribute('title', 'Button Title');
    });
  });
});
