import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Reader App Render Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-app, #f8fafc)',
            color: 'var(--text-main, #0f172a)',
            padding: '24px'
          }}
        >
          <div
            style={{
              maxWidth: '580px',
              width: '100%',
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: '20px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Reader Encountered An Error
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                  A component rendering issue occurred while loading this document.
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-hover, #f1f5f9)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#dc2626',
                wordBreak: 'break-word',
                maxHeight: '160px',
                overflowY: 'auto'
              }}
            >
              {this.state.error?.toString()}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-color, #3b82f6)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Home size={15} />
                <span>Return to Home</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover, #f1f5f9)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} />
                <span>Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

