import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { FileUploadField } from '../file-upload-field';
import { LanguageSelectField } from '../language-select-field';

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
import { SupportedLanguages } from '@/constants';
import { useCreateFileRequest } from '@/hooks';
import { clearObject, validateFile, getFileExtension } from '@/lib';
import { useModalStore } from '@/store';

const formSchema = z.object({
  fileLanguage: z.enum(SupportedLanguages).optional(),
  filename: z.string(),
  file: z.any().refine((file) => file instanceof File, {
    message: 'File is required',
  }),
});

type CreateRequestSchema = z.infer<typeof formSchema>;

export function CreateFileRequestModal() {
  const { mutateAsync: createRequest } = useCreateFileRequest();
  const { setMode, params, clearParams } = useModalStore();

  const bookId = params['bookId'] as string;

  const form = useForm<CreateRequestSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileLanguage: SupportedLanguages[0],
      filename: '',
    },
  });

  const onSubmit = async (values: CreateRequestSchema) => {
    try {
      const data = clearObject(values) as CreateRequestSchema;
      const file = data.file as File;

      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        toast.error(fileValidation.error);
        return;
      }

      const fileFormat = getFileExtension(file);

      await createRequest({
        bookId,
        format: fileFormat,
        file: file,
      });

      toast.success('Request created successfully');
      clearParams();
      setMode(null);
    } catch (error: any) {
      toast.error(error.message ?? (error as string));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fileLanguage"
          render={({ field }) => (
            <LanguageSelectField field={field} label="File Language" />
          )}
        />

        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter file name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FileUploadField
              field={field}
              label="Upload File"
              required={true}
            />
          )}
        />

        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </form>
    </Form>
  );
}
