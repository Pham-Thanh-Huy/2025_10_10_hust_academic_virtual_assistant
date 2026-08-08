import { toast, type ToastOptions } from 'react-toastify';

const HUST_RED = 'rgb(154, 0, 31)';
const HUST_DARK_RED = 'rgb(120, 0, 25)';
const SUCCESS_GREEN = 'rgb(22, 163, 74)';
const ERROR_TOAST_ID = 'global-error-message';

const baseToastOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: false,
    icon: false,
    style: {
        width: 'fit-content',
        minWidth: '320px',
        maxWidth: '420px',
        padding: '15px 18px',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: '600',
        lineHeight: '1.5',
    },
};

export function showSuccessMessage(message: string) {
    toast.success(message, {
        ...baseToastOptions,
        style: {
            ...baseToastOptions.style,
            color: '#166534',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: `1px solid ${SUCCESS_GREEN}`,
            boxShadow: '0 12px 35px rgba(22, 163, 74, 0.15)',
        },
    });
}

export function showErrorMessage(message: string) {
    if (toast.isActive(ERROR_TOAST_ID)) {
        return;
    }

    toast.error(message, {
        ...baseToastOptions,
        toastId: ERROR_TOAST_ID,
        autoClose: 1500,
        style: {
            ...baseToastOptions.style,
            color: HUST_DARK_RED,
            background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
            border: `1px solid ${HUST_RED}`,
            boxShadow: '0 12px 35px rgba(154, 0, 31, 0.16)',
        },
    });
}