import { z } from "zod";

export const googleSignupSchema = z.object({
  name: z.string().trim().min(1, { message: "名前は必須です" }),
});
