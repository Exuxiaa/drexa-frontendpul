"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { getKycStatus } from "@/features/auth/presentation/hooks/kycVerification"

type View = "checking" | "approved" | "pending" | "rejected"

function resolveView(status?: string): View {
    switch ((status ?? "").toLowerCase()) {
        case "approved":
            return "approved"
        case "rejected":
            return "rejected"
        default:
            return "pending"
    }
}

export function VerifyDonePage() {
    const router = useRouter()
    const [view, setView] = useState<View>("checking")

    // The Didit decision arrives on the backend asynchronously via webhook, so poll
    // the status a few times before settling on "pending — under review".
    useEffect(() => {
        let cancelled = false
        let attempts = 0

        const poll = async () => {
            attempts += 1
            try {
                const res = await getKycStatus()
                const next = resolveView(res.status)
                if (!cancelled && (next !== "pending" || attempts >= 4)) {
                    setView(next)
                    return
                }
            } catch {
                // 404 (no submission yet) or transient — keep waiting until attempts run out.
            }
            if (cancelled) return
            if (attempts >= 4) {
                setView("pending")
                return
            }
            setTimeout(poll, 1500)
        }

        poll()
        return () => { cancelled = true }
    }, [])

    const content = {
        checking: {
            icon: <Clock size={88} className="text-blue-400 mx-auto mt-6 animate-pulse" />,
            title: "Checking verification…",
            body: "Hang tight while we confirm your identity verification.",
        },
        approved: {
            icon: <CheckCircle size={88} className="text-green-500 mx-auto mt-6" />,
            title: "Identity Verified",
            body: "Your identity has been verified. Let's finish setting up your account.",
        },
        pending: {
            icon: <Clock size={88} className="text-yellow-400 mx-auto mt-6" />,
            title: "Verification Submitted",
            body: "Thanks! Your identity is being reviewed. This usually takes a few minutes — you can continue setting up your account in the meantime.",
        },
        rejected: {
            icon: <XCircle size={88} className="text-red-500 mx-auto mt-6" />,
            title: "Verification Unsuccessful",
            body: "We couldn't verify your identity. You can retry the verification step.",
        },
    }[view]

    return (
        <main className="bg-background min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>

            <div className="z-10 w-full max-w-md p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                <div className="bg-linear-to-b from-[#15182B] to-[#1C2140] flex flex-col p-6 rounded-[30px] shadow-2xl">
                    <h1 className="text-3xl text-white font-sans font-bold text-center">{content.title}</h1>
                    {content.icon}
                    <p className="text-center text-gray-500 font-bold text-sm my-6">{content.body}</p>

                    {view === "rejected" ? (
                        <button
                            type="button"
                            onClick={() => router.push("/register/identity")}
                            className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-white font-bold"
                        >
                            Retry Verification
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={view === "checking"}
                            onClick={() => router.push("/register/pin")}
                            className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>
        </main>
    )
}
