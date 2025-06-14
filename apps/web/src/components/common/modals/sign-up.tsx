import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
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
import { useSignUp } from '@/hooks/write';
import { useModalStore } from '@/store';

const formSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z
        .string()
        .nonempty(t('emailCannotBeEmpty'))
        .email(t('incorrectEmail'))
        .trim(),
      username: z
        .string()
        .nonempty(t('usernameCannotBeEmpty'))
        .min(3, t('usernameTooShort'))
        .max(20, t('usernameTooLong'))
        .trim(),
      password: z
        .string()
        .nonempty(t('passwordCannotBeEmpty'))
        .min(8, t('passwordTooShort'))
        .trim(),
      passwordRepeat: z
        .string()
        .nonempty(t('passwordCannotBeEmpty'))
        .min(8, t('passwordTooShort'))
        .trim(),
      firstName: z
        .string()
        .refine(
          (firstName) => {
            return firstName === '' || firstName.length >= 3;
          },
          {
            message: t('firstNameTooShort'),
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
            message: t('lastNameTooShort'),
          },
        )
        .transform((value) => {
          return value === '' ? undefined : value.trim();
        }),
      age: z.coerce
        .string()
        .refine(
          (age) => {
            if (age === '') return true;
            const ageNum = parseInt(age, 10);
            return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 120;
          },
          {
            message: t('invalidAge'),
          },
        )
        .transform((value) => {
          if (value === '') return undefined;
          return parseInt(value, 10);
        }),
    })
    .refine((data) => data.password === data.passwordRepeat, {
      message: t('passwordsDoNotMatch'),
      path: ['passwordRepeat'],
    });

type SignUpFormSchema = z.infer<ReturnType<typeof formSchema>>;

export function SignUpModal() {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const { mutateAsync: signUp } = useSignUp();
  const { setMode } = useModalStore();

  const form = useForm<SignUpFormSchema>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      passwordRepeat: '',
      firstName: '',
      lastName: '',
      age: 18,
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
        ...(values.age && { age: values.age }),
      });

      setMode(null);
    } catch (error) {
      toast.error(error as string);
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
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('emailPlaceholder')} {...field} />
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
              <FormLabel>{t('username')}</FormLabel>
              <FormControl>
                <Input placeholder={t('usernamePlaceholder')} {...field} />
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
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...field}
                />
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
              <FormLabel>{t('passwordRepeat')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...field}
                />
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
              <FormLabel>{t('firstName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('john')} {...field} />
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
              <FormLabel>{t('lastName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('doe')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('age')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('agePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormMessage />

        <Button type="submit" className="w-full">
          {t('signUp')}
        </Button>
      </form>
    </Form>
  );
}
