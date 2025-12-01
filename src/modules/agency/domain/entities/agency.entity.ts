import { agency_status } from "@prisma/client";
import { AgencyStatus } from "../types/agency-status.type";
export class Agency {
  constructor(
    public readonly id: number,
    public agencyName: string,
    public licenseNumber: string,
    public address: string,
    public ownerUserId: number,
    public status: AgencyStatus,
    public publicCode: string,
    public agencyEmail?: string,
    public phone?: string,
    public website?: string,
    public logo?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  // Domain methods
  updateFields(data: {
    agencyName?: string;
    agencyEmail?: string;
    phone?: string;
    address?: string;
    website?: string;
  }): void {
    if (data.agencyName !== undefined) this.agencyName = data.agencyName;
    if (data.agencyEmail !== undefined) this.agencyEmail = data.agencyEmail;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
    if (data.website !== undefined) this.website = data.website;
  }

  updateLogo(logoPath: string): void {
    this.logo = logoPath;
  }

  removeLogo(): void {
    this.logo = undefined;
  }

  activate(): void {
    if (this.status !=="active") {
      this.status = "active";
    }
  }

  suspend(): void {
    if (this.status !== "suspended") {
      this.status = "suspended";
    }
  }

  isActive(): boolean {
    return this.status === "active";
  }

  isSuspended(): boolean {
    return this.status === "suspended";
  }

  static create(data: {
    id: number;
    agencyName: string;
    licenseNumber: string;
    address: string;
    ownerUserId: number;
    status: AgencyStatus;
    publicCode: string;
    agencyEmail?: string;
    phone?: string;
    website?: string;
    logo?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Agency {
    return new Agency(
      data.id,
      data.agencyName,
      data.licenseNumber,
      data.address,
      data.ownerUserId,
      data.status,
      data.publicCode,
      data.agencyEmail,
      data.phone,
      data.website,
      data.logo,
      data.createdAt,
      data.updatedAt,
    );
  }
}
