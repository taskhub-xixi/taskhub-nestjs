import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Public } from "../common/decorator";
import { Admin } from "../common/decorator/admin.decorator";
import { JwtAuthGuard } from "../common/guards";
import { AdminGuard } from "../common/guards/admin.guard";
import { PublicGuard } from "../common/guards/public.guards";
import {
  CreateProductRequest,
  CreateProductResponseSuccess,
  DeleteProductResponse,
  GetProductsRequest,
  ProductResponse,
  SlugRequest,
  UpdateProductRequest,
  UpdateProductResponse,
} from "../model/product.model";
import { WebResponse } from "../model/web.mode";
import { ProductService } from "./product.service";

@Controller("/api/products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Admin()
  @Public()
  @UseGuards(PublicGuard)
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createProduct(
    @Body() req: CreateProductRequest,
  ): Promise<WebResponse<CreateProductResponseSuccess>> {
    const result = await this.productService.createProduct(req);
    return {
      data: result,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Admin()
  @Public()
  @UseGuards(PublicGuard)
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("all")
  async getProductAll(
    @Query() req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const result = await this.productService.getProductAll(req);
    return result;
  }

  @Admin()
  @Public()
  @UseGuards(AdminGuard)
  @UseGuards(PublicGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getProductByCategory(
    @Query() req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const result = await this.productService.getProductByCategory(req);
    return result;
  }

  @Admin()
  @Public()
  @UseGuards(AdminGuard)
  @UseGuards(PublicGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/name")
  async searchProductName(
    @Query() req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const result = await this.productService.search(req);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/slug")
  async searchWithSlug(
    @Query() req: GetProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const result = await this.productService.searchWithSlug(req);
    return result;
  }
  //
  // @Admin()
  // @Public()
  // @UseGuards(PublicGuard)
  // @UseGuards(AdminGuard)
  // @Post("upload")
  // @UseInterceptors(
  //   FileInterceptor("file", {
  //     dest: "./files/",
  //     limits: {
  //       fileSize: 1000 * 1000 * 5, // uqual to 5MB
  //     },
  //   }),
  // )
  // uploadFile(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [new FileTypeValidator({ fileType: "image/jpg" })],
  //     }),
  //   )
  //   file: Express.Multer.File,
  // ) {
  //   return {
  //     fileName: file.filename,
  //   };
  // }

  @Admin()
  @Public()
  @UseGuards(PublicGuard)
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/:id")
  async getProductById(
    @Param("id") id: string,
  ): Promise<WebResponse<ProductResponse>> {
    const result = await this.productService.getProductById(id);
    return {
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Admin()
  @Public()
  @UseGuards(PublicGuard)
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch("/:id")
  async updateProductById(
    @Param("id") id: string,
    @Body() req: UpdateProductRequest,
  ): Promise<WebResponse<UpdateProductResponse>> {
    const result = await this.productService.updateProductById(id, req);
    return {
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Admin()
  @Public()
  @UseGuards(PublicGuard)
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete("/:id")
  async deleteProductById(
    @Param("id") id: string,
  ): Promise<WebResponse<DeleteProductResponse>> {
    const result = await this.productService.deleteProductById(id);
    return {
      data: result,
      message: "Product Deleted",
      statusCode: HttpStatus.OK,
    };
  }
}
