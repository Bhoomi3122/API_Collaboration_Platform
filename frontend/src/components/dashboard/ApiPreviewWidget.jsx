function ApiPreviewWidget() {
  return (
    <div className="api-preview-widget">
      <div className="widget-header">
        <h3 className="section-title">API Response Preview</h3>
        <span className="status-badge">200 OK</span>
      </div>
      <pre className="code-preview">
        <code>
          <span className="token-brace">{'{'}</span>{'\n'}
          {'  '}<span className="token-key">"status"</span>: <span className="token-string">"success"</span>,{'\n'}
          {'  '}<span className="token-key">"data"</span>: <span className="token-brace">{'{'}</span>{'\n'}
          {'    '}<span className="token-key">"userId"</span>: <span className="token-number">12345</span>,{'\n'}
          {'    '}<span className="token-key">"name"</span>: <span className="token-string">"John Doe"</span>,{'\n'}
          {'    '}<span className="token-key">"email"</span>: <span className="token-string">"john@example.com"</span>,{'\n'}
          {'    '}<span className="token-key">"active"</span>: <span className="token-boolean">true</span>,{'\n'}
          {'    '}<span className="token-key">"plan"</span>: <span className="token-string">"premium"</span>{'\n'}
          {'  '}<span className="token-brace">{'}'}</span>,{'\n'}
          {'  '}<span className="token-key">"timestamp"</span>: <span className="token-string">"2026-05-27T10:30:00Z"</span>{'\n'}
          <span className="token-brace">{'}'}</span>
        </code>
      </pre>
    </div>
  );
}

export default ApiPreviewWidget;

