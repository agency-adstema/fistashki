import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { MenuService } from './menu.service';
import { MenuItemType } from './menu-item.util';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('products')
@Controller()
export class MenuController {
  constructor(private menu: MenuService) {}

  @Get('products')
  @ApiOperation({ summary: 'Public menu' })
  async publicMenu() {
    const data = await this.menu.getPublicMenu();
    return { success: true, data };
  }

  @Get('admin/menu')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async adminMenu(@RestaurantId() restaurantId: string) {
    const data = await this.menu.adminMenu(restaurantId);
    return { success: true, data };
  }

  @Post('admin/menu/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upload menu product image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'menu');
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const ext = extname(file.originalname).toLowerCase() || '.png';
          cb(null, `${unique}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          cb(new BadRequestException('Dozvoljene su samo slike') as never, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fajl nije poslat');
    return { success: true, data: { url: `/uploads/menu/${file.filename}` } };
  }

  @Post('admin/menu/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async createItem(
    @RestaurantId() restaurantId: string,
    @Param('type') type: MenuItemType,
    @Body() body: Record<string, unknown>,
  ) {
    const data = await this.menu.createMenuItem(restaurantId, type, body as never);
    return { success: true, data };
  }

  @Patch('admin/menu/:type/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async updateItem(
    @RestaurantId() restaurantId: string,
    @Param('type') type: MenuItemType,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    await this.menu.updateMenuItem(restaurantId, type, id, body as never);
    return { success: true };
  }

  @Delete('admin/menu/:type/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async deleteItem(
    @RestaurantId() restaurantId: string,
    @Param('type') type: MenuItemType,
    @Param('id') id: string,
  ) {
    await this.menu.deleteMenuItem(restaurantId, type, id);
    return { success: true };
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async create(@RestaurantId() restaurantId: string, @Body() body: Record<string, unknown>) {
    const data = await this.menu.createProduct(restaurantId, body);
    return { success: true, data };
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async update(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    await this.menu.updateProduct(restaurantId, id, body);
    return { success: true };
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async remove(@RestaurantId() restaurantId: string, @Param('id') id: string) {
    await this.menu.deleteProduct(restaurantId, id);
    return { success: true };
  }
}
