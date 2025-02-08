import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';
import { useSignIn } from '@/hooks/write';
import { useModalStore } from '@/store';

const formSchema = z.object({
  email: z.string().nonempty('Email cannot be empty').email('Incorrect email'),
  password: z
    .string()
    .nonempty('Password cannot be empty')
    .min(8, 'Length of the password cannot be less than 8'),
});

type SingInFormSchema = z.infer<typeof formSchema>;

export function SignInModal() {
  const { mutateAsync: signIn } = useSignIn();

  const { setMode } = useModalStore();

  const form = useForm<SingInFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SingInFormSchema) => {
    try {
      await signIn({
        email: values.email,
        password: values.password,
      });

      setMode(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
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
                <Input type="password" placeholder="asdASD123!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Log In
        </Button>
      </form>
    </Form>
  );
}
