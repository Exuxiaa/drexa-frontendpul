"use client"

import { useState } from "react"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import { startDiditVerification } from "@/features/auth/presentation/hooks/kycVerification"

export function IdentityVerificationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onStart = async () => {
        if (loading) return
        setLoading(true)
        setError(null)

        try {
            // The decision arrives later via the backend's Didit webhook; here we just
            // hand the browser off to Didit's hosted identity flow.
            const { url } = await startDiditVerification()
            window.location.href = url
        } catch (err) {
            const status = (err as { status?: number })?.status
            if (status === 401) {
                setError("Please log in again before verifying your identity.")
            } else if (status === 503) {
                setError("Identity verification is not available right now. Please try again later.")
            } else {
                setError(err instanceof Error ? err.message : "Could not start verification. Please try again.")
            }
            setLoading(false)
        }
    }

    return (
        <main className="bg-background min-h-screen flex flex-col items-center justify-center p-4 md:p-0 overflow-hidden relative">
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>

            <div className="z-10 p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                <form onSubmit={(e) => { e.preventDefault(); onStart() }} className="z-10 bg-linear-to-b from-[#15182B] to-[#1C2140] w-full max-w-md flex flex-col p-6 rounded-[30px] shadow-2xl">

                    <div className="flex gap-12 items-center">
                        <ArrowLeft size={35} color="white" className="opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer" onClick={() => router.back()} />
                        <h1 className="text-3xl text-center text-white font-sans font-bold">Verify Your Identity</h1>
                    </div>

                    <div className="flex flex-col items-center my-8 gap-4">
                        <div className="w-20 h-20 rounded-full bg-[#00FFA3]/10 flex items-center justify-center">
                            <ShieldCheck size={40} className="text-[#00FFA3]" />
                        </div>
                        <p className="text-center text-gray-400 font-semibold text-sm px-2">
                            We use a secure verification provider to confirm your identity. You will be guided
                            through capturing your ID document and a quick selfie. It only takes a minute.
                        </p>
                        <p className="text-center text-gray-500 font-semibold text-xs px-2">
                            For the best scan quality, you can complete this step on your smartphone.
                        </p>
                    </div>

                    {error && (
                        <p className="text-red-400 font-semibold text-sm text-center mb-4">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Starting verification…" : "Start Verification"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/register/pin")}
                        className="mt-3 text-gray-400 font-semibold text-sm hover:text-white transition-colors cursor-pointer"
                    >
                        I'll do this later
                    </button>
                </form>
            </div>
        </main>
    )
}
