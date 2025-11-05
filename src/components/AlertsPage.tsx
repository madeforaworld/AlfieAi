import { useState } from 'react';
import { Plus, Bell, Trash2, Edit2, MapPin, Building2, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface Alert {
  id: string;
  name: string;
  criteria: string;
  frequency: string;
  enabled: boolean;
  matches: number;
  lastNotified: string;
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'CLT Projects in Camden',
      criteria: 'Material: CLT, Location: Camden Borough',
      frequency: 'Daily',
      enabled: true,
      matches: 3,
      lastNotified: '2 hours ago',
    },
    {
      id: '2',
      name: 'Foster + Partners Applications',
      criteria: 'Architect: Foster + Partners, Greater London',
      frequency: 'Weekly',
      enabled: true,
      matches: 1,
      lastNotified: '3 days ago',
    },
    {
      id: '3',
      name: 'High-rise Residential East London',
      criteria: 'Type: Residential, Height: >20 floors, Location: Tower Hamlets, Newham',
      frequency: 'Daily',
      enabled: false,
      matches: 0,
      lastNotified: 'Never',
    },
    {
      id: '4',
      name: 'Westminster Approvals',
      criteria: 'Authority: Westminster, Status: Approved',
      frequency: 'Weekly',
      enabled: true,
      matches: 7,
      lastNotified: '1 day ago',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="h-[calc(100vh-73px)] overflow-auto bg-gray-50">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl mb-2">Alerts & Saved Searches</h1>
            <p className="text-gray-600">Get notified when new projects match your criteria</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#007AFF] hover:bg-[#0066DD]">
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="alert-name">Alert Name</Label>
                  <Input 
                    id="alert-name" 
                    placeholder="e.g., CLT Projects in Camden"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="Enter postcode or city"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="radius">Radius</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 km</SelectItem>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="25">25 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="architect">Architect (optional)</Label>
                  <Input 
                    id="architect" 
                    placeholder="e.g., Foster + Partners"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="materials">Materials (optional)</Label>
                  <Input 
                    id="materials" 
                    placeholder="e.g., CLT, Timber, Brick"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any status</SelectItem>
                        <SelectItem value="submitted">Newly submitted</SelectItem>
                        <SelectItem value="approved">Approved only</SelectItem>
                        <SelectItem value="refused">Refused only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Notification Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#007AFF] hover:bg-[#0066DD]" onClick={() => setIsDialogOpen(false)}>
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card className="p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Active Alerts</p>
            <p className="text-3xl">{alerts.filter(a => a.enabled).length}</p>
          </Card>
          <Card className="p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">New Matches (24h)</p>
            <p className="text-3xl">11</p>
          </Card>
          <Card className="p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Total Monitored</p>
            <p className="text-3xl">{alerts.length}</p>
          </Card>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className={`w-5 h-5 ${alert.enabled ? 'text-[#007AFF]' : 'text-gray-400'}`} />
                    <h3>{alert.name}</h3>
                    {alert.matches > 0 && (
                      <Badge className="bg-[#007AFF] text-white">
                        {alert.matches} new
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{alert.criteria}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{alert.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>Last notified: {alert.lastNotified}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-6">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={alert.enabled}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <span className="text-sm text-gray-600">
                      {alert.enabled ? 'On' : 'Off'}
                    </span>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {alerts.length === 0 && (
          <Card className="p-12 text-center border border-gray-200">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="mb-2">No alerts yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first alert to get notified about relevant planning applications
            </p>
            <Button className="bg-[#007AFF] hover:bg-[#0066DD]">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Alert
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
