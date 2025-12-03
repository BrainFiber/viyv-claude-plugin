# Button Component

A flexible, accessible React button component with TypeScript support, multiple variants, loading states, and comprehensive accessibility features.

## Features

- **Type-safe**: Full TypeScript interfaces and strict typing
- **Accessibility**: ARIA attributes (`aria-busy`, `aria-disabled`), keyboard navigation, focus management
- **Two Variants**: Primary (filled) and Secondary (outlined) styles
- **Loading State**: Built-in spinner animation with optional loading text
- **Responsive**: Flexible styling with CSS-in-JS approach
- **Ref Forwarding**: Access the underlying button element
- **Keyboard Support**: Full keyboard navigation (Tab, Enter, Space)
- **Focus Management**: Clear focus indicators for accessibility
- **HTML Integration**: All standard HTML button attributes supported

## Files Structure

```
components/Button/
├── index.tsx              # Main component with Spinner
├── types.ts               # TypeScript interfaces
├── styles.ts              # CSS-in-JS styling
├── Button.example.tsx     # Complete examples and demos
├── Button.test.tsx        # Comprehensive test suite
└── README.md              # This file
```

## Installation

The Button component is already integrated. Import it directly:

```typescript
import { Button } from './components/Button';
```

## Props

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // The visual style variant of the button
  variant?: 'primary' | 'secondary';  // default: 'primary'

  // Whether the button is in a loading state
  isLoading?: boolean;                // default: false

  // Text or element to display while loading
  loadingText?: ReactNode;

  // The content to display inside the button
  children: ReactNode;                // required

  // Whether the button is disabled
  disabled?: boolean;                 // default: false

  // Click event handler
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  // Additional CSS class names
  className?: string;

  // Test ID for testing purposes
  testId?: string;

  // Supports all standard HTML button attributes:
  // type, name, id, form, aria-*, data-*, etc.
}
```

## Usage Examples

### Basic Primary Button

```tsx
import { Button } from './components/Button';

export function App() {
  return (
    <Button onClick={() => console.log('Clicked!')}>
      Click me
    </Button>
  );
}
```

### Secondary Variant

```tsx
<Button variant="secondary">
  Cancel
</Button>
```

### Loading State with Spinner Only

```tsx
import { useState } from 'react';

const [isLoading, setIsLoading] = useState(false);

<Button
  isLoading={isLoading}
  onClick={async () => {
    setIsLoading(true);
    try {
      await saveData();
    } finally {
      setIsLoading(false);
    }
  }}
>
  Save
</Button>
```

### Loading State with Custom Text

```tsx
<Button
  isLoading={isLoading}
  loadingText="Saving..."
>
  Save
</Button>
```

### Disabled Button

```tsx
<Button disabled>
  Disabled Button
</Button>
```

### Different Button Types

```tsx
// Form submission
<Button type="submit">Submit</Button>

// Form reset
<Button type="reset">Reset</Button>

// Regular button (default)
<Button type="button">Click</Button>
```

### With Custom Styling

```tsx
<Button
  variant="primary"
  style={{
    fontSize: '18px',
    padding: '15px 30px',
    borderRadius: '20px'
  }}
>
  Styled Button
</Button>
```

### With Accessibility Attributes

```tsx
<Button
  aria-label="Submit the form"
  aria-describedby="button-description"
>
  Submit
</Button>

<div id="button-description">
  Submit the form with your changes
</div>
```

### Using Ref Forwarding

```tsx
import { useRef } from 'react';
import { Button } from './components/Button';

export function App() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleFocus = () => {
    buttonRef.current?.focus();
  };

  return (
    <>
      <Button ref={buttonRef}>Button</Button>
      <button onClick={handleFocus}>Focus Button</button>
    </>
  );
}
```

### Complex Form Example

```tsx
import { useState } from 'react';
import { Button } from './components/Button';

