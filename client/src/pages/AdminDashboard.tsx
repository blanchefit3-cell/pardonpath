import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Search, TrendingUp, Users, CheckCircle2, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  intake: "#3B82F6",
  review: "#F59E0B",
  submission: "#10B981",
  rejected: "#EF4444",
  approved: "#8B5CF6",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Verify admin access
  const isAdmin = user?.email?.includes("@pardonpath.ca");

  // Fetch all applications
  const { data: applications, isLoading } = trpc.applications.list.useQuery(undefined);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!applications) return null;

    const total = applications.length;
    const byStatus = applications.reduce(
      (acc, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byTier = applications.reduce(
      (acc, app: any) => {
        acc[app.tier] = (acc[app.tier] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const approved = applications.filter((a: any) => a.status === "approved").length;
    const rejected = applications.filter((a: any) => a.status === "rejected").length;
    const pending = total - approved - rejected;

    return {
      total,
      approved,
      rejected,
      pending,
      byStatus,
      byTier,
    };
  }, [applications]);

  // Filter and search applications
  const filteredApplications = useMemo(() => {
    if (!applications) return [];

    return applications.filter((app: any) => {
      const matchesSearch =
        app.applicant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toString().includes(searchTerm);

      if (filterStatus === "all") return matchesSearch;
      return matchesSearch && app.status === filterStatus;
    });
  }, [applications, searchTerm, filterStatus]);



  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage applications and view platform analytics</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.total > 0 ? Math.round((analytics.approved / analytics.total) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{analytics.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.rejected}</div>
              <p className="text-xs text-muted-foreground mt-1">Not approved</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Applications by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.byStatus).map(([status, count]) => ({ status, count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Applications by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.byTier).map(([tier, count]) => ({ name: tier, value: count }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.byTier).map(([tier], index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(STATUS_COLORS)[index % Object.values(STATUS_COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Search and filter all applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intake">Intake</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="submission">Ready for Submission</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading applications...</p>
          ) : filteredApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No applications found</p>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {app.applicant?.firstName} {app.applicant?.lastName}
                      </h3>
                      <Badge variant={app.status === "approved" ? "default" : "secondary"}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium">App ID</p>
                        <p>#{app.id}</p>
                      </div>
                      <div>
                        <p className="font-medium">Tier</p>
                        <p className="capitalize">{app.tier}</p>
                      </div>
                      <div>
                        <p className="font-medium">Submitted</p>
                        <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Eligibility</p>
                        <p className="capitalize">{app.eligibilityStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Modal */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                {selectedApp.applicant?.firstName} {selectedApp.applicant?.lastName} (#{selectedApp.id})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Applicant Info */}
              <div>
                <h4 className="font-semibold mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedApp.applicant?.firstName} {selectedApp.applicant?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApp.applicant?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedApp.applicant?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Province</p>
                    <p className="font-medium">{selectedApp.applicant?.province || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h4 className="font-semibold mb-3">Application Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className="mt-1">{selectedApp.status}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tier</p>
                    <p className="font-medium capitalize">{selectedApp.tier}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Eligibility</p>
                    <Badge variant="outline" className="mt-1">
                      {selectedApp.eligibilityStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Documents Approved</p>
                    <p className="font-medium">{selectedApp.documentsApproved ? "✓ Yes" : "✗ No"}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="font-semibold mb-3">Timeline</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(selectedApp.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
