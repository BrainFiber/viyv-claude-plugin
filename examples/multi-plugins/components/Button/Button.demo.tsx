import React, { useState } from 'react';
import { Button } from './index';

/**
 * Demo component showcasing all Button variations and states
 */
export const ButtonDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);

  const handlePrimaryClick = async () => {
    setPrimaryLoading(true);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPrimaryLoading(false);
  };

  const handleSecondaryClick = async () => {
    setSecondaryLoading(true);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSecondaryLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1>Button Component Demo</h1>

      {/* Basic Variants */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Basic Variants</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </div>
      </section>

      {/* Loading States */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Loading States</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button isLoading variant="primary">
            Loading
          </Button>
          <Button isLoading variant="secondary">
            Loading
          </Button>
          <Button isLoading loadingText="Processing..." variant="primary">
            Save
          </Button>
          <Button isLoading loadingText="Submitting..." variant="secondary">
            Submit
          </Button>
        </div>
      </section>

      {/* Disabled States */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Disabled States</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button disabled variant="primary">
            Disabled Primary
          </Button>
          <Button disabled variant="secondary">
            Disabled Secondary
          </Button>
        </div>
      </section>

      {/* Interactive Loading */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Interactive Loading (Click to trigger)</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            isLoading={primaryLoading}
            loadingText="Saving..."
            onClick={handlePrimaryClick}
            variant="primary"
          >
            Save Changes
          </Button>
          <Button
            isLoading={secondaryLoading}
            loadingText="Submitting..."
            onClick={handleSecondaryClick}
            variant="secondary"
          >
            Submit Form
          </Button>
        </div>
      </section>

      {/* Different Button Types */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Button Types</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button type="button" variant="primary">
            Type: button
          </Button>
          <Button type="submit" variant="primary">
            Type: submit
          </Button>
          <Button type="reset" variant="secondary">
            Type: reset
          </Button>
        </div>
      </section>

      {/* Custom Styling */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Custom Styling</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
            }}
          >
            Large Button
          </Button>
          <Button
            variant="secondary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
            }}
          >
            Small Button
          </Button>
        </div>
      </section>

      {/* Color Variants Example */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Usage with Form</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePrimaryClick();
          }}
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
          }}
        >
          <Button type="submit" isLoading={isLoading} variant="primary">
            {isLoading ? 'Processing...' : 'Submit'}
          </Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </form>
      </section>

      {/* Accessibility Info */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Accessibility Features</h2>
        <ul>
          <li>aria-busy set to true when loading</li>
          <li>aria-disabled set when button is disabled</li>
          <li>Keyboard navigation support (Tab, Enter, Space)</li>
          <li>Focus styles for visibility</li>
          <li>Proper semantic HTML button element</li>
          <li>Status role on spinner for screen readers</li>
        </ul>
      </section>
    </div>
  );
};

export default ButtonDemo;
