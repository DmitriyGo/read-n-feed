import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  Textarea,
} from '@/components/ui';
import { SupportedLanguages, ImageFormats } from '@/constants';
import { useCreateBookRequest } from '@/hooks';
import { clearObject, validateFile, getFileExtension } from '@/lib';
import { useModalStore } from '@/store';

const formSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().nonempty(t('titleCannotBeEmpty')),
    description: z.string().optional(),
    authorNames: z.string().optional(),
    genreNames: z.string().optional(),
    publicationDate: z.string().optional(),
    publisher: z.string().optional(),
    tagLabels: z.string().optional(),
    fileLanguage: z.enum(SupportedLanguages).optional(),
    filename: z.string(),
    language: z.enum(SupportedLanguages).optional(),
    file: z.any().refine((file) => file instanceof File, {
      message: t('fileIsRequired'),
    }),
    coverImage: z
      .any()
      .optional()
      .refine((file) => !file || file instanceof File, {
        message: t('invalidCoverImage'),
      }),
  });

type CreateRequestSchema = z.infer<ReturnType<typeof formSchema>>;

export function CreateBookRequestModal() {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const { mutateAsync: createRequest } = useCreateBookRequest();
  const { setMode } = useModalStore();

  const form = useForm<CreateRequestSchema>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      title: '',
      description: '',
      authorNames: '',
      genreNames: '',
      publicationDate: '',
      publisher: '',
      tagLabels: '',
      fileLanguage: SupportedLanguages[0],
      language: SupportedLanguages[0],
      filename: '',
    },
  });

  const onSubmit = async (values: CreateRequestSchema) => {
    try {
      const data = clearObject(values) as CreateRequestSchema;
      const file = data.file as File;
      const coverImage = data.coverImage as File | undefined;

      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        toast.error(fileValidation.error);
        return;
      }

      // Validate cover image if provided
      if (coverImage) {
        // Check if it's an image file
        if (!coverImage.type.startsWith('image/')) {
          toast.error(t('coverImageMustBeImage'));
          return;
        }

        // Check file size (max 5MB for images)
        const fileSizeInMB = coverImage.size / (1024 * 1024);
        if (fileSizeInMB > 5) {
          toast.error(t('coverImageTooLarge'));
          return;
        }
      }

      const fileFormat = getFileExtension(file);

      await createRequest({
        ...data,
        authorNames: data.authorNames?.split(',').map((name) => name.trim()),
        genreNames: data.genreNames?.split(',').map((name) => name.trim()),
        tagLabels: data.tagLabels?.split(',').map((name) => name.trim()),
        fileFormat: fileFormat,
        file: file,
        coverImage: coverImage,
      });

      setMode(null);
    } catch (error: any) {
      console.log(error as string);
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
              <FormLabel>{t('bookTitle')}</FormLabel>
              <FormControl>
                <Input placeholder={t('enterBookTitle')} {...field} />
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
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('enterBookDescription')}
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
              <FormLabel>{t('authors')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('enterAuthorNamesSeparatedByCommas')}
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
              <FormLabel>{t('genres')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('enterGenresSeparatedByCommas')}
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
              <FormLabel>{t('publicationDate')}</FormLabel>
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
              <FormLabel>{t('publisher')}</FormLabel>
              <FormControl>
                <Input placeholder={t('enterPublisherName')} {...field} />
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
              <FormLabel>{t('tags')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('enterTagsSeparatedByCommas')}
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
            <LanguageSelectField field={field} label={t('fileLanguage')} />
          )}
        />

        {/* <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <LanguageSelectField field={field} label={t('originalLanguage')} />
          )}
        /> */}

        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fileName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('enterFileName')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FileUploadField
              field={field}
              label={t('uploadCoverImage')}
              acceptedFormats={ImageFormats}
              required={false}
            />
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FileUploadField
              field={field}
              label={t('uploadFile')}
              required={true}
            />
          )}
        />

        <Button type="submit" className="w-full">
          {t('submitRequest')}
        </Button>
      </form>
    </Form>
  );
}
