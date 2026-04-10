import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, { message: "名前は必須です" }),
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
    passwordConfirmation: z
      .string()
      .min(1, { message: "パスワード（確認用）は必須です" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "パスワードが一致しません",
    path: ["passwordConfirmation"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
