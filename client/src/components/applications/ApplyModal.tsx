import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FileText, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { applyToJob } from "@/api/applications";
import { formatBytes } from "@/utils/format";
import { Job } from "@/types";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

interface ApplyModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

export function ApplyModal({ job, open, onClose }: ApplyModalProps) {
  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => applyToJob(job._id, coverNote, file as File),
    onSuccess: () => {
      toast.success("Application submitted!");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["job", job._id] });
      handleClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleClose() {
    setCoverNote("");
    setFile(null);
    setFileError(null);
    onClose();
  }

  function handleFileChange(selected: File | null) {
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError("Please upload a PDF or Word document");
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setFileError("File must be under 5 MB");
      return;
    }
    setFile(selected);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileError("A resume file is required");
      return;
    }
    mutation.mutate();
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Apply to ${job.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">at {job.companyName}</p>

        <Textarea
          label="Cover note (optional)"
          placeholder="Tell the hiring team why you're a great fit..."
          rows={4}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Resume</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-left text-sm text-slate-500 hover:border-brand-400 hover:bg-brand-50/50 focus-ring dark:border-slate-700 dark:text-slate-400 dark:hover:bg-brand-500/5"
          >
            {file ? (
              <>
                <FileText className="h-5 w-5 flex-shrink-0 text-brand-600" />
                <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{file.name}</span>
                <span className="flex-shrink-0 text-xs text-slate-400">{formatBytes(file.size)}</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 flex-shrink-0" />
                <span>Click to upload PDF or Word doc (max 5 MB)</span>
              </>
            )}
          </button>
          {fileError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fileError}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Submit application
          </Button>
        </div>
      </form>
    </Modal>
  );
}
