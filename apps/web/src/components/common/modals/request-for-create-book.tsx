import { zodResolver } from '@hookform/resolvers/zod';
import { isDefined } from '@read-n-feed/shared';
import { useForm } from 'react-hook-form';
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
  Textarea,
} from '@/components/ui';
import { SupportedLanguages } from '@/constants';
import { useCreateBookRequest } from '@/hooks/write/book-requests';
import { clearObject } from '@/lib';
import { useModalStore } from '@/store';

const formSchema = z.object({
  title: z.string().nonempty('Title cannot be empty'),
  description: z.string().optional(),
  authorNames: z.string().optional(),
  genreNames: z.string().optional(),
  publicationDate: z.string().optional(),
  publisher: z.string().optional(),
  tagLabels: z.string().optional(),
  fileLanguage: z.enum(SupportedLanguages).optional(),
  language: z.enum(SupportedLanguages).optional(),
  file: z.any({
    message: 'File is required',
  }),
});

type CreateRequestSchema = z.infer<typeof formSchema>;

export function CreateRequestBookModal() {
  const { mutateAsync: createRequest } = useCreateBookRequest();
  const { setMode } = useModalStore();

  const form = useForm<CreateRequestSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      authorNames: '',
      genreNames: '',
      publicationDate: '',
      publisher: '',
      tagLabels: '',
      fileLanguage: undefined,
      language: undefined,
      // file: {},
    },
  });

  const onSubmit = async (values: CreateRequestSchema) => {
    try {
      const data = clearObject(values) as CreateRequestSchema;

      const file = data.file as File;

      const fileFormat = file.name.split('.').pop()?.toUpperCase();
      const ACCEPTED_FILE_FORMATS = ['PDF', 'EPUB', 'MOBI'];

      if (
        !isDefined(fileFormat) ||
        !ACCEPTED_FILE_FORMATS.includes(fileFormat)
      ) {
        toast.error('File format is not valid');
        return;
      }

      await createRequest({
        ...data,
        authorNames: data.authorNames?.split(',').map((name) => name.trim()),
        genreNames: data.genreNames?.split(',').map((name) => name.trim()),
        tagLabels: data.tagLabels?.split(',').map((name) => name.trim()),
        fileFormat: fileFormat,
        language: data.language,
        file: file,
      });

      toast.success('Request created successfully');
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Book Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter book title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter book description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authorNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authors</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter author names separated by commas"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genreNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genres</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter genres separated by commas"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publicationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publication Date</FormLabel>
              <FormControl>
                <Input type="date" placeholder="YYYY-MM-DD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publisher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publisher</FormLabel>
              <FormControl>
                <Input placeholder="Enter publisher name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagLabels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fileLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Language</FormLabel>
              <FormControl>
                <Input placeholder="Enter file language" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Language</FormLabel>
              <FormControl>
                <Input placeholder="Enter original language" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  {...fieldProps}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </form>
    </Form>
  );
}
