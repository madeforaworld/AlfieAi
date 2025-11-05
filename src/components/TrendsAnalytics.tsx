import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, TrendingUp, TrendingDown, Building2, Trees, Map, Users, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area } from 'recharts';
import { planningApplications, getUniqueValues } from '../data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';

// ============ DATA CALCULATION FUNCTIONS ============

// Activity & Performance Metrics
const calculateApprovalByProjectType = () => {
  const projectTypes = getUniqueValues().projectTypes;
  return projectTypes.map(type => {
    const apps = planningApplications.filter(app => app.project_type === type);
    const approved = apps.filter(app => app.status === 'Approved').length;
    return {
      type: type.replace(/ (at|in) .*/, '').substring(0, 25),
      total: apps.length,
      approved,
      rate: apps.length > 0 ? Math.round((approved / apps.length) * 100) : 0
    };
  }).filter(item => item.total >= 3).sort((a, b) => b.rate - a.rate).slice(0, 8);
};

const calculateDecisionTimeDistribution = () => {
  const decidedApps = planningApplications.filter(app => app.decision_date);
  const buckets = [
    { range: '0-30d', min: 0, max: 30, count: 0 },
    { range: '31-60d', min: 31, max: 60, count: 0 },
    { range: '61-90d', min: 61, max: 90, count: 0 },
    { range: '91-120d', min: 91, max: 120, count: 0 },
    { range: '121-180d', min: 121, max: 180, count: 0 },
    { range: '180+d', min: 181, max: 9999, count: 0 }
  ];
  
  decidedApps.forEach(app => {
    const days = Math.floor((new Date(app.decision_date!).getTime() - new Date(app.received_date).getTime()) / (1000 * 60 * 60 * 24));
    const bucket = buckets.find(b => days >= b.min && days <= b.max);
    if (bucket) bucket.count++;
  });
  
  return buckets;
};

