# Button Component

A production-ready React button component with TypeScript support, multiple variants, loading states, and full accessibility features.

## Features

- **Multiple Variants**: Primary and secondary style variants
- **Loading State**: Built-in spinner and disabled state management
- **Full TypeScript Support**: Complete type definitions with proper interfaces
- **Accessibility**: ARIA attributes, keyboard navigation support
- **Flexible Styling**: CSS-in-JS with smooth transitions
- **Ref Forwarding**: Support for React.forwardRef for direct DOM access
- **HTML Button Support**: All standard HTML button attributes supported
- **Production Ready**: Comprehensive test suite included

## Installation

Copy the Button folder to your project:

```bash
cp -r Button/ src/components/
```

## File Structure

```
Button/
├── index.tsx           # Main component implementation
├── types.ts            # TypeScript interfaces and types
├── styles.ts           # CSS-in-JS styles and animation utilities
├── Button.example.tsx  # Usage examples
├── Button.test.tsx     # Test suite
└── README.md          # This file
```

## Usage

### Basic Usage

```tsx
import Button from './Button';

export function App() {
  return <Button>Click me</Button>;
}
```

### With Variants

```tsx
import Button from './Button';

export function ButtonVariants() {
  return (
    <>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
    </>
  );
}
```

### Loading State

```tsx
import { useState } from 'react';
import Button from './Button';

export function ButtonWithLoading() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('/api/submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button loading={loading} onClick={handleSubmit}>
      {loading ? 'Submitting...' : 'Submit'}
    </Button>
  );
}
```

### With Disabled State

```tsx
import Button from './Button';

export function DisabledButton() {
  return <Button disabled>Cannot Click</Button>;
}
```

### Form Integration

```tsx
import { useRef } from 'react';
import Button from './Button';

export function FormExample() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input type="email" placeholder="Enter email" />
      <Button type="submit" ref={buttonRef}>
        Submit
      </Button>
      <Button type="reset" variant="secondary">
        Clear
      </Button>
    </form>
  );
}
```

### With Custom Styling

```tsx
import Button from './Button';

export function CustomButton() {
  return (
    <Button
      variant="primary"
      className="custom-class"
      style={{ padding: '16px 32px', fontSize: '18px' }}
    >
      Custom Styled
    </Button>
  );
}
```

## Props

### ButtonProps Interface

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';

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
```

### All Standard HTML Button Attributes

The component extends `ButtonHTMLAttributes<HTMLButtonElement>`, so it supports all standard HTML button attributes:

- `type`: 'button' | 'submit' | 'reset' (default: 'button')
- `id`: string
- `className`: string
- `style`: CSSProperties
- `disabled`: boolean
- `aria-*`: ARIA attributes
- `data-*`: Custom data attributes
- And all other standard HTML button attributes

## Styling Details

### Primary Variant

- Background: `#007bff` (Blue)
- Hover: `#0056b3` (Darker Blue)
- Active: `#003f87` (Even Darker Blue)
- Text: White (`#ffffff`)

### Secondary Variant

- Background: `#6c757d` (Gray)
- Hover: `#545b62` (Darker Gray)
- Active: `#414548` (Even Darker Gray)
- Text: White (`#ffffff`)

### States

- **Disabled/Loading**: 60% opacity, cursor not-allowed
- **Hover**: Darker background color
- **Active**: Even darker background color
- **Transitions**: 0.3s ease-in-out for smooth state changes

### Responsive Design

The button uses flexbox layout and adapts to its container:

```css
display: inline-flex;
align-items: center;
justify-content: center;
padding: 10px 16px;
```

## Accessibility Features

### ARIA Attributes

- **aria-busy**: Set to `true` when loading, `false` otherwise
- **aria-disabled**: Set to `true` when disabled or loading
- **aria-hidden**: Applied to spinner to hide it from screen readers

### Keyboard Navigation

- Full keyboard support via native HTML button element
- Enter key triggers click handler
- Space key triggers click handler
- Tab navigation support

### Screen Reader Support

- Spinner is hidden from screen readers using `aria-hidden="true"`
- Loading state is announced via `aria-busy` attribute
- Disabled state is announced via `aria-disabled` attribute
- Button text is properly associated with the button element

## Testing

The component includes a comprehensive test suite using React Testing Library.

### Run Tests

```bash
npm test Button.test.tsx
```

### Test Coverage

- Rendering with different variants and states
- Click event handlers
- Loading state behavior
- Disabled state behavior
- Button type support
- Custom attributes and className
- Accessibility features
- Edge cases and state transitions

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('should call onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);

  const button = screen.getByRole('button');
  button.click();

  expect(handleClick).toHaveBeenCalled();
});
```

## API Reference

### Component

```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // Component implementation
});

export default Button;
```

### Named Exports

```typescript
export { type ButtonProps } from './types';
export type { ButtonVariant } from './types';
```

## Performance Considerations

- Component uses `React.forwardRef` for optimal ref forwarding
- State updates are batched using React's automatic batching
- Spinner animation uses CSS keyframes for smooth, performant animation
- Event handlers use proper cleanup and don't create closures unnecessarily

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE 11+ with polyfills for CSS Grid/Flexbox
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Custom Styling

Modify `/Button/styles.ts` to customize colors and spacing:

```typescript
export const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#your-color',
    color: '#your-text-color',
  },
  secondary: {
    backgroundColor: '#your-color',
    color: '#your-text-color',
  },
};
```

### Custom Variants

Add new variants by extending the types and styles:

```typescript
// types.ts
export type ButtonVariant = 'primary' | 'secondary' | 'danger';

// styles.ts
export const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: { /* ... */ },
  secondary: { /* ... */ },
  danger: { backgroundColor: '#dc3545', color: '#ffffff' },
};
```

## Migration Guide

### From v1 to v2

- No breaking changes in this version
- All props are backward compatible

## Contributing

When contributing to the Button component:

1. Add tests for new features
2. Update the TypeScript types
3. Update this README with new features
4. Ensure accessibility standards are maintained
5. Run the test suite before submitting

## License

This component is part of the project and follows the same license.

## FAQ

### How do I prevent multiple submissions?

Disable the button during loading:

```tsx
<Button loading={isLoading} disabled={isLoading} onClick={handleSubmit}>
  Submit
</Button>
```

### Can I customize the spinner?

Create a custom Button component that wraps this one and customizes the Spinner component:

```tsx
const CustomButton = (props) => {
  return <Button {...props} />;
};
```

### Does it work with Next.js?

Yes, the component works with Next.js as a client component. Add 'use client' directive:

```tsx
'use client';

import Button from './Button';
```

### How do I style the button with CSS modules?

Use the `className` prop:

```tsx
import styles from './Button.module.css';

<Button className={styles.customButton}>Custom</Button>
```

### Can I use this with Tailwind CSS?

Yes, use the `className` prop for Tailwind classes:

```tsx
<Button className="bg-blue-600 hover:bg-blue-700">Tailwind Button</Button>
```

Note: This will override the inline styles. Consider removing inline styles if using Tailwind exclusively.
