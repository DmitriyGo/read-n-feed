import { zodResolver } from '@hookform/resolvers/zod';
import { BookRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useEffect } from 'react';
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
import { useBookRequestById, useUpdateBookRequest } from '@/hooks';
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
});

type CreateRequestSchema = z.infer<typeof formSchema>;

export function UpdateRequestBookModal() {
  const { mutateAsync: updateRequest } = useUpdateBookRequest();
  const { setMode, params } = useModalStore();

  const requestId = params['requestId'] as string;

  const { data } = useBookRequestById({
    id: requestId,
    enabled:
      isDefined(requestId) && typeof requestId === 'string' && requestId !== '',
  });

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
    },
  });

  const onSubmit = async (values: CreateRequestSchema) => {
    try {
      const data = clearObject(values) as CreateRequestSchema;

      await updateRequest({
        id: requestId,
        dto: {
          ...data,
          authorNames: data.authorNames?.split(',').map((name) => name.trim()),
          genreNames: data.genreNames?.split(',').map((name) => name.trim()),
          tagLabels: data.tagLabels?.split(',').map((name) => name.trim()),
        },
      });

      toast.success('Request created successfully');
      setMode(null);
    } catch (error) {
      toast.error(error as string);
    }
  };

  useEffect(() => {
    if (isDefined(data?.data)) {
      form.reset({
        authorNames: data.data?.authorNames?.join(',') ?? '',
        description: data.data?.description ?? '',
        genreNames: data.data?.genreNames?.join(',') ?? '',
        publicationDate: String(data.data?.publicationDate ?? ''),
        publisher: data.data?.publisher ?? '',
        tagLabels: data.data?.tagLabels?.join(',') ?? '',
        title: data.data?.title ?? '',
      });
    }
  }, [data, form]);

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

        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </form>
    </Form>
  );
}
