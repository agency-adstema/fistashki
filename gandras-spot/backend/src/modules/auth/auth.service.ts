import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        restaurants: {
          include: { restaurant: true },
          take: 1,
        },
      },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = user.restaurants[0];
    if (!membership) {
      throw new UnauthorizedException('No restaurant access');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      restaurantId: membership.restaurantId,
      role: membership.role,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: membership.role,
        restaurant: {
          id: membership.restaurant.id,
          name: membership.restaurant.name,
          slug: membership.restaurant.slug,
        },
      },
    };
  }

  async me(userId: string, restaurantId: string) {
    const membership = await this.prisma.restaurantUser.findUnique({
      where: { restaurantId_userId: { restaurantId, userId } },
      include: { user: true, restaurant: true },
    });
    if (!membership) throw new UnauthorizedException();
    return {
      id: membership.user.id,
      email: membership.user.email,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      role: membership.role,
      restaurant: membership.restaurant,
    };
  }
}
