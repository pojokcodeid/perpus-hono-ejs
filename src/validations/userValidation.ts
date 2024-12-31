import { z, ZodType } from "zod";

// Skema validasi untuk kata sandi yang kuat
export const strongPasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[@$!%*?&]/, {
    message: "Password must contain at least one special character",
  });

export const validateUser: ZodType = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 characters long" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: strongPasswordSchema,
  role: z.enum(["USER", "ADMIN"]),
});

export const validateNoPasswordUser: ZodType = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 characters long" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]),
});

export const loginValidation: ZodType = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});
