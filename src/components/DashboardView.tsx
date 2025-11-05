import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { MapView } from './MapView';
import { Card } from './ui/card';
import { planningApplications, getUniqueValues } from '../data/mockData';

interface DashboardViewProps {
  onProjectSelect: (id: string) => void;
}

export function DashboardView({ onProjectSelect }: DashboardViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorough, setSelectedBorough] = useState<string>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [architectFilter, setArchitectFilter] = useState('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listContainerRef = useRef<HTMLDivElement>(null);

  const handleProjectClick = (id: string) => {
    setSelectedProject(id);
    // Scroll to the card after a brief delay to ensure it's rendered
    setTimeout(() => {
      const cardElement = cardRefs.current[id];
      if (cardElement && listContainerRef.current) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a brief highlight effect
        cardElement.style.boxShadow = '0 0 0 3px #007AFF40';
        setTimeout(() => {
          cardElement.style.boxShadow = '';
        }, 1500);
      }
    }, 100);
  };

  // Clear card refs when filtered applications change
  useEffect(() => {
    cardRefs.current = {};
  }, [searchQuery, selectedBorough, selectedStatuses, selectedMaterials, architectFilter, dateRange]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'borough':
        setSelectedBorough('all');
        break;
      case 'status':
        if (value) {
          setSelectedStatuses(prev => prev.filter(s => s !== value));
        }
        break;
      case 'material':
        if (value) {
          setSelectedMaterials(prev => prev.filter(m => m !== value));
        }
        break;
      case 'architect':
        setArchitectFilter('');
        break;
      case 'date':
        setDateRange('all');
        break;
      case 'search':
        setSearchQuery('');
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBorough('all');
    setSelectedStatuses([]);
    setSelectedMaterials([]);
    setArchitectFilter('');
    setDateRange('all');
  };

  // Filter applications based on all criteria
  const filteredApplications = useMemo(() => {
    return planningApplications.filter(app => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          app.name.toLowerCase().includes(searchLower) ||
          app.address.toLowerCase().includes(searchLower) ||
          app.architect.toLowerCase().includes(searchLower) ||
          app.developer.toLowerCase().includes(searchLower) ||
          app.materials.some(m => m.toLowerCase().includes(searchLower)) ||
          app.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Borough filter
      if (selectedBorough !== 'all' && app.borough !== selectedBorough) {
        return false;
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(app.status)) {
        return false;
      }

      // Materials filter
      if (selectedMaterials.length > 0) {
        const hasMatchingMaterial = selectedMaterials.some(material =>
          app.materials.includes(material)
        );
        if (!hasMatchingMaterial) return false;
      }

      // Architect filter
      if (architectFilter && !app.architect.toLowerCase().includes(architectFilter.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (dateRange !== 'all') {
        const receivedDate = new Date(app.received_date);
        const now = new Date();
        const monthsAgo = dateRange === '1m' ? 1 : dateRange === '3m' ? 3 : dateRange === '6m' ? 6 : 12;
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate());
        if (receivedDate < cutoffDate) return false;
      }

      return true;
    });
  }, [searchQuery, selectedBorough, selectedStatuses, selectedMaterials, architectFilter, dateRange]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      Approved: { className: 'bg-[#32C8A2] text-white hover:bg-[#32C8A2]' },
      Refused: { className: 'bg-[#FF3B30] text-white hover:bg-[#FF3B30]' },
      Pending: { className: 'bg-[#007AFF] text-white hover:bg-[#007AFF]' },
      Withdrawn: { className: 'bg-gray-400 text-white hover:bg-gray-400' },
    };
    return (
      <Badge className={variants[status]?.className || ''}>
        {status}
      </Badge>
    );
  };

  const activeFilterCount = 
    (searchQuery ? 1 : 0) +
    (selectedBorough !== 'all' ? 1 : 0) +
    selectedStatuses.length +
    selectedMaterials.length +
    (architectFilter ? 1 : 0) +
    (dateRange !== 'all' ? 1 : 0);

  const uniqueValues = getUniqueValues();

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search and Filters Bar */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, address, architect, materials..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-[#007AFF] text-white">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Projects</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="text-sm mb-2 block text-gray-600">Borough</label>
                    <Select value={selectedBorough} onValueChange={setSelectedBorough}>
                      <SelectTrigger>
                        <SelectValue placeholder="All boroughs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All boroughs</SelectItem>
                        {uniqueValues.boroughs.map((borough) => (
                          <SelectItem key={borough} value={borough}>
                            {borough}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm mb-2 block text-gray-600">Status</label>
                    <div className="space-y-2">
                      {['Approved', 'Pending', 'Refused', 'Withdrawn'].map((status) => (
                        <div key={status} className="flex items-center gap-2">
                          <Checkbox
                            id={status}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <label htmlFor={status} className="text-sm cursor-pointer">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm mb-2 block text-gray-600">Materials</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uniqueValues.materials.map((material) => (
                        <div key={material} className="flex items-center gap-2">
                          <Checkbox
                            id={material}
                            checked={selectedMaterials.includes(material)}
                            onCheckedChange={() => toggleMaterial(material)}
                          />
                          <label htmlFor={material} className="text-sm cursor-pointer">
                            {material}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm mb-2 block text-gray-600">Architect</label>
                    <Input
                      placeholder="Search architect name"
                      value={architectFilter}
                      onChange={(e) => setArchitectFilter(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-2 block text-gray-600">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All time</SelectItem>
                        <SelectItem value="1m">Last month</SelectItem>
                        <SelectItem value="3m">Last 3 months</SelectItem>
                        <SelectItem value="6m">Last 6 months</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearAllFilters}
                    disabled={activeFilterCount === 0}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => removeFilter('search')}
                >
                  Search: "{searchQuery.substring(0, 20)}..."
                  <X className="ml-1 w-3 h-3" />
                </Badge>
              )}
              {selectedBorough !== 'all' && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => removeFilter('borough')}
                >
                  {selectedBorough}
                  <X className="ml-1 w-3 h-3" />
                </Badge>
              )}
              {selectedStatuses.map((status) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => removeFilter('status', status)}
                >
                  {status}
                  <X className="ml-1 w-3 h-3" />
                </Badge>
              ))}
              {selectedMaterials.map((material) => (
                <Badge
                  key={material}
                  variant="secondary"
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => removeFilter('material', material)}
                >
                  {material}
                  <X className="ml-1 w-3 h-3" />
                </Badge>
              ))}
              {architectFilter && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => removeFilter('architect')}
                >
                  Architect: {architectFilter}
                  <X className="ml-1 w-3 h-3" />
                </Badge>
              )}
              {dateRange !== 'all' && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => removeFilter('date')}
                >
                  {dateRange === '1m' ? 'Last month' : dateRange === '3m' ? 'Last 3 months' : dateRange === '6m' ? 'Last 6 months' : 'Last year'}
                  <X className="ml-1 w-3 h-3" />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="h-[45%] p-6">
          <MapView 
            selectedProject={selectedProject} 
            onProjectClick={handleProjectClick}
            applications={filteredApplications}
          />
        </div>

        {/* Table Section */}
        <div ref={listContainerRef} className="flex-1 overflow-auto px-6 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
              {activeFilterCount > 0 && ` (filtered from ${planningApplications.length} total)`}
            </p>
          </div>
          
          {filteredApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-2">No applications match your filters</p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card 
                  key={app.id}
                  ref={(el) => cardRefs.current[app.id] = el}
                  className={`p-4 hover:shadow-md transition-all cursor-pointer border ${
                    selectedProject === app.id ? 'border-[#007AFF] ring-2 ring-[#007AFF]/20' : 'border-gray-200'
                  }`}
                  onClick={() => onProjectSelect(app.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base">{app.name}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{app.address}</p>
                      <p className="text-sm text-gray-500">{app.reference}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Architect</p>
                      <p>{app.architect}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Developer</p>
                      <p>{app.developer}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Borough</p>
                      <p>{app.borough}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Decision Date</p>
                      <p>{app.decision_date || 'Pending'}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">
                    {app.materials.map((material) => (
                      <Badge key={material} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
