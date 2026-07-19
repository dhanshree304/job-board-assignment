import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateProfile } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const isEmployer = user?.role === "employer";

  const [name, setName] = useState(user?.name ?? "");
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [skills, setSkills] = useState((user?.skills ?? []).join(", "));
  const [companyName, setCompanyName] = useState(user?.company?.name ?? "");
  const [companyWebsite, setCompanyWebsite] = useState(user?.company?.website ?? "");
  const [companyAbout, setCompanyAbout] = useState(user?.company?.about ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      updateProfile(
        isEmployer
          ? { name, company: { name: companyName, website: companyWebsite, about: companyAbout } }
          : {
              name,
              headline,
              location,
              skills: skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
      ),
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success("Profile updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your profile</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {isEmployer ? "Manage your company details shown to applicants." : "Keep your profile up to date to help employers get to know you."}
      </p>

      <Card className="mt-8 space-y-4 p-6">
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={user.email} disabled hint="Email cannot be changed" />

        {isEmployer ? (
          <>
            <Input label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Input label="Company website" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://" />
            <Textarea label="About the company" rows={4} value={companyAbout} onChange={(e) => setCompanyAbout(e.target.value)} />
          </>
        ) : (
          <>
            <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Full-stack developer" />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote" />
            <Input
              label="Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, TypeScript"
              hint="Comma-separated"
            />
          </>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
