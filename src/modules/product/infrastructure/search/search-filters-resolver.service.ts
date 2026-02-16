import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { SearchFiltersDto } from '../../dto/product-filters.dto';

@Injectable()
export class SearchFiltersResolver {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeSlug(value?: string | null): string | undefined {
    if (!value) return undefined;
    return value
      .trim()
      .toLowerCase()
      .replace(/ë/g, 'e')
      .replace(/ç/g, 'c');
  }

  async resolve(filters: SearchFiltersDto): Promise<SearchFiltersDto> {
    const result: SearchFiltersDto = { ...filters };

    const normalizedCategory = this.normalizeSlug(result.category);
    const normalizedSubcategory = this.normalizeSlug(result.subcategory);
    const normalizedListingType = this.normalizeSlug(result.listingtype);

    if (process.env.NODE_ENV === 'development') {
      console.log(' RESOLVING SLUGS:', {
        original: {
          category: result.category,
          subcategory: result.subcategory,
          listingtype: result.listingtype,
        },
        normalized: {
          category: normalizedCategory,
          subcategory: normalizedSubcategory,
          listingtype: normalizedListingType,
        },
      });
    }

    // CATEGORY
    if (normalizedCategory && !result.categoryId) {
      try {
        const category = await this.prisma.category.findUnique({
          where: { slug: normalizedCategory },
        });

        if (!category) {
          console.warn(` Category slug "${normalizedCategory}" not found in database`);
        } else {
          console.log(` Category found: ${category.slug} (ID: ${category.id})`);
        }

        result.categoryId = category?.id || undefined;
      } catch (error) {
        console.error(' Error finding category:', error);
        throw error;
      }
    }

    // SUBCATEGORY
    if (normalizedSubcategory && !result.subcategoryId) {
      try {
        const subcategory = await this.prisma.subcategory.findUnique({
          where: { slug: normalizedSubcategory },
        });

        if (!subcategory) {
          console.warn(` Subcategory slug "${normalizedSubcategory}" not found in database`);
        } else {
          console.log(` Subcategory found: ${subcategory.slug} (ID: ${subcategory.id})`);
        }

        result.subcategoryId = subcategory?.id || undefined;

        if (!result.categoryId && subcategory?.categoryId) {
          result.categoryId = subcategory.categoryId;
          console.log(` Auto-bound parent categoryId: ${subcategory.categoryId}`);
        }
      } catch (error) {
        console.error(' Error finding subcategory:', error);
        throw error;
      }
    }

    // LISTING TYPE
    if (normalizedListingType && !result.listingTypeId) {
      try {
        const listingType = await this.prisma.listingType.findFirst({
          where: { slug: normalizedListingType },
        });

        if (!listingType) {
          console.warn(`Listing type slug "${normalizedListingType}" not found in database`);
        } else {
          console.log(` Listing type found: ${listingType.slug} (ID: ${listingType.id})`);
        }

        result.listingTypeId = listingType?.id || undefined;
      } catch (error) {
        console.error('Error finding listing type:', error);
        throw error;
      }
    }

    // ATTRIBUTES – resolve codes to IDs
    if (result.attributeCodes && Object.keys(result.attributeCodes).length > 0) {
      const resolvedAttributes: Record<number, number[]> = result.attributes || {};

      for (const [attributeCode, valueCodes] of Object.entries(result.attributeCodes)) {
        try {
          const normalizedAttrCode = this.normalizeSlug(attributeCode);
          if (!normalizedAttrCode) {
            console.warn(` Empty attribute code after normalization: "${attributeCode}"`);
            continue;
          }

          console.log(`Looking for attribute code: "${normalizedAttrCode}"`);

          const attribute = await this.prisma.attribute.findFirst({
            where: {
              code: normalizedAttrCode,
              ...(result.subcategoryId && { subcategoryId: result.subcategoryId }),
            },
          });

          if (!attribute) {
            console.warn(
              ` Attribute code "${attributeCode}" not found${
                result.subcategoryId ? ` for subcategoryId ${result.subcategoryId}` : ''
              }`,
            );
            continue;
          }

          console.log(` Attribute found: ${attribute.code} (ID: ${attribute.id})`);

          const valueCodeArray = valueCodes
            .split(',')
            .map((v) => this.normalizeSlug(v.trim()))
            .filter((code): code is string => code !== undefined);

          if (valueCodeArray.length === 0) {
            console.warn(` No valid value codes for attribute "${attributeCode}"`);
            continue;
          }

          console.log(` Looking for value codes: [${valueCodeArray.join(', ')}]`);

          const attributeValues = await this.prisma.attributeValue.findMany({
            where: {
              attributeId: attribute.id,
              valueCode: { in: valueCodeArray },
            },
            select: { id: true, valueCode: true },
          });

          if (attributeValues.length > 0) {
            const valueIds = attributeValues.map((av) => av.id);
            resolvedAttributes[attribute.id] = [
              ...(resolvedAttributes[attribute.id] || []),
              ...valueIds,
            ];
            console.log(
              `Found ${attributeValues.length} values: ${attributeValues
                .map((av) => av.valueCode)
                .join(', ')}`,
            );
          } else {
            console.warn(
              ` No values found for attribute "${attributeCode}" with codes: ${valueCodeArray.join(
                ', ',
              )}`,
            );
          }
        } catch (error) {
          console.error(` Error resolving attribute "${attributeCode}":`, error);
        }
      }

      result.attributes = resolvedAttributes;
    }

    console.log(' RESOLVED IDs:', {
      category: result.category,
      subcategory: result.subcategory,
      listingtype: result.listingtype,
      categoryId: result.categoryId,
      subcategoryId: result.subcategoryId,
      listingTypeId: result.listingTypeId,
      attributeCodes: result.attributeCodes,
      attributes: result.attributes,
    });

    return result;
  }
}