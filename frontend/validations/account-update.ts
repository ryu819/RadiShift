import { z } from "zod";

export const accountUpdateSchema = z.object({
  name: z.string().trim().min(1, { message: "名前は必須です" }),
  email: z.email({
    error: (issue) => {
      if (issue.input === undefined || issue.input === "") {
        return "メールアドレスは必須です";
      }
      return "有効なメールアドレスを入力してください";
    },
  }),
});

export type SignupFormValues = z.infer<typeof accountUpdateSchema>;
