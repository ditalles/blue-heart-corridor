"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Ban } from "lucide-react";

interface AdminHostelActionsProps {
  hostelId: string;
  currentStatus: string;
}

export function AdminHostelActions({ hostelId, currentStatus }: AdminHostelActionsProps) {
  const supabase = createClient();
  const router = useRouter();

  const updateStatus = async (status: string) => {
    const { error } = await supabase
      .from("hostels")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", hostelId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Hostel ${status === "active" ? "approved" : status}`);
      router.refresh();
    }
  };

  return (
    <div className="flex gap-2">
      {currentStatus === "pending_review" && (
        <>
          <Button size="sm" onClick={() => updateStatus("active")}>
            <CheckCircle className="h-3 w-3 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => updateStatus("suspended")}>
            <XCircle className="h-3 w-3 mr-1" /> Reject
          </Button>
        </>
      )}
      {currentStatus === "active" && (
        <Button size="sm" variant="destructive" onClick={() => updateStatus("suspended")}>
          <Ban className="h-3 w-3 mr-1" /> Suspend
        </Button>
      )}
      {currentStatus === "suspended" && (
        <Button size="sm" onClick={() => updateStatus("active")}>
          <CheckCircle className="h-3 w-3 mr-1" /> Reactivate
        </Button>
      )}
    </div>
  );
}
