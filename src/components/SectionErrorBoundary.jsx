import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[SectionErrorBoundary - ${this.props.name || 'Section'}] Caught Error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#fef2f2',
          border: '1.5px solid #fca5a5',
          borderRadius: '16px',
          padding: '1.25rem',
          margin: '0.5rem 0',
          color: '#991b1b',
          fontFamily: 'var(--font-body, sans-serif)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <AlertTriangle size={20} style={{ color: '#dc2626' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#991b1b' }}>
              {this.props.name || 'Section'} Temporarily Unavailable
            </h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#7f1d1d', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
            An isolated component error occurred in this section. The rest of your dashboard remains fully operational.
          </p>
          {this.state.error && (
            <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#dc2626', marginBottom: '0.75rem', overflowX: 'auto' }}>
              {this.state.error.toString()}
            </div>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={13} /> Retry Loading {this.props.name || 'Section'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
