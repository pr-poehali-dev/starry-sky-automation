import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface SecurityEvent {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface AISecurityMonitorProps {
  isVisible: boolean;
}

const AISecurityMonitor = ({ isVisible }: AISecurityMonitorProps) => {
  const [securityLevel, setSecurityLevel] = useState(98);
  const [events, setEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'info',
      message: 'Система успешно отразила 3 попытки несанкционированного доступа',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      resolved: true
    },
    {
      id: '2',
      type: 'warning',
      message: 'Обнаружена необычная активность в модуле WhatsApp Integration',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      resolved: false
    },
    {
      id: '3',
      type: 'info',
      message: 'AI автоматически обновил правила доступа для 5 пользователей',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      resolved: true
    }
  ]);

  const [aiStatus, setAiStatus] = useState<'active' | 'learning' | 'protecting'>('active');

  useEffect(() => {
    const statusCycle = setInterval(() => {
      const statuses: Array<'active' | 'learning' | 'protecting'> = ['active', 'learning', 'protecting'];
      setAiStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 8000);

    const securityUpdate = setInterval(() => {
      setSecurityLevel(prev => {
        const change = Math.random() * 4 - 2;
        return Math.max(90, Math.min(100, prev + change));
      });
    }, 3000);

    return () => {
      clearInterval(statusCycle);
      clearInterval(securityUpdate);
    };
  }, []);

  if (!isVisible) return null;

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'critical': return 'AlertTriangle';
      case 'warning': return 'AlertCircle';
      case 'info': return 'Info';
    }
  };

  const getEventColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'critical': return 'text-red-400 border-red-500/50';
      case 'warning': return 'text-yellow-400 border-yellow-500/50';
      case 'info': return 'text-blue-400 border-blue-500/50';
    }
  };

  const getStatusConfig = () => {
    switch (aiStatus) {
      case 'learning':
        return { label: 'Обучение', color: 'from-blue-500 to-cyan-500', icon: 'Brain' };
      case 'protecting':
        return { label: 'Защита', color: 'from-red-500 to-orange-500', icon: 'ShieldAlert' };
      default:
        return { label: 'Активна', color: 'from-green-500 to-emerald-500', icon: 'ShieldCheck' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="fixed bottom-6 right-6 w-96 glass border-purple-500/30 rounded-2xl p-6 shadow-2xl animate-fade-in z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${statusConfig.color} flex items-center justify-center animate-pulse-glow`}>
            <Icon name={statusConfig.icon} size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Security</h3>
            <p className="text-xs text-purple-300">{statusConfig.label}</p>
          </div>
        </div>
        <Badge className="gradient-primary text-white border-0">
          {securityLevel.toFixed(1)}%
        </Badge>
      </div>

      <Progress value={securityLevel} className="h-2 mb-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-purple-300 mb-2">
          <span>Последние события</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Live
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {events.map((event) => (
            <Card key={event.id} className={`glass p-3 border ${getEventColor(event.type)}`}>
              <div className="flex items-start gap-2">
                <Icon name={getEventIcon(event.type)} size={16} className={getEventColor(event.type)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white leading-tight mb-1">{event.message}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400">
                      {event.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {event.resolved && (
                      <Badge variant="outline" className="text-xs py-0 px-1 h-4 border-green-500/50 text-green-400">
                        Решено
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-purple-500/20">
          <div className="text-center">
            <p className="text-xs text-purple-300">Угрозы</p>
            <p className="text-lg font-bold text-white">0</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-purple-300">Блокировки</p>
            <p className="text-lg font-bold text-white">12</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-purple-300">Uptime</p>
            <p className="text-lg font-bold text-green-400">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISecurityMonitor;
