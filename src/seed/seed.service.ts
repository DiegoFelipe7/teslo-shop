import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Users } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {

  }

  async runSeed(users: Users) {
    await this.insertNewProduct(users);
  }

  private async insertNewProduct(user: Users) {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromise = [];
    products.forEach(product => {
      insertPromise.push(this.productService.create(product, user));
    })
    await Promise.all(insertPromise)
  }



}
