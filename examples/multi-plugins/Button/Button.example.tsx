import React, { useState } from 'react';
import Button from './index';

/**
 * Comprehensive example demonstrating all Button component variants and states
 */
export const ButtonExamples: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // Simulate async operation
  const handleAsyncClick = async () => {
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus('Success!');
    } catch (error) {
      setSubmitStatus('Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Button Component Examples</h1>

      {/* Basic Variants */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Basic Variants</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={handleClick}>
            Primary Button
          </Button>
          <Button variant="secondary" onClick={handleClick}>
            Secondary Button
          </Button>
        </div>
      </section>

      {/* Loading States */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Loading States</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="primary" loading>
            Loading Primary
          </Button>
          <Button variant="secondary" loading>
            Loading Secondary
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleAsyncClick}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Form'}
          </Button>
        </div>
      </section>

      {/* Disabled States */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Disabled States</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="primary" disabled>
            Disabled Primary
          </Button>
          <Button variant="secondary" disabled>
            Disabled Secondary
          </Button>
        </div>
      </section>

      {/* Different Button Types */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Different Button Types</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button type="button" variant="primary">
            Button Type
          </Button>
          <Button type="submit" variant="primary">
            Submit Type
          </Button>
          <Button type="reset" variant="secondary">
            Reset Type
          </Button>
        </div>
      </section>

      {/* With Custom Class */}
      <section style={{ marginBottom: '40px' }}>
        <h2>With Custom Styling</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            className="custom-button"
            onClick={handleClick}
            style={{ padding: '12px 24px', fontSize: '16px' }}
          >
            Custom Styled Button
          </Button>
        </div>
      </section>

      {/* Status Display */}
      {submitStatus && (
        <section style={{ marginBottom: '40px' }}>
          <p
            style={{
              padding: '16px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '4px',
              border: '1px solid #c3e6cb',
            }}
          >
            {submitStatus}
          </p>
        </section>
      )}

      {/* Form Example */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Form Integration</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsyncClick();
          }}
          style={{
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              disabled={isLoading}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? 'Submitting' : 'Submit'}
            </Button>
            <Button
              type="reset"
              variant="secondary"
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>
      </section>

      {/* Accessibility Notes */}
      <section style={{ marginBottom: '40px', fontSize: '12px', color: '#666' }}>
        <h3>Accessibility Features</h3>
        <ul>
          <li>aria-busy attribute for loading state</li>
          <li>aria-disabled attribute for disabled state</li>
          <li>Proper type attribute support</li>
          <li>Keyboard navigation support</li>
          <li>Visual feedback on hover and active states</li>
          <li>Spinner is hidden from screen readers (aria-hidden)</li>
        </ul>
      </section>
    </div>
  );
};

export default ButtonExamples;
