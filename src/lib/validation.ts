import { z } from 'zod';

export const TeamCodeSchema = z.object({
  teamCode: z
    .string()
    .min(3, 'Team code is required')
    .max(20, 'Team code too long')
    .transform((val) => val.trim().toUpperCase()),
});

export const MemberVerifySchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter your registered full name')
    .max(80, 'Name too long'),
  pin: z
    .string()
    .min(4, 'PIN must be 4 digits')
    .max(8, 'PIN too long')
    .regex(/^\d+$/, 'PIN must contain only numbers'),
});

export const BuyOrderSchema = z.object({
  quantity: z
    .number()
    .int('Shares must be whole numbers')
    .positive('Quantity must be greater than 0'),
});

export const SellOrderSchema = z.object({
  quantity: z
    .number()
    .int('Shares must be whole numbers')
    .positive('Quantity must be greater than 0'),
});

export const StockPriceSchema = z.object({
  price: z
    .number()
    .positive('Price must be greater than 0'),
  reason: z.string().min(2, 'Please provide a reason for the price adjustment'),
});

export const TeamCreateSchema = z.object({
  name: z.string().min(2, 'Team name is required').max(50),
  startingCapital: z.number().positive('Starting capital must be positive'),
  members: z.array(z.string().min(2, 'Member name required')).min(1, 'At least 1 member required'),
});

export const NewsCreateSchema = z.object({
  headline: z.string().min(5, 'Headline must be at least 5 characters').max(150),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  sector: z.string().min(2, 'Select or specify a sector'),
});

export const CashAdjustSchema = z.object({
  amount: z.number(),
  reason: z.string().min(3, 'Reason is required for cash adjustment'),
});
