import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { z } from 'zod';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '@/components/ui';
import { useVerifyRequest } from '@/hooks/write';
import { useModalStore } from '@/store';

const formSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().min(1, 'rejectionReasonRequired').optional(),
    adminNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'REJECTED') {
        return data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    },
    {
      message: 'rejectionReasonRequired',
    },
  );

type VerifyRequestSchema = z.infer<typeof formSchema>;

export function VerifyRequestModal() {
  const { t } = useTranslation();
  const { mutateAsync: verifyRequest } = useVerifyRequest();
  const { setMode, params, clearParams } = useModalStore();

  const requestId = params['requestId'] as string;
  const requestType = (params['requestType'] as 'book' | 'file') || 'book';

  const form = useForm<VerifyRequestSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'APPROVED',
      rejectionReason: '',
      adminNotes: '',
    },
  });

  const status = form.watch('status');

  const onSubmit = async (values: VerifyRequestSchema) => {
    try {
      await verifyRequest({
        requestId,
        typeOf: requestType,
        body: {
          status: values.status,
          rejectionReason:
            values.status === 'REJECTED' ? values.rejectionReason : undefined,
          adminNotes: values.adminNotes,
        },
      });

      clearParams();
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
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('decisionStatus')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="APPROVED" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('approve')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="REJECTED" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('reject')}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === 'REJECTED' && (
          <FormField
            control={form.control}
            name="rejectionReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('rejectionReason')} *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('enterRejectionReason')}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="adminNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('adminNotes')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('enterAdminNotes')}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {status === 'APPROVED' ? t('approveRequest') : t('rejectRequest')}
        </Button>
      </form>
    </Form>
  );
}
