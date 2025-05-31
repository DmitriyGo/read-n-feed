import { useState } from 'react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';
import { FileFormat, FileFormats } from '@/constants';
import { cn } from '@/lib/utils';

type FileUploadFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  acceptedFormats?: FileFormat[];
  className?: string;
  required?: boolean;
};

export function FileUploadField<TFieldValues extends FieldValues>({
  field,
  label,
  acceptedFormats = FileFormats,
  className,
  required = false,
}: FileUploadFieldProps<TFieldValues>) {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const [fileName, setFileName] = useState<string>('');

  const acceptString = acceptedFormats
    .map((format) => `.${format.toLowerCase()}`)
    .join(',');

  return (
    <FormItem className={cn(className)}>
      <FormLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <div className="flex flex-col gap-2">
          <Input
            type="file"
            accept={acceptString}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                setFileName(file.name);
                field.onChange(file);
              }
            }}
          />

          {fileName && (
            <p className="text-sm text-muted-foreground truncate">
              {t('selected')}: {fileName}
            </p>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
