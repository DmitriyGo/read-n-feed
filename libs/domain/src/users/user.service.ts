import { UserRole } from './user-role.enum';
import { User } from './user.entity';

export class UserDomainService {
  grantAdminRights(user: User): void {
    user.updateRole(UserRole.ADMIN);
  }

  // Additional domain-level validations or rules could go here
}
