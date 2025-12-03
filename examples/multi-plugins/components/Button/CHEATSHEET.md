# Button Component Cheatsheet

Quick reference guide for the Button component.

## Import

```typescript
import { Button } from './components/Button';
import type { ButtonProps } from './components/Button';
```

## Basic Usage

```tsx
<Button>Click me</Button>
<Button onClick={handleClick}>Click me</Button>
<Button>Disabled</Button>
<Button type="submit">Submit Form</Button>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Button style variant |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `loadingText` | `string` | `undefined` | Text to show while loading |
| `disabled` | `boolean` | `false` | Disable the button |
| `onClick` | `(e: MouseEvent) => void` | `undefined` | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `className` | `string` | `''` | CSS class name |
| `style` | `CSSProperties` | `{}` | Inline styles |
| `ref` | `React.Ref<HTMLButtonElement>` | `undefined` | Forward ref |
| `children` | `ReactNode` | Required | Button content |
| ...rest | `ButtonHTMLAttributes` | - | All standard button attributes |

## Common Patterns

### Primary Button
```tsx
<Button variant="primary">Primary Action</Button>
```

### Secondary Button
```tsx
<Button variant="secondary">Secondary Action</Button>
```

### Loading Button
```tsx
<Button isLoading>Loading...</Button>
<Button isLoading loadingText="Saving...">Save</Button>
```

### Disabled Button
```tsx
<Button disabled>Disabled</Button>
```

### Form Button
```tsx
<Button type="submit">Submit</Button>
<Button type="reset" variant="secondary">Reset</Button>
```

### With Click Handler
```tsx
<Button onClick={() => alert('Clicked!')}>Click me</Button>
```

### With Ref
```tsx
const buttonRef = useRef<HTMLButtonElement>(null);
<Button ref={buttonRef}>Button</Button>
```

### Custom Styling
```tsx
<Button style={{ padding: '12px 24px', fontSize: '16px' }}>
  Large Button
</Button>
```

### Loading with State
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleClick = async () => {
  setIsLoading(true);
  await someAction();
  setIsLoading(false);
};

<Button isLoading={isLoading} onClick={handleClick}>
  Save
</Button>
```

## State Management Pattern

```tsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setIsLoading(true);
  setError(null);

  try {
    await submitData();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

<Button
  isLoading={isLoading}
  loadingText="Submitting..."
  onClick={handleSubmit}
>
  Submit
</Button>

{error && <p style={{ color: 'red' }}>{error}</p>}
```

## Form Integration

```tsx
<form onSubmit={(e) => {
  e.preventDefault();
  handleSubmit();
}}>
  <input type="text" />
  <Button type="submit">Submit</Button>
  <Button type="reset" variant="secondary">Clear</Button>
</form>
```

## Button Group

```tsx
<div style={{ display: 'flex', gap: '12px' }}>
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
</div>
```

## Accessibility Features

Automatic:
- `aria-busy="true"` when loading
- `aria-disabled="true"` when disabled
- Keyboard navigation (Tab, Enter, Space)
- Focus visible styles
- Semantic HTML button element

## Color Scheme

### Primary
- Default: `#2563eb`
- Hover: `#1d4ed8`
- Active: `#1e40af`

### Secondary
- Border: `#2563eb`
- Text: `#2563eb`
- Hover BG: `#eff6ff`

## Styling Tips

### Change Color
```tsx
<Button style={{ backgroundColor: '#ff0000' }}>Red</Button>
```

### Change Size
```tsx
<Button style={{ padding: '12px 24px', fontSize: '16px' }}>Large</Button>
```

### Rounded Corners
```tsx
<Button style={{ borderRadius: '12px' }}>Rounded</Button>
```

### Full Width
```tsx
<Button style={{ width: '100%' }}>Full Width</Button>
```

### With Icon Classes
```tsx
<Button className="with-icon">
  <IconComponent /> Click me
</Button>
```

## Testing Examples

