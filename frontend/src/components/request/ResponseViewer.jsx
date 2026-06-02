import { useState } from "react";

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

// ── Status code to status text mapping ──────────────────────────
const getStatusText = (code) => {
  const statusMap = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusMap[code] || "Unknown";
};

// ── Status badge styling based on code ──────────────────────────
const getStatusStyle = (code) => {
  if (code >= 200 && code < 300) {
    return { background: "#D1FAE5", color: "#059669" };
  }
  if (code >= 300 && code < 400) {
    return { background: "#DBEAFE", color: "#2563EB" };
  }
  if (code >= 400 && code < 500) {
    return { background: "#FED7AA", color: "#EA580C" };
  }
  if (code >= 500) {
    return { background: "#FEE2E2", color: "#DC2626" };
  }
  return { background: "#F3F4F6", color: "#6B7280" };
};

const ResponseViewer = ({ response, loading, error }) => {
  const [activeTab, setActiveTab] = useState("Body");

  // ── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cd-response">
        <div className="cd-response-loading">
          <div className="cd-response-loader"></div>
          <p className="cd-response-loading-text">Executing request...</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="cd-response">
        <div className="cd-response-error">
          <div className="cd-response-error-icon">⚠️</div>
          <p className="cd-response-error-title">Request Failed</p>
          <p className="cd-response-error-message">{error}</p>
        </div>
      </div>
    );
  }

  // ── No Response Yet ────────────────────────────────────────────
  if (!response) {
    return (
      <div className="cd-response">
        <div className="cd-response-empty">
          <div className="cd-response-empty-icon">⚡</div>
          <p className="cd-response-empty-title">No response yet</p>
          <p className="cd-response-empty-sub">
            Click "Send" to execute the request and see the response here.
          </p>
        </div>
      </div>
    );
  }

  // ── Response Available ─────────────────────────────────────────
  const { statusCode, responseBody, responseTime, responseHeaders } = response;
  const headersCount = responseHeaders ? Object.keys(responseHeaders).length : 0;
  const statusStyle = getStatusStyle(statusCode);
  const statusText = getStatusText(statusCode);

  // Format body for display
  let formattedBody = "";
  let highlighted = "";
  try {
    const parsed = typeof responseBody === "string" ? JSON.parse(responseBody) : responseBody;
    formattedBody = JSON.stringify(parsed, null, 2);
    highlighted = highlight(formattedBody);
  } catch {
    formattedBody = responseBody || "";
    highlighted = formattedBody;
  }

  return (
    <div className="cd-response">
      {/* ── Response Tabs ── */}
      <div className="cd-response-tabs">
        <button
          className={`cd-response-tab${activeTab === "Body" ? " active" : ""}`}
          onClick={() => setActiveTab("Body")}
        >
          Body
        </button>
        <button
          className={`cd-response-tab${activeTab === "Headers" ? " active" : ""}`}
          onClick={() => setActiveTab("Headers")}
        >
          Headers ({headersCount})
        </button>
      </div>

      {/* ── Body Tab ── */}
      {activeTab === "Body" && (
        <>
          {/* Response metadata bar */}
          <div className="cd-response-meta">
            <span
              className="cd-response-status-badge"
              style={statusStyle}
            >
              ● {statusCode} {statusText}
            </span>
            <span className="cd-response-time">{responseTime} ms</span>
          </div>

          {/* Response body */}
          <div className="cd-response-body">
            <pre
              className="cd-response-code"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        </>
      )}

      {/* ── Headers Tab ── */}
      {activeTab === "Headers" && (
        <div className="cd-response-headers-container">
          {headersCount === 0 ? (
            <div className="cd-response-headers-empty">
              No response headers available.
            </div>
          ) : (
            <div className="cd-response-headers-table">
              {Object.entries(responseHeaders).map(([key, value], index) => (
                <div
                  key={index}
                  className="cd-response-header-row"
                >
                  <div className="cd-response-header-name">{key}</div>
                  <div className="cd-response-header-value">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponseViewer;
