import { useTranslation } from 'react-i18next';

import { Badges, PartiallyLoadedContent } from '@/components/common';
import { Card, CardContent, CardHeader, Avatar, Badge } from '@/components/ui';
import { useGetProfile } from '@/hooks/read';

export const ShowProfileInfo = () => {
  const { data, isLoading } = useGetProfile();
  const profileData = data?.data;

  const { t } = useTranslation(['translation', 'validation', 'badges']);

  return (
    <Card className="[&:p]:text-sm">
      <CardHeader>
        <h2 className="!text-xl font-semibold">{t('yourProfile')}</h2>
      </CardHeader>

      <CardContent className="grid md:grid-cols-[auto_auto] xl:grid-cols-[auto_auto_auto] gap-4">
        <Avatar
          src={profileData?.avatarUrl}
          alt="avatar"
          className="size-48 mx-auto"
        />

        <Card>
          <CardHeader>
            <p>{t('essentialData')}:</p>
          </CardHeader>
          <CardContent className="gap-2 flex flex-col">
            <PartiallyLoadedContent
              label={t('email')}
              content={profileData?.email}
            />
            <PartiallyLoadedContent
              label={t('username')}
              content={profileData?.username}
            />
            <PartiallyLoadedContent
              label={t('firstName')}
              content={profileData?.firstName}
            />
            <PartiallyLoadedContent
              label={t('lastName')}
              content={profileData?.lastName}
            />
            <PartiallyLoadedContent
              label={t('age')}
              content={profileData?.age ?? null}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <p>{t('additionalData')}:</p>
          </CardHeader>
          <CardContent className="gap-2 flex flex-col">
            <PartiallyLoadedContent
              className="h-[22px]"
              label={t('status')}
              isLoading={isLoading}
              content={
                <Badge
                  variant={
                    profileData?.isBlocked === true ? 'destructive' : 'default'
                  }
                >
                  {profileData?.isBlocked === true
                    ? t('blocked')
                    : t('notBlocked')}
                </Badge>
              }
            />

            <Badges
              label={t('roles')}
              tags={profileData?.roles.map((role) => t(role.toLowerCase()))}
            />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
