import { Conditional } from '@/components/common';
import { Card, CardContent, CardHeader, Avatar } from '@/components/ui';
import { useProfile } from '@/hooks/read/profile';

export const ProfilePage = () => {
  const { data: profileData, isLoading } = useProfile();

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Profile</h2>
      </CardHeader>

      <CardContent>
        <Conditional condition={isLoading}>
          <Conditional.True>True</Conditional.True>

          <Conditional.False>
            <Avatar
              src={profileData?.avatarUrl}
              alt="avatar"
              className="size-48"
            />
          </Conditional.False>
        </Conditional>
      </CardContent>
    </Card>
  );
};