const calculateAuthoritySpeed = () => {
  const boroughs = getUniqueValues().boroughs;
  return boroughs.map(borough => {
    const apps = planningApplications.filter(app => app.borough === borough && app.decision_date);
    if (apps.length === 0) return null;
    
    const avgDays = Math.round(apps.reduce((sum, app) => {
      const days = Math.floor((new Date(app.decision_date!).getTime() - new Date(app.received_date).getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / apps.length);
    
    return { authority: borough, avgDays, count: apps.length };
  }).filter(Boolean).sort((a, b) => a!.avgDays - b!.avgDays).slice(0, 10) as { authority: string; avgDays: number; count: number }[];
};

const calculateStatusBreakdown = () => {
  const statuses = ['Approved', 'Pending', 'Refused', 'Withdrawn'];
  const total = planningApplications.length;
  return statuses.map(status => ({
    status,
    count: planningApplications.filter(app => app.status === status).length,
    percent: Math.round((planningApplications.filter(app => app.status === status).length / total) * 100)
  }));
};

// Design & Material Trends
const calculateMaterialsFrequency = () => {
  const materialCounts = planningApplications.reduce((acc, app) => {
    app.materials.forEach(material => {
      acc[material] = (acc[material] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(materialCounts)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / planningApplications.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};

const calculateHeightDistribution = () => {
  const boroughs = getUniqueValues().boroughs;
  return boroughs.map(borough => {
    const apps = planningApplications.filter(app => app.borough === borough);
    const avgHeight = apps.length > 0 
      ? (apps.reduce((sum, app) => sum + app.storeys, 0) / apps.length).toFixed(1)
      : 0;
    return {
      borough: borough.length > 15 ? borough.substring(0, 15) + '...' : borough,
      avgStoreys: parseFloat(avgHeight as string),
      count: apps.length
    };
  }).filter(item => item.count >= 3).sort((a, b) => b.avgStoreys - a.avgStoreys).slice(0, 10);
};

// Sustainability Trends
const calculateSustainabilityFeatures = () => {
  const featureCounts = planningApplications.reduce((acc, app) => {
    app.sustainability_features.forEach(feature => {
      acc[feature] = (acc[feature] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const total = planningApplications.length;
  return Object.entries(featureCounts)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};

const calculateSustainabilityTrend = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, idx) => {
    const monthApps = planningApplications.filter(app => {
      const receivedMonth = new Date(app.received_date).getMonth();
      return receivedMonth === idx;
    });
    
    const withSustainability = monthApps.filter(app => app.sustainability_features.length > 0).length;
    
    return {
      month,
      total: monthApps.length,
      withFeatures: withSustainability,
      percent: monthApps.length > 0 ? Math.round((withSustainability / monthApps.length) * 100) : 0
    };
  }).filter(m => m.total > 0);
};

// Market & Firms
const calculateTopArchitects = () => {
  const architects = getUniqueValues().architects;
  return architects.map(architect => {
    const projects = planningApplications.filter(app => app.architect === architect);
    const approved = projects.filter(app => app.status === 'Approved').length;
    return {
      name: architect,
      projects: projects.length,
      approved,
      approvalRate: projects.length > 0 ? Math.round((approved / projects.length) * 100) : 0
    };
  }).sort((a, b) => b.projects - a.projects).slice(0, 10);
};

const calculateTopDevelopers = () => {
  const developers = getUniqueValues().developers;
  return developers.map(developer => {
    const projects = planningApplications.filter(app => app.developer === developer);
    const approved = projects.filter(app => app.status === 'Approved').length;
    return {
      name: developer,
      projects: projects.length,
      approved,
      approvalRate: projects.length > 0 ? Math.round((approved / projects.length) * 100) : 0
    };
  }).sort((a, b) => b.projects - a.projects).slice(0, 10);
};

const calculateArchitectDeveloperPairs = () => {
  const pairs = planningApplications.reduce((acc, app) => {
    const key = `${app.architect}|${app.developer}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(pairs)
    .map(([key, count]) => {
      const [architect, developer] = key.split('|');
      return { architect, developer, collaborations: count };
    })
    .sort((a, b) => b.collaborations - a.collaborations)
    .slice(0, 8);
};

// Geospatial Patterns
const calculateApprovalRateByBorough = () => {
  const boroughs = getUniqueValues().boroughs;
  return boroughs.map(borough => {
    const apps = planningApplications.filter(app => app.borough === borough);
    const approved = apps.filter(app => app.status === 'Approved').length;
    return {
      borough,
      total: apps.length,
      approved,
      rate: apps.length > 0 ? Math.round((approved / apps.length) * 100) : 0
    };
  }).sort((a, b) => b.rate - a.rate);
};

// Overall Stats
const calculateOverallStats = () => {
  const total = planningApplications.length;
  const approved = planningApplications.filter(app => app.status === 'Approved').length;
  const pending = planningApplications.filter(app => app.status === 'Pending').length;
  const refused = planningApplications.filter(app => app.status === 'Refused').length;
  
  const decidedApps = planningApplications.filter(app => app.decision_date);
  const avgDecisionDays = decidedApps.length > 0 
    ? Math.round(decidedApps.reduce((sum, app) => {
        const days = Math.floor((new Date(app.decision_date!).getTime() - new Date(app.received_date).getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / decidedApps.length)
    : 0;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const uniqueArchitects = getUniqueValues().architects.length;
  const uniqueDevelopers = getUniqueValues().developers.length;
  const uniqueBoroughs = getUniqueValues().boroughs.length;
  
  const totalUnits = planningApplications.reduce((sum, app) => sum + app.units, 0);
  const appsWithSustainability = planningApplications.filter(app => app.sustainability_features.length > 0).length;
  const sustainabilityAdoption = Math.round((appsWithSustainability / total) * 100);

  return {
    total,
    approved,
    pending,
    refused,
    approvalRate,
    avgDecisionDays,
    uniqueArchitects,
    uniqueDevelopers,
    uniqueBoroughs,
    totalUnits,
    sustainabilityAdoption
  };
};

// Pre-calculate all data
const approvalByType = calculateApprovalByProjectType();
const decisionTimeDistribution = calculateDecisionTimeDistribution();
const authoritySpeed = calculateAuthoritySpeed();
const statusBreakdown = calculateStatusBreakdown();
const materialsFrequency = calculateMaterialsFrequency();
const heightDistribution = calculateHeightDistribution();
const sustainabilityFeatures = calculateSustainabilityFeatures();
const sustainabilityTrend = calculateSustainabilityTrend();
const topArchitects = calculateTopArchitects();
const topDevelopers = calculateTopDevelopers();
const architectDeveloperPairs = calculateArchitectDeveloperPairs();
const approvalRateByBorough = calculateApprovalRateByBorough();
const stats = calculateOverallStats();

const COLORS = {
  primary: '#007AFF',
  success: '#32C8A2',
  warning: '#FF9500',
  danger: '#FF3B30',
  purple: '#AF52DE',
  teal: '#5AC8FA',
  materials: ['#A0522D', '#87CEEB', '#D2691E', '#808080', '#778899', '#696969', '#DEB887', '#CD853F']
};

export function TrendsAnalytics() {
  const [activeTab, setActiveTab] = useState('activity');

  return (
    <div className="h-[calc(100vh-73px)] overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl mb-2">Trends & Insights</h1>
          <p className="text-gray-600">
            Comprehensive analysis of {stats.total} London planning applications across {stats.uniqueBoroughs} boroughs
          </p>
        </div>

        {/* Key Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total Applications</p>
            <p className="text-2xl">{stats.total}</p>
          </Card>
          <Card className="p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Approval Rate</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl">{stats.approvalRate}%</p>
              <TrendingUp className="w-4 h-4 text-[#32C8A2]" />
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Avg Decision Time</p>
            <p className="text-2xl">{stats.avgDecisionDays}d</p>
          </Card>
          <Card className="p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total Units</p>
            <p className="text-2xl">{stats.totalUnits.toLocaleString()}</p>
          </Card>
          <Card className="p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Active Firms</p>
            <p className="text-2xl">{stats.uniqueArchitects}</p>
          </Card>
          <Card className="p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Sustainability</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl">{stats.sustainabilityAdoption}%</p>
              <Trees className="w-4 h-4 text-[#32C8A2]" />
            </div>
          </Card>
        </div>

        {/* Main Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
            <TabsTrigger value="sustainability" className="flex items-center gap-2">
              <Trees className="w-4 h-4" />
              <span className="hidden sm:inline">Sustainability</span>
            </TabsTrigger>
            <TabsTrigger value="geospatial" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Geospatial</span>
            </TabsTrigger>
            <TabsTrigger value="firms" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Firms</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Activity & Performance Tab */}
          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Activity & Performance
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Approval Rate by Project Type */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Approval Rate by Project Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={approvalByType} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="rate" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Approval %" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Decision Time Distribution */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Decision Time Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={decisionTimeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Top 10 Planning Authorities by Speed */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Fastest Planning Authorities</h3>
                <div className="space-y-3">
                  {authoritySpeed.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{i + 1}. {item.authority}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-[#32C8A2] h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (item.avgDays / 200) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm w-16 text-right">{item.avgDays}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Status Breakdown */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Application Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status} ${percent}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.status === 'Approved' ? COLORS.success :
                          entry.status === 'Pending' ? COLORS.warning :
                          entry.status === 'Refused' ? COLORS.danger :
                          '#999'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Design & Material Trends Tab */}
          <TabsContent value="design" className="space-y-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Design & Material Trends
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Materials Frequency */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Emerging Materials Index</h3>
                <div className="space-y-3">
                  {materialsFrequency.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm mb-1">{item.name}</p>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${item.percent}%`,
                              backgroundColor: COLORS.materials[i % COLORS.materials.length]
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm">{item.count}</p>
                        <Badge variant="outline" className="text-xs">{item.percent}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Building Height Distribution */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Average Building Height by Borough</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={heightDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="borough" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
                    <YAxis label={{ value: 'Storeys', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="avgStoreys" fill={COLORS.purple} radius={[4, 4, 0, 0]} name="Avg Storeys" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Sustainability & Net Zero Tab */}
          <TabsContent value="sustainability" className="space-y-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Trees className="w-6 h-6" />
              Sustainability & Net Zero
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Sustainability Features */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Top Sustainability Features</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sustainabilityFeatures.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.success} radius={[0, 4, 4, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Sustainability Adoption Trend */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Sustainability Adoption Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sustainabilityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="percent" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} name="% with Features" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Sustainability Insights Card */}
              <Card className="p-6 border border-gray-200 lg:col-span-2 bg-gradient-to-br from-green-50 to-white">
                <h3 className="mb-3 flex items-center gap-2">
                  <Trees className="w-5 h-5 text-[#32C8A2]" />
                  Sustainability Insights
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Badge className="mb-2 bg-[#32C8A2]">High Adoption</Badge>
                    <p className="text-sm text-gray-700">
                      {sustainabilityFeatures[0]?.name} appears in {sustainabilityFeatures[0]?.count} projects ({sustainabilityFeatures[0]?.percent}%), leading sustainability features in London applications.
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2 bg-[#32C8A2]">Growing Trend</Badge>
                    <p className="text-sm text-gray-700">
                      {stats.sustainabilityAdoption}% of all applications now include sustainability features, reflecting increased focus on net zero targets.
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2 bg-[#32C8A2]">Policy Alignment</Badge>
                    <p className="text-sm text-gray-700">
                      BREEAM Excellent certifications appear in {sustainabilityFeatures.find(f => f.name === 'BREEAM Excellent')?.count || 0} projects, showing strong policy compliance.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Geospatial Patterns Tab */}
          <TabsContent value="geospatial" className="space-y-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Map className="w-6 h-6" />
              Geospatial Patterns
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Approval Rate by Borough */}
              <Card className="p-6 border border-gray-200 lg:col-span-2">
                <h3 className="mb-4">Approval Rate by Borough</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={approvalRateByBorough}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="borough" angle={-45} textAnchor="end" height={120} style={{ fontSize: '11px' }} />
                    <YAxis domain={[0, 100]} label={{ value: 'Approval Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="rate" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Approval Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Borough Statistics */}
              <Card className="p-6 border border-gray-200 lg:col-span-2">
                <h3 className="mb-4">Borough Performance Summary</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvalRateByBorough.slice(0, 6).map((borough, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm mb-2">{borough.borough}</p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl">{borough.rate}%</span>
                        <span className="text-xs text-gray-600">approval</span>
                      </div>
                      <p className="text-xs text-gray-600">{borough.total} applications</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Market & Firms Tab */}
          <TabsContent value="firms" className="space-y-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              Market & Firms
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Architects */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Most Active Architects</h3>
                <div className="space-y-3">
                  {topArchitects.map((architect, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm mb-1">{i + 1}. {architect.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{architect.projects} projects</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[150px]">
                            <div 
                              className="bg-[#007AFF] h-2 rounded-full" 
                              style={{ width: `${architect.approvalRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{architect.approvalRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Developers */}
              <Card className="p-6 border border-gray-200">
                <h3 className="mb-4">Most Active Developers</h3>
                <div className="space-y-3">
                  {topDevelopers.map((developer, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm mb-1">{i + 1}. {developer.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{developer.projects} projects</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[150px]">
                            <div 
                              className="bg-[#32C8A2] h-2 rounded-full" 
                              style={{ width: `${developer.approvalRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{developer.approvalRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Collaboration Network */}
              <Card className="p-6 border border-gray-200 lg:col-span-2">
                <h3 className="mb-4">Top Architect-Developer Collaborations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {architectDeveloperPairs.map((pair, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm mb-1">{pair.architect}</p>
                          <p className="text-xs text-gray-500">× {pair.developer}</p>
                        </div>
                        <Badge variant="outline">{pair.collaborations} projects</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai" className="space-y-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#007AFF]" />
              AI-Generated Insights
            </h2>

            {/* AI Insights Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border border-gray-200 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-[#007AFF]" />
                  <h3 className="text-sm">Trend Analysis</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>{materialsFrequency[0]?.name}</strong> leads material specifications with {materialsFrequency[0]?.count} applications ({materialsFrequency[0]?.percent}% of total). 
                  {materialsFrequency[1]?.name} follows at {materialsFrequency[1]?.count} projects, showing a clear preference for traditional materials combined with modern glazing.
                </p>
                <Badge variant="outline" className="text-xs">Updated daily</Badge>
              </Card>

              <Card className="p-6 border border-gray-200 bg-gradient-to-br from-green-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <Trees className="w-5 h-5 text-[#32C8A2]" />
                  <h3 className="text-sm">Sustainability Focus</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {stats.sustainabilityAdoption}% of applications now include sustainability features. 
                  <strong> {sustainabilityFeatures[0]?.name}</strong> appears most frequently ({sustainabilityFeatures[0]?.count} projects), 
                  followed by {sustainabilityFeatures[1]?.name} ({sustainabilityFeatures[1]?.count} projects), indicating strong alignment with London Plan sustainability requirements.
                </p>
                <Badge variant="outline" className="text-xs">Updated daily</Badge>
              </Card>

              <Card className="p-6 border border-gray-200 bg-gradient-to-br from-purple-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <Map className="w-5 h-5 text-[#AF52DE]" />
                  <h3 className="text-sm">Geographic Patterns</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>{approvalRateByBorough[0]?.borough}</strong> shows the highest approval rate at {approvalRateByBorough[0]?.rate}% 
                  across {approvalRateByBorough[0]?.total} applications. 
                  {heightDistribution[0]?.borough} leads in building height with an average of {heightDistribution[0]?.avgStoreys} storeys, 
                  reflecting density-focused development strategies.
                </p>
                <Badge variant="outline" className="text-xs">Updated daily</Badge>
              </Card>

              <Card className="p-6 border border-gray-200 bg-gradient-to-br from-orange-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-[#FF9500]" />
                  <h3 className="text-sm">Performance Insights</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Average decision time stands at <strong>{stats.avgDecisionDays} days</strong> across all boroughs. 
                  {authoritySpeed[0]?.authority} processes applications fastest at {authoritySpeed[0]?.avgDays} days on average. 
                  {approvalByType[0]?.type} projects show the highest approval rate at {approvalByType[0]?.rate}%.
                </p>
                <Badge variant="outline" className="text-xs">Updated daily</Badge>
              </Card>

              <Card className="p-6 border border-gray-200 bg-gradient-to-br from-teal-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-[#5AC8FA]" />
                  <h3 className="text-sm">Market Intelligence</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>{topArchitects[0]?.name}</strong> leads with {topArchitects[0]?.projects} projects and a {topArchitects[0]?.approvalRate}% approval rate. 
                  Top developer <strong>{topDevelopers[0]?.name}</strong> has {topDevelopers[0]?.projects} active applications. 
                  {architectDeveloperPairs[0]?.architect} and {architectDeveloperPairs[0]?.developer} show the strongest collaboration pattern with {architectDeveloperPairs[0]?.collaborations} joint projects.
                </p>
                <Badge variant="outline" className="text-xs">Updated daily</Badge>
              </Card>

              <Card className="p-6 border border-gray-200 bg-gradient-to-br from-red-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
                  <h3 className="text-sm">Risk & Opportunity</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {stats.approved} applications approved vs {stats.refused} refused, yielding a {stats.approvalRate}% overall success rate. 
                  {stats.pending} applications currently pending decision. Projects incorporating {sustainabilityFeatures[0]?.name} correlate with higher approval rates, 
                  particularly in boroughs with strong sustainability mandates.
                </p>
                <Badge variant="outline" className="text-xs">Updated daily</Badge>
              </Card>
            </div>

            {/* Summary Stats */}
            <Card className="p-6 border border-gray-200">
              <h3 className="mb-4">Dataset Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl mb-1">{stats.uniqueBoroughs}</p>
                  <p className="text-sm text-gray-600">Boroughs</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl mb-1">{stats.uniqueArchitects}</p>
                  <p className="text-sm text-gray-600">Architects</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl mb-1">{stats.uniqueDevelopers}</p>
                  <p className="text-sm text-gray-600">Developers</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl mb-1">{stats.totalUnits.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Units</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
