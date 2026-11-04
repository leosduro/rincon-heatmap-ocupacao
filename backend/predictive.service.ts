import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '@prisma/client';

@Injectable()
export class PredictiveService {
  constructor(private prisma: PrismaService) {}

  async calculateForProperty(propertyId: string, horizonHours = 6) {
    const now = new Date();
    const horizon = new Date(now.getTime() + horizonHours * 60 * 60 * 1000);

    const rooms = await this.prisma.room.findMany({
      where: { propertyId },
      include: { currentStay: true, category: true },
    });

    const profiles = await this.prisma.cleaningProfile.findMany({ where: { propertyId } });
    const profileMap = new Map(profiles.map(p => [p.categoryId, p]));

    return rooms.map(room => {
      const profile = profileMap.get(room.categoryId) ?? { averageMinutes: 35, bufferMinutes: 10 };
      const nextCheckIn = room.currentStay?.expectedArrival ?? null;

      let minutesUntilCheckIn = null;
      let riskLevel: RiskLevel = 'SAFE';
      let recommendedStartBy = null;

      if (nextCheckIn && nextCheckIn <= horizon) {
        minutesUntilCheckIn = Math.round((nextCheckIn.getTime() - now.getTime()) / 60000);
        const needed = profile.averageMinutes + profile.bufferMinutes;
        const margin = minutesUntilCheckIn - needed;

        if (margin < 15) riskLevel = 'CRITICAL';
        else if (margin < 30) riskLevel = 'HIGH';
        else if (margin < 60) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';

        recommendedStartBy = new Date(nextCheckIn.getTime() - needed * 60000);
      }

      return {
        id: room.id,
        number: room.number,
        floor: room.floor,
        block: room.block,
        category: room.category?.name,
        occupancyStatus: room.occupancyStatus,
        housekeepingStatus: room.housekeepingStatus,
        predictive: {
          nextCheckIn,
          minutesUntilCheckIn,
          estimatedCleaningMinutes: profile.averageMinutes,
          riskLevel,
          recommendedStartBy,
          score: this.calculatePriorityScore(minutesUntilCheckIn, riskLevel),
        },
      };
    });
  }

  private calculatePriorityScore(minutes: number | null, risk: RiskLevel): number {
    if (!minutes) return 0;
    const riskWeight = { CRITICAL: 1000, HIGH: 600, MEDIUM: 300, LOW: 100, SAFE: 0 }[risk];
    return Math.round(1000 / Math.max(minutes, 1) + riskWeight);
  }
}
