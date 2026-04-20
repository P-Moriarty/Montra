import { z } from 'zod';

/**
 * Industrial-Grade Validation Schemas
 * Orchestrates bank-level precision for all authentication data entries.
 */

export const LoginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid industrial-grade email'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const SignupSchema = z.object({
  full_name: z.string()
    .min(1, 'Full name is required')
    .min(3, 'Name must be at least 3 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid industrial-grade email'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string()
    .min(1, 'Please confirm your password'),
  phone_number: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\d-+]+$/, 'Please enter a valid numeric phone number'),
  referral_code: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

export const VerifyAccountSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid industrial-grade email'),
  verification_code: z.string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type VerifyAccountInput = z.infer<typeof VerifyAccountSchema>;
