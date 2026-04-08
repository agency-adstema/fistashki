import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async createTag(dto: CreateTagDto, actorUserId?: string) {
    const existing = await this.prisma.orderTag.findUnique({
      where: { key: dto.key.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException(`Tag with key "${dto.key}" already exists`);
    }

    const tag = await this.prisma.orderTag.create({
      data: { key: dto.key.toLowerCase(), name: dto.name, color: dto.color ?? null },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.tag.created',
      entityType: 'OrderTag',
      entityId: tag.id,
      metadata: { key: tag.key, name: tag.name },
    });

    return tag;
  }

  async findAllTags() {
    return this.prisma.orderTag.findMany({ orderBy: { name: 'asc' } });
  }

  async findOneTag(id: string) {
    const tag = await this.prisma.orderTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async updateTag(id: string, dto: UpdateTagDto, actorUserId?: string) {
    await this.findOneTag(id);

    const updated = await this.prisma.orderTag.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.tag.updated',
      entityType: 'OrderTag',
      entityId: id,
      metadata: { changes: dto },
    });

    return updated;
  }

  async deleteTag(id: string, actorUserId?: string) {
    await this.findOneTag(id);

    await this.prisma.orderTag.delete({ where: { id } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.tag.deleted',
      entityType: 'OrderTag',
      entityId: id,
      metadata: {},
    });

    return { deleted: true };
  }

  async getOrderTags(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const assignments = await this.prisma.orderTagAssignment.findMany({
      where: { orderId },
      include: { tag: true },
      orderBy: { createdAt: 'asc' },
    });

    return assignments.map((a) => a.tag);
  }

  async assignTag(orderId: string, tagId: string, actorUserId?: string) {
    const [order, tag] = await Promise.all([
      this.prisma.order.findUnique({ where: { id: orderId } }),
      this.prisma.orderTag.findUnique({ where: { id: tagId } }),
    ]);

    if (!order) throw new NotFoundException('Order not found');
    if (!tag) throw new NotFoundException('Tag not found');

    const existing = await this.prisma.orderTagAssignment.findUnique({
      where: { orderId_tagId: { orderId, tagId } },
    });
    if (existing) {
      throw new ConflictException('Tag is already assigned to this order');
    }

    await this.prisma.orderTagAssignment.create({ data: { orderId, tagId } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.tag.assigned',
      entityType: 'Order',
      entityId: orderId,
      metadata: { tagId, tagKey: tag.key, tagName: tag.name },
    });

    return tag;
  }

  async removeTag(orderId: string, tagId: string, actorUserId?: string) {
    const assignment = await this.prisma.orderTagAssignment.findUnique({
      where: { orderId_tagId: { orderId, tagId } },
      include: { tag: true },
    });
    if (!assignment) throw new NotFoundException('Tag assignment not found');

    await this.prisma.orderTagAssignment.delete({
      where: { orderId_tagId: { orderId, tagId } },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.tag.removed',
      entityType: 'Order',
      entityId: orderId,
      metadata: { tagId, tagKey: assignment.tag.key },
    });

    return { removed: true };
  }
}
