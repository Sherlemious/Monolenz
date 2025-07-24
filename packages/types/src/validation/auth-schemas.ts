import { z } from 'zod';
import { strongPasswordSchema } from './common';

/**
 * Authentication validation schemas
 */

export const authSchemas = {
  // Login
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  // Register
  register: z
    .object({
      email: z.string().email('Invalid email format'),
      password: strongPasswordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),

  // Password reset request
  forgotPassword: z.object({
    email: z.string().email('Invalid email format'),
  }),

  // Password reset
  resetPassword: z
    .object({
      token: z.string().min(1, 'Reset token is required'),
      password: strongPasswordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),

  // Change password (when logged in)
  changePassword: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: strongPasswordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
};
