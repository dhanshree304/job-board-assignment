import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Briefcase, Lock, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import { UserRole } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const [role, setRole] = useState<UserRole>("jobseeker");
  const { register: doRegister, isRegistering } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    doRegister({
      name: values.name,
      email: values.email,
      password: values.password,
      role,
      company: role === "employer" && values.companyName ? { name: values.companyName } : undefined,
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Briefcase className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join JobBoard to get started</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(["jobseeker", "employer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-lg py-2 text-sm font-medium transition-colors",
              role === r
                ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            {r === "jobseeker" ? "Job seeker" : "Employer"}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <Input label="Full name" icon={<User className="h-4 w-4" />} placeholder="Jordan Lee" error={errors.name?.message} {...register("name")} />
        <Input
          label="Email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        {role === "employer" && (
          <Input label="Company name (optional)" placeholder="Acme Corp" {...register("companyName")} />
        )}
        <Button type="submit" className="w-full" isLoading={isRegistering}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
