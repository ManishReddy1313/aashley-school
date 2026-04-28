import { useMemo, useState } from "react";
import { useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronRight, Circle } from "lucide-react";
import { PageHeader } from "@/components/portal/page-header";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  PIPELINE_STEPS,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_NEXT_STEPS,
  type AdmissionStatus,
} from "@/lib/admissions-utils";

type LeadRow = {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  message: string | null;
  status: string;
  source: string | null;
  createdAt: string | null;
};

type LeadComment = {
  id: string;
  leadId: string;
  userId: string;
  comment: string;
  createdAt: string | null;
};

type LeadStatusHistory = {
  id: string;
  leadId: string;
  changedByUserId: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string | null;
};

type LeadDetailResponse = {
  lead: LeadRow;
  comments: LeadComment[];
  history: LeadStatusHistory[];
};

type TimelineItem =
  | { kind: "comment"; id: string; createdAt: string | null; text: string }
  | {
      kind: "history";
      id: string;
      createdAt: string | null;
      fromStatus: string | null;
      toStatus: string;
    };

export default function LeadDetailPage() {
  const [, params] = useRoute("/portal/admissions/:id");
  const leadId = params?.id;
  const { can, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const leadQuery = useQuery<LeadDetailResponse>({
    queryKey: ["/api/admissions/leads", leadId],
    queryFn: async () => {
      const res = await fetch(`/api/admissions/leads/${leadId}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: Boolean(leadId) && isAuthenticated && can("admissions.view"),
  });

  const statusMutation = useMutation({
    mutationFn: async (status: AdmissionStatus) => {
      const res = await apiRequest("PATCH", `/api/admissions/leads/${leadId}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admissions/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admissions/leads", leadId] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admissions/leads/${leadId}/comments`, {
        comment: note.trim(),
      });
      return res.json();
    },
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["/api/admissions/leads", leadId] });
      toast({ title: "Note added", description: "Activity timeline updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add note", description: error.message, variant: "destructive" });
    },
  });

  const timeline = useMemo(() => {
    const comments = (leadQuery.data?.comments ?? []).map<TimelineItem>((item) => ({
      kind: "comment",
      id: item.id,
      createdAt: item.createdAt,
      text: item.comment,
    }));
    const history = (leadQuery.data?.history ?? []).map<TimelineItem>((item) => ({
      kind: "history",
      id: item.id,
      createdAt: item.createdAt,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
    }));
    return [...comments, ...history].sort((a, b) => {
      const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return t2 - t1;
    });
  }, [leadQuery.data?.comments, leadQuery.data?.history]);

  if (!can("admissions.view")) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-background p-6">
          <Card className="max-w-7xl mx-auto rounded-none">
            <CardHeader>
              <CardTitle className="font-serif font-normal text-2xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              You do not have permission to access lead details.
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  if (leadQuery.isLoading || !leadQuery.data) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-24 rounded-none" />
            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
              <div className="space-y-4">
                <Skeleton className="h-56 rounded-none" />
                <Skeleton className="h-56 rounded-none" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-40 rounded-none" />
                <Skeleton className="h-64 rounded-none" />
              </div>
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const lead = leadQuery.data.lead;
  const currentStatus = (lead.status as AdmissionStatus) ?? "new_enquiry";
  const currentIndex = PIPELINE_STEPS.indexOf(currentStatus);
  const nextSteps = STATUS_NEXT_STEPS[currentStatus] ?? [];

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background font-sans">
        <PageHeader
        title={lead.studentName}
        subtitle={`Parent: ${lead.parentName} · Grade ${lead.grade}`}
        backHref="/portal/admissions"
        actions={
          <Badge variant="outline" className={`rounded-none border ${STATUS_COLORS[currentStatus]}`}>
            {STATUS_LABELS[currentStatus]}
          </Badge>
        }
      />

        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <div className="space-y-4">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-serif font-normal">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Phone</p>
                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                  {lead.phone}
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline break-all">
                  {lead.email}
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Grade</p>
                <p className="text-foreground">{lead.grade}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Source</p>
                <p className="text-foreground">{SOURCE_LABELS[lead.source ?? "website"] ?? "Website"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Added</p>
                <p className="text-foreground">
                  {lead.createdAt
                    ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
                    : "Recently"}
                </p>
              </div>
              {lead.message ? (
                <>
                  <div className="border-t border-border pt-3">
                    <p className="text-muted-foreground mb-1">Initial Message</p>
                    <p className="text-foreground whitespace-pre-wrap">{lead.message}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-serif font-normal">Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {PIPELINE_STEPS.map((step, index) => {
                  const isDone = currentIndex > index;
                  const isCurrent = currentStatus === step;
                  return (
                    <li key={step} className="flex items-start gap-3">
                      <div
                        className={`h-7 w-7 shrink-0 border grid place-items-center text-xs font-semibold ${
                          isDone
                            ? "bg-primary text-primary-foreground border-primary"
                            : isCurrent
                              ? "bg-gold/10 text-gold-dark border-gold/30"
                              : "bg-background text-muted-foreground border-border"
                        }`}
                      >
                        {isDone ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className={isDone || isCurrent ? "text-foreground" : "text-muted-foreground"}>
                        {STATUS_LABELS[step]}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {can("admissions.manage") && nextSteps.length > 0 ? (
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-serif font-normal">Move To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {nextSteps.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={status === "not_interested" ? "outline" : "default"}
                    className="w-full rounded-none justify-between"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate(status)}
                  >
                    {STATUS_LABELS[status]}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          {can("admissions.comment") ? (
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-serif font-normal">Add Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  className="rounded-none min-h-28"
                  placeholder="Log a call, add a note, record next steps..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <Button
                  className="rounded-none"
                  disabled={!note.trim() || commentMutation.isPending}
                  onClick={() => commentMutation.mutate()}
                >
                  {commentMutation.isPending ? "Posting..." : "Post Note"}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-serif font-normal">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet. Add a note above to start tracking.
                </p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={`${item.kind}-${item.id}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-5 w-5 grid place-items-center">
                          {item.kind === "history" ? (
                            <Circle className="h-3 w-3 fill-primary text-primary" />
                          ) : (
                            <Circle className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        {index !== timeline.length - 1 ? (
                          <div className="w-px flex-1 bg-border min-h-6" />
                        ) : null}
                      </div>
                      <div className="pb-3">
                        {item.kind === "history" ? (
                          <p className="text-sm text-muted-foreground">
                            Status changed from{" "}
                            {item.fromStatus ? STATUS_LABELS[item.fromStatus as AdmissionStatus] : "Unknown"} to{" "}
                            {STATUS_LABELS[item.toStatus as AdmissionStatus] ?? item.toStatus}
                          </p>
                        ) : (
                          <p className="text-sm text-foreground whitespace-pre-wrap">{item.text}</p>
                        )}
                        <p className="text-xs text-muted-foreground/80 mt-1">
                          {item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </PortalLayout>
  );
}
