"use client"

import { CheckCircle } from "lucide-react"

import { useRouter } from "next/navigation"

export default function RegistrationCompletePage() {
    const router = useRouter()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/auth/login");
    };
    
    return (
        <div>
            <main className="bg-background min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>

            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>
                <div className="w-full max-w-md p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                    <form onSubmit={onSubmit} action="" className="bg-linear-to-b from-[#15182B] to-[#1C2140] flex flex-col p-6 rounded-[30px] shadow-2xl">
                    
                        <div className="flex justify-center gap-4">
                            <h1 className="text-3xl text-white font-sans font-bold text-center">Registration Successful</h1>
                        </div>

                        <CheckCircle size={100} className="text-green-500 mx-auto mt-6" />
        
                        <p className="text-center text-gray-500 font-bold text-sm my-6">Thank you for joining us <br />
                        Your data is being reviewed to ensure security and accuracy <br />This will take 2–3 business days</p>
                        
                        <button type="submit" 
                                className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-white font-bold">
                            Continue to Login
                        </button>
            
                    </form>
                </div>
            </main>
        </div> 
    )
}