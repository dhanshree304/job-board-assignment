import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createJob, getJob, updateJob } from "@/api/jobs";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { JOB_TYPES, WORK_MODES } from "@/types";
import { JOB_TYPE_LABELS, WORK_MODE_LABELS } from "@/utils/format";

const schema = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(150),
    companyName: z.string().trim().min(1, "Company name is required").max(150),
    location: z.string().trim().min(1, "Location is required").max(100),
    type: z.enum(["full-time", "part-time", "contract", "internship"]),
    workMode: z.enum(["remote", "hybrid", "onsite"]),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    description: z.string().trim().min(20, "Description must be at least 20 characters").max(10000),
    requirements: z.string().optional(),
    tags: z.string().optional(),
  })
  .refine((v) => !v.salaryMin || !v.salaryMax || Number(v.salaryMin) <= Number(v.salaryMax), {
    message: "Minimum salary must be less than or equal to maximum salary",
    path: ["salaryMax"],
  });

type FormValues = z.infer<typeof schema>;

export default function JobForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: existingJob, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id as string),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: user?.company?.name ?? "",
      type: "full-time",
      workMode: "remote",
    },
  });

  useEffect(() => {
    if (existingJob) {
      reset({
        title: existingJob.title,
        companyName: existingJob.companyName,
        location: existingJob.location,
        type: existingJob.type,
        workMode: existingJob.workMode,
        salaryMin: existingJob.salaryMin?.toString() ?? "",
        salaryMax: existingJob.salaryMax?.toString() ?? "",
        description: existingJob.description,
        requirements: existingJob.requirements.join("\n"),
        tags: existingJob.tags.join(", "),
      });
    }
  }, [existingJob, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        title: values.title,
        companyName: values.companyName,
        location: values.location,
        type: values.type,
        workMode: values.workMode,
        salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
        salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
        description: values.description,
        requirements: (values.requirements ?? "")
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        tags: (values.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      return isEdit ? updateJob(id as string, payload) : createJob(payload);
    },
    onSuccess: (job) => {
      toast.success(isEdit ? "Job posting updated" : "Job posted");
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate(`/jobs/${job._id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isEdit && isLoadingJob) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isEdit ? "Edit job posting" : "Post a new job"}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {isEdit ? "Update the details below." : "Fill in the details to publish your listing."}
      </p>

      <Card className="mt-8 p-6">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <Input label="Job title" placeholder="e.g. Senior Backend Engineer" error={errors.title?.message} {...register("title")} />
          <Input label="Company name" error={errors.companyName?.message} {...register("companyName")} />
          <Input label="Location" placeholder="e.g. Remote, or San Francisco, CA" error={errors.location?.message} {...register("location")} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Job type" error={errors.type?.message} {...register("type")}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
            <Select label="Work mode" error={errors.workMode?.message} {...register("workMode")}>
              {WORK_MODES.map((w) => (
                <option key={w} value={w}>
                  {WORK_MODE_LABELS[w]}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Min salary (optional)" type="number" min={0} {...register("salaryMin")} />
            <Input label="Max salary (optional)" type="number" min={0} error={errors.salaryMax?.message} {...register("salaryMax")} />
          </div>

          <Textarea
            label="Description"
            rows={6}
            placeholder="Describe the role, responsibilities, and what makes it a great opportunity..."
            error={errors.description?.message}
            {...register("description")}
          />

          <Textarea
            label="Requirements (optional)"
            rows={4}
            placeholder="One requirement per line"
            hint="One per line"
            {...register("requirements")}
          />

          <Input label="Tags (optional)" placeholder="react, typescript, remote" hint="Comma-separated" {...register("tags")} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {isEdit ? "Save changes" : "Publish job"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
