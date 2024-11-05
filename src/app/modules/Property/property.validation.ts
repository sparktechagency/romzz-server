import { z } from 'zod';

export const propertyValidationSchema = z.object({
  body: z.object({
    ownerType: z.enum(['own-property', 'others-property'], {
      required_error: 'Owner type is required.',
      invalid_type_error:
        'Owner type must be either "own-property" or "others-property".',
    }),

    title: z.string({
      required_error: 'Property title is required.',
      invalid_type_error: 'Property title must be a string.',
    }),

    address: z.string({
      required_error: 'Address is required.',
      invalid_type_error: 'Address must be a string.',
    }),

    category: z.enum(['whole-unit', 'room-mate', 'flat-mate', 'house'], {
      required_error: 'Category is required.',
      invalid_type_error:
        'Category must be one of the following: "whole-unit", "room-mate", "flat-mate", or "house".',
    }),

    price: z.string({
      required_error: 'Price is required.',
      invalid_type_error: 'Price must be a string.',
    }),

    priceType: z.enum(['day', 'week', 'month', 'year'], {
      required_error: 'Price type is required.',
      invalid_type_error:
        'Price type must be one of the following: "day", "week", "month", or "year".',
    }),

    description: z.string({
      required_error: 'Property description are required.',
      invalid_type_error: 'Property description must be a string.',
    }),

    size: z.string({
      required_error: 'Size is required.',
      invalid_type_error: 'Size must be a string.',
    }),

    decorationType: z.enum(['furnished', 'unfurnished'], {
      required_error: 'Decoration type is required.',
      invalid_type_error:
        'Decoration type must be either "furnished" or "unfurnished".',
    }),

    flore: z
      .number({
        required_error: 'Flore is required.',
        invalid_type_error: 'Flore must be a number.',
      })
      .int(),

    propertyType: z.enum(
      ['family-house', 'apartment', 'lodge', 'villa', 'cottage'],
      {
        required_error: 'Property type is required.',
        invalid_type_error:
          'Property type must be one of the following: "family-house", "apartment", "lodge", "villa", or "cottage".',
      },
    ),

    bedType: z.string({
      required_error: 'Bed type is required.',
      invalid_type_error: 'Bed type must be a string.',
    }),

    bedrooms: z
      .number({
        required_error: 'Number of bedrooms is required.',
        invalid_type_error: 'Number of bedrooms must be a number.',
      })
      .int()
      .min(0, 'Number of bedrooms cannot be negative.'),

    bathrooms: z
      .number({
        required_error: 'Number of bathrooms is required.',
        invalid_type_error: 'Number of bathrooms must be a number.',
      })
      .int()
      .min(0, 'Number of bathrooms cannot be negative.'),

    balcony: z
      .number({
        required_error: 'Number of balconies is required.',
        invalid_type_error: 'Number of balconies must be a number.',
      })
      .int()
      .min(0, 'Number of balconies cannot be negative.'),

    kitchen: z
      .number({
        required_error: 'Number of kitchens is required.',
        invalid_type_error: 'Number of kitchens must be a number.',
      })
      .int()
      .min(0, 'Number of kitchens cannot be negative.'),

    dining: z
      .number({
        required_error: 'Number of dining areas is required.',
        invalid_type_error: 'Number of dining areas must be a number.',
      })
      .int()
      .min(0, 'Number of dining areas cannot be negative.'),

    drawing: z
      .number({
        required_error: 'Number of drawing rooms is required.',
        invalid_type_error: 'Number of drawing rooms must be a number.',
      })
      .int()
      .min(0, 'Number of drawing rooms cannot be negative.'),

    moveOn: z.string({
      required_error: 'Move-on date is required.',
      invalid_type_error: 'Move-on date must be a valid date.',
    }),

    facilities: z.array(z.string(), {
      required_error: 'Facilities are required.',
      invalid_type_error: 'Facilities must be an array of strings.',
    }),
  }),
});
