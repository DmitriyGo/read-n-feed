import { UserRole } from './user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string, // hashed password
    public role: UserRole = UserRole.READER,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  updateRole(newRole: UserRole): void {
    this.role = newRole;
  }
}
