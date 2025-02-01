import { Conditional } from '@/components/common';
import { Card, CardContent, CardHeader, Avatar, Badge } from '@/components/ui';
import { useGetProfile } from '@/hooks/read';

export const ShowProfileInfo = () => {
  const { data, isLoading } = useGetProfile();
  const profileData = data?.data;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Your Profile</h2>
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <Conditional condition={isLoading}>
          <Conditional.True>True</Conditional.True>

          <Conditional.False>
            <Avatar
              src={profileData?.avatarUrl}
              alt="avatar"
              className="size-48"
            />

            <Card>
              <CardHeader>
                <p>Essential data:</p>
              </CardHeader>
              <CardContent className="space-y-2 flex flex-col justify-center">
                <p className="text-sm text-neutral-500">
                  Email: {profileData?.email}
                </p>
                <p className="text-sm text-neutral-500">
                  Username: {profileData?.username}
                </p>
                <p className="text-sm text-neutral-500">
                  First Name: {profileData?.firstName ?? 'Not Given'}
                </p>
                <p className="text-sm text-neutral-500">
                  Last Name {profileData?.lastName ?? 'Not Given'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <p>Additional Data:</p>
              </CardHeader>
              <CardContent className="space-y-2 flex flex-col justify-center">
                <div className="text-sm text-neutral-500">
                  <p>Status:&nbsp;</p>
                  <Badge
                    variant={
                      profileData?.isBlocked === true
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {profileData?.isBlocked === true
                      ? 'Blocked'
                      : 'Not Blocked'}
                  </Badge>
                </div>

                <div className="text-sm text-neutral-500">
                  <p>Roles:&nbsp;</p>
                  {profileData?.roles.map((role) => (
                    <Badge
                      key={role}
                      variant={role === 'ADMIN' ? 'destructive' : 'default'}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Conditional.False>
        </Conditional>
      </CardContent>
    </Card>
  );
};
