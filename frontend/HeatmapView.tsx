'use client';
import { useHeatmap } from './useHeatmap';

const riskColors: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white animate-pulse',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-400',
  LOW: 'bg-green-200',
  SAFE: 'bg-slate-100',
};

export function HeatmapView({ propertyId }: { propertyId: string }) {
  const { rooms, connected } = useHeatmap(propertyId);
  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Heatmap de Ocupação</h1>
        <span className={connected ? 'text-green-600' : 'text-red-600'}>
          {connected ? 'Tempo real ativo' : 'Desconectado'}
        </span>
      </div>
      {floors.map(floor => (
        <div key={floor} className="mb-6">
          <h2 className="font-medium mb-2">Andar {floor}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {rooms.filter(r => r.floor === floor).map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoomCard({ room }: { room: any }) {
  const risk = room.predictive?.riskLevel ?? 'SAFE';
  const changeStatus = async (status: string) => {
    await fetch(`/api/heatmap/rooms/${room.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ housekeepingStatus: status }),
    });
  };

  return (
    <div className={`rounded-lg p-3 border shadow-sm ${riskColors[risk]}`}>
      <div className="font-bold text-lg">{room.number}</div>
      <div className="text-xs opacity-80">{room.category}</div>
      <div className="text-xs mt-1">{room.housekeepingStatus}</div>
      {room.predictive?.minutesUntilCheckIn && (
        <div className="text-xs font-medium mt-1">
          Check-in em {room.predictive.minutesUntilCheckIn} min
        </div>
      )}
      <div className="mt-2 flex gap-1">
        <button onClick={() => changeStatus('IN_PROGRESS')} className="text-xs bg-white/20 px-2 py-1 rounded">Iniciar</button>
        <button onClick={() => changeStatus('CLEAN')} className="text-xs bg-white/20 px-2 py-1 rounded">Pronto</button>
      </div>
    </div>
  );
}
