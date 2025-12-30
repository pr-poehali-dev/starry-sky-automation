import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

type Role = 'owner' | 'admin' | 'manager' | 'accountant' | 'user';

interface Module {
  id: string;
  name: string;
  icon: string;
  isPremium: boolean;
  isActive: boolean;
  allowedRoles: Role[];
}

const Index = () => {
  const [currentRole, setCurrentRole] = useState<Role>('owner');
  const [modules, setModules] = useState<Module[]>([
    { id: '1', name: 'Dashboard Analytics', icon: 'BarChart3', isPremium: true, isActive: true, allowedRoles: ['owner', 'admin'] },
    { id: '2', name: 'User Management', icon: 'Users', isPremium: false, isActive: true, allowedRoles: ['owner', 'admin', 'manager'] },
    { id: '3', name: 'Finance Control', icon: 'Wallet', isPremium: true, isActive: true, allowedRoles: ['owner', 'accountant'] },
    { id: '4', name: 'WhatsApp Integration', icon: 'MessageCircle', isPremium: true, isActive: false, allowedRoles: ['owner', 'admin', 'manager'] },
    { id: '5', name: 'Avito Connector', icon: 'ShoppingCart', isPremium: true, isActive: false, allowedRoles: ['owner', 'admin'] },
    { id: '6', name: 'Tab Manager', icon: 'Layout', isPremium: false, isActive: true, allowedRoles: ['owner', 'admin', 'manager', 'user'] },
    { id: '7', name: 'AI Security', icon: 'Shield', isPremium: true, isActive: true, allowedRoles: ['owner'] },
    { id: '8', name: 'Plugin Hub', icon: 'Plug', isPremium: false, isActive: true, allowedRoles: ['owner', 'admin'] },
  ]);

  const roleConfig = {
    owner: { color: 'from-purple-500 to-pink-500', label: 'Владелец', icon: 'Crown' },
    admin: { color: 'from-blue-500 to-cyan-500', label: 'Администратор', icon: 'Shield' },
    manager: { color: 'from-green-500 to-emerald-500', label: 'Менеджер', icon: 'Briefcase' },
    accountant: { color: 'from-orange-500 to-yellow-500', label: 'Бухгалтер', icon: 'Calculator' },
    user: { color: 'from-gray-500 to-slate-500', label: 'Пользователь', icon: 'User' },
  };

  const hasAccess = (module: Module) => {
    return module.allowedRoles.includes(currentRole);
  };

  const toggleModule = (id: string) => {
    if (currentRole !== 'owner') return;
    setModules(modules.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  const duplicateModule = (module: Module) => {
    if (currentRole !== 'owner') return;
    const newModule = { 
      ...module, 
      id: `${module.id}-copy-${Date.now()}`, 
      name: `${module.name} (Copy)` 
    };
    setModules([...modules, newModule]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2d1f3d] to-[#1A1F2C] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Yjg3ZjUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6TTEyIDUwYzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4 animate-float">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl shadow-2xl">
              ✨
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            The Starry Sky
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Универсальная платформа управления с безграничными возможностями
          </p>
        </header>

        <div className="max-w-7xl mx-auto mb-8">
          <Card className="glass p-6 border-purple-500/30">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${roleConfig[currentRole].color} flex items-center justify-center shadow-lg`}>
                  <Icon name={roleConfig[currentRole].icon} size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-300">Текущая роль</p>
                  <h2 className="text-2xl font-bold">{roleConfig[currentRole].label}</h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(roleConfig) as Role[]).map((role) => (
                  <Button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    variant={currentRole === role ? 'default' : 'outline'}
                    className={`transition-all ${
                      currentRole === role 
                        ? `bg-gradient-to-r ${roleConfig[role].color} border-0 text-white` 
                        : 'glass border-purple-500/30 text-purple-200 hover:bg-purple-500/20'
                    }`}
                  >
                    <Icon name={roleConfig[role].icon} size={16} className="mr-2" />
                    {roleConfig[role].label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="modules" className="max-w-7xl mx-auto">
          <TabsList className="glass w-full justify-start border-purple-500/30 mb-8">
            <TabsTrigger value="modules" className="data-[state=active]:bg-purple-500/30">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              Модули
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/30">
              <Icon name="TrendingUp" size={18} className="mr-2" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/30">
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modules.map((module) => {
                const access = hasAccess(module);
                return (
                  <Card
                    key={module.id}
                    className={`glass p-6 border-purple-500/30 transition-all duration-300 hover:scale-105 hover:border-purple-400/50 ${
                      !access ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${module.isActive ? 'ring-2 ring-purple-500/40' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${
                        module.isActive ? 'gradient-primary' : 'bg-gray-700'
                      } flex items-center justify-center shadow-lg`}>
                        <Icon name={module.icon} size={24} className="text-white" />
                      </div>
                      <div className="flex gap-2">
                        {module.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                            <Icon name="Sparkles" size={12} className="mr-1" />
                            Premium
                          </Badge>
                        )}
                        {module.isActive && (
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{module.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="Lock" size={14} className="text-purple-400" />
                      <span className="text-xs text-purple-300">
                        {module.allowedRoles.map(r => roleConfig[r].label).join(', ')}
                      </span>
                    </div>

                    {access && currentRole === 'owner' && (
                      <div className="flex gap-2 pt-4 border-t border-purple-500/20">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleModule(module.id)}
                          className="flex-1 glass border-purple-500/30 hover:bg-purple-500/20"
                        >
                          <Icon name={module.isActive ? 'Power' : 'PowerOff'} size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateModule(module)}
                          className="flex-1 glass border-purple-500/30 hover:bg-purple-500/20"
                        >
                          <Icon name="Copy" size={14} />
                        </Button>
                      </div>
                    )}

                    {!access && (
                      <div className="pt-4 border-t border-purple-500/20">
                        <Badge variant="outline" className="w-full justify-center border-red-500/50 text-red-400">
                          <Icon name="ShieldX" size={12} className="mr-1" />
                          Нет доступа
                        </Badge>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {currentRole === 'owner' && (
              <Card className="glass p-6 border-purple-500/30 border-dashed hover:border-purple-400/50 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center py-8 gap-4 text-purple-300 group-hover:text-purple-200 transition-colors">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-purple-500/50 flex items-center justify-center group-hover:border-purple-400 transition-colors">
                    <Icon name="Plus" size={32} />
                  </div>
                  <p className="text-lg font-semibold">Добавить новый модуль</p>
                  <p className="text-sm text-center max-w-md">
                    Создайте новый модуль или подключите интеграцию с внешним сервисом
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass p-6 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Users" size={24} className="text-purple-400" />
                  <Badge className="gradient-primary text-white border-0">+12%</Badge>
                </div>
                <p className="text-sm text-purple-300 mb-1">Активных пользователей</p>
                <h3 className="text-3xl font-bold">1,284</h3>
                <Progress value={68} className="mt-4 h-2" />
              </Card>

              <Card className="glass p-6 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Activity" size={24} className="text-cyan-400" />
                  <Badge className="gradient-secondary text-white border-0">+8%</Badge>
                </div>
                <p className="text-sm text-purple-300 mb-1">Активных модулей</p>
                <h3 className="text-3xl font-bold">{modules.filter(m => m.isActive).length}</h3>
                <Progress value={85} className="mt-4 h-2" />
              </Card>

              <Card className="glass p-6 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Zap" size={24} className="text-pink-400" />
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">99.9%</Badge>
                </div>
                <p className="text-sm text-purple-300 mb-1">Uptime системы</p>
                <h3 className="text-3xl font-bold">Отлично</h3>
                <Progress value={99} className="mt-4 h-2" />
              </Card>
            </div>

            <Card className="glass p-6 border-purple-500/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icon name="TrendingUp" size={24} className="text-purple-400" />
                Активность платформы
              </h3>
              <div className="grid grid-cols-7 gap-2 h-48">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col justify-end items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-lg transition-all hover:opacity-80"
                      style={{ height: `${Math.random() * 100}%` }}
                    ></div>
                    <span className="text-xs text-purple-300">
                      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="glass p-6 border-purple-500/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Shield" size={24} className="text-purple-400" />
                Настройки безопасности
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                  <div>
                    <p className="font-medium">Двухфакторная аутентификация</p>
                    <p className="text-sm text-purple-300">Дополнительная защита аккаунта</p>
                  </div>
                  <Switch defaultChecked disabled={currentRole !== 'owner'} />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                  <div>
                    <p className="font-medium">AI мониторинг безопасности</p>
                    <p className="text-sm text-purple-300">Автоматическое обнаружение угроз</p>
                  </div>
                  <Switch defaultChecked disabled={currentRole !== 'owner'} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Журнал активности</p>
                    <p className="text-sm text-purple-300">Отслеживание всех действий</p>
                  </div>
                  <Switch defaultChecked disabled={currentRole !== 'owner'} />
                </div>
              </div>
            </Card>

            <Card className="glass p-6 border-purple-500/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Bell" size={24} className="text-purple-400" />
                Уведомления
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                  <div>
                    <p className="font-medium">Email уведомления</p>
                    <p className="text-sm text-purple-300">Получать важные обновления</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                  <div>
                    <p className="font-medium">Push уведомления</p>
                    <p className="text-sm text-purple-300">Уведомления в реальном времени</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Еженедельный отчёт</p>
                    <p className="text-sm text-purple-300">Сводка активности платформы</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
