import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Briefcase, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Briefcase className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Log in to continue to JobBoard
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => login(values))}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" isLoading={isLoggingIn}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-brand-600 hover:underline"
        >
          Sign up
        </Link>
      </p>

      <div className="mt-6 rounded-xl bg-slate-100 p-4 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <p className="mb-1 font-medium text-slate-600 dark:text-slate-300">
          Demo accounts (after running the seed script)
        </p>
        <p>Employer: employer@demo.io / password@123</p>
        <p>Job seeker: jobseeker@demo.io / password@123</p>
      </div>
    </div>
  );
}
