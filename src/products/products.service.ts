import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { Users } from 'src/auth/entities/user.entity';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger("ProductsService");
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource) {

  }
  async create(createProductDto: CreateProductDto, user: Users) {

    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user,
      });

      await this.productRepository.save(product);

      return { ...product, images };

    } catch (error) {
      this.handlerException(error);
    }


  }

  async findAll(paginationDto: PaginationDto) {
    const { limint = 10, offset = 0 } = paginationDto;
    const product = await this.productRepository.find({
      take: limint,
      skip: offset,
      relations: {
        images: true
      },
    });
    return product.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImage')
        .getOne();
    }


    if (!product)
      throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: Users) {
    //Prepara para la actualizacion
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
      user
    });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    //create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        //eliminar todas las colimnasdo donde en la table product image se elimine por el id del producto
        await queryRunner.manager.delete(ProductImage, { product: { id: id } })
        product.images = images.map(image => this.productImageRepository.create({
          url: image
        }))

      }


      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handlerException(error)
    }
  }
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    await this.productRepository.remove(product);
  }
  private handlerException(error: any) {
    if (error.code === "23505") {
      throw new BadRequestException(error.details)
    }
    throw new InternalServerErrorException("ayuda")
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder("product");
    try {
      return await query.delete().where({}).execute();
    } catch (error) {

    }
  }
}
