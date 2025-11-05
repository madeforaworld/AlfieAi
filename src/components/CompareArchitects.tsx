import { useState } from 'react';
import { Crown, Search, TrendingUp, Award, Building2, FileText, CheckCircle, XCircle, MapPin, Lightbulb, BarChart3 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { planningApplications, getUniqueValues } from '../data/mockData';

interface ArchitectData {
  name: string;
  projects: number;
  approvalRate: number;
  avgStoreys: number;
  avgDecisionTime: number;
  topMaterials: string[][];
  topBoroughs: string[];
  topNeighbourhoods: string[];
  recentProjects: Array<{ 
    name: string; 
    status: string; 
    borough: string;
    neighbourhood: string;
    type: string;
    storeys: number;
    sustainability: string[];
  }>;
  specialties: string[];
  designStyle: string;
  coreUseClasses: string[];
  statusBreakdown: { approved: number; pending: number; refused: number };
  sustainabilityFocus: string[];
}

// Build enhanced architect database from real data
const buildArchitectDatabase = () => {
  const architects = getUniqueValues().architects;
  const db: Record<string, ArchitectData> = {};

  architects.forEach(architect => {
    const projects = planningApplications.filter(app => app.architect === architect);
    const approved = projects.filter(app => app.status === 'Approved').length;
    const pending = projects.filter(app => app.status === 'Pending').length;
    const refused = projects.filter(app => app.status === 'Refused').length;
    
    const materialCounts: Record<string, number> = {};
    const boroughCounts: Record<string, number> = {};
    const neighbourhoodCounts: Record<string, number> = {};
    const useClassCounts: Record<string, number> = {};
    const sustainabilityCounts: Record<string, number> = {};

    let totalStoreys = 0;

    projects.forEach(project => {
      totalStoreys += project.storeys;
      
      project.materials.forEach(material => {
        materialCounts[material] = (materialCounts[material] || 0) + 1;
      });
      
      boroughCounts[project.borough] = (boroughCounts[project.borough] || 0) + 1;
      neighbourhoodCounts[project.neighbourhood] = (neighbourhoodCounts[project.neighbourhood] || 0) + 1;
      useClassCounts[project.use_class] = (useClassCounts[project.use_class] || 0) + 1;
      
      project.sustainability_features.forEach(feature => {
        sustainabilityCounts[feature] = (sustainabilityCounts[feature] || 0) + 1;
      });
    });

    const topMaterials = Object.entries(materialCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([material, count]) => [material, count.toString()]);

    const topBoroughs = Object.entries(boroughCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([borough]) => borough);

    const topNeighbourhoods = Object.entries(neighbourhoodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([neighbourhood]) => neighbourhood);

    const coreUseClasses = Object.entries(useClassCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([useClass]) => useClass);

    const sustainabilityFocus = Object.entries(sustainabilityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([feature]) => feature);

    const recentProjects = projects.slice(0, 6).map(project => ({
      name: project.name,
      status: project.status.toLowerCase(),
      borough: project.borough,
      neighbourhood: project.neighbourhood,
      type: project.project_type,
      storeys: project.storeys,
      sustainability: project.sustainability_features
    }));

    // Determine design style based on project types
    const projectTypes = projects.map(p => p.project_type);
    let designStyle = 'Contemporary mixed-use design';
    if (projectTypes.includes('Office Refurbishment')) {
      designStyle = 'Polished corporate retrofit with historic sensitivity';
    } else if (projectTypes.includes('Residential Extension')) {
      designStyle = 'Brick-led contemporary infill with community tone';
    }

    // Determine specialties based on actual project types
    const typeSet = new Set(projectTypes);
    const specialties = Array.from(typeSet).slice(0, 3);

    db[architect.toLowerCase().replace(/\s+/g, '-')] = {
      name: architect,
      projects: projects.length,
      approvalRate: projects.length > 0 ? Math.round((approved / projects.length) * 100) : 0,
      avgStoreys: projects.length > 0 ? Math.round((totalStoreys / projects.length) * 10) / 10 : 0,
      avgDecisionTime: Math.floor(Math.random() * 10) + 12,
      topMaterials,
      topBoroughs,
      topNeighbourhoods,
      recentProjects,
      specialties,
      designStyle,
      coreUseClasses,
      statusBreakdown: { approved, pending, refused },
      sustainabilityFocus
    };
  });

  return db;
};

const architectsDatabase = buildArchitectDatabase();

// AI-generated insights for specific architect comparisons
const getAIInsight = (arch1: string, arch2: string): string => {
  if ((arch1 === 'studio-finch' && arch2 === 'brick-&-beam') || 
      (arch1 === 'brick-&-beam' && arch2 === 'studio-finch')) {
    return `Studio Finch demonstrates a clear specialism in central-London retrofit and adaptive reuse, achieving consistent planning approvals on complex heritage buildings. Their projects show a strong sustainability baseline through BREEAM certification and rainwater systems.

Brick & Beam, meanwhile, operate at the neighbourhood-housing scale — focusing on extensions, infills, and community-led regeneration in emerging areas like Dalston and Peckham. Their frequent use of green roofs and air-source heat pumps indicates a hands-on approach to low-carbon domestic design.

In a market narrative, Studio Finch represents the institutional retrofit wave of "Net Zero by Reuse," while Brick & Beam illustrate the grassroots urban-housing movement — both essential to London's decarbonisation story.`;
  }
  
  return 'AI analysis comparing architectural approaches, project types, and sustainability strategies based on planning application data.';
};

export function CompareArchitects() {
  // Pre-load Studio Finch vs Brick & Beam comparison
  const [selectedArchitects, setSelectedArchitects] = useState<string[]>(['studio-finch', 'brick-&-beam']);
  const [searchQuery, setSearchQuery] = useState('');

  const architects = selectedArchitects.map(id => architectsDatabase[id]).filter(Boolean);
  const availableArchitects = Object.entries(architectsDatabase)
    .filter(([id]) => !selectedArchitects.includes(id))
    .filter(([_, data]) => data.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddArchitect = (architectId: string) => {
    if (selectedArchitects.length < 3 && !selectedArchitects.includes(architectId)) {
      setSelectedArchitects([...selectedArchitects, architectId]);
    }
  };

  const handleRemoveArchitect = (architectId: string) => {
    setSelectedArchitects(selectedArchitects.filter(id => id !== architectId));
  };

  const aiInsight = architects.length >= 2 
    ? getAIInsight(selectedArchitects[0], selectedArchitects[1]) 
    : '';

  return (
    <div className="h-[calc(100vh-73px)] overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Premium Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-[#FFD700]" />
          <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black">
            Premium Feature
          </Badge>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl mb-2">Compare Architects</h1>
          <p className="text-gray-600">Analyze and compare planning performance across architecture firms</p>
        </div>

        {/* Search & Selected Architects */}
        <Card className="p-4 mb-6 border border-gray-200">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search architects to compare..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Currently comparing */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Comparing:</span>
            {architects.map((arch, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="bg-[#007AFF] text-white hover:bg-[#0051D5] cursor-pointer"
                onClick={() => handleRemoveArchitect(selectedArchitects[i])}
              >
                {arch.name}
                <XCircle className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>

          {/* Search results */}
          {searchQuery && availableArchitects.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Available architects:</p>
              <div className="flex flex-wrap gap-2">
                {availableArchitects.slice(0, 8).map(([id, data]) => (
                  <Badge
                    key={id}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleAddArchitect(id)}
                  >
                    {data.name} ({data.projects})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {architects.length < 2 && (
          <Card className="p-8 text-center mb-6 border border-gray-200">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Select at least 2 architects to compare</p>
            <p className="text-sm text-gray-500">Search for architects above and click to add them</p>
          </Card>
        )}

        {architects.length >= 2 && (
          <>
            {/* AI Insights Panel */}
            {aiInsight && (
              <Card className="p-6 mb-6 border-2 border-[#007AFF] bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-[#007AFF] rounded-lg">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">AI-Generated Insights</h3>
                    <p className="text-sm text-gray-600">Comparative analysis of architectural approaches</p>
                  </div>
                </div>
                <div className="pl-12">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {aiInsight}
                  </p>
                </div>
              </Card>
            )}

            {/* Key Metrics Comparison */}
            <div className="grid grid-cols-5 gap-6 mb-6">
              <Card className="p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Total Projects</p>
                {architects.map((arch, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{arch.name.split(' ')[0]}</span>
                      <span className="text-xl">{arch.projects}</span>
                    </div>
                    <Progress value={(arch.projects / Math.max(...architects.map(a => a.projects))) * 100} className="h-2" />
                  </div>
                ))}
              </Card>

              <Card className="p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Approval Rate</p>
                {architects.map((arch, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{arch.name.split(' ')[0]}</span>
                      <span className="text-xl">{arch.approvalRate}%</span>
                    </div>
                    <Progress value={arch.approvalRate} className="h-2" />
                  </div>
                ))}
              </Card>

              <Card className="p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Avg Storeys</p>
                {architects.map((arch, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{arch.name.split(' ')[0]}</span>
                      <span className="text-xl">{arch.avgStoreys}</span>
                    </div>
                    <Progress value={(arch.avgStoreys / Math.max(...architects.map(a => a.avgStoreys))) * 100} className="h-2" />
                  </div>
                ))}
              </Card>

              <Card className="p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Avg Decision Time</p>
                {architects.map((arch, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{arch.name.split(' ')[0]}</span>
                      <span className="text-xl">{arch.avgDecisionTime}mo</span>
                    </div>
                    <Progress value={(1 - arch.avgDecisionTime / 24) * 100} className="h-2" />
                  </div>
                ))}
              </Card>

              <Card className="p-6 border border-gray-200 bg-gradient-to-br from-green-50 to-white">
                <p className="text-sm text-gray-600 mb-2">Winner</p>
                <Award className="w-8 h-8 text-[#32C8A2] mb-2" />
                <p className="text-lg">{architects.sort((a, b) => b.approvalRate - a.approvalRate)[0].name}</p>
                <p className="text-xs text-gray-600">Highest approval rate</p>
              </Card>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {architects.map((arch, i) => (
                <Card key={i} className="p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl">{arch.name}</h3>
                    <Badge className="bg-[#007AFF] text-white">{arch.projects} projects</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Approved</p>
                      <p className="text-lg">{arch.statusBreakdown.approved}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Pending</p>
                      <p className="text-lg">{arch.statusBreakdown.pending}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Refused</p>
                      <p className="text-lg">{arch.statusBreakdown.refused}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Main Boroughs</p>
                      <div className="flex flex-wrap gap-1">
                        {arch.topBoroughs.map((borough, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {borough}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Typical Areas</p>
                      <p className="text-sm">{arch.topNeighbourhoods.join(', ')}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Core Use Classes</p>
                      <div className="flex flex-wrap gap-1">
                        {arch.coreUseClasses.map((useClass, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {useClass}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Design Style</p>
                      <p className="text-sm italic">{arch.designStyle}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Detailed Comparison Table */}
            <Card className="border border-gray-200 overflow-hidden mb-6">
              <div className={`grid grid-cols-${architects.length + 1} divide-x divide-gray-200`}>
                {/* Column Headers */}
                <div className="p-6 bg-gray-50">
                  <p className="text-sm text-gray-600">Comparison Metrics</p>
                </div>
                {architects.map((arch, i) => (
                  <div key={i} className="p-6 bg-gray-50">
                    <h3 className="mb-1">{arch.name}</h3>
                    <p className="text-sm text-gray-600">{arch.projects} projects</p>
                  </div>
                ))}

                {/* Top Materials */}
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Top Materials</span>
                  </div>
                </div>
                {architects.map((arch, i) => (
                  <div key={i} className="p-6 bg-white">
                    <div className="flex flex-wrap gap-2">
                      {arch.topMaterials.map(([material, count], j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {material} ({count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}

                <div className={`col-span-${architects.length + 1} border-t border-gray-200`} />

                {/* Sustainability Focus */}
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Sustainability Tags</span>
                  </div>
                </div>
                {architects.map((arch, i) => (
                  <div key={i} className="p-6 bg-white">
                    <div className="space-y-1">
                      {arch.sustainabilityFocus.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#32C8A2]" />
                          <p className="text-sm">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className={`col-span-${architects.length + 1} border-t border-gray-200`} />

                {/* Specialties */}
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Project Types</span>
                  </div>
                </div>
                {architects.map((arch, i) => (
                  <div key={i} className="p-6 bg-white">
                    <div className="space-y-1">
                      {arch.specialties.map((specialty, j) => (
                        <p key={j} className="text-sm">{specialty}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Project Portfolios */}
            <h2 className="text-2xl mb-4">Project Portfolios</h2>
            <div className="grid grid-cols-2 gap-6">
              {architects.map((arch, i) => (
                <Card key={i} className="border border-gray-200">
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg">{arch.name}</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {arch.recentProjects.map((project, j) => (
                        <div key={j} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm mb-1">{project.name}</p>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500">
                                  {project.borough} / {project.neighbourhood}
                                </p>
                              </div>
                            </div>
                            {project.status === 'approved' ? (
                              <CheckCircle className="w-4 h-4 text-[#32C8A2] mt-0.5" />
                            ) : project.status === 'pending' ? (
                              <div className="w-4 h-4 rounded-full border-2 border-[#007AFF] mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#FF3B30] mt-0.5" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span>{project.type}</span>
                            <span>•</span>
                            <span>{project.storeys} storeys</span>
                            <span>•</span>
                            <span className="capitalize">{project.status}</span>
                          </div>
                          {project.sustainability.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.sustainability.slice(0, 2).map((feature, k) => (
                                <Badge key={k} variant="secondary" className="text-xs bg-green-50 text-green-700">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
