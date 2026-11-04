'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useHeatmap(propertyId: string) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL}/heatmap`, {
      query: { propertyId },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('heatmap:snapshot', (data) => setRooms(data.rooms));
    socket.on('room:updated', (updatedRoom) => {
      setRooms(prev => prev.map(r => r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r));
    });

    return () => socket.disconnect();
  }, [propertyId]);

  return { rooms, connected };
}
