import { toast } from 'react-toastify';

export const SuccessToast = (msg) => {
    toast.success(msg, {
        position: 'top-right'
    })
}

export const ErrorToast = (msg) => {
    toast.error(msg, {
        position: 'top-right'
    })
}