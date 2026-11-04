import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PredictiveService } from './predictive.service';

@WebSocketGateway({ cors: true, namespace: '/heatmap' })
export class HeatmapGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private predictive: PredictiveService) {}

  async handleConnection(client: Socket) {
    const propertyId = client.handshake.query.propertyId as string;
    if (propertyId) {
      client.join(`property:${propertyId}`);
      const snapshot = await this.predictive.calculateForProperty(propertyId);
      client.emit('heatmap:snapshot', { propertyId, rooms: snapshot, generatedAt: new Date() });
    }
  }

  broadcastRoomUpdate(propertyId: string, roomUpdate: any) {
    this.server.to(`property:${propertyId}`).emit('room:updated', roomUpdate);
  }
}
