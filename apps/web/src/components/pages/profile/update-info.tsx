import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';
import { useGetProfile } from '@/hooks/read';
import { useUpdateProfile } from '@/hooks/write';

const formSchema = z.object({
  firstName: z
    .string()
    .refine(
      (firstName) => {
        return firstName === '' || firstName.length >= 3;
      },
      {
        message: 'firstNameTooShort',
      },
    )
    .transform((value) => {
      return value === '' ? undefined : value.trim();
    }),
  lastName: z
    .string()
    .refine(
      (firstName) => {
        return firstName === '' || firstName.length >= 3;
      },
      {
        message: 'lastNameTooShort',
      },
    )
    .transform((value) => {
      return value === '' ? undefined : value.trim();
    }),
  age: z
    .string()
    .refine(
      (age) => {
        if (age === '') return true;
        const ageNum = parseInt(age, 10);
        return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 120;
      },
      {
        message: 'invalidAge',
      },
    )
    .transform((value) => {
      if (value === '') return undefined;
      return parseInt(value, 10);
    }),
});

type UpdateProfileFormSchema = z.infer<typeof formSchema>;

export const UpdateProfileInfo = () => {
  const { isSuccess } = useGetProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const { t } = useTranslation(['translation', 'validation', 'badges']);

  const form = useForm<UpdateProfileFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 18,
    },
  });

  const clearForm = async () => {
    form.resetField('firstName');
    form.resetField('lastName');
    form.resetField('age');
  };

  const onSubmit = async (values: UpdateProfileFormSchema) => {
    try {
      await updateProfile({
        ...(values.firstName && { firstName: values.firstName }),
        ...(values.lastName && { lastName: values.lastName }),
        ...(values.age && { age: values.age }),
      });

      clearForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{t('updateYourProfile')}</h2>
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
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

            <Button
              type="reset"
              disabled={!form.formState.isDirty}
              variant="destructive"
              onClick={clearForm}
              className="w-full"
            >
              {t('cancel')}
            </Button>

            <Button
              disabled={!(form.formState.isDirty && isSuccess)}
              type="submit"
              variant="outline"
              className="w-full"
            >
              {t('updateInformation')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
