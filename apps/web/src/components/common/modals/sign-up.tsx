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
import { useSignUp } from '@/hooks';
import { useModalStore } from '@/store';

const formSchema = z
  .object({
    email: z
      .string()
      .nonempty('Email cannot be empty')
      .email('Incorrect email')
      .trim(),
    username: z
      .string()
      .nonempty('Username cannot be empty')
      .min(3, 'Length of the username cannot be less than 3')
      .max(20, 'Length of the username cannot be more than 20')
      .trim(),
    password: z
      .string()
      .nonempty('Password cannot be empty')
      .min(8, 'Length of the password cannot be less than 8')
      .trim(),
    passwordRepeat: z
      .string()
      .nonempty('Password cannot be empty')
      .min(8, 'Length of the password cannot be less than 8')
      .trim(),
    firstName: z
      .string()
      .refine(
        (firstName) => {
          return firstName === '' || firstName.length >= 3;
        },
        {
          message: 'First name is too short',
        },
      )
      .transform((value) => {
        return value === '' ? undefined : value.trim();
      }),
    lastName: z
      .string()
      .refine(
        (lastName) => {
          return lastName === '' || lastName.length >= 3;
        },
        {
          message: 'Last name is too short',
        },
      )
      .transform((value) => {
        return value === '' ? undefined : value.trim();
      }),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    message: 'Passwords do not match',
    path: ['passwordRepeat'],
  });

type SignUpFormSchema = z.infer<typeof formSchema>;

export function SignUpModal() {
  const { mutateAsync: signUp } = useSignUp();

  const { setMode } = useModalStore();

  const form = useForm<SignUpFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      passwordRepeat: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (values: SignUpFormSchema) => {
    try {
      await signUp({
        email: values.email,
        password: values.password,
        username: values.username,
        ...(values.firstName && { firstName: values.firstName }),
        ...(values.lastName && { lastName: values.lastName }),
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="john_doe" {...field} />
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

        <FormField
          control={form.control}
          name="passwordRepeat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Repeat</FormLabel>
              <FormControl>
                <Input type="password" placeholder="asdASD123!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
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
