// EmergencyFallback.tsx - GUARANTEED to render - prevents white screens
// This is the absolute last line of defense against white screens

export function EmergencyFallback({ error }: { error?: Error }) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'oklch(0.08 0.02 280)',
      color: 'oklch(0.85 0.12 195)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '2rem',
      margin: 0
    }}>
      <div style={{ 
        maxWidth: '600px', 
        width: '100%',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          🦅
        </div>
        
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: 'oklch(0.72 0.20 195)',
          textShadow: '0 0 10px oklch(0.72 0.20 195 / 0.3)'
        }}>
          QUANTUM FALCON COCKPIT
        </h1>
        
        <div style={{
          padding: '1rem',
          background: 'oklch(0.12 0.03 280)',
          border: '1px solid oklch(0.35 0.12 195 / 0.3)',
          marginBottom: '2rem',
          borderRadius: '0.5rem'
        }}>
          <p style={{ 
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600
          }}>
            System Initialization
          </p>
          
          {error && (
            <p style={{
              fontSize: '0.75rem',
              color: 'oklch(0.65 0.25 25)',
              fontFamily: 'monospace',
              marginTop: '0.5rem'
            }}>
              {error.message}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.875rem 2rem',
              background: 'oklch(0.72 0.20 195)',
              color: 'oklch(0.08 0.02 280)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '0.5rem',
              boxShadow: '0 0 20px oklch(0.72 0.20 195 / 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 30px oklch(0.72 0.20 195 / 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px oklch(0.72 0.20 195 / 0.3)';
            }}
          >
            Reload Application
          </button>
          
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '0.875rem 2rem',
              background: 'transparent',
              color: 'oklch(0.68 0.18 330)',
              border: '1px solid oklch(0.68 0.18 330)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'oklch(0.68 0.18 330 / 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Clear Cache & Reload
          </button>
        </div>

        <div style={{
          marginTop: '3rem',
          padding: '1rem',
          background: 'oklch(0.10 0.02 280 / 0.5)',
          borderRadius: '0.5rem',
          border: '1px solid oklch(0.35 0.12 195 / 0.2)'
        }}>
          <p style={{ 
            fontSize: '0.75rem',
            opacity: 0.6,
            marginBottom: '0.5rem'
          }}>
            If the issue persists:
          </p>
          <ul style={{
            fontSize: '0.75rem',
            opacity: 0.7,
            textAlign: 'left',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Try using a different browser</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Disable browser extensions</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Check your internet connection</li>
            <li>✓ Clear browser cache completely</li>
          </ul>
        </div>

        <p style={{ 
          marginTop: '2rem',
          fontSize: '0.625rem',
          opacity: 0.4,
          fontFamily: 'monospace'
        }}>
          Quantum Falcon Cockpit v2025.1.0 • Production
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default EmergencyFallback;
