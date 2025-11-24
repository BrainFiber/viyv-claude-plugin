# Button Component - Quick Start Guide

## Installation

Copy the Button folder to your project's components directory:

```bash
cp -r Button/ src/components/
```

## Basic Import

```tsx
import Button from './Button';
// or with named import
import { Button } from './Button';
```

## 5-Minute Examples

### Example 1: Simple Button
```tsx
import Button from './Button';

function MyComponent() {
  return <Button onClick={() => alert('Clicked!')}>Click Me</Button>;
}
```

### Example 2: Loading State
```tsx
import { useState } from 'react';
import Button from './Button';

function SubmitButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await fetch('/api/data');
    setLoading(false);
  };

  return (
    <Button loading={loading} onClick={handleClick}>
      {loading ? 'Submitting...' : 'Submit'}
    </Button>
  );
}
```

### Example 3: Form
```tsx
import Button from './Button';

function LoginForm() {
  return (
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <Button type="submit" variant="primary">
        Login
      </Button>
      <Button type="reset" variant="secondary">
        Clear
      </Button>
    </form>
  );
}
```

### Example 4: Button Groups
```tsx
import Button from './Button';

function ActionButtons() {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="primary" onClick={() => {}}>
        Save
      </Button>
      <Button variant="secondary" onClick={() => {}}>
        Cancel
      </Button>
      <Button disabled>
        Delete
      </Button>
    </div>
  );
}
```

### Example 5: All Props
```tsx
import { useRef } from 'react';
import Button from './Button';

function AdvancedButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <Button
      ref={buttonRef}
      variant="primary"
      type="button"
      loading={false}
      disabled={false}
      className="custom-class"
      onClick={() => console.log('clicked')}
      style={{ padding: '12px 24px' }}
      aria-label="My Custom Button"
      data-custom="value"
    >
      Advanced Button
    </Button>
  );
}
```

## Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' | 'primary' | Button style variant |
| loading | boolean | false | Shows spinner, disables button |
| disabled | boolean | false | Disables the button |
| children | ReactNode | required | Button content |
| onClick | function | undefined | Click handler |
| type | 'button' \| 'submit' \| 'reset' | 'button' | HTML button type |
| className | string | '' | CSS class name |
| style | CSSProperties | {} | Inline styles |
| ref | React.Ref | undefined | Forward ref |

Plus all standard HTML button attributes (id, aria-*, data-*, etc.)

## Common Patterns

### Prevent Double Submit
```tsx
<Button loading={loading} disabled={loading} onClick={handleSubmit}>
  Submit
</Button>
```

### Conditional Rendering
```tsx
{isAuthorized && <Button>Delete</Button>}
```

### With Custom Styling
```tsx
<Button
  className="my-custom-button"
  style={{ fontSize: '16px', padding: '12px 24px' }}
>
  Custom
</Button>
```

### With Ref
```tsx
const buttonRef = useRef<HTMLButtonElement>(null);

<Button ref={buttonRef}>Focus Me</Button>

// Later:
buttonRef.current?.focus();
```

## Styling

### Default Colors

**Primary Button**
- Background: Blue (#007bff)
- Text: White

**Secondary Button**
- Background: Gray (#6c757d)
- Text: White

### Custom Colors

Edit `/Button/styles.ts`:

```typescript
export const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#your-primary-color',
    color: '#your-text-color',
  },
  secondary: {
    backgroundColor: '#your-secondary-color',
    color: '#your-text-color',
  },
};
```

## Accessibility

The component includes:
- ARIA attributes (aria-busy, aria-disabled)
- Keyboard navigation (Enter, Space)
- Screen reader support
- Semantic HTML button element

No additional configuration needed!

## Testing

Run the test suite:

```bash
npm test Button.test.tsx
```

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```

## TypeScript

Full type support out of the box:

```tsx
import Button, { type ButtonProps } from './Button';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Troubleshooting

### Button doesn't disable when loading
```tsx
// Make sure to add disabled prop
<Button loading={loading} disabled={loading}>
  Submit
</Button>
```

### onClick not firing
```tsx
// Make sure button is not disabled
<Button onClick={handler} disabled={false}>
  Click
</Button>
```

### Styles not applying
```tsx
// Use inline style prop or className
<Button style={{ padding: '16px' }}>
  Button
</Button>
```

### Animation not showing
The spinner animation is injected automatically. Make sure:
- Component is mounted
- loading prop is true
- Browser supports CSS animations

## Next Steps

1. Review `/Button/README.md` for complete documentation
2. Check `/Button/Button.example.tsx` for more examples
3. Look at `/Button/Button.test.tsx` for testing patterns
4. Customize colors in `/Button/styles.ts` if needed

## File Reference

- **Main Component**: `Button/index.tsx`
- **Types**: `Button/types.ts`
- **Styles**: `Button/styles.ts`
- **Examples**: `Button/Button.example.tsx`
- **Tests**: `Button/Button.test.tsx`
- **Docs**: `Button/README.md`

## API Quick Reference

```tsx
// Basic
<Button>Click</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// Types
<Button type="submit">Submit</Button>
<Button type="reset">Reset</Button>

// Events
<Button onClick={handler}>Click</Button>

// Styling
<Button className="custom" style={{ padding: '16px' }}>
  Styled
</Button>

// Ref
<Button ref={buttonRef}>With Ref</Button>

// Form Integration
<form>
  <Button type="submit">Submit</Button>
  <Button type="reset">Clear</Button>
</form>
```

## Support

For detailed documentation, see:
- `README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `Button.example.tsx` - Runnable examples
- `Button.test.tsx` - Test patterns

Happy coding!
