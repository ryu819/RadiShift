import { z } from "zod";

export const resendConfirmationSchema = z.object({
  email: z.email({
    error: (issue) => {
      if (issue.input === undefined || issue.input === "") {
        return "メールアドレスは必須です";
      }
      return "有効なメールアドレスを入力してください";
    },
  }),
});
