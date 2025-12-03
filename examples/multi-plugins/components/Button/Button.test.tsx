import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './index';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render with primary variant by default', () => {
      const { container } = render(<Button>Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ backgroundColor: '#2563eb' });
    });

    it('should render with secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ border: '2px solid #2563eb' });
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should be disabled when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not trigger onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Loading
        </Button>
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      const spinner = screen.getByTestId('button-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should have aria-busy when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should show loadingText when provided', () => {
      render(<Button isLoading loadingText="Processing...">
        Save
      </Button>);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should hide children when loading without loadingText', () => {
      const { container } = render(<Button isLoading>Save</Button>);
      const hiddenContent = container.querySelector('[style*="visibility: hidden"]');
      expect(hiddenContent).toBeInTheDocument();
    });

    it('should show spinner and children when loading with loadingText', () => {
      render(
        <Button isLoading loadingText="Loading...">
          Submit
        </Button>
      );
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event to onClick handler', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should work with userEvent', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Type', () => {
    it('should default to type="button"', () => {
      render(<Button>Default Type</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should accept type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should accept type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Custom Props', () => {
    it('should accept className', () => {
      const { container } = render(<Button className="custom-class">Button</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should accept style prop', () => {
      const { container } = render(
        <Button style={{ padding: '20px' }}>Button</Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ padding: '20px' });
    });

    it('should forward other button attributes', () => {
      render(
        <Button data-testid="custom-button" aria-label="Custom Button">
          Button
        </Button>
      );
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom Button');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Accessible</Button>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      const { rerender } = render(<Button>Button</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
      expect(button).toHaveAttribute('aria-disabled', 'false');

      rerender(<Button isLoading>Button</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');

      rerender(<Button disabled>Button</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have proper button role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow direct manipulation via ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      ref.current?.focus();
      expect(ref.current).toBe(document.activeElement);
    });
  });

  describe('Variants Styling', () => {
    it('should apply primary variant colors', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        backgroundColor: '#2563eb',
        color: '#ffffff',
      });
    });

    it('should apply secondary variant colors and border', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        backgroundColor: 'transparent',
        color: '#2563eb',
        border: '2px solid #2563eb',
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle loading state transitions', async () => {
      const { rerender } = render(
        <Button isLoading={false} loadingText="Loading...">
          Submit
        </Button>
      );

      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.queryByTestId('button-spinner')).not.toBeInTheDocument();

      rerender(
        <Button isLoading={true} loadingText="Loading...">
          Submit
        </Button>
      );

      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle form submission', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should work in multiple variants simultaneously', () => {
      const { container } = render(
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveStyle({ backgroundColor: '#2563eb' });
      expect(buttons[1]).toHaveStyle({ border: '2px solid #2563eb' });
    });
  });
});
