import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/ui';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSignUp } from '@/hooks/write/sign-up';

const formSchema = z
  .object({
    email: z
      .string()
      .nonempty('Email cannot be empty')
      .email('Incorrect email'),
    password: z
      .string()
      .nonempty('Password cannot be empty')
      .min(8, 'Length of the password cannot be less than 8'),
    passwordRepeat: z
      .string()
      .nonempty('Password cannot be empty')
      .min(8, 'Length of the password cannot be less than 8'),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    message: 'Passwords do not match',
    path: ['passwordRepeat'],
  });

type SignUpFormSchema = z.infer<typeof formSchema>;

export function SignUpModal() {
  const { mutateAsync: signUp } = useSignUp();

  const form = useForm<SignUpFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordRepeat: '',
    },
  });

  const onSubmit = async (values: SignUpFormSchema) => {
    signUp({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordRepeat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeat password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormMessage />

        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
