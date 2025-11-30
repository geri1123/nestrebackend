import { UsernameHistory } from "../entities/username-history.entity";

export interface IUsernameHistoryDomainRepository {
  getLastUsernameChange(userId: number): Promise<UsernameHistory | null>;
  saveUsernameChange(
    userId: number,
    oldUsername: string,
    newUsername: string,
    nextUpdateDate: Date,
  ): Promise<void>;
}