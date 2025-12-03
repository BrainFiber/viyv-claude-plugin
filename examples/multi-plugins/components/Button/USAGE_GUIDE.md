# Button Component Usage Guide

Complete guide for using the Button component in your React applications.

## Quick Start

### Import

```typescript
import { Button } from './components/Button';
import type { ButtonProps } from './components/Button';
```

### Basic Usage

```tsx
<Button onClick={() => alert('Button clicked!')}>
  Click me
</Button>
```

## Real-World Examples

### 1. Form with Submit and Cancel Buttons

```tsx
import { useState } from 'react';
import { Button } from './components/Button';

export function UserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Submission failed');
      alert('User created successfully!');
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" required placeholder="Username" />
      <input type="email" name="email" required placeholder="Email" />

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="Creating user..."
        >
          Create User
        </Button>
        <Button type="reset" variant="secondary">
          Clear Form
        </Button>
      </div>
    </form>
  );
}
```

### 2. Async Action Button with Error Handling

```tsx
import { useState } from 'react';
import { Button } from './components/Button';

export function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Button
        variant="secondary"
        isLoading={isDeleting}
        loadingText="Deleting..."
        onClick={handleDelete}
        disabled={isDeleting}
        style={{ color: '#dc2626' }}
      >
        Delete Item
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### 3. Button Group for Pagination

```tsx
import { Button } from './components/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Button
        disabled={!canGoPrevious || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        isLoading={isLoading}
      >
        Previous
      </Button>

      <span style={{ margin: '0 12px' }}>
        Page {currentPage} of {totalPages}
      </span>

      <Button
        disabled={!canGoNext || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        isLoading={isLoading}
      >
        Next
      </Button>
    </div>
  );
}
```

### 4. Multi-Step Form Wizard

```tsx
import { useState } from 'react';
import { Button } from './components/Button';

type Step = 'personal' | 'address' | 'confirmation';

