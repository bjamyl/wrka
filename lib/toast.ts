import { Toast, ToastTitle, useToast as useGluestackToast } from '@/components/ui/toast';
import { Icon } from '@/components/ui/icon';
import { Send, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { Divider } from '@/components/ui/divider';

// Icon mapping for different toast types
const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  default: Send,
};

// Simplified toast function
export const showToast = (toast, { message, type = 'default', placement = 'top' }) => {
  toast.show({
    placement,
    render: ({ id }) => {
      const toastId = 'toast-' + id;
      const IconComponent = iconMap[type] || iconMap.default;
      
      return (
        <Toast
          nativeID={toastId}
          className="px-5 py-3 gap-4 shadow-soft-1 items-center flex-row"
        >
          <Icon
            as={IconComponent}
            size="xl"
            className="fill-typography-100 stroke-none"
          />
          <Divider
            orientation="vertical"
            className="h-[30px] bg-outline-200"
          />
          <ToastTitle size="sm">{message}</ToastTitle>
        </Toast>
      );
    },
  });
};

// Optional: Custom hook that returns simplified toast functions
export const useToast = () => {
  const toast = useGluestackToast();
  
  return {
    success: (message, placement) => showToast(toast, { message, type: 'success', placement }),
    error: (message, placement) => showToast(toast, { message, type: 'error', placement }),
    info: (message, placement) => showToast(toast, { message, type: 'info', placement }),
    show: (message, placement) => showToast(toast, { message, placement }),
  };
};