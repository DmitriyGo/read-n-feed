import { Section, BaseTooltip, ComponentLoader } from '@/components/common';
import { Button } from '@/components/ui';

export const HomePage = () => {
  return (
    <div>
      <p>HomePage</p>

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
    </div>
  );
};
