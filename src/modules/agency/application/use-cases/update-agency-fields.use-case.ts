import { Inject, Injectable } from '@nestjs/common';

import {
  AGENCY_REPO,
  type IAgencyDomainRepository,
} from '../../domain/repositories/agency.repository.interface';

import { GetAgencyByIdUseCase } from './get-agency-by-id.use-case';

import { SupportedLang, t } from '../../../../locales';

import { throwValidationErrors } from '../../../../common/helpers/validation.helper';

export interface UpdateAgencyFieldsData {
  agencyName?: string;
  agencyEmail?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
}

@Injectable()
export class UpdateAgencyFieldsUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,

    private readonly getAgencyById: GetAgencyByIdUseCase,
  ) {}

  async execute(
    agencyId: number,
    data: UpdateAgencyFieldsData,
    language: SupportedLang = 'al',
  ): Promise<{ success: boolean; message: string; data: any }> {

    const agency = await this.getAgencyById.execute(
      agencyId,
      language,
    );

    const errors: Record<string, string[]> = {};

    const fieldsToUpdate = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    if (Object.keys(fieldsToUpdate).length === 0) {
      return {
        success: false,
        message: 'No fields provided.',
        data: null,
      };
    }

    if (
      data.agencyName &&
      data.agencyName !== agency.agencyName
    ) {
      const exists =
        await this.agencyRepository.agencyNameExists(
          data.agencyName,
        );

      if (exists) {
      errors.agencyName = [t('agencyExists', language)];
      }
    }

    if (Object.keys(errors).length > 0) {
      throwValidationErrors([], language, errors);
    }

    agency.updateFields(fieldsToUpdate);

    const updatedAgency =
      await this.agencyRepository.updateFields(
        agencyId,
        fieldsToUpdate,
      );

    return {
      success: true,
      message: t('agencyUpdatedSuccess', language),
      data: updatedAgency,
    };
  }
}