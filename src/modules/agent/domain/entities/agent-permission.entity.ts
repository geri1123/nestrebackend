export class AgentPermissionEntity {
  constructor(
    public readonly id: number,
    public readonly agencyAgentId: number,
    public readonly agencyId: number,
    public canEditOwnPost: boolean,
    public canEditOthersPost: boolean,
    public canApproveRequests: boolean,
    public canViewAllPosts: boolean,
    public canDeletePosts: boolean,
    public canManageAgents: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
  ) {}
}