### Test Rendering
```tsx
import { render, screen } from '@testing-library/react';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Test Click
```tsx
test('handles click', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Test Loading
```tsx
test('shows loading state', () => {
  render(<Button isLoading>Loading</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
});
```

### Test Disabled
```tsx
test('button disabled', () => {
  render(<Button disabled>Disabled</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

## Props Combinations

### Save Button
```tsx
<Button
  isLoading={isSaving}
  loadingText="Saving..."
  onClick={handleSave}
>
  Save Changes
</Button>
```

### Delete Button
```tsx
<Button
  variant="secondary"
  onClick={handleDelete}
  style={{ color: '#dc2626' }}
>
  Delete
</Button>
```

### Submit Form
```tsx
<Button
  type="submit"
  isLoading={isSubmitting}
  loadingText="Submitting..."
>
  Submit Form
</Button>
```

### Disabled Action
```tsx
<Button
  disabled={!formValid}
  onClick={handleAction}
>
  Continue
</Button>
```

## Variants Comparison

| Feature | Primary | Secondary |
|---------|---------|-----------|
| Background | Solid Blue | Transparent |
| Text Color | White | Blue |
| Border | None | Blue Border |
| Use Case | Main Action | Alternative |

## Performance Tips

1. Memoize click handlers
2. Use useCallback for event handlers
3. Avoid recreating style objects
4. Use className for repeated styles

```tsx
const handleClick = useCallback(() => {
  doSomething();
}, []);

<Button onClick={handleClick}>Optimized</Button>
```

## Common Mistakes

### Don't
```tsx
// Object recreation on every render
<Button onClick={() => setState(!state)} />

// Not setting loading state
<Button isLoading onClick={asyncFn} />

// Missing error handling
<Button onClick={apiCall} />
```

### Do
```tsx
// Memoized callback
const handleClick = useCallback(() => setState(prev => !prev), []);
<Button onClick={handleClick} />

// Handle loading properly
const [loading, setLoading] = useState(false);
<Button
  isLoading={loading}
  onClick={async () => {
    setLoading(true);
    await apiCall();
    setLoading(false);
  }}
/>

// Handle errors
<Button onClick={async () => {
  try {
    await apiCall();
  } catch (error) {
    setError(error.message);
  }
}} />
```

## Browser DevTools Tips

1. Check ARIA attributes: `aria-busy`, `aria-disabled`
2. Inspect computed styles
3. Use accessibility inspector
4. Test keyboard navigation with Tab key
5. Verify focus outline visibility

## TypeScript Tips

```tsx
// Import types
import type { ButtonProps, ButtonVariant } from './Button';

// Type your handler
const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
  e.preventDefault();
  doSomething();
};

// Type variant
const variant: ButtonVariant = 'primary';

// Extend props
interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}
```

## Animation Details

- Spin animation: `0.8s linear infinite`
- Transition: `200ms ease-in-out`
- CSS: `@keyframes spin { to { transform: rotate(360deg); } }`

## Accessibility Checklist

- [ ] Button has descriptive text
- [ ] Click handler works with Enter/Space
- [ ] Loading state has aria-busy
- [ ] Disabled state has aria-disabled
- [ ] Focus outline visible
- [ ] Color not only indicator

## File Structure
```
Button/
├── index.tsx           (Component)
├── types.ts            (Types)
├── styles.ts           (Styles)
├── index.ts            (Exports)
├── Button.demo.tsx     (Demo)
├── Button.test.tsx     (Tests)
├── README.md           (Docs)
└── USAGE_GUIDE.md      (Examples)
```

## Next Steps

1. Copy component to your project
2. Import where needed
3. Customize colors if desired
4. Run tests to verify
5. Use in your application
6. Reference docs for questions

## Support Resources

- README.md - Full documentation
- USAGE_GUIDE.md - Real-world examples
- Button.test.tsx - Test examples
- Button.demo.tsx - Component showcase
