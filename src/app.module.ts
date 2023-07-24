import { CommonModule } from './common/common.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    CommonModule, ConfigModule.forRoot(), TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.HOST,
      port: +process.env.PORT,
      database: process.env.DATABASE,
      username: "postgres",
      password: process.env.PASSWORD,
      autoLoadEntities: true,
      synchronize: true  // solo en desarrollo en produccion se deja en falso
    }), ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }), ProductsModule, SeedModule, FilesModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
