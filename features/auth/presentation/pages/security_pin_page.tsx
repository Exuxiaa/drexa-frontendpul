import { ArrowLeft } from "lucide-react"

export default function Security_pin(){
    return (
        <main className="bg-background min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>

            {/* PENTING BUAT BACKGROUND CIRCLE */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>
            
            <div className="z-10 w-full min-h-screen sm:max-w-sm sm:min-h-0 p-[1px] rounded-none sm:rounded-[30px] bg-transparent sm:bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                <form
                    className="z-10 bg-transparent md:bg-linear-to-b from-[#15182B] to-[#1C2140] text-center text-white flex flex-col gap-0 sm: gap-16 justify-between items-center p-8 rounded-none sm:rounded-[30px] min-h-screen sm:min-h-0 shadow-2xl"
                >
                    <div className="flex flex-col gap-8 sm:gap-8 justify-center items-center">
                        <h1 className="font-bold text-2xl">
                            Set Your Security PIN
                        </h1>
                        <div className="flex justify-center items-center gap-4">
                            <div className="w-4 h-4 bg-white/50 flex items-center justify-center text-xl font-bold rounded-full"></div>
                            <div className="w-4 h-4 bg-white/50 flex items-center justify-center text-xl font-bold rounded-full"></div>
                            <div className="w-4 h-4 bg-white/50 flex items-center justify-center text-xl font-bold rounded-full"></div>
                            <div className="w-4 h-4 bg-white/50 flex items-center justify-center text-xl font-bold rounded-full"></div>
                            <div className="w-4 h-4 bg-white/50 flex items-center justify-center text-xl font-bold rounded-full"></div>
                            <div className="w-4 h-4 bg-white/50 flex items-center justify-center text-xl font-bold rounded-full"></div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-3 gap-8 text-4xl sm:text-3xl font-semibold">
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">1</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">2</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">3</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">4</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">5</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">6</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">7</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">8</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">9</div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer"></div>
                            <div className="bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">0</div>
                            <div className="flex justify-center items-center bg-transparent hover:bg-white/10 p-4 rounded-xl transition cursor-pointer">
                                <ArrowLeft
                                    width={36}
                                    height={36}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}