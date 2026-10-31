import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/auth.decorators';

interface JwtPayload {
  sub: string;
  email: string;
  restaurantId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const membership = await this.prisma.restaurantUser.findFirst({
      where: {
        userId: payload.sub,
        restaurantId: payload.restaurantId,
        user: { isActive: true },
      },
      include: { user: true },
    });

    if (!membership) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: membership.user.id,
      email: membership.user.email,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      restaurantId: membership.restaurantId,
      role: membership.role,
    };
  }
}
