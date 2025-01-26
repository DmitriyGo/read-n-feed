import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository, User, UserProps } from '@read-n-feed/domain';

@Injectable()
export class UserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  async updateUserProfile(
    userId: string,
    partial: Partial<UserProps>,
  ): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    user.updateProfile(partial);
    return this.userRepo.save(user);
  }

  async blockUser(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    user.blockUser();
    return this.userRepo.save(user);
  }

  async unblockUser(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    user.unblockUser();
    return this.userRepo.save(user);
  }
}
