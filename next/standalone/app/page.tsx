export default function StandaloneHealthPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '40rem' }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'hsl(var(--platform-accent))',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          margin: '0 0 0.5rem',
        }}
      >
        AI Platform Console + Model Deployment Monitor (non-composed baseline)
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.5rem' }}>Next Standalone</h1>
      <p>Scaffold healthy on port 3002. No Module Federation, no iframe.</p>
    </main>
  );
}
