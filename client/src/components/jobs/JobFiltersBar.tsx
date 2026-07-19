import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { JobFilters, JOB_TYPES, WORK_MODES } from "@/types";
import { JOB_TYPE_LABELS, WORK_MODE_LABELS } from "@/utils/format";

interface JobFiltersBarProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
}

export function JobFiltersBar({ filters, onChange }: JobFiltersBarProps) {
  const hasActiveFilters = filters.location || filters.type || filters.workMode || filters.salaryMin;

  function update(patch: Partial<JobFilters>) {
    onChange({ ...filters, ...patch, page: 1 });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search job title, company, or keyword"
            value={filters.q ?? ""}
            onChange={(e) => update({ q: e.target.value })}
            aria-label="Search jobs"
          />
        </div>
        <div className="sm:w-56">
          <Input
            icon={<MapPin className="h-4 w-4" />}
            placeholder="Location"
            value={filters.location ?? ""}
            onChange={(e) => update({ location: e.target.value })}
            aria-label="Filter by location"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        <Select
          className="w-auto"
          value={filters.type ?? ""}
          onChange={(e) => update({ type: (e.target.value || undefined) as JobFilters["type"] })}
          aria-label="Filter by job type"
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {JOB_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select
          className="w-auto"
          value={filters.workMode ?? ""}
          onChange={(e) => update({ workMode: (e.target.value || undefined) as JobFilters["workMode"] })}
          aria-label="Filter by work mode"
        >
          <option value="">All work modes</option>
          {WORK_MODES.map((w) => (
            <option key={w} value={w}>
              {WORK_MODE_LABELS[w]}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          min={0}
          className="w-36"
          placeholder="Min salary"
          value={filters.salaryMin ?? ""}
          onChange={(e) => update({ salaryMin: e.target.value ? Number(e.target.value) : undefined })}
          aria-label="Minimum salary"
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ q: filters.q, page: 1, limit: filters.limit })}
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
