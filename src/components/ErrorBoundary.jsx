import { Component } from 'react'

// Catches render/runtime errors anywhere below it and shows a friendly screen
// instead of a blank white page. Uses inline styles so it works even if the
// stylesheet failed to load. Logs the error to the console (and to Sentry if present).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Always log so you can see it in the browser console / hosting logs.
    console.error('DooarsGo crashed:', error, info)
    // If you add Sentry later, it will pick this up automatically:
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error)
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: '#ecfdf5', fontFamily: 'system-ui, sans-serif', textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 360, background: '#fff', borderRadius: 20, padding: 28,
          boxShadow: '0 10px 30px rgba(15,90,46,0.12)',
        }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🛺</div>
          <h1 style={{ color: '#14532d', fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#475569', fontSize: 14, margin: '0 0 20px' }}>
            Sorry about that. Please reload the page — your account and rides are safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%', padding: '12px 16px', border: 'none', borderRadius: 12,
              background: '#15803d', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            Reload
          </button>
          <button
            onClick={() => { window.location.href = '/' }}
            style={{
              width: '100%', marginTop: 8, padding: '12px 16px', borderRadius: 12,
              border: '1px solid #e2e8f0', background: '#fff', color: '#334155',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Go to home
          </button>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 16 }}>
            Still stuck? <a href="mailto:support.dooarsgo@gmail.com" style={{ color: '#15803d', fontWeight: 600 }}>support.dooarsgo@gmail.com</a>
          </p>
        </div>
      </div>
    )
  }
}
