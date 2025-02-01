import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { useUpdateProfile } from '@/hooks/write';

const formSchema = z.object({
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
});

type UpdateProfileFormSchema = z.infer<typeof formSchema>;

export const UpdateProfileInfo = () => {
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const form = useForm<UpdateProfileFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  const clearForm = async () => {
    form.resetField('firstName');
    form.resetField('lastName');
  };

  const onSubmit = async (values: UpdateProfileFormSchema) => {
    try {
      await updateProfile({
        ...(values.firstName && { firstName: values.firstName }),
        ...(values.lastName && { lastName: values.lastName }),
      });

      clearForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Update Your Profile</h2>
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

            <Button
              type="reset"
              disabled={!form.formState.isDirty}
              variant="destructive"
              onClick={clearForm}
              className="w-full"
            >
              Cancel
            </Button>

            <Button
              disabled={!form.formState.isDirty || !form.formState.isValid}
              type="submit"
              variant="outline"
              className="w-full"
            >
              Update Information
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
