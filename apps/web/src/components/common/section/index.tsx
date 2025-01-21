import { HTMLProps } from 'react';

import {
  BaseComponentProps,
  FCWithNames,
  getChildrenOnDisplayName,
} from '@/types';

type SectionElements = 'Header' | 'Content' | 'Footer';

type SectionComponent = BaseComponentProps<HTMLProps<HTMLDivElement>>;

export const Section = ({ children, className }: SectionComponent) => {
  const header = getChildrenOnDisplayName<SectionElements>(children, 'Header');
  const content = getChildrenOnDisplayName<SectionElements>(
    children,
    'Content',
  );
  const footer = getChildrenOnDisplayName<SectionElements>(children, 'Footer');

  return (
    <section className={className}>
      {header}
      {content}
      {footer}
    </section>
  );
};

const Header: FCWithNames<SectionElements, SectionComponent> = ({
  children,
  className,
}) => {
  return <header className={className}>{children}</header>;
};

Header.displayName = 'Header';
Section.Header = Header;

const Content: FCWithNames<SectionElements, SectionComponent> = ({
  children,
  className,
}) => {
  return <main className={className}>{children}</main>;
};

Content.displayName = 'Content';
Section.Content = Content;

const Footer: FCWithNames<SectionElements, SectionComponent> = ({
  children,
  className,
}) => {
  return <footer className={className}>{children}</footer>;
};

Footer.displayName = 'Footer';
Section.Footer = Footer;
