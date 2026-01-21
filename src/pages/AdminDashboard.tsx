import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, MessageSquare, MoreHorizontal, Trash2, CheckCircle, Clock, XCircle, LogOut, Camera } from "lucide-react";
import { useAuth, useIsAdmin, useSignOut } from "@/hooks/useAuth";
import { useAdminFeedback, useUpdateFeedbackStatus, useDeleteFeedback } from "@/hooks/useFeedback";
import { LeaderPhotoManager } from "@/components/admin/LeaderPhotoManager";
import { toast } from "sonner";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  reviewed: { label: "Reviewed", icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const signOut = useSignOut();
  const { data: feedback, isLoading: feedbackLoading, error: feedbackError } = useAdminFeedback();
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFeedback = useDeleteFeedback();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [authLoading, user, navigate]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Feedback marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      await deleteFeedback.mutateAsync(id);
      toast.success("Feedback deleted");
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      navigate("/admin/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-12 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact an administrator to request access.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Logged in as: {user.email}</p>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Manage citizen feedback and moderate content
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="feedback" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Leader Photos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback">
            {/* Feedback Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Citizen Feedback
                </CardTitle>
                <CardDescription>
                  Review and moderate feedback submissions from citizens
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : feedbackError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Failed to load feedback. Make sure you have admin access.</p>
                  </div>
                ) : feedback && feedback.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Submitter</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.map((item) => {
                          const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.pending;
                          const StatusIcon = status.icon;
                          
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(item.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {item.subject}
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                <p className="truncate">{item.message}</p>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {item.name && <p>{item.name}</p>}
                                  {item.email && (
                                    <p className="text-muted-foreground text-xs">{item.email}</p>
                                  )}
                                  {!item.name && !item.email && (
                                    <span className="text-muted-foreground italic">Anonymous</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={status.className} variant="secondary">
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(item.id, "reviewed")}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      Mark Reviewed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(item.id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                      Mark Rejected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(item.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No feedback submissions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <LeaderPhotoManager />
          </TabsContent>
        </Tabs>

        {/* Legal Disclaimer */}
        <div className="text-center py-8 border-t">
          <h3 className="text-sm font-semibold text-foreground mb-2">Admin Notice</h3>
          <div className="text-sm text-muted-foreground max-w-2xl mx-auto space-y-1">
            <p>All feedback data is confidential and for administrative use only.</p>
            <p>Do not share citizen email addresses or personal information externally.</p>
            <p>Review content for hate speech, abuse, or false claims before publishing.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
