"use client"
import { ArrowLeft } from "lucide-react"
import { Camera } from "lucide-react"

import { useRouter } from "next/navigation";

export default function IdentityVerificationPage() {
    const router = useRouter();
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/auth/register/identity_face");
    };
    return (
        <main className="bg-background min-h-screen flex flex-col items-center justify-center p-4 md:p-0 overflow-hidden relative">
            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>

            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>
            
            <div className="z-10 p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                <form onSubmit={onSubmit}action="" className="z-10 bg-linear-to-b from-[#15182B] to-[#1C2140] w-full max-w-md flex flex-col p-6 rounded-[30px] shadow-2xl">

                    <div className="flex gap-12 items-center">
                        <ArrowLeft size={35} color="white" className="opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer" onClick={() => router.back()}/>
                        <h1 className="text-3xl text-center text-white font-sans font-bold">Verify Your Identity</h1>
                    </div>

                    <p className="text-center text-gray-500 font-bold text-sm my-6">To ensure a secure and high-quality scan, please continue the verification process on your smartphone</p>
                    
                    <div className="w-full h-48 rounded-lg bg-background border-2 border-dashed border-gray-500 flex items-center justify-center block lg:hidden">

                    </div>
                    
                    <div className="hidden lg:flex bg-white rounded-xl items-center justify-center max-w-xs mx-auto">
                        <img src="/qr_dummy.svg" className="" alt="" />
                    </div>
                    <p className="text-white font-bold text-sm text-center mt-3 hidden lg:block">Scan this QR code with your phone to start</p>

                    <p className="text-center text-gray-500 font-bold text-sm my-6">Please keep this window open until you finish the process on your phone</p>
                    
                    <button type="submit" className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-white font-bold">
                        Capture Photo
                    </button>
                    
                    <div className="flex items-center w-full my-0.5">
                        <div className="grow h-px bg-gray-500"></div>
                        <span className="px-4 text-gray-400 font-medium">or</span>
                        <div className="grow h-px bg-gray-500"></div>
                    </div>

                    <button className="flex items-center justify-center bg-white opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-black font-bold">
                        <p className="flex items-center"><Camera size={26} className="mr-4" />Upload from Gallery</p>
                    </button>

                </form>
            </div>
        
        </main>
    )
}