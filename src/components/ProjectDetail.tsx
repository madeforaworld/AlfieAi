import { ArrowLeft, Download, MapPin, Calendar, Building2, User, FileText, Image as ImageIcon, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { planningApplications } from '../data/mockData';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

// Create a project data map from planning applications
const projectDataMap = planningApplications.reduce((acc, app) => {
  acc[app.id] = {
    ...app,
    authority: app.borough,
    officer: 'Planning Officer',
    ward: app.neighbourhood,
    height: `${app.storeys * 3}m`,
    floors: app.storeys,
    parking: '15 cycle spaces',
    aiSummary: `This ${app.project_type} in ${app.neighbourhood}, ${app.borough} proposes ${app.storeys} storeys with ${app.units} units. The scheme features ${app.materials.join(', ')} materials and includes sustainability features: ${app.sustainability_features.join(', ')}. ${app.description}`,
    documents: [
      { name: 'Design & Access Statement', type: 'PDF', size: '24.5 MB', pages: 87 },
      { name: 'Planning Statement', type: 'PDF', size: '3.2 MB', pages: 42 },
      { name: 'Site Plan', type: 'PDF', size: '2.1 MB', pages: 1 },
      { name: 'Elevations', type: 'PDF', size: '5.4 MB', pages: 4 },
      { name: 'Sections', type: 'PDF', size: '4.8 MB', pages: 3 },
    ],
    relatedProjects: [],
  };
  return acc;
}, {} as Record<string, any>);

const projectData = projectDataMap;

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const project = projectData[projectId] || projectData[planningApplications[0].id];

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

  return (
    <div className="h-[calc(100vh-73px)] overflow-auto bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl">{project.name}</h1>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-gray-600 mb-1">{project.address}</p>
                <p className="text-sm text-gray-500">{project.reference}</p>
              </div>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-6 mt-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Architect</p>
                  <p>{project.architect}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Developer</p>
                  <p>{project.developer}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Authority</p>
                  <p>{project.authority}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Decision Date</p>
                  <p>{project.decision_date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* AI Summary */}
            <Card className="p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#007AFF]" />
                <h2>AI Summary</h2>
                <Badge variant="outline" className="text-xs ml-auto">Generated by AlfieAI</Badge>
              </div>
              <p className="text-gray-700 leading-relaxed">{project.aiSummary}</p>
            </Card>

            {/* Tabs */}
            <Card className="border border-gray-200">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#007AFF]">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="drawings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#007AFF]">
                    Drawings
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#007AFF]">
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3">Description</h3>
                      <p className="text-gray-700">{project.description}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Height</p>
                        <p>{project.height}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Floors</p>
                        <p>{project.floors}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Units</p>
                        <p>{project.units}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Parking</p>
                        <p>{project.parking}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm text-gray-500 mb-3">Materials</p>
                      <div className="flex gap-2 flex-wrap">
                        {project.materials.map((material: string) => (
                          <Badge key={material} variant="outline">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="drawings" className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {['Site Plan', 'North Elevation', 'South Elevation', 'Section A-A'].map((drawing, i) => (
                      <div key={i} className="aspect-[4/3] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center group cursor-pointer hover:border-[#007AFF] transition-colors">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{drawing}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="p-6">
                  <div className="space-y-2">
                    {project.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {doc.pages} pages</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 border border-gray-200">
              <h3 className="mb-4">Key Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Received</span>
                  <span>{project.received_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Decided</span>
                  <span>{project.decision_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ward</span>
                  <span>{project.ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Officer</span>
                  <span>{project.officer}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button variant="outline" className="w-full" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Authority Portal
              </Button>
            </Card>

            {/* Related Projects */}
            <Card className="p-6 border border-gray-200">
              <h3 className="mb-4">Similar Nearby Projects</h3>
              <div className="space-y-3">
                {project.relatedProjects.map((related: any) => (
                  <div key={related.id} className="p-3 rounded-lg border border-gray-200 hover:border-[#007AFF] cursor-pointer transition-colors">
                    <p className="text-sm mb-1">{related.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{related.distance} away</span>
                      <Badge variant="outline" className="text-xs">
                        {related.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
