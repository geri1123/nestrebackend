import { Inject, Injectable } from '@nestjs/common';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import { GetAgencyByIdUseCase } from './get-agency-by-id.use-case';
import { SupportedLang } from '../../../../locales';

export interface UpdateAgencyFieldsData {
  agencyName?: string;
  agencyEmail?: string;
  phone?: string;
  address?: string;
  website?: string;
}

@Injectable()
export class UpdateAgencyFieldsUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly getAgencyById: GetAgencyByIdUseCase,
  ) {}

  async execute(
    agencyId: number,
    data: UpdateAgencyFieldsData,
    language: SupportedLang = 'al',
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Verify agency exists
    const agency = await this.getAgencyById.execute(agencyId, language);

    // Update domain entity
    agency.updateFields({
      agencyName: data.agencyName,
      agencyEmail: data.agencyEmail,
      phone: data.phone,
      address: data.address,
      website: data.website,
    });

    // Prepare data for persistence
    const dataToUpdate: any = {};
    if (data.agencyName !== undefined) dataToUpdate.agency_name = data.agencyName;
    if (data.agencyEmail !== undefined) dataToUpdate.agency_email = data.agencyEmail;
    if (data.phone !== undefined) dataToUpdate.phone = data.phone;
    if (data.address !== undefined) dataToUpdate.address = data.address;
    if (data.website !== undefined) dataToUpdate.website = data.website;

    if (Object.keys(dataToUpdate).length === 0) {
      return {
        success: false,
        message: 'No fields provided.',
        data: null,
      };
    }

    // Persist changes
    const updatedAgency = await this.agencyRepository.updateFields(agencyId, dataToUpdate);

    return {
      success: true,
      message: 'Agency updated successfully.',
      data: updatedAgency,
    };
  }
}