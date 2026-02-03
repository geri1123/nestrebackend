import { SetMetadata } from '@nestjs/common';

export const REQUIRE_AGENCY_CONTEXT = 'requireAgencyContext';
export const RequireAgencyContext = () => SetMetadata(REQUIRE_AGENCY_CONTEXT, true);