import { SupportedLang } from "../../../../locales";
import { agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
import { UpdateAgentsDto } from "../../dto/update-agents.dto";

// Field translations
const fieldTranslations = {
  commission_rate: {
    en: "commission rate",
    al: "përqindja e komisionit",
    it: "percentuale di commissione",
  },
  role_in_agency: {
    en: "role",
    al: "roli",
    it: "ruolo",
  },
  status: {
    en: "status",
    al: "statusi",
    it: "stato",
  },
  end_date: {
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

// Role translations
const roleTranslations: Record<agencyagent_role_in_agency, Record<SupportedLang, string>> = {
  agent: { en: "agent", al: "agjent", it: "agente" },
  senior_agent: { en: "senior agent", al: "agjent i lartë", it: "agente senior" },
  team_lead: { en: "team lead", al: "udhëheqës i ekipit", it: "capo squadra" },
};

// Status translations
const statusTranslations: Record<agencyagent_status, Record<SupportedLang, string>> = {
  active: { en: "active", al: "aktiv", it: "attivo" },
  terminated: { en: "terminated", al: "përfunduar", it: "terminato" },
  inactive: { en: "inactive", al: "jo aktiv", it: "inattivo" },
};

// Permission translations
const permissionTranslations: Record<string, Record<SupportedLang, string>> = {
  can_edit_own_post: {
    en: "edit own posts",
    al: "ndryshoni postimet e veta",
    it: "modificare i propri post",
  },
  can_edit_others_post: {
    en: "edit others' posts",
    al: "ndryshoni postimet e të tjerëve",
    it: "modificare i post degli altri",
  },
  can_approve_requests: {
    en: "approve requests",
    al: "miratoni kërkesat",
    it: "approvare le richieste",
  },
  can_view_all_posts: {
    en: "view all posts",
    al: "shikoni të gjitha postimet",
    it: "visualizzare tutti i post",
  },
  can_delete_posts: {
    en: "delete posts",
    al: "fshini postimet",
    it: "eliminare i post",
  },
  can_manage_agents: {
    en: "manage agents",
    al: "menaxhoni agjentët",
    it: "gestire gli agenti",
  },
};

export function translateAgentChanges(dto: any, lang: SupportedLang): string {
  const changes: string[] = [];

  if (dto.commission_rate !== undefined)
    changes.push(`${fieldTranslations.commission_rate[lang]} → ${dto.commission_rate}`);

  if (dto.role_in_agency !== undefined)
    changes.push(
      `${fieldTranslations.role_in_agency[lang]} → ${roleTranslations[dto.role_in_agency][lang]}`
    );

  if (dto.status !== undefined)
    changes.push(
      `${fieldTranslations.status[lang]} → ${statusTranslations[dto.status][lang]}`
    );

  if (dto.end_date !== undefined)
    changes.push(
      `${fieldTranslations.end_date[lang]} → ${new Date(dto.end_date).toLocaleDateString()}`
    );

  // Handle permissions
  if (dto.permissions !== undefined) {
    const permissionChanges: string[] = [];
    
    Object.entries(dto.permissions).forEach(([key, value]) => {
      if (permissionTranslations[key]) {
        const status = value ? 
          (lang === 'al' ? 'aktiv' : lang === 'it' ? 'attivo' : 'enabled') : 
          (lang === 'al' ? 'joaktiv' : lang === 'it' ? 'disattivato' : 'disabled');
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
  if (dto.role_in_agency !== undefined && dto.role_in_agency !== existing.role_in_agency)
    return true;

  if (dto.commission_rate !== undefined && dto.commission_rate !== existing.commission_rate)
    return true;

  if (dto.end_date !== undefined) {
    const newDate = new Date(dto.end_date).getTime();
    const oldDate = existing.end_date ? new Date(existing.end_date).getTime() : null;
    if (newDate !== oldDate) return true;
  }

  if (dto.status !== undefined && dto.status !== existing.status)
    return true;

  // Permission changes
  if (dto.permissions) {
    const existingPerms = existing.permissions || {};
    for (const [key, value] of Object.entries(dto.permissions)) {
      if (existingPerms[key] !== value) return true;
    }
  }

  return false;
}