export function UserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveUserData();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form>
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Saving..."
          onClick={handleSave}
        >
          Save
        </Button>

        <Button variant="secondary">
          Cancel
        </Button>
      </div>

      {isSaved && <p>Changes saved!</p>}
    </form>
  );
}
```

## Variants

### Primary (Default)

- Bold, filled appearance
- Blue background (#2563eb) with white text
- Best for primary actions or CTAs
- Clear hierarchy and prominence

```tsx
<Button variant="primary">Primary Button</Button>
```

**States:**
- Normal: Blue background with white text
- Hover: Darker blue background (#1d4ed8)
- Active: Even darker blue (#1e40af)
- Disabled: Light gray background (#cbd5e1) with reduced opacity

### Secondary

- Outlined or subtle appearance
- Transparent background with blue border and blue text
- Best for secondary actions or alternatives
- Less prominent than primary

```tsx
<Button variant="secondary">Secondary Button</Button>
```

**States:**
- Normal: Transparent background, blue border and text
- Hover: Light blue background (#eff6ff)
- Active: Medium light blue background (#dbeafe)
- Disabled: Gray border and text with reduced opacity

## States

### Normal State

- Button is clickable and responsive
- Normal cursor (pointer)
- Standard colors for the variant

### Loading State

- Shows animated spinner (rotation animation)
- Button is disabled (cannot be clicked)
- Optionally shows custom loading text
- `aria-busy="true"` for accessibility
- Original content is hidden (with `visibility: hidden` for spacing preservation)

```tsx
<Button isLoading={true} loadingText="Processing...">
  Submit
</Button>
```

**Behavior:**
- Spinner rotates at 0.8s per rotation
- Click handler is prevented
- Button appears disabled
- Loading text is optional

### Disabled State

- Button is not clickable
- Grayed-out appearance (reduced opacity)
- Cursor changes to `not-allowed`
- `aria-disabled="true"` for accessibility

```tsx
<Button disabled>Disabled Button</Button>
```

**Behavior:**
- Cannot be clicked
- Appearance is muted
- Click handlers are prevented

## Styling

### CSS-in-JS Approach

The Button component uses inline CSS-in-JS styling via CSSProperties. All styles are defined in `/components/Button/styles.ts`.

### Color Palette

**Primary Variant:**
- Default: #2563eb (Blue)
- Hover: #1d4ed8 (Darker Blue)
- Active: #1e40af (Even Darker Blue)
- Text: #ffffff (White)
- Disabled: #cbd5e1 (Light Gray) background with #94a3b8 (Medium Gray) text

**Secondary Variant:**
- Border: #2563eb (Blue)
- Text: #2563eb (Blue)
- Hover Background: #eff6ff (Light Blue)
- Active Background: #dbeafe (Medium Light Blue)
- Disabled: #cbd5e1 (Light Gray) border with #94a3b8 (Medium Gray) text

### Dimensions

- Padding: 10px 16px (vertical, horizontal)
- Border Radius: 6px
- Min Height: 36px
- Font Size: 14px
- Font Weight: 500
- Gap between elements: 8px

### Custom Styling

You can override default styles using the `style` prop:

```tsx
<Button
  style={{
    fontSize: '16px',
    padding: '12px 24px',
    borderRadius: '8px'
  }}
>
  Custom Button
</Button>
```

Custom styles are merged with variant styles, allowing you to override specific properties while keeping others intact.

## Accessibility

The Button component includes comprehensive accessibility features:

### ARIA Attributes

- `aria-busy`: Set to `true` when loading, `false` otherwise
- `aria-disabled`: Set to `true` when disabled or loading
- `aria-label`: Supports custom labels for screen readers
- `aria-describedby`: Supports additional description references
- `aria-expanded`, `aria-pressed`, `aria-controls`: All standard button ARIA attributes supported

### Keyboard Navigation

- **Tab**: Navigate to the button
- **Enter**: Activate the button
- **Space**: Activate the button (when focused)

### Focus Management

- Visible focus indicator (2px solid outline in blue)
- Clear focus outline at 2px offset
- Proper focus management for disabled/loading states
- Focus style inherits from variant colors

### Screen Reader Support

- Button announces its state (loading, disabled, etc.)
- Spinner has `role="status"` for real-time updates
- Custom `aria-label` support for context-specific descriptions
- Semantic HTML button element

### Example with Full Accessibility

```tsx
<Button
  testId="save-button"
  aria-label="Save your changes"
  aria-describedby="save-description"
>
  Save
</Button>

<div id="save-description">
  Save all pending changes to your profile
