"use client";

import { ArrowLeft, CircleAlert } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

// dummy password
const passwordDummy = "sixSeverIsCool123!";

// schema
const filledSchema = z
    .object({
        password: z.string().min(1, "Password is required"),
    })
    .refine((data) => data.password === passwordDummy, {
        message: "Wrong password. Please try again.",
        path: ["password"],
    });

type FilledData = z.infer<typeof filledSchema>;

function LoginFilledPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FilledData>({
        resolver: zodResolver(filledSchema),
        mode: "onChange",
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (data: FilledData) => {
        console.log("Login Successful!", data);
        router.push("/auth/register");
    };

    const renderError = (message: string) => (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
            <CircleAlert size={16} />
            <p className="font-semibold">{message}</p>
        </div>
    );

    return (
        <div>
            <main className="bg-background min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
                
                {/* background */}
                <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>
                <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>

                <div className="w-full max-w-sm p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">    
                    
                    <form 
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-linear-to-b from-[#15182B] to-[#1C2140] flex flex-col p-6 md:p-8 rounded-[30px] shadow-2xl"
                    >
                    
                        <div className="flex flex-col gap-8">
                            <img src="/logo_drexa.svg" className="w-[196px]" alt="" />
                            <h1 className="text-3xl text-white font-sans font-bold">Log In</h1>
                        </div>

                        <div className="flex items-center mt-6 gap-2">
                            <ArrowLeft 
                                size={32} 
                                color="white" 
                                className="cursor-pointer" 
                                onClick={() => router.back()} 
                            />
                            <h1 className="text-white font-bold">YourEmail@gmail.com</h1>
                        </div>

                        <div className="font-bold mt-6" id="input_section">
                            <label htmlFor="password_input" className="text-white">
                                Enter password
                            </label><br />

                            <input 
                                {...register("password")}
                                type="password"
                                id="password_input" 
                                placeholder="Password" 
                                className="bg-input mt-1 w-full focus:outline-none rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground"
                            /><br />

                            {errors.password && renderError(errors.password.message!)}
                        </div>

                        <button 
                            type="submit"
                            disabled={!isValid}
                            className={`bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] py-4 px-8 mt-4 rounded-lg text-white font-bold
                                ${!isValid ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                            Continue
                        </button>

                        <div className="flex flex-col items-center mt-4">
                            <h1 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]">
                                Can't log in?
                            </h1>
                        </div>

                    </form>
                </div>
            </main>
        </div> 
    );
}

export default LoginFilledPage;