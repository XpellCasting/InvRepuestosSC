import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // type can be 'success', 'error', 'warning', 'info'
  const showAlert = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {alerts.map((alert) => (
          <ToastItem key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

const ToastItem = ({ alert, onClose }) => {
  let bgColor = 'bg-[#003366]'; // default info
  let Icon = Info;

  if (alert.type === 'success') {
    bgColor = 'bg-[#28A745]';
    Icon = CheckCircle;
  } else if (alert.type === 'error') {
    bgColor = 'bg-red-500';
    Icon = AlertTriangle;
  } else if (alert.type === 'warning') {
    bgColor = 'bg-[#F59E0B]';
    Icon = AlertCircle;
  }

  return (
    <div className={`flex items-start gap-3 w-80 max-w-[90vw] p-4 rounded-lg shadow-lg pointer-events-auto text-white transform transition-all duration-300 animate-slide-in-right ${bgColor}`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={20} />
      </div>
      <div className="flex-1 whitespace-pre-wrap text-sm font-medium">
        {alert.message}
      </div>
      <button onClick={onClose} className="flex-shrink-0 text-white opacity-70 hover:opacity-100 transition focus:outline-none">
        <X size={18} />
      </button>
    </div>
  );
};
