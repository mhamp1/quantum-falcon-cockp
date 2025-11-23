// RenderSafetyWrapper.tsx - Ensures React always renders SOMETHING
// This prevents white screens by providing emergency fallbacks

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasRenderError: boolean;
  renderAttempts: number;
}

export class RenderSafetyWrapper extends Component<Props, State> {
  private renderTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasRenderError: false,
      renderAttempts: 0
    };
  }

  componentDidMount() {
    // Set a timeout to detect if component never renders
    this.renderTimeout = setTimeout(() => {
      console.warn(`[RenderSafetyWrapper] ${this.props.componentName || 'Component'} took >2s to render`);
    }, 2000);
  }

  componentWillUnmount() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[RenderSafetyWrapper] ${this.props.componentName || 'Component'} render error:`, error);
    
    // If we've tried too many times, give up and show fallback
    if (this.state.renderAttempts >= 3) {
      this.setState({ hasRenderError: true });
      return;
    }

    // Otherwise, try to recover
    this.setState(prev => ({ renderAttempts: prev.renderAttempts + 1 }));
    
    // Auto-retry after a short delay
    setTimeout(() => {
      this.setState({ hasRenderError: false });
    }, 1000);
  }

  render() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }

    if (this.state.hasRenderError) {
      const { componentName = 'Component' } = this.props;
      
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'oklch(0.08 0.02 280)',
          color: 'oklch(0.85 0.12 195)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1rem',
              color: 'oklch(0.72 0.20 195)'
            }}>
              ⚠️ {componentName} Failed to Render
            </h2>
            <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
              This component encountered an error and could not recover.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 2rem',
                background: 'oklch(0.72 0.20 195)',
                color: 'oklch(0.08 0.02 280)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                borderRadius: '0.5rem'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RenderSafetyWrapper;
