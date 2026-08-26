import { HttpException, Inject, Injectable } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { PrismaService } from '../common/prisma.service'
import {
  CreateProductRequest,
  CreateProductResponseSuccess,
  DeleteProductResponse,
  GetProductResponseSuccessQuery,
  GetProductsRequest,
  ProductResponse,
  TotalResultCategories,
  TotalSlugQuery,
  UpdateProductRequest,
  UpdateProductResponse,
} from '../model/product.model'
import { WebResponse } from '../model/web.model'

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createProduct(
    req: CreateProductRequest,
  ): Promise<CreateProductResponseSuccess> {
    this.logger.info(`PRODUCT_SERVICE.createProduct: ${JSON.stringify(req)}`)
    const category_id = await this.prismaService.category.findFirst({
      where: { name: req.categoryId },
    })

    if (!category_id) {
      throw new HttpException('category not found', 403)
    }

    const checkBrandId = await this.prismaService.brand.findFirst({
      where: { name: req.brandId },
    })

    if (!checkBrandId) {
      await this.createBrand(req.brandId)
    }

    const brand_id = await this.prismaService.brand.findFirst({
      where: { name: req.brandId },
    })

    if (!brand_id) {
      throw new HttpException('Brand not found', 403)
    }

    await this.prismaService.$executeRaw`
    insert into products (
        name, slug, sku, description, short_description, price, 
        original_price, category_id, brand_id, stock, low_stock_threshold,
        rating_average, rating_count, review_count, is_active, metadata
    ) values (
        ${req.name}, ${req.slug}, ${req.sku}, ${req.description}, 
        ${req.shortDescription}, ${req.price}, ${req.originalPrice},
        ${category_id.id}, ${brand_id.id}, ${req.stock}, ${req.lowStockThreshold},
        ${req.ratingAverage}, ${req.ratingCount}, ${req.reviewCount},
        ${req.isActive}, ${req.metadata}
    )`

    const product = await this.prismaService.product.findUnique({
      where: {
        slug: req.slug,
      },
    })

    if (!product) {
      throw new HttpException('Product not created', 403)
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      originalPrice: product.originalPrice,
      categoryId: product.categoryId,
      brandId: product.brandId,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      reviewCount: product.reviewCount,
      isActive: product.isActive,
      metadata: product.metadata,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      shortDescription: product.shortDescription,
      deletedAt: product.deletedAt,
    }
  }

  async getProductAll(
    req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    this.logger.info(`PRODUCT_SERVICE.getProductAll: ${JSON.stringify(req)}`)

    const page = Math.max(1, Number(req.page) || 1)
    const limit = Math.max(1, Number(req.limit) || 20)

    const totalItems = await this.prismaService.product.count()
    const totalPages = Math.ceil(totalItems / limit)
    const offset = (page - 1) * limit

    const dataProduct = await this.prismaService.$queryRaw<
      GetProductResponseSuccessQuery[]
    >`
      select
          p.id,
          p.name,
          p.price,
          p.original_price,
          p.slug,
          p.sku,
          p.description,
          p.short_description,
          p.stock,
          p.low_stock_threshold,
          p.rating_average,
          p.review_count,
          p.rating_count,
          p.is_active,
          p.metadata,
          p.created_at,
          b.id as brand_id,
          b.name as brand_name,
          c.id as category_id,
          c.name as category_name,
          c.slug as category_slug
      from
          products as p
          join brands as b on p.brand_id = b.id
          join categories as c on c.id = p.category_id
      limit ${limit}
      offset ${offset};`

    const data = dataProduct.map((product) => {
      return this.toProductResponse(product)
    })
    return {
      statusCode: 200,
      message: 'Success',
      data: data,
      paging: {
        currentPage: page,
        pageSize: limit,
        totalItem: totalItems,
        totalPage: totalPages,
      },
    }
  }

  async getProductById(id: string): Promise<ProductResponse> {
    this.logger.info(`PRODUCT_SERVICE.getProductById: ${id}`)

    const [dataProduct] = await this.prismaService.$queryRaw<
      GetProductResponseSuccessQuery[]
    >`
      select
          p.id,
          p.name,
          p.price,
          p.original_price,
          p.slug,
          p.sku,
          p.description,
          p.short_description,
          p.stock,
          p.low_stock_threshold,
          p.rating_average,
          p.review_count,
          p.rating_count,
          p.is_active,
          p.metadata,
          p.created_at,
          b.id as brand_id,
          b.name as brand_name,
          c.id as category_id,
          c.name as category_name,
          c.slug as category_slug
      from
          products as p
          join brands as b on p.brand_id = b.id
          join categories as c on c.id = p.category_id
      where
          p.id = ${id};`

    if (!dataProduct) {
      throw new HttpException('Data Not Found', 404)
    }

    const data = this.toProductResponse(dataProduct)

    return data
  }

  async updateProductById(
    id: string,
    req: UpdateProductRequest,
  ): Promise<UpdateProductResponse> {
    const isExist = await this.prismaService.product.findUnique({
      where: { id },
    })
    if (!isExist) {
      throw new HttpException('Product not found', 404)
    }

    const product = await this.prismaService.product.update({
      where: { id: id },
      data: req,
    })

    return {
      products: product,
    }
  }

  async deleteProductById(id: string): Promise<DeleteProductResponse> {
    const isExist = await this.prismaService.product.findUnique({
      where: { id },
    })

    if (!isExist) {
      throw new HttpException('Product not found', 404)
    }

    await this.prismaService.$executeRaw`DELETE FROM products WHERE id = ${id}`

    const product = await this.prismaService
      .$queryRaw`SELECT * FROM products WHERE id = ${id}`

    let dtd: boolean = false

    if (product) {
      throw new HttpException('Product not deleted', 404)
    }

    dtd = true

    return {
      deleted: dtd,
    }
  }

  async getProductByCategory(
    req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    this.logger.info(
      `PRODUCT_SERVICE.getProductByCategory: ${JSON.stringify(req)}`,
    )

    const category = req.category
    const page = Math.max(1, Number(req.page) || 1)
    const limit = Math.max(1, Number(req.limit) || 20)

    const total = await this.prismaService.$queryRaw<
      TotalResultCategories[]
    >`SELECT COUNT(*) as perCategory, c.name
      FROM products as p
      JOIN categories as c ON p.category_id = c.id
      WHERE c.name = ${category}
      GROUP BY
      category_id, c.name;`

    const totalCategory = Number(total[0].perCategory)

    const totalPages = Math.ceil(totalCategory / limit)
    const offset = (page - 1) * limit

    if (!category) {
      throw new HttpException('Product not found', 404)
    }

    const rawCategory = await this.prismaService.$queryRaw<
      GetProductResponseSuccessQuery[]
    >`
      select
          p.id,
          p.name,
          p.price,
          p.original_price,
          p.slug,
          p.sku,
          p.description,
          p.short_description,
          p.stock,
          p.low_stock_threshold,
          p.rating_average,
          p.review_count,
          p.rating_count,
          p.is_active,
          p.metadata,
          p.created_at,
          b.id as brand_id,
          b.name as brand_name,
          c.id as category_id,
          c.name as category_name,
          c.slug as category_slug
      from
          products as p
          join brands as b on p.brand_id = b.id
          join categories as c on c.id = p.category_id
      WHERE
      c.name LIKE ${category} 
      LIMIT ${limit}
      OFFSET ${offset}`

    const data = rawCategory.map((product) => {
      return this.toProductResponse(product)
    })

    return {
      statusCode: 200,
      message: 'Success',
      data: data,
      paging: {
        currentPage: page,
        pageSize: limit,
        totalItem: totalCategory,
        totalPage: totalPages,
      },
    }
  }

  async search(
    req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    this.logger.info(`PRODUCT_SERVICE:search ${req.search}`)

    if (!req.search || typeof req.search !== 'string') {
      throw new HttpException('Search term is required', 400)
    }

    const sanitized = req.search.replace('/%/g', '\\%').replace('/_/g', '\\_')

    const flex = sanitized.concat('%')

    const page = Math.max(1, Number(req.page) || 1)
    const limit = Math.max(1, Number(req.limit) || 20)

    const totalNames = await this.prismaService.product.count({
      where: { name: { startsWith: flex } },
    })

    const totalPages = Math.ceil(totalNames / limit)
    // const offset = (page - 1) * limit;

    const dataProduct = await this.prismaService.$queryRaw<
      GetProductResponseSuccessQuery[]
    >`
      SELECT * FROM products as p 
      left join categories as c on c.id = p.category_id 
      left join brands as b on b.id = p.brand_id
      WHERE p.name LIKE ${flex}`

    if (!dataProduct) {
      throw new HttpException('Product not found', 404)
    }

    const data = dataProduct.map((product) => {
      return this.toProductResponse(product)
    })

    return {
      statusCode: 200,
      message: 'Success',
      data: data,
      paging: {
        currentPage: page,
        pageSize: limit,
        totalItem: totalNames,
        totalPage: totalPages,
      },
    }
  }

  async searchWithSlug(
    req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const slug = `%${req.slug}%`

    const page = Math.max(1, Number(req.page) || 1)
    const limit = Math.max(1, Number(req.limit) || 20)

    const total = await this.prismaService.$queryRaw<TotalSlugQuery[]>`
      select count(*) as jumlah
      from products as p
      where
          p.slug like ${slug}`

    const totalSlug = Number(total[0].jumlah)

    const totalPages = Math.ceil(totalSlug / limit)
    const offset = (page - 1) * limit

    const dataProduct = await this.prismaService.$queryRaw<
      GetProductResponseSuccessQuery[]
    >`
      SELECT
        p.id,
        p.name,
        p.price,
        p.original_price AS "originalPrice",
        p.slug,
        p.sku,
        p.description,
        p.short_description AS "shortDescription",
        p.stock,
        p.low_stock_threshold AS "lowStockThreshold",
        p.rating_average AS "ratingAverage",
        p.rating_count AS "ratingCount",
        p.review_count AS "reviewCount",
        p.is_active AS "isActive",
        p.metadata,
        p.created_at AS "createdAt",
        c.id AS "categoryId",
        c.name AS "categoryName",
        c.slug AS "categorySlug",
        b.id AS "brandId",
        b.name AS "brandName"
      FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.slug LIKE ${slug}
      LIMIT ${limit}
      OFFSET ${offset};`

    const data = dataProduct.map((product) => {
      return this.toProductResponse(product)
    })

    return {
      statusCode: 200,
      message: 'Success',
      data: data,
      paging: {
        currentPage: page,
        pageSize: limit,
        totalItem: totalSlug,
        totalPage: totalPages,
      },
    }
  }

  async createBrand(brand: string): Promise<void> {
    await this.prismaService.brand.create({
      data: {
        name: brand,
        slug: brand.toLowerCase(),
        description: brand,
        isActive: true,
        websiteUrl: `www.${brand.toLowerCase()}.com`,
      },
    })
  }

  private toProductResponse(product: GetProductResponseSuccessQuery) {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      shortDescription: product.short_description,
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug,
      },
      brand: {
        id: product.brand_id,
        name: product.brand_name,
      },
      stock: product.stock,
      lowStockThreshold: product.low_stock_threshold,
      ratingAverage: product.rating_average,
      ratingCount: product.rating_count,
      reviewCount: product.review_count,
      isActive: product.isActive,
      metadata: product.metadata,
      createdAt: product.created_at,
    }
  }
}
