"use client"

import { ArrowLeft, CircleAlert } from "lucide-react"
import { useRouter } from "next/navigation"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// dummy email
const emailDummy = "example@gmail.com"

// schema
const forgotPassSchema = z.object({
    email: z.string().email("Invalid email"),
})

type FormData = z.infer<typeof forgotPassSchema>

export default function ForgotPasswordPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(forgotPassSchema),
        mode: "onChange", 
        defaultValues: {
            email: "",
        },
    })

   const onSubmit = async (data: FormData) => {
    try {
        const res = await fetch("/api/v1/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: data.email,
            }),
        })
        
        if (res.ok) {
            console.log("Reset email requested")

            router.push("/auth/login/reset_password")
        }
    } catch (err) {
        console.error("Request failed:", err)

        setError("email", {
            message: "Something went wrong. Try again.",
        })
    }
}

    return (
        <main className="bg-background min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* background */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px]" />
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px]" />

            <div className="z-10 p-[1px] rounded-[30px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-700">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-gradient-to-b from-[#15182B] to-[#1C2140] w-full max-w-sm flex flex-col p-6 rounded-[30px]"
                >
                    {/* header */}
                    <div className="flex gap-4 items-center mb-6">
                        <ArrowLeft
                            className="text-white cursor-pointer"
                            size={40}
                            onClick={() => router.back()}
                        />
                        <h1 className="text-3xl font-bold text-white">
                            Forgot Password
                        </h1>
                    </div>

                    {/* email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-white font-bold">Email</label>

                        <input
                            type="email"
                            placeholder="e.g. johndoe@example.com"
                            className="bg-input w-full font-bold text-white mt-1 rounded-lg px-6 py-4 placeholder:text-muted-foreground focus:outline-none"
                            {...register("email")}
                        />

                        {errors.email && (
                            <p className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                                <CircleAlert size={16} />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* button */}
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`mt-4 py-4 opacity-100 hover:opacity-90 cursor-pointer rounded-lg text-white font-bold transition
                            ${
                                isValid
                                    ? "bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]"
                                    : "bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-50 cursor-not-allowed"
                            }`}
                    >
                        Continue
                    </button>
                </form>
            </div>
        </main>
    )
}