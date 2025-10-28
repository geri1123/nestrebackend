export interface IUsernameHistoryRepository {
    getLastUsernameChange(userId: number): Promise<any | null>;
    saveUsernameChange(
        userId: number,
        oldUsername: string,
        newUsername: string,
        nextUpdateDate: Date
    ): Promise<void>;
}