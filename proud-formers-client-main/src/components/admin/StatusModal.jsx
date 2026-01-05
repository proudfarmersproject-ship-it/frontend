import { CheckCircle, XCircle } from "lucide-react";

export default function StatusModal({ message, type = "success", onClose }) {
  // We remove the useEffect timer because user interaction (OK button) is now required
  if (!message) return null;

  const config = {
    success: {
      title: "Success",
      bg: "bg-green-100",
      iconColor: "text-green-600",
      btnBg: "bg-green-600 hover:bg-green-700",
      icon: <CheckCircle size={48} />,
    },
    error: {
      title: "Failure",
      bg: "bg-red-100",
      iconColor: "text-red-600",
      btnBg: "bg-red-600 hover:bg-red-700",
      icon: <XCircle size={48} />,
    },
  };

  const theme = config[type] || config.success;

  return (
    // Backdrop / Overlay
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Icon Section */}
        <div
          className={`flex flex-col items-center justify-center p-6 ${theme.bg} ${theme.iconColor}`}
        >
          {theme.icon}
          <h2 className="text-2xl font-bold mt-2">{theme.title}</h2>
        </div>

        {/* Message Section */}
        <div className="p-6 text-center">
          <p className="text-gray-600 text-lg leading-relaxed">{message}</p>
        </div>

        {/* Action Button Section */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className={`w-full py-3 text-white font-bold rounded-xl transition-all active:scale-95 ${theme.btnBg}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
