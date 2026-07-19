import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { mySavedJobs } from "@/api/applications";
import { toggleSaveJob } from "@/api/jobs";
import { useAuthStore } from "@/store/authStore";
import { Job } from "@/types";

export function useSavedJobs() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const enabled = user?.role === "jobseeker";

  const {
    data: savedJobs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: mySavedJobs,
    enabled,
  });

  const savedJobIds = new Set(savedJobs.map((s) => s.job._id));

  const toggleMutation = useMutation({
    mutationFn: (job: Job) => toggleSaveJob(job._id),
    onSuccess: (saved) => {
      toast.success(saved ? "Job saved" : "Removed from saved jobs");
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    savedJobs,
    savedJobIds,
    isLoading,
    isError,
    refetch,
    isEnabled: enabled,
    toggleSave: toggleMutation.mutate,
  };
}
