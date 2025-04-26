
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { ChartContainer, ChartLegendContent, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CompanyData = {
  company_name: string;
  total_media: number;
  total_time: number;
  total_interactions: number;
}

type MediaData = {
  id: string;
  name: string;
  type: string;
  company_name: string;
  time_slot: number;
  created_at: string;
  interactions: number;
}

type InteractionDataPoint = {
  time: string;
  interactions: number;
}

type MediaDetailsType = {
  company_name: string;
  time_slot: number;
}

const CompanyDashboard = () => {
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [mediaData, setMediaData] = useState<MediaData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [interactionData, setInteractionData] = useState<InteractionDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch media data with details
        const { data: mediaWithDetails, error: mediaError } = await supabase
          .from('media')
          .select(`
            id, name, type, userid, interactions, created_at,
            media_details(company_name, time_slot)
          `);

        if (mediaError) throw mediaError;

        // Process the data for display
        const processedMediaData: MediaData[] = (mediaWithDetails || [])
          .filter(item => item.media_details)
          .map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            company_name: (item.media_details as MediaDetailsType).company_name || "Unknown",
            time_slot: (item.media_details as MediaDetailsType).time_slot || 0,
            created_at: new Date(item.created_at || "").toLocaleString(),
            interactions: item.interactions || 0
          }));
        
        setMediaData(processedMediaData);

        // Aggregate data by company
        const companyStats = processedMediaData.reduce((acc: Record<string, CompanyData>, item) => {
          const { company_name, time_slot, interactions } = item;
          
          if (!acc[company_name]) {
            acc[company_name] = {
              company_name,
              total_media: 0,
              total_time: 0,
              total_interactions: 0
            };
          }
          
          acc[company_name].total_media += 1;
          acc[company_name].total_time += time_slot;
          acc[company_name].total_interactions += interactions;
          
          return acc;
        }, {});
        
        setCompanyData(Object.values(companyStats));

        // Generate mock interaction data for the selected company
        generateInteractionData(selectedCompany, processedMediaData);
        
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error loading dashboard",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Update interaction data when a different company is selected
  useEffect(() => {
    generateInteractionData(selectedCompany, mediaData);
  }, [selectedCompany, mediaData]);

  // Generate 24 hours of interaction data for a company
  const generateInteractionData = (companyName: string, mediaItems: MediaData[]) => {
    const now = new Date();
    const hourlyData: InteractionDataPoint[] = [];
    
    // Generate data for the past 24 hours
    for (let i = 23; i >= 0; i--) {
      const timePoint = new Date(now);
      timePoint.setHours(now.getHours() - i);
      
      let interactions = 0;
      
      // If "all" is selected, sum interactions from all companies
      // Otherwise, filter by the selected company
      if (companyName === "all") {
        // Distribute total interactions across the time periods with some randomness
        const totalInteractions = mediaItems.reduce((sum, item) => sum + item.interactions, 0);
        interactions = Math.round((totalInteractions / 24) * (0.5 + Math.random()));
      } else {
        // Filter interactions by company and add randomness
        const companyMedia = mediaItems.filter(item => item.company_name === companyName);
        const companyTotalInteractions = companyMedia.reduce((sum, item) => sum + item.interactions, 0);
        interactions = Math.round((companyTotalInteractions / 24) * (0.5 + Math.random()));
      }
      
      hourlyData.push({
        time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactions: interactions
      });
    }
    
    setInteractionData(hourlyData);
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
  };

  return (
    <Layout title="Company Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Company Media Analytics</h1>
          <div className="w-[200px]">
            <Select value={selectedCompany} onValueChange={handleCompanyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companyData.map(company => (
                  <SelectItem key={company.company_name} value={company.company_name}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Media</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-bold">
              {selectedCompany === "all" 
                ? mediaData.length 
                : companyData.find(c => c.company_name === selectedCompany)?.total_media || 0}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Time Slots (mins)</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-bold">
              {selectedCompany === "all"
                ? companyData.reduce((sum, company) => sum + company.total_time, 0)
                : companyData.find(c => c.company_name === selectedCompany)?.total_time || 0}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Interactions</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-bold">
              {selectedCompany === "all"
                ? companyData.reduce((sum, company) => sum + company.total_interactions, 0)
                : companyData.find(c => c.company_name === selectedCompany)?.total_interactions || 0}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>24-Hour Interaction Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer className="h-full" config={{
                interactions: {
                  theme: {
                    light: "#3b82f6",
                    dark: "#60a5fa"
                  }
                }
              }}>
                <LineChart data={interactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent
                            className="max-w-xs"
                            payload={payload}
                            label={payload[0].payload.time}
                          />
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    content={() => (
                      <ChartLegendContent
                        className="mt-3"
                        payload={[
                          {
                            value: "Interactions",
                            color: "#3b82f6",
                            dataKey: "interactions"
                          }
                        ]}
                      />
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="interactions"
                    stroke="var(--color-interactions)"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2, r: 4 }}
                    animationDuration={800}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Time Slot (mins)</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Interactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mediaData
                  .filter(item => selectedCompany === "all" || item.company_name === selectedCompany)
                  .map((media) => (
                    <TableRow key={media.id}>
                      <TableCell className="font-medium">{media.name}</TableCell>
                      <TableCell>{media.type.split('/')[0]}</TableCell>
                      <TableCell>{media.company_name}</TableCell>
                      <TableCell>{media.time_slot}</TableCell>
                      <TableCell>{media.created_at}</TableCell>
                      <TableCell>{media.interactions}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
