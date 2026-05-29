// ── Light-theme JSON syntax highlighter ────────────────────────
const highlight = (json) => {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      // Key — string followed by colon → light brown, normal weight
      if (/^"/.test(match) && /:$/.test(match)) {
        return `<span style="color:#B45309">${match}</span>`;
      }
      // String value → green
      if (/^"/.test(match)) {
        return `<span style="color:#16A34A">${match}</span>`;
      }
      // Boolean → green
      if (/true|false/.test(match)) {
        return `<span style="color:#16A34A">${match}</span>`;
      }
      // Null → muted gray
      if (/null/.test(match)) {
        return `<span style="color:#9CA3AF">${match}</span>`;
      }
      // Number → green
      return `<span style="color:#16A34A">${match}</span>`;
    }
  );
};

// Mock response for Phase 1 — no backend calls yet
const MOCK_RESPONSE = {
  status: 200,
  statusText: "OK",
  time: "120ms",
  size: "1.2 KB",
  body: {
    message: "Response will appear here",
    success: true,
    data: null,
  },
};

const ResponseViewer = () => {
  const formatted = JSON.stringify(MOCK_RESPONSE.body, null, 2);
  const highlighted = highlight(formatted);

  return (
    <div className="cd-response">
      {/* ── Status Bar ── */}
      <div className="cd-response-bar">
        <span className="cd-response-bar-left">Response</span>
        <div className="cd-response-bar-right">
          <span className="cd-response-pill cd-pill-status">
            {MOCK_RESPONSE.status} {MOCK_RESPONSE.statusText}
          </span>
          <span className="cd-response-pill cd-pill-time">
            {MOCK_RESPONSE.time}
          </span>
          <span className="cd-response-pill cd-pill-size">
            {MOCK_RESPONSE.size}
          </span>
        </div>
      </div>

      {/* ── Highlighted JSON Body ── */}
      <div className="cd-response-body">
        <pre
          className="cd-response-code"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
};

export default ResponseViewer;
