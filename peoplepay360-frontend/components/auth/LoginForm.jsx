"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "@/hooks/auth/useAuth";
import FormField from "@/components/forms/FormField";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "" } });

  async function onSubmit(values) {
    setFormError(null);
    try {
      await login(values);
      router.push("/employees");
    } catch (err) {
      setFormError(err.message || "Invalid email or password.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField label="Work Email" htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          invalid={Boolean(errors.email)}
          {...register("email", { required: "Work email is required" })}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            className="pr-10"
            {...register("password", { required: "Password is required" })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
