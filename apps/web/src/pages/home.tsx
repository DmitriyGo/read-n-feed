import { Section, BaseTooltip, ComponentLoader } from '@/components/common';
import { Button } from '@/components/ui';
import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';
import { useModalStore } from '@/store';

export const HomePage = () => {
  const { setMode } = useModalStore();

  const handleLogOut = async () => {
    await axiosSecure.post(ApiRoute.Auth.Logout);
  };

  return (
    <div>
      <p>HomePage</p>
      <Button
        variant="destructive"
        onClick={() => {
          setMode('SignIn');
        }}
      >
        SignIn
      </Button>
      <Button
        variant="default"
        onClick={() => {
          setMode('SignUp');
        }}
      >
        SignUp
      </Button>

      <Section>
        <Section.Header>Header</Section.Header>
        <Section.Content>Content</Section.Content>
        <Section.Footer>Footer</Section.Footer>
      </Section>

      <BaseTooltip content="Loading...">
        <Button className="mx-8" variant="secondary">
          <ComponentLoader />
        </Button>
      </BaseTooltip>

      <Button onClick={handleLogOut} className="mx-8" variant="secondary">
        LogOut
      </Button>
    </div>
  );
};
