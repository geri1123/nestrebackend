export interface PublicUserProfile {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  aboutMe: string | null;
  profileImgUrl: string | null;
  role: string;
  createdAt: Date;
  agency: { id: number; agencyName: string; logo: string | null } | null;
  roleInAgency: string | null;
}