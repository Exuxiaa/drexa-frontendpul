"use client"

import { ArrowLeft } from "lucide-react"

import { useRouter } from "next/navigation"

export default function IdentityFacePage() {
    const router = useRouter()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/auth/register/register_complete");
    };

    return (
        <div>
            <main className="bg-background min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
            
            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>

            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>
                
            <div className="w-full max-w-sm p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                <form onSubmit={onSubmit} action="" className="bg-linear-to-b from-[#15182B] to-[#1C2140] flex flex-col p-6 rounded-[30px] shadow-2xl">
                
                    <div className="flex gap-4">
                        <ArrowLeft size={40} 
                                   color="white"
                                   className="opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer" 
                                   onClick={() => router.back()}/>
                        <h1 className="text-3xl text-white font-sans font-bold">Verify Your Identity</h1>
                    </div>

                    <p className="text-center text-gray-500 font-bold text-sm my-6">Please position your face within the frame to verify your identity</p>
                    
                    <div className="w-full h-64 rounded-lg bg-background border-2 border-dashed border-gray-500 flex items-center justify-center">

                    </div>
                    
                    <p className="text-center text-gray-500 font-bold text-sm my-6">Ensure your face is clearly visible and well-lit for accurate verification</p>
                    
                    <button onClick={() => router.push("/auth/register/register_complete")} 
                            type="submit" 
                            className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-white font-bold">
                        Capture Photo
                    </button>

                </form>
                </div>
            </main>
        </div> 
    )
}