import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface SignupProps {
  onClose?: () => void;
}

const signupSchema = z
  .object({
    name: z.string().min(3, "Name is required"),
    surname: z.string().min(2, "Surname is required"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC<SignupProps> = ({ onClose = () => {} }) => {
  const [password, setPassword] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;

  const onSubmit = (data: SignupFormData) => {
    console.log("Signup attempt", data);
    onClose();
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl w-full max-w-md text-left shadow-lg border border-gray-100 mx-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Join us</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Sign Up</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-lg font-bold transition"
          aria-label="Close signup"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Name</label>
          <input
            type="text"
            {...register("name")}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

<div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Surname</label>
          <input
            type="text"
            {...register("surname")}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your surname"
          />
          {errors.surname && (
            <p className="text-sm text-red-500">{errors.surname.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Email</label>
          <input
            type="email"
            {...register("email")}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Password</label>
          <input
            type="password"
            {...register("password")}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
          {password && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-gray-700 mb-1">Password strength:</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${hasMinLength ? "text-green-600" : "text-gray-400"}`}>
                  {hasMinLength ? "✓" : "○"} At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${hasUppercase ? "text-green-600" : "text-gray-400"}`}>
                  {hasUppercase ? "✓" : "○"} One uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${hasNumber ? "text-green-600" : "text-gray-400"}`}>
                  {hasNumber ? "✓" : "○"} One number
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${hasSpecialChar ? "text-green-600" : "text-gray-400"}`}>
                  {hasSpecialChar ? "✓" : "○"} One special character
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Repeat your password"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>!</span> {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-black font-semibold shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
