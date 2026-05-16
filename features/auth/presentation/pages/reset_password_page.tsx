"use client"

import { ArrowLeft, CircleAlert } from "lucide-react"

import { useSearchParams } from "next/navigation"

const searchParams = useSearchParams()
const resetToken = searchParams.get("token")

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useRouter } from "next/navigation"

const resetSchema = z
    .object({
        password: z.string().min(8, "Password must be 8 letters or more."),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password doesn't match. Please try again.",
        path: ["confirmPassword"],
    })

type resetData = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<resetData>({
        resolver: zodResolver(resetSchema),
        mode: "onChange",
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    })

    const router = useRouter();

    const onSubmit = (data: resetData) => {
        console.log("Password has been reset successfully", data)
        router.push("/auth/login")
    }

    const renderError = (message: string) => (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
            <CircleAlert size={16} />
            <p className="font-semibold">{message}</p>
        </div>
    )

    return (
        <div>
            <main className="bg-background min-h-screen flex flex-col items-center justify-center overflow-hidden relative p-4 md:p-0">
            
                {/* PENTING BUAT BACKGROUND CIRCLE */}
                <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>

                {/* PENTING BUAT BACKGROUND CIRCLE */}
                <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>
            
                <div className="z-10 w-full max-w-sm p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                    <form 
                        onSubmit={handleSubmit(onSubmit)} 
                        className="bg-linear-to-b from-[#15182B] to-[#1C2140] flex flex-col gap-8 p-6 rounded-[30px] shadow-2xl"
                    >
                        
                        <div className="flex gap-4 items-center">
                            <ArrowLeft className="text-white" size={38} onClick={() => router.back()} />
                            <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
                        </div>
                        
                        <div className="flex flex-col">
                            <div className="flex flex-col gap-2">
                                
                                <div>
                                    <label className="text-white font-bold">Password</label>
                                    <input 
                                        {...register("password")}
                                        type="password" 
                                        placeholder="Enter your new password" 
                                        className="bg-input w-full font-bold focus:outline-none mt-1 rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground"
                                    />
                                    {errors.password && renderError(errors.password.message!)}
                                </div>

                                <div>
                                    <label className="text-white font-bold">Confirm Password</label>
                                    <input 
                                        {...register("confirmPassword")}
                                        type="password" 
                                        placeholder="Confirm your new password" 
                                        className="bg-input w-full font-bold focus:outline-none mt-1 rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground"
                                    />
                                    {errors.confirmPassword && renderError(errors.confirmPassword.message!)}
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <button 
                                type="submit"
                                disabled={!isValid}
                                className={`bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 py-4 px-8 rounded-lg text-white font-bold w-full
                                    ${!isValid ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                Continue
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    )
}