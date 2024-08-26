import { z } from 'zod';

const blogValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Titile is required.',
      invalid_type_error: 'Titile must be a string.',
    }),
    description: z.string({
      required_error: 'Description is required.',
      invalid_type_error: 'Description must be a string.',
    }),
  }),
});

export default blogValidationSchema;
