import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, CheckCircle2, XCircle, Clock, Search } from "lucide-react";

export default function ParalegalQueue() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch applications pending paralegal review
  const { data: applications, isLoading, refetch } = trpc.applications.list.useQuery(undefined);

  // Approve application mutation
  const approveMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      console.log("Application approved");
      setApprovalNotes("");
      setSelectedApp(null);
      refetch();
    },
    onError: (error: any) => {
      console.error("Approval error:", error);
    },
  });

  // Reject application mutation
  const rejectMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      console.log("Application rejected");
      setRejectionNotes("");
      setSelectedApp(null);
      refetch();
    },
    onError: (error: any) => {
      console.error("Rejection error:", error);
    },
  });

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

  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsApproving(true);
    try {
      await approveMutation.mutateAsync({
        applicationId: selectedApp.id,
        status: "submission",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setIsRejecting(true);
    try {
      await rejectMutation.mutateAsync({
        applicationId: selectedApp.id,
        status: "rejected",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paralegal Review Queue</h1>
        <p className="text-muted-foreground">Review and approve applications pending paralegal review</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
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
            <SelectItem value="review">Under Review</SelectItem>
            <SelectItem value="submission">Ready for Submission</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications?.filter((a: any) => a.status === "review").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications?.filter((a: any) => a.status === "submission").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications?.filter((a: any) => a.status === "rejected").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading applications...</p>
            </CardContent>
          </Card>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app: any) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {app.applicant?.firstName} {app.applicant?.lastName}
                      </h3>
                      <Badge variant={app.status === "review" ? "default" : "secondary"}>
                        {app.status === "review" && <Clock className="w-3 h-3 mr-1" />}
                        {app.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium">Application ID</p>
                        <p>#{app.id}</p>
                      </div>
                      <div>
                        <p className="font-medium">Submitted</p>
                        <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Tier</p>
                        <p className="capitalize">{app.tier}</p>
                      </div>
                      <div>
                        <p className="font-medium">Eligibility</p>
                        <p className="capitalize">{app.eligibilityStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          Review
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </DialogTrigger>
                      {selectedApp?.id === app.id && (
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Application</DialogTitle>
                            <DialogDescription>
                              {selectedApp.applicant?.firstName} {selectedApp.applicant?.lastName} (#{selectedApp.id})
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Application Details */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Application Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Tier</p>
                                    <p className="font-medium capitalize">{selectedApp.tier}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{selectedApp.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Eligibility</p>
                                    <p className="font-medium capitalize">{selectedApp.eligibilityStatus}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Documents Approved</p>
                                    <p className="font-medium">{selectedApp.documentsApproved ? "Yes" : "No"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Decision</h4>

                                {/* Approve Section */}
                                <div className="mb-4">
                                  <label className="text-sm font-medium mb-2 block">Approval Notes (Optional)</label>
                                  <Textarea
                                    placeholder="Add any notes about this approval..."
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    className="mb-2"
                                  />
                                  <Button
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {isApproving ? "Approving..." : "Approve Application"}
                                  </Button>
                                </div>

                                {/* Reject Section */}
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Rejection Reason (Required)</label>
                                  <Textarea
                                    placeholder="Explain why this application is being rejected..."
                                    value={rejectionNotes}
                                    onChange={(e) => setRejectionNotes(e.target.value)}
                                    className="mb-2"
                                  />
                                  <Button
                                    onClick={handleReject}
                                    disabled={isRejecting || !rejectionNotes.trim()}
                                    variant="destructive"
                                    className="w-full"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {isRejecting ? "Rejecting..." : "Reject Application"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
