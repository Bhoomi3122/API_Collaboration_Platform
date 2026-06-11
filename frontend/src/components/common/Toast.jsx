import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import "../../styles/toast.css";

const Toast = ({ message, type = "success", onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertCircle size={18} />,
  };

  const colors = {
    success: {
      bg: "#ECFDF5",
      border: "#10B981",
      text: "#065F46",
      icon: "#10B981",
    },
    error: {
      bg: "#FEF2F2",
      border: "#EF4444",
      text: "#991B1B",
      icon: "#EF4444",
    },
    warning: {
      bg: "#FEF3C7",
      border: "#F59E0B",
      text: "#92400E",
      icon: "#F59E0B",
    },
  };

  const style = colors[type] || colors.success;

  return (
    <div
      className="toast-container"
      style={{
        background: style.bg,
        borderLeft: `4px solid ${style.border}`,
      }}
    >
      {type === "success" && (
        <div className="toast-icon" style={{ color: style.icon }}>
          {icons[type]}
        </div>
      )}
      <p className="toast-message" style={{ color: style.text }}>
        {message}
      </p>
      <button
        className="toast-close"
        onClick={onClose}
        style={{ color: style.text }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

