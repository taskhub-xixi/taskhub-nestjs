import { Decimal } from "@prisma/client/runtime/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateProductRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  sku!: string;

  @Min(1)
  price!: Decimal;

  @Min(1)
  originalPrice!: Decimal;

  @IsString()
  description!: string;

  @IsString()
  shortDescription!: string;

  @IsString()
  brandId!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsNumber()
  stock!: number;

  @IsNumber()
  lowStockThreshold!: number;

  @Min(1)
  ratingAverage!: Decimal;

  @IsNumber()
  ratingCount!: number;

  @IsNumber()
  reviewCount!: number;

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  metadata!: string;
}

export class CreateProductResponseSuccess {
  id!: string;
  name!: string;
  price!: Decimal;
  slug!: string;
  sku!: string;
  description!: string;
  originalPrice!: Decimal | null;
  categoryId!: string;
  brandId!: string | null;
  stock!: number;
  lowStockThreshold!: number | null;
  ratingAverage!: Decimal | null;
  ratingCount!: number | null;
  reviewCount!: number | null;
  isActive!: boolean;
  metadata!: {} | null;
  createdAt!: Date | null;
  updatedAt!: Date | null;
  shortDescription!: string | null;
  deletedAt?: Date | null;
}

export class CreateProductResponseError {
  message!: string[];
  statusCode!: number;
}

export class GetProductsRequest {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

export class ProductResponse {
  id!: string;
  name!: string;
  price!: Decimal;
  slug!: string;
  sku!: string;
  description!: string;
  originalPrice!: Decimal | null;

  category!: {
    id: string;
    name: string;
    slug: string;
    parent?: {
      id: string;
      name: string;
      slug: string;
    };
  };

  brand!: {
    id: string;
    name: string;
  };

  stock!: number;
  lowStockThreshold!: number | null;
  ratingAverage!: Decimal | null;
  ratingCount!: number | null;
  reviewCount!: number | null;
  isActive!: boolean;
  metadata!: Record<string, unknown> | null;
  createdAt!: Date | null;
  shortDescription!: string | null;
}

export class GetProductResponseSuccessQuery {
  id!: string;
  name!: string;
  price!: Decimal;
  slug!: string;
  sku!: string;
  description!: string;
  original_price!: Decimal | null;
  category_id!: string;
  category_name!: string;
  category_slug!: string;
  brand_id!: string;
  brand_name!: string;
  stock!: number;
  low_stock_threshold!: number | null;
  rating_average!: Decimal | null;
  rating_count!: number | null;
  review_count!: number | null;
  isActive!: boolean;
  metadata!: {} | null;
  created_at!: Date | null;
  short_description!: string | null;
}

export class GetProductsResponseError {
  message!: string[];
  statusCode!: number;
}

export class GetProductById {
  @IsNumber()
  id?: number;
}

export class UpdateProductResponse {
  products!: {
    id: string;
    name: string;
    price: Decimal;
    slug: string;
    sku: string;
    description: string;
    originalPrice: Decimal | null;
    categoryId: string;
    brandId: string | null;
    stock: number;
    lowStockThreshold: number | null;
    ratingAverage: Decimal | null;
    ratingCount: number | null;
    reviewCount: number | null;
    isActive: boolean;
    metadata: {} | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    shortDescription: string | null;
    deletedAt?: Date | null;
  };
}

export class UpdateProductRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDecimal()
  @Min(0)
  @IsOptional()
  price?: Decimal;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDecimal()
  @IsOptional()
  originalPrice?: Decimal;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number;

  @IsNumber()
  @IsOptional()
  ratingAverage?: Decimal;

  @IsNumber()
  @IsOptional()
  ratingCount?: number;

  @IsNumber()
  @IsOptional()
  reviewCount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: {};
}

export class UploadPhotoRequest {
  @IsString()
  filename!: string;
}

export class UploadPhotoResponseSuccess {
  data!: {
    filename: string;
    originalName: string;
  };
}

export class TotalResultCategories {
  perCategory!: number;
  name!: string;
}

export class SearchRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class SlugRequest {
  @IsString()
  @IsNotEmpty()
  slug!: string;
}

export class DeleteProductResponse {
  @IsBoolean()
  deleted!: boolean;
}

export class TotalSlugQuery {
  jumlah!: number;
}
