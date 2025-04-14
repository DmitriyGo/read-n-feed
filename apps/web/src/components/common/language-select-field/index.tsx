import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui';
import { SupportedLanguages } from '@/constants';

type LanguageSelectFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  languages?: string[];
};

export function LanguageSelectField<TFieldValues extends FieldValues>({
  field,
  label,
  languages = SupportedLanguages,
}: LanguageSelectFieldProps<TFieldValues>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <RadioGroup
          defaultValue={languages[0]}
          className="flex flex-row flex-wrap gap-4"
          onValueChange={field.onChange}
        >
          {languages.map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <RadioGroupItem value={lang} id={`${field.name}-${lang}`} />
              <Label htmlFor={`${field.name}-${lang}`}>
                {lang.toUpperCase()}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
