export interface PaginatedAgenciesVO {
  total: number;
  page: number;
  limit: number;
  agencies: {
    id: number;
    name: string;
    logo: string | null;
    address: string;
    created_at: string;
  }[];
}