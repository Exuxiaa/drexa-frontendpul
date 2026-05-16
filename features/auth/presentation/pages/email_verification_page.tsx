"use client";

import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// schema
const verificationSchema = z.object({
  code: z
    .string()
    .length(4, "Code must be 4 digits")
    .regex(/^\d+$/, "Only numbers allowed"),
});

type FormData = z.infer<typeof verificationSchema>;

export default function EmailVerificationPage() {
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(verificationSchema),
    });

  const code = watch("code", "");

  const onSubmit = async (data: FormData) => {
  try {
    const email = localStorage.getItem("email"); 

    const res = await fetch("http://localhost:8080/api/v1/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
      body: JSON.stringify({
        email,
        otp: data.code,
      }),
    });

    if (res.status === 200) {
      console.log("Verification success");
      // redirect ke landing page atau ke mana lah akowkaow
      window.location.href = "/dashboard";
    } 
    
    else {
      setError("code", {
        type: "manual",
        message: "Invalid or expired code",
      });
    }

  } catch (err) {
    console.error(err);
    setError("code", {
      type: "manual",
      message: "Server error. Try again.",
    });
  }
};

  return (
    <main className="bg-background min-h-screen flex flex-col items-center justify-center p-4 lg:p-0 overflow-hidden relative">
        {/* PENTING BUAT BACKGROUND CIRCLE */}
        <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>

        {/* PENTING BUAT BACKGROUND CIRCLE */}
        <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>
        <div className="z-10 w-full max-w-sm p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="z-10 bg-linear-to-b from-[#15182B] to-[#1C2140] text-center flex flex-col gap-6 items-center p-6 md:p-8 rounded-[30px] shadow-2xl"
            >
                {/* judul plenger */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">
                        Verify Your Email Address
                    </h1>
                    <p className="text-gray-400 font-bold text-sm">
                        We’ve sent a 4-digit verification code to your email. Please enter it below.
                    </p>
                </div>

                {/* PENTING INI WOI PANTEK HIDDEN INPUT */}
                <input
                    id="code-input"
                    {...register("code")}
                    maxLength={4}
                    autoFocus
                    className="absolute opacity-0"
                />

                {/* otp box buat input */}
                <div
                    className="flex gap-2 cursor-text"
                    onClick={() => document.getElementById("code-input")?.focus()}
                >
                {[0, 1, 2, 3].map((i) => (
                    <div
                    key={i}
                    className={`w-16 h-16 rounded-xl bg-background border flex items-center justify-center transition-colors
                    ${errors.code ? "border-red-500" : "border-gray-500"}`}
                    >
                        <h1 className="text-white text-2xl">
                            {code[i] || ""}
                        </h1>
                    </div>
                ))}
                </div>

                {/* error */}
                {errors.code && (
                <p className="text-red-500 text-xs -mt-4 font-semibold flex items-center gap-1.5">
                    <CircleAlert size={14} />
                    {errors.code.message}
                </p>
                )}

                {/* buttons */}
                <div className="flex flex-col gap-2 w-full">
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] py-4 px-8 rounded-lg text-white font-bold w-full"
                    >
                        Continue
                    </button>

                    <button
                        type="button"
                        className="bg-transparent py-4 px-8 rounded-lg text-white font-bold w-full"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]">
                            Resend code
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </main>
  );
}