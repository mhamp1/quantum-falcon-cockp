import { toast as sonnerToast } from 'sonner';
import { soundEffects } from './soundEffects';

export const toast = {
  success: (message: string, data?: any) => {
    soundEffects.playSuccess();
    return sonnerToast.success(message, data);
  },
  error: (message: string, data?: any) => {
    soundEffects.playError();
    return sonnerToast.error(message, data);
  },
  info: (message: string, data?: any) => {
    soundEffects.playNotification();
    return sonnerToast.info(message, data);
  },
  warning: (message: string, data?: any) => {
    soundEffects.playNotification();
    return sonnerToast.warning(message, data);
  },
  message: (message: string, data?: any) => {
    soundEffects.playNotification();
    return sonnerToast.message(message, data);
  },
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
  custom: sonnerToast.custom,
  dismiss: sonnerToast.dismiss,
};
