import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  priceUsd: z.number().positive("Price must be greater than 0"),
  billingInterval: z.enum(["monthly", "yearly"]),
  settleCoin: z.string().min(1),
  settleNetwork: z.string().min(1),
});

export const updateSettingsSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  settleAddress: z.string().min(1, "Settle address is required"),
  settleCoin: z.string().min(1),
  settleNetwork: z.string().min(1),
});

export const createSubscriptionSchema = z.object({
  email: z.string().email("Invalid email address"),
  planId: z.string(),
  depositCoin: z.string(),
  depositNetwork: z.string(),
  refundAddress: z.string().optional(),
});