export function FormWizard() {
  const [step, setStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: Step[] = ['personal', 'address', 'confirmation'];
  const currentStepIndex = steps.indexOf(step);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      // Submit form
      setIsSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate submission
        alert('Form submitted successfully!');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handlePrevious = () => {
    setStep(steps[currentStepIndex - 1]);
  };

  return (
    <div>
      <h2>Step {currentStepIndex + 1}: {step}</h2>

      {/* Step content */}
      <div style={{ minHeight: '200px', marginBottom: '20px' }}>
        {/* Render current step content */}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
        <Button
          onClick={handlePrevious}
          disabled={isFirstStep}
          variant="secondary"
        >
          Previous
        </Button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ alignSelf: 'center', color: '#666' }}>
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <Button
            onClick={handleNext}
            isLoading={isSubmitting && isLastStep}
            loadingText={isLastStep ? 'Submitting...' : undefined}
          >
            {isLastStep ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 5. With Custom Styling and Theme Support

```tsx
import { useState } from 'react';
import { Button } from './components/Button';
import type { ButtonProps } from './components/Button';

type Theme = 'light' | 'dark';

const themeColors = {
  light: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryDark: '#1e40af',
    secondary: '#f3f4f6',
    text: '#1f2937',
  },
  dark: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryDark: '#1d4ed8',
    secondary: '#374151',
    text: '#f3f4f6',
  },
};

interface ThemedButtonProps extends ButtonProps {
  theme?: Theme;
}

export function ThemedButton({
  theme = 'light',
  variant = 'primary',
  ...props
}: ThemedButtonProps) {
  const colors = themeColors[theme];

  const themeStyles: React.CSSProperties =
    variant === 'primary'
      ? {
          backgroundColor: colors.primary,
          color: theme === 'light' ? '#fff' : '#fff',
        }
      : {
          backgroundColor: colors.secondary,
          color: colors.text,
          borderColor: colors.primary,
        };

  return (
    <Button variant={variant} style={themeStyles} {...props} />
  );
}

// Usage
export function ThemedButtonExample() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div style={{
      backgroundColor: theme === 'light' ? '#fff' : '#1f2937',
      color: theme === 'light' ? '#000' : '#fff',
      padding: '20px',
    }}>
      <ThemedButton theme={theme}>
        Light Theme Button
      </ThemedButton>

      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### 6. Loading Button with Timeout

```tsx
import { useState, useCallback } from 'react';
import { Button } from './components/Button';

interface LoadingButtonWithTimeoutProps {
  action: () => Promise<void>;
  timeout?: number; // milliseconds
}

export function LoadingButtonWithTimeout({
  action,
  timeout = 5000,
}: LoadingButtonWithTimeoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Create a race between the action and timeout
      await Promise.race([
        action(),
        new Promise((_, reject) =>
          (timeoutId = setTimeout(
            () => reject(new Error('Operation timed out')),
            timeout
          ))
        ),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [action, timeout]);

  return (
    <div>
      <Button
        isLoading={isLoading}
        loadingText="Processing..."
        onClick={handleClick}
      >
        Execute Action
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

// Usage
export function TimeoutExample() {
  const handleSlowAction = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  return (
    <LoadingButtonWithTimeout action={handleSlowAction} timeout={5000} />
  );
}
```

### 7. Button with Keyboard Shortcuts

```tsx
import { useEffect, useRef } from 'react';
import { Button } from './components/Button';

interface KeyboardShortcutButtonProps {
  shortcut: string; // e.g., 'Ctrl+S', 'Cmd+S'
  onShortcut: () => void;
  children: React.ReactNode;
}

export function KeyboardShortcutButton({
  shortcut,
  onShortcut,
  children,
}: KeyboardShortcutButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (shortcut.includes('Ctrl') || shortcut.includes('Cmd')) {
        if (modifierKey && event.key.toUpperCase() === 'S') {
          event.preventDefault();
          buttonRef.current?.click();
          onShortcut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, onShortcut]);

  return (
    <Button
      ref={buttonRef}
      onClick={onShortcut}
      title={`Keyboard shortcut: ${shortcut}`}
    >
      {children} <small style={{ opacity: 0.7 }}>({shortcut})</small>
    </Button>
  );
}
```

### 8. Conditional Button States

```tsx
import { useState } from 'react';
import { Button } from './components/Button';

export function ConditionalStateButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleAction = async () => {
    setStatus('loading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return 'Processing...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error!';
      default:
        return 'Click me';
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case 'success':
        return { backgroundColor: '#10b981' };
      case 'error':
        return { backgroundColor: '#ef4444' };
      default:
        return {};
    }
  };

  return (
    <Button
      isLoading={status === 'loading'}
      onClick={handleAction}
      disabled={status !== 'idle'}
      style={getButtonStyle()}
    >
      {getButtonContent()}
    </Button>
  );
}
```

## Best Practices

1. **Always handle loading states properly**:
   ```tsx
   const [isLoading, setIsLoading] = useState(false);

   const handleClick = async () => {
     setIsLoading(true);
     try {
       await someAsyncAction();
     } finally {
       setIsLoading(false);
     }
   };
   ```

2. **Use appropriate variants**:
   - Primary for main actions
   - Secondary for less important actions

3. **Provide feedback**:
   - Use `loadingText` to inform users what's happening
   - Show success/error messages

4. **Consider accessibility**:
   - Button automatically has ARIA attributes
   - Ensure proper button type for forms

5. **Style consistently**:
   - Keep custom styling minimal
   - Use theme system for consistency

6. **Test properly**:
   - Test click handlers
   - Test loading states
   - Test form submissions
   - Test keyboard navigation

## Common Patterns

### Loading with Optimistic UI

```tsx
const handleAction = async () => {
  // Optimistically update UI
  setStatus('success');
  setIsLoading(true);

  try {
    await submitToServer();
  } catch (error) {
    // Rollback on error
    setStatus('error');
  } finally {
    setIsLoading(false);
  }
};
```

### Debounced Button Clicks

```tsx
import { useRef, useCallback } from 'react';

export function DebouncedButton() {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleClick = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Handle click
    }, 300);
  }, []);

  return <Button onClick={handleClick}>Click</Button>;
}
```

## Troubleshooting

### Button not responding to clicks
- Check if `disabled` prop is true
- Check if `isLoading` prop is true
- Verify `onClick` handler is properly defined

### Loading spinner not showing
- Ensure `isLoading={true}` is set
- Check if CSS animations are enabled in browser
- Verify global styles are injected

### Styles not applying
- Check CSS specificity
- Ensure custom styles don't override important properties
- Use inline styles for higher specificity
