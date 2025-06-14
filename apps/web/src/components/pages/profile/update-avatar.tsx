import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, Input } from '@/components/ui';
import { useUpdateAvatar } from '@/hooks/write';

export const UpdateProfileAvatar = () => {
  const { t } = useTranslation(['translation']);
  const { mutateAsync: updateAvatar, isPending } = useUpdateAvatar();

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('onlyImagesAllowed'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('imageTooLarge'));
        return;
      }

      try {
        await updateAvatar(file);
        toast.success(t('avatarUpdated'));

        // Reset the input
        event.target.value = '';
      } catch (error) {
        console.error('Failed to update avatar:', error);
        toast.error(t('failedToUpdateAvatar'));
      }
    },
    [t, updateAvatar],
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{t('updateYourAvatar')}</h2>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isPending}
            className="w-full"
          />
          <p className="text-sm text-gray-500">{t('imageRequirements')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
