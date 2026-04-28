import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format, isToday, isPast, startOfDay } from "date-fns";
import { ChevronRight, Filter, Inbox, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/portal/page-header";
import { PortalLayout } from "@/components/portal/portal-layout";
import { StatCard } from "@/components/portal/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ADMISSION_STATUSES,
  GRADE_OPTIONS,
  PIPELINE_STEPS,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
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
  assignedTo: string | null;
  source: string | null;
  followUpDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type CreateLeadForm = {
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  source: string;
  message: string;
};

const initialCreateForm: CreateLeadForm = {
  studentName: "",
  parentName: "",
  email: "",
  phone: "",
  grade: "",
  source: "website",
  message: "",
};

export default function AdmissionsPage() {
  const { isAuthenticated, isLoading: authLoading, can } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<AdmissionStatus | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLeadForm>(initialCreateForm);

  const leadsQuery = useQuery<LeadRow[]>({
    queryKey: ["/api/admissions/leads"],
    enabled: isAuthenticated && can("admissions.view"),
  });

  const createLeadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admissions/leads", {
        studentName: createForm.studentName.trim(),
        parentName: createForm.parentName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        grade: createForm.grade,
        message: createForm.message.trim() || null,
        source: createForm.source,
        status: "new_enquiry",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admissions/leads"] });
      setCreateForm(initialCreateForm);
      setSheetOpen(false);
      toast({ title: "Lead created", description: "New admission lead added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create lead", description: error.message, variant: "destructive" });
    },
  });

  const leads = leadsQuery.data ?? [];
  const midnight = startOfDay(new Date());
  const maxPipelineCount = Math.max(
    1,
    ...PIPELINE_STEPS.map((step) => leads.filter((lead) => lead.status === step).length)
  );

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(ADMISSION_STATUSES.map((status) => [status, 0])) as Record<
      AdmissionStatus,
      number
    >;
    for (const lead of leads) {
      if (lead.status in byStatus) {
        byStatus[lead.status as AdmissionStatus] += 1;
      }
    }
    return byStatus;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads
      .filter((lead) => (activeStatus === "all" ? true : lead.status === activeStatus))
      .filter((lead) => {
        if (!q) return true;
        return (
          lead.studentName.toLowerCase().includes(q) ||
          lead.parentName.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.grade.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return t2 - t1;
      });
  }, [activeStatus, leads, search]);

  const stats = useMemo(() => {
    const total = leads.length;
    const newToday = leads.filter((lead) => {
      if (!lead.createdAt) return false;
      return new Date(lead.createdAt) >= midnight;
    }).length;
    const visitsBooked = leads.filter(
      (lead) => lead.status === "visit_scheduled" || lead.status === "visit_done"
    ).length;
    const admitted = leads.filter((lead) => lead.status === "admitted").length;
    return { total, newToday, visitsBooked, admitted };
  }, [leads, midnight]);

  if (authLoading) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-background" />
      </PortalLayout>
    );
  }

  if (!can("admissions.view")) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-2xl">Access Denied</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                You do not have permission to access Admissions CRM.
              </CardContent>
            </Card>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const submitDisabled =
    createLeadMutation.isPending ||
    !createForm.studentName.trim() ||
    !createForm.parentName.trim() ||
    !createForm.email.trim() ||
    !createForm.phone.trim() ||
    !createForm.grade;

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background font-sans">
        <PageHeader
        title="Admissions CRM"
        subtitle="Manage enquiries, follow-ups, and admissions pipeline in one place."
        actions={
          can("admissions.manage") ? (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className="rounded-none" data-testid="button-new-lead">
                  <Plus className="h-4 w-4" />
                  New Lead
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xl border-border">
                <SheetHeader>
                  <SheetTitle className="font-serif font-normal text-2xl">Create New Lead</SheetTitle>
                  <SheetDescription>
                    Add an enquiry manually to the Admissions CRM pipeline.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Student Name *</label>
                    <Input
                      className="rounded-none"
                      value={createForm.studentName}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, studentName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Parent Name *</label>
                    <Input
                      className="rounded-none"
                      value={createForm.parentName}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, parentName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Email *</label>
                    <Input
                      type="email"
                      className="rounded-none"
                      value={createForm.email}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Phone *</label>
                    <Input
                      className="rounded-none"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Grade *</label>
                    <Select
                      value={createForm.grade}
                      onValueChange={(value) => setCreateForm((prev) => ({ ...prev, grade: value }))}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Source</label>
                    <Select
                      value={createForm.source}
                      onValueChange={(value) => setCreateForm((prev) => ({ ...prev, source: value }))}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Notes</label>
                    <Textarea
                      className="rounded-none min-h-24"
                      value={createForm.message}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  <Button
                    className="w-full rounded-none"
                    onClick={() => createLeadMutation.mutate()}
                    disabled={submitDisabled}
                  >
                    {createLeadMutation.isPending ? "Creating Lead..." : "Create Lead"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : undefined
        }
      />

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={stats.total} icon={Inbox} accent="primary" />
          <StatCard label="New Today" value={stats.newToday} icon={Plus} accent="gold" />
          <StatCard label="Visits Booked" value={stats.visitsBooked} icon={Filter} accent="success" />
          <StatCard label="Admitted" value={stats.admitted} icon={ChevronRight} accent="success" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4 min-w-0">
            <div className="bg-card border border-border p-3 shadow-sm">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9 rounded-none"
                  placeholder="Search by student, parent, phone, email, or grade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                className={`shrink-0 border px-3 py-2 text-sm transition-colors ${
                  activeStatus === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
                onClick={() => setActiveStatus("all")}
              >
                All <span className="ml-1 text-xs opacity-80">({leads.length})</span>
              </button>
              {ADMISSION_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`shrink-0 border px-3 py-2 text-sm transition-colors ${
                    activeStatus === status
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                  onClick={() => setActiveStatus(status)}
                >
                  {STATUS_LABELS[status]}{" "}
                  <span className="ml-1 text-xs opacity-80">({counts[status] ?? 0})</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {leadsQuery.isLoading ? (
                <>
                  <Skeleton className="h-24 rounded-none" />
                  <Skeleton className="h-24 rounded-none" />
                  <Skeleton className="h-24 rounded-none" />
                </>
              ) : filteredLeads.length === 0 ? (
                <Card className="rounded-none">
                  <CardContent className="py-12 text-center">
                    <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium">No leads found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try changing the search text or status filter.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredLeads.map((lead) => {
                  const followUpDate = lead.followUpDate ? new Date(lead.followUpDate) : null;
                  let followUpClass = "text-muted-foreground";
                  if (followUpDate && isPast(followUpDate) && !isToday(followUpDate)) {
                    followUpClass = "text-destructive";
                  } else if (followUpDate && isToday(followUpDate)) {
                    followUpClass = "text-gold-dark";
                  }

                  return (
                    <button
                      key={lead.id}
                      type="button"
                      className="w-full text-left bg-card border border-border p-4 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setLocation(`/portal/admissions/${lead.id}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{lead.studentName}</p>
                            <Badge
                              variant="outline"
                              className={`rounded-none border ${STATUS_COLORS[
                                (lead.status as AdmissionStatus) ?? "new_enquiry"
                              ]}`}
                            >
                              {STATUS_LABELS[(lead.status as AdmissionStatus) ?? "new_enquiry"] ??
                                lead.status}
                            </Badge>
                            <Badge variant="secondary" className="rounded-none">
                              {lead.grade}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Parent: {lead.parentName}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-primary hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {lead.phone}
                            </a>
                            <span className="text-muted-foreground">
                              {SOURCE_LABELS[lead.source ?? "website"] ?? lead.source ?? "Website"}
                            </span>
                            {followUpDate ? (
                              <span className={followUpClass}>
                                Follow-up: {format(followUpDate, "dd MMM yyyy")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div className="text-xs text-muted-foreground">
                            {lead.createdAt
                              ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
                              : "Just now"}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <aside className="w-full lg:w-72 shrink-0">
            <Card className="rounded-none sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif font-normal">Pipeline Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PIPELINE_STEPS.map((step) => {
                  const count = counts[step] ?? 0;
                  const width = `${(count / maxPipelineCount) * 100}%`;
                  const isAdmitted = step === "admitted";
                  return (
                    <button
                      key={step}
                      type="button"
                      className="w-full text-left"
                      onClick={() => setActiveStatus(step)}
                    >
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{STATUS_LABELS[step]}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 bg-secondary">
                        <div
                          className={`h-full ${isAdmitted ? "bg-emerald-500" : "bg-primary"}`}
                          style={{ width }}
                        />
                      </div>
                    </button>
                  );
                })}
                <div className="border-t border-border pt-3 flex items-center justify-between text-sm">
                  <span className="text-destructive">Not Interested</span>
                  <span className="text-destructive">{counts.not_interested ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
        </div>
      </div>
    </PortalLayout>
  );
}
