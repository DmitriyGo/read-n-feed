import { User } from '@read-n-feed/domain';
import * as bcrypt from 'bcrypt';

import { UserAlreadyExistsError } from '../users/errors/user-already-exists.error';
import { UserRepositoryPort } from '../users/user.repository.port';

export class RegisterUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(email: string, password: string): Promise<User> {
    const existing = await this.userRepo.findUserByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsError(email);
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = new User(crypto.randomUUID(), email, hashed);
    return this.userRepo.createUser(user);
  }
}
