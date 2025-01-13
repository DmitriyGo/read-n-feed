export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public password: string, // hashed
    public role = 'user',
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
