// components/ProcessShellArsenal/ui/SocketDiagnostics.tsx

interface SocketDiagnosticsProps {
  info: {
    localAddress: string;
    localPort: number;
    localFamily: string;
    remoteAddress: string;
    remotePort: number;
    remoteFamily: string;
  };
}

export function SocketDiagnostics({ info }: SocketDiagnosticsProps) {
  return (
    <div className="socket-diagnostics">
      <div className="diagnostics-grid">
        <div className="diagnostic-section">
          <h4>Local Connection</h4>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Address:</span>
            <span className="diagnostic-value">{info.localAddress}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Port:</span>
            <span className="diagnostic-value">{info.localPort}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Family:</span>
            <span className="diagnostic-value">{info.localFamily}</span>
          </div>
        </div>

        <div className="diagnostic-section">
          <h4>Remote Connection</h4>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Address:</span>
            <span className="diagnostic-value">{info.remoteAddress}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Port:</span>
            <span className="diagnostic-value">{info.remotePort}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Family:</span>
            <span className="diagnostic-value">{info.remoteFamily}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
