import { type ZodType, z } from 'zod'
import patterns from './patterns'

export const AddPatientSchema: ZodType<Omit<PatientFields, 'id' | 'suffix'>> = z
  .object({
    patientType: z.string({
      required_error: 'This is required.',
    }),
    entryDate: z
      .date({
        required_error: 'This is required.',
        invalid_type_error: 'Should be a valid date',
      })
      .optional()
      .or(z.null()),
    firstName: z
      .string({
        required_error: 'This is required.',
        invalid_type_error: 'Should be a string',
      })
      .min(2, 'Should contain at least 2 letters')
      .regex(patterns.name, 'Invalid name'),
    middleName: z
      .string()
      .min(2, 'Should contain at least 2 letters')
      .regex(patterns.name, 'Invalid name')
      .optional()
      .or(z.literal('')),
    lastName: z
      .string({
        required_error: 'This is required.',
        invalid_type_error: 'Should be a string',
      })
      .min(2, 'Should contain at least 2 letters')
      .regex(patterns.name, 'Invalid name'),
    birthdate: z.date({
      required_error: 'This is required.',
      invalid_type_error: 'Should be a valid date',
    }),
    gender: z.string({
      required_error: 'This is required.',
    }),
    phone: z
      .string({
        required_error: 'This is required.',
      })
      .length(11, 'Should contain 11 digits')
      .regex(
        patterns.phone,
        'Invalid format. Should be in the form 0912 345 6789'
      ),
    address: z
      .string({
        required_error: 'This is required.',
      })
      .min(1, 'This is required.'),
  })
  .refine((input) => input.patientType === 'new' || input.entryDate !== null, {
    message: 'Select the date of entry.',
    path: ['entryDate'],
  })

export const AddBillSchema: ZodType<Omit<BillFields, 'id' | 'patientId'>> =
  z.object({
    procedure: z
      .string({
        required_error: 'This is required.',
        invalid_type_error: 'Select an option',
      })
      .min(1, 'This is required.')
      .trim(),
    description: z
      .string({
        required_error: 'This is required.',
        invalid_type_error: 'Select an option',
      })
      .min(1, 'This is required.')
      .trim(),
    serviceAmount: z
      .number({
        required_error: 'This is required.',
        invalid_type_error: 'Should be a number',
      })
      .min(50, 'Enter at least PHP 50.00'),
    totalAmount: z.number({
      required_error: 'This is required.',
      invalid_type_error: 'Should be a number',
    }),
    items: z.array(
      z.object({
        name: z
          .string({
            required_error: 'This is required.',
            invalid_type_error: 'Select an option',
          })
          .min(1, 'This is required.')
          .trim(),
        amount: z
          .number({
            required_error: 'This is required.',
            invalid_type_error: 'Should be a number',
          })
          .min(50, 'Enter at least PHP 50.00'),
      })
    ),
  })

export const SettleBillSchema: ZodType<
  Omit<SettleFields, 'billId' | 'balance'>
> = z.object({
  amount: z
    .number({
      required_error: 'This is required.',
      invalid_type_error: 'Should be a number',
    })
    .min(50, 'Enter at least PHP 50.00'),
  paymentMode: z
    .string({
      required_error: 'This is required.',
      invalid_type_error: 'Select an option',
    })
    .min(1, 'This is required.')
    .trim(),
})
