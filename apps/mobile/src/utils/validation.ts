import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username ust be at least 3 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const validateLoginForm = (data: LoginFormData) => {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0].toString()] = err.message;
      }
    });
    return { isValid: false, errors };
  }
  return { isValid: true, errors: {} };
};

export const validateRegisterForm = (data: RegisterFormData) => {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0].toString()] = err.message;
      }
    });
    return { isValid: false, errors };
  }
  return { isValid: true, errors: {} };
};
