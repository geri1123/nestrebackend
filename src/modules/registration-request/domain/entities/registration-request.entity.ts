export class RegistrationRequestEntity {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly agencyId: number | null,
    public readonly idCardNumber: string | null,
    public status: string,
    public readonly user: {
      email: string;
      first_name: string | null;
      last_name: string | null;
      role: string;
      status: string;
    }
  ) {}

  belongsToAgency(agencyId: number): boolean {
    return this.agencyId === agencyId;
  }

  approve() {
    this.status = "approved";
  }

  reject() {
    this.status = "rejected";
  }
}