</div>
```

## Testing

The component is fully testable with React Testing Library. Key testing aspects:

### Test Selectors

- `getByRole('button')`: Get button by role
- `getByTestId('button-spinner')`: Get the loading spinner
- `getByTestId('custom-id')`: Get button by custom testId prop

### Example Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './components/Button';

describe('Button', () => {
  it('should render', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle clicks', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have correct aria attributes', () => {
    const { rerender } = render(<Button>Normal</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false');

    rerender(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('should prevent clicks during loading', () => {
    const handleClick = jest.fn();
    render(<Button isLoading onClick={handleClick}>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### Test Coverage

The comprehensive test suite covers:
- Rendering and variants
- Disabled and loading states
- Click handlers and event handling
- Button types (button, submit, reset)
- Custom props and HTML attributes
- Accessibility features
- Ref forwarding
- Integration scenarios
- Edge cases

Run tests with:
```bash
npm test -- Button.test.tsx
```

## Animation

The loading spinner uses a CSS animation defined in the `globalAnimationStyles`. The animation rotates the spinner indefinitely at 0.8s per rotation.

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

## Performance Considerations

- **Memoized Styles**: Styles are memoized using `useMemo` to prevent unnecessary recalculations
- **Efficient Re-renders**: Only re-renders when props change
- **Animation Performance**: CSS animations use GPU-accelerated transforms
- **No External Dependencies**: Pure React implementation with no additional libraries
- **One-time Animation Injection**: Global animation styles are injected only once

## Browser Support

The Button component works in all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Best Practices

1. **Always provide meaningful text or aria-label**
   ```tsx
   // Good
   <Button aria-label="Save changes">Save</Button>

   // Also good (text is meaningful)
   <Button>Save</Button>
   ```

2. **Use appropriate button type**
   ```tsx
   // For form submission
   <Button type="submit">Submit</Button>

   // For regular actions
   <Button type="button">Click me</Button>
   ```

3. **Show loading state for async operations**
   ```tsx
   <Button
     isLoading={isLoading}
     loadingText="Saving..."
     onClick={handleSave}
   >
     Save
   </Button>
   ```

4. **Use secondary variant for less important actions**
   ```tsx
   <div style={{ display: 'flex', gap: '12px' }}>
     <Button variant="primary">Confirm</Button>
     <Button variant="secondary">Cancel</Button>
   </div>
   ```

5. **Provide immediate feedback**
   ```tsx
   const handleClick = async () => {
     setIsLoading(true);
     try {
       await performAction();
       // Show success message
     } catch (error) {
       // Show error message
     } finally {
       setIsLoading(false);
     }
   };
   ```

6. **Test both loading and disabled states**
   ```tsx
   // Good - shows clear feedback
   <Button
     isLoading={isLoading}
     disabled={disabled || isLoading}
     loadingText="Processing..."
   >
     Submit
   </Button>
   ```

## Type Exports

The component exports TypeScript types for use in your code:

```typescript
import type { ButtonProps, ButtonVariant } from './components/Button';

// Use in component props
type MyComponentProps = {
  buttonVariant?: ButtonVariant;
  onButtonClick?: ButtonProps['onClick'];
};
```

## Customization Guide

### Changing Colors

Edit `/components/Button/styles.ts` to modify colors:

```typescript
const variantStyles: CSSProperties =
  variant === 'primary'
    ? {
        backgroundColor: '#your-color', // Change this
        color: '#your-text-color',
      }
    : {
        backgroundColor: 'transparent',
        color: '#your-border-color',
        border: '2px solid #your-border-color',
      };
```

### Changing Spacing

Adjust padding and gap in `styles.ts`:

```typescript
padding: '10px 16px', // Change these values
gap: '8px',           // And this
```

### Changing Animation

Modify the spinner animation in `styles.ts`:

```typescript
export const globalAnimationStyles = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
```

## Common Patterns

### Form Submission with Loading

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await submitForm();
    alert('Form submitted!');
  } catch (error) {
    alert('Error: ' + error);
  } finally {
    setIsLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input required />
    <Button type="submit" isLoading={isLoading} loadingText="Submitting...">
      Submit
    </Button>
  </form>
);
```

### Action with Confirmation

```tsx
const [isLoading, setIsLoading] = useState(false);
const [confirmed, setConfirmed] = useState(false);

const handleDelete = async () => {
  if (!confirmed) {
    setConfirmed(true);
    return;
  }
  setIsLoading(true);
  try {
    await deleteItem();
  } finally {
    setIsLoading(false);
    setConfirmed(false);
  }
};

return (
  <Button
    onClick={handleDelete}
    isLoading={isLoading}
    variant={confirmed ? 'primary' : 'secondary'}
  >
    {confirmed ? 'Confirm Delete' : 'Delete'}
  </Button>
);
```

## Troubleshooting

### Button doesn't respond to clicks
- Check if `disabled` or `isLoading` is `true`
- Ensure `onClick` handler is properly defined
- Check browser console for errors

### Loading spinner not visible
- Verify `isLoading={true}` is set
- Check if styles are being loaded correctly
- Inspect element to see if spinner is in DOM

### Accessibility issues
- Always provide meaningful button text or `aria-label`
- Use semantic HTML (button element)
- Test with screen readers (NVDA, JAWS, VoiceOver)

## License

This component is part of the project and follows the same license.
