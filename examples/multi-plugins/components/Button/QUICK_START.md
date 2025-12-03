# Button Component - Quick Start Guide

## Installation

The Button component is already in your project at `/components/Button/`. Just import it:

```typescript
import { Button } from './components/Button';
```

## Basic Usage

### Simple Button
```tsx
<Button onClick={() => console.log('Clicked!')}>
  Click me
</Button>
```

### With Variant
```tsx
<Button variant="secondary">
  Cancel
</Button>
```

## Common Patterns

### Async Operations with Loading
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
  } finally {
    setIsLoading(false);
  }
};

<Button isLoading={isLoading} loadingText="Saving...">
  Save
</Button>
```

### Form Submission
```tsx
<form onSubmit={(e) => {
  e.preventDefault();
  // handle submission
}}>
  <input type="text" placeholder="Enter text" />
  <Button type="submit">Submit</Button>
  <Button type="reset" variant="secondary">Reset</Button>
</form>
```

### Primary and Secondary Buttons Together
```tsx
<div style={{ display: 'flex', gap: '12px' }}>
  <Button variant="primary">Confirm</Button>
  <Button variant="secondary">Cancel</Button>
</div>
```

### With Accessibility
```tsx
<Button
  aria-label="Save your changes"
  aria-describedby="save-description"
>
  Save
</Button>

<div id="save-description">
  Save all pending changes to your profile
</div>
```

### Custom Styling
```tsx
<Button
  style={{
    fontSize: '18px',
    padding: '15px 30px'
  }}
>
  Large Button
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Button style variant |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `loadingText` | `ReactNode` | - | Text to show while loading |
| `disabled` | `boolean` | `false` | Disable the button |
| `onClick` | `function` | - | Click handler |
| `children` | `ReactNode` | - | Button text/content (required) |
| `className` | `string` | - | CSS class name |
| `testId` | `string` | - | Test ID for testing |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| All HTML button attributes | - | - | Supported (id, name, form, etc.) |

## States

### Normal
```tsx
<Button>Click me</Button>
```

### Loading
```tsx
<Button isLoading>Click me</Button>
```

### Loading with Text
```tsx
<Button isLoading loadingText="Processing...">
  Click me
</Button>
```

### Disabled
```tsx
<Button disabled>Click me</Button>
```

## Variants

### Primary (Default)
- Bold, filled style
- Blue background with white text
- Best for main actions

```tsx
<Button variant="primary">Primary</Button>
```

### Secondary
- Outlined style
- Transparent background with blue border
- Best for secondary actions

```tsx
<Button variant="secondary">Secondary</Button>
```

## Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary background | Blue | #2563eb |
| Primary text | White | #ffffff |
| Secondary border | Blue | #2563eb |
| Secondary text | Blue | #2563eb |
| Hover (primary) | Dark Blue | #1d4ed8 |
| Hover (secondary) | Light Blue BG | #eff6ff |
| Disabled | Light Gray | #cbd5e1 |

## Testing

### Render
```tsx
render(<Button>Click me</Button>);
```

### Find Button
```tsx
const button = screen.getByRole('button');
// or
const button = screen.getByText('Click me');
```

### Click
```tsx
fireEvent.click(button);
```

### Check Loading
```tsx
expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
```

### Check Disabled
```tsx
expect(button).toBeDisabled();
```

## TypeScript

```typescript
import { Button } from './components/Button';
import type { ButtonProps, ButtonVariant } from './components/Button';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Common Issues

### Button doesn't respond to clicks
- Check if `disabled` or `isLoading` is true
- Verify `onClick` handler is defined
- Check browser console for errors

### Loading spinner doesn't show
- Make sure `isLoading={true}`
- Verify CSS is loaded properly
- Check browser developer tools

### Styling not applied
- Custom styles should use the `style` prop
- CSS class names use the `className` prop
- Inline styles override variant styles

## Performance Tips

1. Memoize button click handlers for complex operations
2. Use loading state to prevent double-clicks
3. Consider disabling during async operations
4. Use secondary variant for less important actions

## Accessibility

The Button component is fully accessible with:
- ARIA attributes (`aria-busy`, `aria-disabled`)
- Keyboard navigation (Tab, Enter, Space)
- Focus indicators
- Screen reader support

Always provide meaningful button text or `aria-label`.

## Examples

See `/components/Button/Button.example.tsx` for 9 complete working examples.

## Documentation

Full documentation is available in `/components/Button/README.md`.

## Tests

Run the test suite:
```bash
npm test -- Button.test.tsx
```

Test file: `/components/Button/Button.test.tsx`
