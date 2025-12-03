import React, { useState, useRef } from 'react';
import { Button } from './index';

/**
 * Complete Button Component Examples
 *
 * This file demonstrates all the features and use cases of the Button component.
 */

export const ButtonExamples: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [variant, setVariant] = useState<'primary' | 'secondary'>('primary');
  const [disabled, setDisabled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSimpleClick = () => {
    console.log('Button clicked!');
  };

  const handleAsyncClick = async () => {
    setIsLoading(true);
    try {
      // Simulate async operation (e.g., API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Operation completed!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>Button Component Examples</h1>

      {/* Section 1: Variants */}
      <section style={{ marginBottom: '40px' }}>
        <h2>1. Button Variants</h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={handleSimpleClick}>
            Primary Button
          </Button>

          <Button variant="secondary" onClick={handleSimpleClick}>
            Secondary Button
          </Button>
        </div>

        <p style={{ marginTop: '16px', color: '#666' }}>
          Primary: Bold, filled style (blue background, white text)
          <br />
          Secondary: Outlined style (transparent background, blue border)
        </p>
      </section>

      {/* Section 2: Loading States */}
      <section style={{ marginBottom: '40px' }}>
        <h2>2. Loading States</h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button isLoading={isLoading} onClick={handleAsyncClick}>
            Click to Load (spinner only)
          </Button>

          <Button isLoading={isLoading} loadingText="Processing...">
            Async Operation
          </Button>

          <Button isLoading variant="secondary" loadingText="Loading...">
            Secondary Loading
          </Button>

          <button
            onClick={() => setIsLoading(!isLoading)}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              backgroundColor: '#f0f0f0',
            }}
          >
            Toggle Loading
          </button>
        </div>

        <p style={{ marginTop: '16px', color: '#666' }}>
          When isLoading is true, the button automatically becomes disabled and shows a
          loading spinner. Optionally, you can provide loadingText to display custom text.
        </p>
      </section>

      {/* Section 3: Disabled State */}
      <section style={{ marginBottom: '40px' }}>
        <h2>3. Disabled State</h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button disabled={disabled} variant="primary">
            Primary Disabled
          </Button>

          <Button disabled={disabled} variant="secondary">
            Secondary Disabled
          </Button>

          <button
            onClick={() => setDisabled(!disabled)}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              backgroundColor: '#f0f0f0',
            }}
          >
            Toggle Disabled
          </button>
        </div>

        <p style={{ marginTop: '16px', color: '#666' }}>
          Disabled buttons have a grayed-out appearance and cursor changes to not-allowed.
          Click handlers are automatically prevented when disabled.
        </p>
      </section>

      {/* Section 4: Button Types */}
      <section style={{ marginBottom: '40px' }}>
        <h2>4. Button Types</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted!');
          }}
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Button type="button" onClick={handleSimpleClick}>
            type="button"
          </Button>

          <Button type="submit">type="submit"</Button>

          <Button type="reset">type="reset"</Button>
        </form>

        <p style={{ marginTop: '16px', color: '#666' }}>
          Buttons support standard HTML button types: button, submit, and reset.
        </p>
      </section>

      {/* Section 5: Ref Forwarding */}
      <section style={{ marginBottom: '40px' }}>
        <h2>5. Ref Forwarding</h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            ref={buttonRef}
            onClick={() => {
              console.log('Button ref:', buttonRef.current);
              buttonRef.current?.focus();
            }}
          >
            Click to Log Ref
          </Button>

          <span style={{ color: '#666' }}>Check console to see the button ref</span>
        </div>
      </section>

      {/* Section 6: Custom Styling */}
      <section style={{ marginBottom: '40px' }}>
        <h2>6. Custom Styling</h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            style={{
              fontSize: '18px',
              padding: '15px 30px',
              borderRadius: '20px',
            }}
          >
            Custom Style Button
          </Button>

          <Button
            variant="secondary"
            style={{
              fontSize: '12px',
              padding: '5px 10px',
              borderRadius: '3px',
            }}
          >
            Small Variant
          </Button>
        </div>

        <p style={{ marginTop: '16px', color: '#666' }}>
          You can override default styles using the style prop. Custom styles are merged
          with the variant styles.
        </p>
      </section>

      {/* Section 7: Accessibility */}
      <section style={{ marginBottom: '40px' }}>
        <h2>7. Accessibility Features</h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            testId="accessible-button-1"
            aria-label="Submit the form with additional context"
          >
            Button with ARIA Label
          </Button>

          <Button
            testId="accessible-button-2"
            aria-describedby="button-description"
            loadingText="Processing..."
            isLoading={false}
          >
            Button with Description
          </Button>

          <div id="button-description" style={{ color: '#666', fontSize: '12px' }}>
            This button has additional description for screen readers.
          </div>
        </div>

        <p style={{ marginTop: '16px', color: '#666' }}>
          The Button component includes:
          <ul>
            <li>aria-busy attribute for loading state</li>
            <li>aria-disabled attribute for disabled state</li>
            <li>Support for custom aria-label and aria-describedby</li>
            <li>Proper keyboard navigation (Tab, Enter, Space)</li>
            <li>Focus management with visible focus indicator</li>
            <li>data-testid for testing purposes</li>
          </ul>
        </p>
      </section>

      {/* Section 8: Complex Example */}
      <section style={{ marginBottom: '40px' }}>
        <h2>8. Complex Example: Form-like Interaction</h2>

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '400px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>User Settings</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Theme:
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value as 'primary' | 'secondary')}
                style={{
                  marginLeft: '8px',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant={variant}
              isLoading={isLoading}
              loadingText="Saving..."
              onClick={handleAsyncClick}
              style={{ flex: 1 }}
            >
              Save Settings
            </Button>

            <Button
              variant={variant === 'primary' ? 'secondary' : 'primary'}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </section>

      {/* Props Reference */}
      <section style={{ marginBottom: '40px' }}>
        <h2>9. Props Reference</h2>

        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: '12px',
              lineHeight: '1.5',
            }}
          >
            {`interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
  // type, name, id, form, disabled, tabIndex, etc.
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ButtonExamples;
