"use client";

import { Circle, CheckCircle, ArrowLeft, CircleAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation"; // ✅ ADDED

// schema 
const registerSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registerSchema>;

function RegisterPage() {
  const router = useRouter(); // ✅ ADDED

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  // live password rules
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const onSubmit = async (data: FormData) => {
    console.log("FORM DATA:", data);

    try {
    const res = await fetch("http://localhost:8080/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (res.status === 200) {
      // success terus OTP sent
      router.push("/auth/register/email_verification");
    } 
    
    else if (res.status === 409) {
      alert("Email already exists");
    } 
    
    else {
      const err = await res.text();
      console.error("ERROR:", err);
      alert("Something went wrong");
    }

  } catch (error) {
    console.error("FETCH ERROR:", error);
    alert("Cannot connect to server");
  }
  };

  // helper UI
  const renderRule = (condition: boolean, text: string) => (
    <li
      className={`flex items-center gap-1.5 ${
        condition ? "text-green-400" : "text-white"
      }`}
    >
      {condition ? (
        <CheckCircle size={12} />
      ) : (
        <Circle size={12} strokeWidth={3} />
      )}
      {text}
    </li>
  );

  return (
    <main className="bg-background min-h-screen flex justify-center p-4 md:p-0 items-center gap-32 overflow-hidden relative">
      <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>
      <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>

      <div className="z-10 w-full md:w-1/2 xl:w-1/3 p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="z-10 bg-linear-to-b from-[#15182B] to-[#1C2140] space-y-8 p-6 md:p-8
                      flex flex-col rounded-4xl shadow-2xl"
        >
          {/* header */}
          <div className="flex gap-4">
            <ArrowLeft
              size={40}
              color="white"
              className="opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer"
              onClick={() => router.back()} // ✅ ADDED
            />
            <h1 className="text-3xl text-white font-sans font-bold">
              Register
            </h1>
          </div>

          <div className="flex flex-col">
            <div className=" space-y-3">
              {/* email  */}
              <div>
                <label className="text-white font-bold">Email</label>
                <input
                  {...register("email")}
                  type="text"
                  placeholder="example@gmail.com"
                  className="bg-input text-white font-bold w-full focus:outline-none rounded-lg mt-1 px-6 py-4 text-foreground placeholder:text-muted-foreground"
                />
                {errors.email && (
                  <div className="flex items-center gap-1 mt-1">
                    <CircleAlertIcon size={16} color="#F87171" />
                    <p className="text-red-400 text-sm font-semibold">
                      {errors.email.message}
                    </p>
                  </div>
                )}

              </div>

              {/* pw  */}
              <div>
                <label className="font-bold text-white">Password</label>
                <input
                  {...register("password")}
                  placeholder="Enter your password"
                  type="password"
                  className="bg-input font-bold w-full focus:outline-none rounded-lg mt-1 text-white px-6 py-4 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* confirm pass */}
              <div>
                <label className="font-bold text-white">Confirm Password</label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-input font-bold w-full focus:outline-none mt-1 rounded-lg text-white px-6 py-4 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {confirmPassword.length > 0 && !passwordsMatch && (
              <div className="flex items-center mt-1 gap-1">
                <CircleAlertIcon size={16} color="#F87171" />
                <p className="text-red-400 text-sm font-semibold">
                  Passwords do not match
                </p>
              </div>
            )}

            <ul className="flex flex-col text-sm font-semibold mt-2">
              {renderRule(rules.length, "Minimum 8 characters")}
              {renderRule(rules.uppercase, "Include at least 1 uppercase letter")}
              {renderRule(rules.lowercase, "Include at least 1 lowercase letter")}
              {renderRule(rules.number, "Include at least 1 number")}
              {renderRule(rules.special, "Include at least 1 special character")}
            </ul>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 py-4 px-8 rounded-lg text-white font-bold cursor-pointer opacity-100 disabled:opacity-50 disabled:text-gray-100 disabled:cursor-not-allowed"
            disabled={
              !(
                rules.length &&
                rules.uppercase &&
                rules.lowercase &&
                rules.number &&
                rules.special &&
                passwordsMatch
              )
            }
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}

export default RegisterPage;