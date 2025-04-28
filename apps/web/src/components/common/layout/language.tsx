import { Label } from '@radix-ui/react-label';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui';
import { SupportedLanguagesMap } from '@/constants';

export const ChangeLanguage = () => {
  const { t, i18n } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="mr-4 rounded-full p-3">
          <Globe />
        </Button>
      </PopoverTrigger>
      <PopoverContent collisionPadding={50} className="w-[270px] space-y-2">
        <Label>{t('selectLanguage')}:</Label>
        <RadioGroup
          onValueChange={async (value) => {
            i18n.changeLanguage(value);
          }}
        >
          {Object.entries(SupportedLanguagesMap).map(([key, value]) => (
            <RadioGroupItem
              value={key}
              id={key}
              label={value}
              key={key}
              checked={i18n.language === key}
            />
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
};
