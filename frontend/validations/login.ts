import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({
    error: (issue) => {
      if (issue.input === undefined || issue.input === "") {
        return "メールアドレスは必須です";
      }
      return "有効なメールアドレスを入力してください";
    },
  }),
  password: z
    .string()
    .min(1, { message: "パスワードは必須です" })
    .min(6, { message: "パスワードは6文字以上で入力してください" })
    .max(128, { message: "パスワードは128文字以内で入力してください" }),
});
