import { SupportedLang } from "../../../../locales";
import { AgencyAgentRoleInAgency, AgencyAgentStatus } from "@prisma/client";
import { UpdateAgentsDto } from "../../dto/update-agents.dto";

const fieldTranslations = {
  commissionRate: {
    en: "commission rate",
    al: "përqindja e komisionit",
    it: "percentuale di commissione",
  },
  roleInAgency: {
    en: "role",
    al: "roli",
    it: "ruolo",
  },
  status: {
    en: "status",
    al: "statusi",
    it: "stato",
  },
  endDate: {
    en: "end date",
    al: "data e përfundimit",
    it: "data di fine",
  },
  permissions: {
    en: "permissions",
    al: "lejet",
    it: "permessi",
  },
};

const roleTranslations: Record<AgencyAgentRoleInAgency, Record<SupportedLang, string>> = {
  agent: { en: "agent", al: "agjent", it: "agente" },
  senior_agent: { en: "senior agent", al: "agjent i lartë", it: "agente senior" },
  team_lead: { en: "team lead", al: "udhëheqës i ekipit", it: "capo squadra" },
};

const statusTranslations: Record<AgencyAgentStatus, Record<SupportedLang, string>> = {
  active: { en: "active", al: "aktiv", it: "attivo" },
  terminated: { en: "terminated", al: "përfunduar", it: "terminato" },
  inactive: { en: "inactive", al: "jo aktiv", it: "inattivo" },
};

const permissionTranslations: Record<string, Record<SupportedLang, string>> = {
  canEditOwnPost: {
    en: "edit own posts",
    al: "ndryshoni postimet e veta",
    it: "modificare i propri post",
  },
  canEditOthersPost: {
    en: "edit others' posts",
    al: "ndryshoni postimet e të tjerëve",
    it: "modificare i post degli altri",
  },
  canApproveRequests: {
    en: "approve requests",
    al: "miratoni kërkesat",
    it: "approvare le richieste",
  },
  canViewAllPosts: {
    en: "view all posts",
    al: "shikoni të gjitha postimet",
    it: "visualizzare tutti i post",
  },
  canDeletePosts: {
    en: "delete posts",
    al: "fshini postimet",
    it: "eliminare i post",
  },
  canManageAgents: {
    en: "manage agents",
    al: "menaxhoni agjentët",
    it: "gestire gli agenti",
  },
};

export function translateAgentChanges(dto: UpdateAgentsDto, lang: SupportedLang): string {
  const changes: string[] = [];

  if (dto.commissionRate !== undefined)
    changes.push(`${fieldTranslations.commissionRate[lang]} → ${dto.commissionRate}`);

  if (dto.roleInAgency !== undefined)
    changes.push(
      `${fieldTranslations.roleInAgency[lang]} → ${roleTranslations[dto.roleInAgency][lang]}`
    );

  if (dto.status !== undefined)
    changes.push(
      `${fieldTranslations.status[lang]} → ${statusTranslations[dto.status][lang]}`
    );

  if (dto.endDate !== undefined)
    changes.push(
      `${fieldTranslations.endDate[lang]} → ${new Date(dto.endDate).toLocaleDateString()}`
    );

  if (dto.permissions !== undefined) {
    const permissionChanges: string[] = [];

    Object.entries(dto.permissions).forEach(([key, value]) => {
      if (permissionTranslations[key]) {
        const status = value
          ? (lang === 'al' ? 'aktiv' : lang === 'it' ? 'attivo' : 'enabled')
          : (lang === 'al' ? 'joaktiv' : lang === 'it' ? 'disattivato' : 'disabled');
        permissionChanges.push(`${permissionTranslations[key][lang]} (${status})`);
      }
    });

    if (permissionChanges.length > 0) {
      changes.push(`${fieldTranslations.permissions[lang]}: ${permissionChanges.join(', ')}`);
    }
  }

  return changes.join(", ");
}

export function hasAgentChanges(dto: UpdateAgentsDto, existing: any): boolean {
  if (dto.roleInAgency !== undefined && dto.roleInAgency !== existing.roleInAgency)
    return true;

  if (dto.commissionRate !== undefined && dto.commissionRate !== existing.commissionRate)
    return true;

  if (dto.endDate !== undefined) {
    const newDate = new Date(dto.endDate).getTime();
    const oldDate = existing.endDate ? new Date(existing.endDate).getTime() : null;
    if (newDate !== oldDate) return true;
  }

  if (dto.status !== undefined && dto.status !== existing.status)
    return true;

  if (dto.permissions) {
    const existingPerms = existing.permissions || {};
    for (const [key, value] of Object.entries(dto.permissions)) {
      if (existingPerms[key] !== value) return true;
    }
  }

  return false;
}