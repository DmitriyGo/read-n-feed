import { PartiallyLoadedContent } from '@/components/common';
import { Card, CardContent, CardHeader, Avatar, Badge } from '@/components/ui';
import { useGetProfile } from '@/hooks/read';

export const ShowProfileInfo = () => {
  const { data, isLoading } = useGetProfile();
  const profileData = data?.data;

  return (
    <Card className="[&:p]:text-sm">
      <CardHeader>
        <h2 className="!text-xl font-semibold">Your Profile</h2>
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <Avatar src={profileData?.avatarUrl} alt="avatar" className="size-48" />

        <Card>
          <CardHeader>
            <p>Essential data:</p>
          </CardHeader>
          <CardContent className="gap-2 flex flex-col">
            <PartiallyLoadedContent
              label="Email"
              content={profileData?.email}
            />
            <PartiallyLoadedContent
              label="Username"
              content={profileData?.username}
            />
            <PartiallyLoadedContent
              label="First Name"
              content={profileData?.firstName}
            />
            <PartiallyLoadedContent
              label="Last Name"
              content={profileData?.lastName}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p>Additional Data:</p>
          </CardHeader>
          <CardContent className="gap-2 flex flex-col">
            <PartiallyLoadedContent
              className="h-[22px]"
              label="Status"
              isLoading={isLoading}
              content={
                <Badge
                  variant={
                    profileData?.isBlocked === true ? 'destructive' : 'default'
                  }
                >
                  {profileData?.isBlocked === true ? 'Blocked' : 'Not Blocked'}
                </Badge>
              }
            />

            <PartiallyLoadedContent
              className="min-h-[22px]"
              label="Roles"
              isLoading={isLoading}
              content={profileData?.roles.map((role) => (
                <Badge
                  key={role}
                  variant={role === 'ADMIN' ? 'destructive' : 'default'}
                >
                  {role}
                </Badge>
              ))}
            />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
