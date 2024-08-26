import { z } from 'zod';

const outStoryValidationSchema = z.object({
  body: z.object({
    storyDetails: z.string({
      required_error: 'Titile is required.',
      invalid_type_error: 'Titile must be a string.',
    }),
  }),
});

export default outStoryValidationSchema;
