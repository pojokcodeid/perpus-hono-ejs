import { z, ZodType } from "zod";

export const validateCategory: ZodType = z.object({
  categoryName: z.string().min(1, { message: "Category name is required" }),
});
