import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { loginRequest, LoginPayload, registerRequest, RegisterPayload } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { token, user, setSession, logout } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: ({ token, user }) => {
      setSession(token, user);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(user.role === "employer" ? "/employer" : "/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => registerRequest(payload),
    onSuccess: ({ token, user }) => {
      setSession(token, user);
      toast.success(`Welcome to JobBoard, ${user.name.split(" ")[0]}`);
      navigate(user.role === "employer" ? "/employer" : "/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function signOut() {
    logout();
    toast.success("Signed out");
    navigate("/");
  }

  return {
    token,
    user,
    isAuthenticated: !!token,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    signOut,
  };
}
