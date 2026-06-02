import { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const TABS = ["Docs", "Params", "Authorization", "Headers", "Body", "Scripts", "Settings"];
const AUTH_TYPES = ["No Auth", "Bearer Token", "Basic Auth", "API Key"];

// ── Method colour map ───────────────────────────────────────────
const METHOD_COLORS = {
  GET:     { color: "#2F9E44", bg: "#E6F4EA" },
  POST:    { color: "#4B61FF", bg: "#E8ECFF" },
  PUT:     { color: "#B88300", bg: "#FFF2D6" },
  PATCH:   { color: "#EA580C", bg: "#FFEDD5" },
  DELETE:  { color: "#7C3AED", bg: "#F3E8FF" },
  HEAD:    { color: "#6B7280", bg: "#F3F4F6" },
  OPTIONS: { color: "#EA00FF", bg: "#F9F0FF" },
};

// ── Custom Method Dropdown ──────────────────────────────────────
const MethodDropdown = ({ method, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = METHOD_COLORS[method] || METHOD_COLORS.GET;

  return (
    <div className="cd-method-dropdown" ref={ref}>
      <button
        className="cd-method-trigger"
        style={{ color: current.color, background: current.bg }}
        onClick={() => setOpen((p) => !p)}
        type="button"
      >
        {method}
        <ChevronDown size={12} style={{ marginLeft: 4, opacity: 0.7 }} />
      </button>

      {open && (
        <div className="cd-method-menu">
          {HTTP_METHODS.map((m) => {
            const style = METHOD_COLORS[m] || METHOD_COLORS.GET;
            return (
              <button
                key={m}
                className={`cd-method-option${method === m ? " active" : ""}`}
                style={{ color: style.color }}
                onClick={() => { onChange(m); setOpen(false); }}
                type="button"
              >
                {m}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Key-Value Table (Params & Headers) ─────────────────────────
const KVTable = ({ colHeaders, placeholder }) => {
  const [rows, setRows] = useState([{ key: "", value: "", description: "" }]);

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, { key: "", value: "", description: "" }]);

  return (
    <div>
      <table className="cd-kv-table">
        <thead>
          <tr>
            {colHeaders.map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <input className="cd-kv-input" placeholder={placeholder[0]}
                  value={row.key} onChange={(e) => updateRow(i, "key", e.target.value)} />
              </td>
              <td>
                <input className="cd-kv-input" placeholder={placeholder[1]}
                  value={row.value} onChange={(e) => updateRow(i, "value", e.target.value)} />
              </td>
              {colHeaders.length === 3 && (
                <td>
                  <input className="cd-kv-input" placeholder="Description"
                    value={row.description} onChange={(e) => updateRow(i, "description", e.target.value)} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <button className="cd-add-row-btn" onClick={addRow}>
        <Plus size={12} /> Add Row
      </button>
    </div>
  );
};

// ── Authorization Tab ───────────────────────────────────────────
const AuthTab = () => {
  const [authType, setAuthType] = useState("No Auth");
  return (
    <div>
      <select className="cd-auth-select" value={authType}
        onChange={(e) => setAuthType(e.target.value)}>
        {AUTH_TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>

      {authType === "Bearer Token" && (
        <div className="cd-auth-field">
          <label className="cd-auth-label">Token</label>
          <input className="cd-auth-input" placeholder="Enter bearer token..." type="password" />
        </div>
      )}

      {authType === "Basic Auth" && (
        <>
          <div className="cd-auth-field">
            <label className="cd-auth-label">Username</label>
            <input className="cd-auth-input" placeholder="Enter username..." />
          </div>
          <div className="cd-auth-field">
            <label className="cd-auth-label">Password</label>
            <input className="cd-auth-input" placeholder="Enter password..." type="password" />
          </div>
        </>
      )}

      {authType === "API Key" && (
        <>
          <div className="cd-auth-field">
            <label className="cd-auth-label">Key</label>
            <input className="cd-auth-input" placeholder="Header name (e.g. X-API-Key)" />
          </div>
          <div className="cd-auth-field">
            <label className="cd-auth-label">Value</label>
            <input className="cd-auth-input" placeholder="API key value..." type="password" />
          </div>
        </>
      )}

      {authType === "No Auth" && (
        <p className="cd-auth-placeholder">No authentication configured for this request.</p>
      )}
    </div>
  );
};

// ── Settings Tab ────────────────────────────────────────────────
const SettingsTab = () => {
  const [settings, setSettings] = useState({
    redirects: true,
    cookies: true,
    history: false,
  });
  const toggle = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));

  const rows = [
    { key: "redirects", label: "Follow Redirects"      },
    { key: "cookies",   label: "Enable Cookies"         },
    { key: "history",   label: "Save Response History"  },
  ];

  return (
    <div>
      {rows.map(({ key, label }) => (
        <label key={key} className="cd-settings-row">
          <input
            type="checkbox"
            className="cd-settings-check"
            checked={settings[key]}
            onChange={() => toggle(key)}
          />
          <span className="cd-settings-label">{label}</span>
        </label>
      ))}
    </div>
  );
};

// ── Method colour map (matches design spec) ─────────────────

// ── RequestEditor (main export) ─────────────────────────────────
const RequestEditor = ({ request, onSave, onDelete, saving = false, saveMessage = null }) => {
  const [method, setMethod]       = useState(request?.method || "GET");
  const [url, setUrl]             = useState(request?.url    || "");
  const [activeTab, setActiveTab] = useState("Body");
  const [body, setBody]           = useState(request?.body   || "");
  const [scripts, setScripts]     = useState("");
  const [headers, setHeaders]     = useState(request?.headers || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync editor fields whenever the selected request changes
  useEffect(() => {
    if (request) {
      setMethod(request.method || "GET");
      setUrl(request.url || "");
      setBody(request.body || "");
      setHeaders(request.headers || "");
      setActiveTab("Body");
    }
  }, [request?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const methodStyle = METHOD_COLORS[method] || METHOD_COLORS.GET; // kept for badge use

  return (
    <div className="cd-editor">
      {/* ── Save message banner ── */}
      {saveMessage && (
        <div style={{
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 500,
          background: saveMessage.type === "success" ? "#E6F4EA" : "#FEE2E2",
          color: saveMessage.type === "success" ? "#2F9E44" : "#DC2626",
          borderBottom: `1px solid ${saveMessage.type === "success" ? "#BBF7D0" : "#FECACA"}`,
        }}>
          {saveMessage.text}
        </div>
      )}

      {/* ── URL Row ── */}
      <div className="cd-editor-url-row">
        <MethodDropdown method={method} onChange={setMethod} />

        <input
          type="text"
          className="cd-url-input"
          placeholder="https://api.example.com/endpoint"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {/* ── Split button group ── */}
        <div className="cd-send-group" ref={dropdownRef}>
          <button className="cd-send-btn">Send</button>
          <button
            className="cd-send-dropdown-toggle"
            onClick={() => setDropdownOpen((p) => !p)}
            title="More options"
          >
            <ChevronDown size={14} />
          </button>
          {dropdownOpen && (
            <div className="cd-send-dropdown-menu">
              <button
                className="cd-send-dropdown-item"
                disabled={saving}
                onClick={() => {
                  setDropdownOpen(false);
                  if (onSave) onSave({ method, url, headers, body });
                }}
              >
                {saving ? "Saving..." : "Save Request"}
              </button>
              <button
                className="cd-send-dropdown-item"
                onClick={() => { console.log("Save & Send clicked"); setDropdownOpen(false); }}
              >
                Save &amp; Send
              </button>
              {/* Only show Delete for existing (saved) requests */}
              {request?.id && (
                <>
                  <div style={{ height: 1, background: "#E5E7EB", margin: "4px 0" }} />
                  <button
                    className="cd-send-dropdown-item"
                    style={{ color: "#DC2626" }}
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onDelete) onDelete();
                    }}
                  >
                    Delete Request
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {/* ── end split button group ── */}
      </div>

      {/* ── Tabs ── */}
      <div className="cd-tabs">
        {TABS.map((tab) => (
          <button key={tab}
            className={`cd-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="cd-tab-content">

        {activeTab === "Docs" && (
          <div className="cd-docs-placeholder">
            📄 API documentation will appear here
          </div>
        )}

        {activeTab === "Params" && (
          <KVTable
            colHeaders={["Key", "Value", "Description"]}
            placeholder={["param_key", "param_value"]}
          />
        )}

        {activeTab === "Authorization" && <AuthTab />}

        {activeTab === "Headers" && (
          headers ? (
            <textarea
              className="cd-textarea"
              placeholder="Headers (key: value)"
              value={typeof headers === "object" ? JSON.stringify(headers, null, 2) : headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={7}
            />
          ) : (
            <KVTable
              colHeaders={["Key", "Value"]}
              placeholder={["Content-Type", "application/json"]}
            />
          )
        )}

        {activeTab === "Body" && (
          <textarea
            className="cd-textarea"
            placeholder={'{\n  "key": "value"\n}'}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
          />
        )}

        {activeTab === "Scripts" && (
          <textarea
            className="cd-textarea"
            placeholder={"// Pre-request or test scripts\n// e.g. pm.test('Status is 200', () => {\n//   pm.response.to.have.status(200);\n// });"}
            value={scripts}
            onChange={(e) => setScripts(e.target.value)}
            rows={7}
          />
        )}

        {activeTab === "Settings" && <SettingsTab />}

      </div>
    </div>
  );
};

export default RequestEditor;
