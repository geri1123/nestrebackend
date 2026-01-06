import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { SearchFiltersDto } from '../../dto/product-filters.dto';

@Injectable()
export class SearchFiltersResolver {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 Normalize slugs: lowercase, replace ë→e, ç→c
  private normalizeSlug(value?: string | null): string | undefined {
    if (!value) return undefined;
    return value
      .trim()
      .toLowerCase()
      .replace(/ë/g, 'e')
      .replace(/ç/g, 'c');
  }

  /**
   * Resolve slugs and attribute codes to IDs
   * This mutates the filters object.
   */
  async resolve(filters: SearchFiltersDto): Promise<void> {
    const normalizedCategory = this.normalizeSlug(filters.category);
    const normalizedSubcategory = this.normalizeSlug(filters.subcategory);
    const normalizedListingType = this.normalizeSlug(filters.listingtype);

    console.log(' RESOLVING SLUGS:', {
      original: {
        category: filters.category,
        subcategory: filters.subcategory,
        listingtype: filters.listingtype,
      },
      normalized: {
        category: normalizedCategory,
        subcategory: normalizedSubcategory,
        listingtype: normalizedListingType,
      },
    });

    // 🔹 CATEGORY
    if (normalizedCategory && !filters.categoryId) {
      try {
        const category = await this.prisma.category.findUnique({
          where: { slug: normalizedCategory },
        });

        if (!category) {
          console.warn(` Category slug "${normalizedCategory}" not found in database`);
        } else {
          console.log(` Category found: ${category.slug} (ID: ${category.id})`);
        }

        filters.categoryId = category?.id || undefined;
      } catch (error) {
        console.error(' Error finding category:', error);
        throw error;
      }
    }

    // 🔹 SUBCATEGORY – canonical slug only
    if (normalizedSubcategory && !filters.subcategoryId) {
      try {
        const subcategory = await this.prisma.subcategory.findUnique({
          where: { slug: normalizedSubcategory },
        });

        if (!subcategory) {
          console.warn(` Subcategory slug "${normalizedSubcategory}" not found in database`);
        } else {
          console.log(` Subcategory found: ${subcategory.slug} (ID: ${subcategory.id})`);
        }

        filters.subcategoryId = subcategory?.id || undefined;

        // Auto-bind parent category
        if (!filters.categoryId && subcategory?.categoryId) {
          filters.categoryId = subcategory.categoryId;
          console.log(` Auto-bound parent categoryId: ${subcategory.categoryId}`);
        }
      } catch (error) {
        console.error(' Error finding subcategory:', error);
        throw error;
      }
    }

    // 🔹 LISTING TYPE – canonical slug only
    if (normalizedListingType && !filters.listingTypeId) {
      try {
        const listingType = await this.prisma.listing_type.findFirst({
          where: { slug: normalizedListingType },
        });

        if (!listingType) {
          console.warn(`Listing type slug "${normalizedListingType}" not found in database`);
        } else {
          console.log(` Listing type found: ${listingType.slug} (ID: ${listingType.id})`);
        }

        filters.listingTypeId = listingType?.id || undefined;
      } catch (error) {
        console.error('Error finding listing type:', error);
        throw error;
      }
    }

    // 🔹 ATTRIBUTES – resolve codes to IDs
    if (filters.attributeCodes && Object.keys(filters.attributeCodes).length > 0) {
      const resolvedAttributes: Record<number, number[]> = filters.attributes || {};

      for (const [attributeCode, valueCodes] of Object.entries(filters.attributeCodes)) {
        try {
          // Normalize attribute code
          const normalizedAttrCode = this.normalizeSlug(attributeCode);
          if (!normalizedAttrCode) {
            console.warn(` Empty attribute code after normalization: "${attributeCode}"`);
            continue;
          }

          console.log(`Looking for attribute code: "${normalizedAttrCode}"`);

          // Find attribute by code
          const attribute = await this.prisma.attribute.findFirst({
            where: {
              code: normalizedAttrCode,
              // Optionally filter by subcategory if available
              ...(filters.subcategoryId && { subcategoryId: filters.subcategoryId }),
            },
          });

          if (!attribute) {
            console.warn(
              ` Attribute code "${attributeCode}" not found${
                filters.subcategoryId ? ` for subcategoryId ${filters.subcategoryId}` : ''
              }`,
            );
            continue;
          }

          console.log(` Attribute found: ${attribute.code} (ID: ${attribute.id})`);

          // Split and normalize value codes
          const valueCodeArray = valueCodes
            .split(',')
            .map((v) => this.normalizeSlug(v.trim()))
            .filter((code): code is string => code !== undefined);

          if (valueCodeArray.length === 0) {
            console.warn(` No valid value codes for attribute "${attributeCode}"`);
            continue;
          }

          console.log(` Looking for value codes: [${valueCodeArray.join(', ')}]`);

          // Find attribute values by code
          const attributeValues = await this.prisma.attribute_value.findMany({
            where: {
              attribute_id: attribute.id,
              value_code: { in: valueCodeArray },
            },
            select: { id: true, value_code: true },
          });

          if (attributeValues.length > 0) {
            const valueIds = attributeValues.map((av) => av.id);
            resolvedAttributes[attribute.id] = [
              ...(resolvedAttributes[attribute.id] || []),
              ...valueIds,
            ];
            console.log(
              `Found ${attributeValues.length} values: ${attributeValues
                .map((av) => av.value_code)
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
          // Continue with other attributes instead of failing completely
        }
      }

      filters.attributes = resolvedAttributes;
    }

    console.log(' RESOLVED IDs:', {
      category: filters.category,
      subcategory: filters.subcategory,
      listingtype: filters.listingtype,
      categoryId: filters.categoryId,
      subcategoryId: filters.subcategoryId,
      listingTypeId: filters.listingTypeId,
      attributeCodes: filters.attributeCodes,
      attributes: filters.attributes,
    });
  }
}