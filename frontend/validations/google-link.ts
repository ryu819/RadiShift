import { z } from "zod";

export const googleLinkSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "パスワードは必須です" })
    .min(6, { message: "パスワードは6文字以上で入力してください" })
    .max(128, { message: "パスワードは128文字以内で入力してください" }),
});
