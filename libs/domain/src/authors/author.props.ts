export interface AuthorProps {
  id: string;
  name: string;
  bio?: string | null;
  dateOfBirth?: Date | null;
  dateOfDeath?: Date | null;
}
