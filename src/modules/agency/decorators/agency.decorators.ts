import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiConsumes, 
  ApiBody, 
  ApiOkResponse,
  ApiQuery,
  ApiParam,
  ApiTags,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { 
  ApiSuccessResponse, 
  ApiBadRequestResponse, 
  ApiUnauthorizedResponse,
 
   
} from '../../../common/swagger/response.helper.ts';
import { CreateAgencyDto } from '../dto/create-agency.dto';
import { UpdateAgencyDto } from '../dto/update-agency.dto';
import { PaginatedAgenciesResponse } from '../responses/paginated-agencies.response.js';
import { AgencyDetailResponse } from '../responses/agency-detail.response.js';

// Tags
export const ApiAgencyTags = () => applyDecorators(ApiTags('Agencies'));

// ---------------------------------------------------------
// GET PAGINATED AGENCIES (PUBLIC)
// ---------------------------------------------------------
export const ApiGetPaginatedAgencies = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get paginated list of agencies (Public)' }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page number for pagination'
    }),
    ApiOkResponse({ 
      type: PaginatedAgenciesResponse,
      description: 'Agencies retrieved successfully' 
    })
  );


// ---------------------------------------------------------
// GET AGENCY INFO (PRIVATE)
// ---------------------------------------------------------
export const ApiGetAgencyInfoPrivate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get agency information (Private - Owner/Agent only)' }),
    ApiOkResponse({
      type: AgencyDetailResponse,
      description: 'Agency information retrieved successfully'
    }),
    ApiUnauthorizedResponse(),
    
  );
// ---------------------------------------------------------
// GET AGENCY DETAIL (PUBLIC)
// ---------------------------------------------------------
export const ApiGetAgencyInfoPublic = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get agency details (Public)' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Agency ID',
      example: '1'
    }),
    ApiOkResponse({
      type: AgencyDetailResponse,
      description: 'Agency details retrieved successfully'
    })
  );
// ---------------------------------------------------------
// UPDATE AGENCY FIELDS
// ---------------------------------------------------------
export const ApiUpdateAgencyFields = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Update agency fields (Owner only)' }),
    ApiBody({ type: UpdateAgencyDto }),
    ApiSuccessResponse('Agjencia u përditësua me sukses.'),
    ApiBadRequestResponse('Gabim validimi', {
      agencyName: ['Emri i agjencisë është i detyrueshëm'],
      agencyEmail: ['Email i pavlefshëm'],
      phone: ['Numri i telefonit duhet të jetë midis 5 dhe 20 shifra'],
      address: ['Adresa është e detyrueshme'],
      website: ['URL e pavlefshme']
    }),
    ApiUnauthorizedResponse(),
    
  );

// ---------------------------------------------------------
// UPLOAD AGENCY LOGO
// ---------------------------------------------------------
export const ApiUploadAgencyLogo = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Upload agency logo (Owner only)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Agency logo image file (JPG, PNG, WEBP)'
          }
        },
        required: ['file']
      }
    }),
    ApiOkResponse({
      description: 'Logo uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Imazhi u ngarkua me sukses.' },
          imageUrl: { type: 'string', example: 'https://your-bucket.s3.amazonaws.com/agency-logos/123.jpg' }
        }
      }
    }),
    ApiBadRequestResponse('Gabim', {
      file: ['Asnjë imazh nuk u ngarkua', 'Formati i imazhit nuk është i vlefshëm']
    }),
    ApiUnauthorizedResponse(),
    
  );

// ---------------------------------------------------------
// DELETE AGENCY LOGO
// ---------------------------------------------------------
export const ApiDeleteAgencyLogo = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Delete agency logo (Owner only)' }),
    ApiOkResponse({
      description: 'Logo deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Imazhi u fshi me sukses.' }
        }
      }
    }),
    ApiBadRequestResponse('Gabim', {
      logo: ['Nuk ka logo për tu fshirë']
    }),
    ApiUnauthorizedResponse(),
  
  );

// ---------------------------------------------------------
// CREATE AGENCY
// ---------------------------------------------------------
export const ApiCreateAgency = () =>
  applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Create new agency (User only)' }),
    ApiBody({ type: CreateAgencyDto }),
    ApiOkResponse({
      description: 'Agency created successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Agjencia u krijua me sukses.' },
          agency: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              agency_name: { type: 'string', example: 'DreamHomes Agency' },
              license_number: { type: 'string', example: 'LIC-2025-00123' },
              address: { type: 'string', example: 'Rruga e Kavajës 120' }
            }
          }
        }
      }
    }),
    ApiBadRequestResponse('Gabim validimi', {
      agency_name: ['Emri i agjencisë është i detyrueshëm'],
      license_number: ['Numri i licencës është i detyrueshëm'],
      address: ['Adresa është e detyrueshme']
    }),
    ApiUnauthorizedResponse()
  );