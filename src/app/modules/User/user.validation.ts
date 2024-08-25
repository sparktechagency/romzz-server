import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    fullName: z.string({
      required_error: 'Full name is required.',
      invalid_type_error: 'Full name must be a string.',
    }),

    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email format.'),

    phoneNumber: z.string({
      required_error: 'Phone number is required.',
      invalid_type_error: 'Phone number must be a string.',
    }),

    nidNumber: z.number({
      required_error: 'NID number is required.',
      invalid_type_error: 'NID number must be a number.',
    }),

    gender: z.enum(['male', 'female', 'others'], {
      required_error: 'Gender is required.',
      invalid_type_error: 'Gender must be a string.',
    }),

    password: z.string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string.',
    }),

    permanentAddress: z.string({
      required_error: 'Permanent address is required.',
      invalid_type_error: 'Permanent address must be a string.',
    }),
  }),
});

const createAdminSchema = z.object({
  body: z.object({
    fullName: z.string({
      required_error: 'Full name is required.',
      invalid_type_error: 'Full name must be a string.',
    }),

    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email format.'),

    password: z.string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string.',
    }),
  }),
});

export const userValidationSchema = {
  createUserSchema,
  createAdminSchema,
};
