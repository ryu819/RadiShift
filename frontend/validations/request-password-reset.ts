import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.email({
    error: (issue) => {
      if (issue.input === undefined || issue.input === "") {
        return "メールアドレスは必須です";
      }
      return "有効なメールアドレスを入力してください";
    },
  }),
});

export type SignupFormValues = z.infer<typeof requestPasswordResetSchema>;
