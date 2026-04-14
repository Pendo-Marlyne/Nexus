export function NexusLogo({ compact = false }) {
  return (
    <div className="nexus-logo" aria-label="Nexus logo">
      <svg viewBox="0 0 80 80" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="nexus-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="34" fill="none" stroke="url(#nexus-g)" strokeWidth="5" />
        <path d="M24 52 L24 28 L56 52 L56 28" fill="none" stroke="url(#nexus-g)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <div>
          <strong>NEXUS</strong>
          <p>Creative Ops Cloud</p>
        </div>
      )}
    </div>
  )
}
