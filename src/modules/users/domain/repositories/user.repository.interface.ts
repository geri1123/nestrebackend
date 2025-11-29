
import { UserEntity } from '../../entities/user.entity';

export interface IUserDomainRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIdentifier(identifier: string): Promise<UserEntity | null>;
  usernameExists(username: string): Promise<boolean>;
  emailExists(email: string): Promise<boolean>;
  delete(user: UserEntity): Promise<void>;
  findUnverifiedBefore(date: Date): Promise<UserEntity[]>;
}
