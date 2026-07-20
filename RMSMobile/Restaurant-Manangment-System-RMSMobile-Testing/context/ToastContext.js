import React, { createContext, useContext, useState } from 'react';
import ToastNotification from '../components/ToastNotification';

const ToastContext = createContext();

export { ToastContext };

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = ({
    message,
    type = 'success',
    title,
    duration = 4000,
    actionText,
    onActionPress
  }) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      message,
      type,
      title,
      duration,
      actionText,
      onActionPress,
      visible: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration + animation time
    setTimeout(() => {
      hideToast(id);
    }, duration + 500);
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, options = {}) => {
    showToast({
      message,
      type: 'success',
      title: options.title || '🎉 Thành công!',
      ...options
    });
  };

  const showError = (message, options = {}) => {
    showToast({
      message,
      type: 'error',
      title: options.title || '❌ Lỗi!',
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    showToast({
      message,
      type: 'warning',
      title: options.title || '⚠️ Cảnh báo!',
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    showToast({
      message,
      type: 'info',
      title: options.title || 'ℹ️ Thông tin',
      ...options
    });
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast
      }}
    >
      {children}
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          title={toast.title}
          duration={toast.duration}
          actionText={toast.actionText}
          onActionPress={toast.onActionPress}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;