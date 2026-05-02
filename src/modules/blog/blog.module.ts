import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogImageService } from './services/blog-image.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SeoModule } from '../seo/seo.module';

@Module({
  imports: [PrismaModule, SeoModule],
  providers: [BlogService, BlogImageService],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}
