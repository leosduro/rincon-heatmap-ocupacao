import { Controller, Post, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HeatmapGateway } from './heatmap.gateway';
import { PredictiveService } from './predictive.service';

@Controller('heatmap')
export class HeatmapController {
  constructor(
    private prisma: PrismaService,
    private gateway: HeatmapGateway,
    private predictive: PredictiveService,
  ) {}

  @Post('rooms/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { housekeepingStatus: string }) {
    const room = await this.prisma.room.update({
      where: { id },
      data: { housekeepingStatus: body.housekeepingStatus as any },
    });
    const updated = await this.predictive.calculateForProperty(room.propertyId);
    const roomData = updated.find(r => r.id === id);
    this.gateway.broadcastRoomUpdate(room.propertyId, roomData);
    return roomData;
  }
}
