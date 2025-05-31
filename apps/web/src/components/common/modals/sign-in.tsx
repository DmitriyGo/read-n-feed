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
import { useSignIn } from '@/hooks/write';
import { useModalStore } from '@/store';

const formSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .nonempty(t('emailCannotBeEmpty'))
      .email(t('incorrectEmail')),
    password: z
      .string()
      .nonempty(t('passwordCannotBeEmpty'))
      .min(8, t('passwordTooShort')),
  });

type SignInFormSchema = z.infer<ReturnType<typeof formSchema>>;

export function SignInModal() {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const { mutateAsync: signIn } = useSignIn();
  const { setMode } = useModalStore();

  const form = useForm<SignInFormSchema>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormSchema) => {
    try {
      await signIn({
        email: values.email,
        password: values.password,
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

        <Button type="submit" className="w-full">
          {t('logIn')}
        </Button>
      </form>
    </Form>
  );
}
