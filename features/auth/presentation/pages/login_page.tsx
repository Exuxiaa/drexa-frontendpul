"use client";

import { ArrowLeft, CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
 
import { useRouter } from "next/navigation"

// schema
const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

type loginData = z.infer<typeof loginSchema>;

function LoginPage(){
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<loginData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: loginData) => {
        try {
            const res = await fetch("http://localhost:8080/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", 
                body: JSON.stringify({
                        email: data.email,
                        password: data.password,
                }),
            });

            if (res.status === 200) {
                // login success ada cookies enak
                router.push("/dashboard");
            } 
            
            else if (res.status === 401) {
                alert("Invalid email or password");
            } 
            
            else {
                const err = await res.text();
                console.error("ERROR:", err);
                alert("Something went wrong");
            }

        } catch (err) {
            console.error("FETCH ERROR:", err);
            alert("Cannot connect to server");
        }
    };

    const renderError = (message: string) => (
        <div className="flex items-center gap-2 text-red-500 text-sm">
            <CircleAlert size={16} />
            <p className="font-semibold">{message}</p>
        </div>
    );

    return (
        <main className="bg-background min-h-screen flex justify-center p-4 md:p-0 items-center gap-32 overflow-hidden relative">
            
            {/* background */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>
            
            <div className="z-10 w-full md:w-1/2 xl:w-1/3 p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                <form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="z-10 bg-linear-to-b from-[#15182B] to-[#1C2140] p-6 md:p-8 flex flex-col rounded-4xl shadow-2xl"
                >
                
                    <img src="/logo_drexa.svg" className="w-[196px]" alt="" />

                    <div className="flex gap-4 mt-8 md:mt-6">
                        <ArrowLeft size={40} 
                                   color="white"
                                   className="opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer" 
                                   onClick={() => router.back()} />
                        <h1 className="text-3xl text-white font-sans font-bold">Log In</h1>
                    </div>

                    <p className="font-semibold text-gray-400 mt-2">
                        Use the registered email and password to log in to your account
                    </p>

                    <div className="space-y-1 font-bold mt-8 md:mt-6" id="input_section">
                        <label htmlFor="email_input" className="text-white">
                            Email / Phone
                        </label><br />

                        <input 
                            {...register("email")}
                            type="email" 
                            id="email_input" 
                            placeholder="Email / Phone" 
                            className="border border-transparent bg-input w-full focus:outline-none rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground"
                        />

                        {errors.email && renderError(errors.email.message!)}
                    </div>

                    <div className="space-y-1 font-bold mt-2" id="input_section">
                        <label htmlFor="password_input" className="text-white">
                            Password
                        </label>

                        <input 
                            {...register("password")}
                            type="password" 
                            id="password_input" 
                            placeholder="Your Password" 
                            className="border border-transparent bg-input w-full focus:outline-none rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground"
                        />

                        {errors.password && renderError(errors.password.message!)}
                    </div>

                    <button 
                        type="submit"
                        disabled={!isValid}
                        className={`bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] 
                                        mt-4 py-4 px-8 rounded-lg text-sm xl:text-base text-white font-bold
                                        ${!isValid ? "opacity-50 hover:opacity-50 cursor-not-allowed" : "opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer"}
                                    `}
                    >
                        Continue
                    </button>

                    <div className="flex items-center w-full my-0.5">
                        <div className="grow h-px bg-gray-500"></div>
                        <span className="px-4 text-gray-400 font-medium">or</span>
                        <div className="grow h-px bg-gray-500"></div>
                    </div>

                    <button className="flex items-center justify-center bg-white opacity-100 cursor-pointer hover:opacity-90 transition-all duration-300 py-4 px-8 rounded-lg text-black font-bold">
                        <img src="/google_icon.svg" className="w-5 h-5 lg:w-6 lg:h-6 mr-2" alt="" />
                        <p className="text-sm xl:text-base">Continue with Google</p>
                    </button>

                    <div className="flex flex-col items-center gap-2 mt-6">
                        <h1 
                            onClick={() => router.push("/auth/register/")} 
                            className="text-sm xl:text-base font-bold bg-clip-text opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer text-transparent bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]"
                        >
                            Create a Drexa account
                        </h1>

                        <h1 
                            onClick={() => router.push("/auth/login/forgot_password")} 
                            className="text-sm xl:text-base font-bold bg-clip-text opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer text-transparent bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]"
                        >
                            Can't log in?
                        </h1>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default LoginPage;