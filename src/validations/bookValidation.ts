import { z, ZodType } from "zod";

export const validateBook: ZodType = z.object({
  title: z.string().min(1, { message: "Book title is required" }),
  publisher: z.string().min(1, { message: "Book publisher is required" }),
  yearPublished: z
    .string()
    .min(1, { message: "Book year published is required" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Book year published must be a positive number",
    }),
  author: z.string().min(1, { message: "Book author is required" }),
  isbn: z.string().min(1, { message: "Book ISBN is required" }),
  qty: z
    .string()
    .min(1, { message: "Book quantity is required" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Book quantity must be a positive number",
    }),
  categoryId: z
    .string()
    .min(1, { message: "Book category is required" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Book category ID must be a positive number",
    }),
});
