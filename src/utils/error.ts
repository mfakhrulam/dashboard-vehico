import { AxiosError } from 'axios';

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: FieldError[];
}

export interface FormErrors {
  [fieldName: string]: string[];
}

/**
 * Parse error response dari backend
 * Handle multiple format error dari API
 */
export const parseApiError = (error: unknown): {
  message: string;
  formErrors?: FormErrors;
  fieldErrors?: FieldError[];
} => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const data = axiosError?.response?.data;

  // Jika ada field errors (validation errors)
  if (data?.errors && Array.isArray(data.errors)) {
    const formErrors: FormErrors = {};

    data.errors.forEach((error) => {
      if (error.field) {
        if (!formErrors[error.field]) {
          formErrors[error.field] = [];
        }
        formErrors[error.field].push(error.message);
      }
    });

    return {
      message: data.message || 'Validation error',
      formErrors,
      fieldErrors: data.errors,
    };
  }

  // Jika hanya ada message (rate limiting, server error, etc)
  if (data?.message) {
    return {
      message: data.message,
    };
  }

  // Fallback untuk error response lain
  if (axiosError?.response?.status === 429) {
    return {
      message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
    };
  }

  if (axiosError?.response?.status === 500) {
    return {
      message: 'Server error. Silakan coba lagi nanti.',
    };
  }

  return {
    message: error instanceof Error ? error.message : 'Terjadi kesalahan',
  };
};
