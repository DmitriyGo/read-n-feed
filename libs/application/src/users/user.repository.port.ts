import { User } from '@read-n-feed/domain';

export interface UserRepositoryPort {
  createUser(user: User): Promise<User>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
