"use client"

import { ArrowLeft, CircleAlert } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// schema
const schema = z.object({
    name: z.string().min(3, "Name is required"),
    nik: z.string().length(16, "NIK must be 16 digits"),
    address: z.string().min(5, "Address is required"),
    phone: z.string().min(9, "Invalid phone number"),
})

type FormData = z.infer<typeof schema>

export default function RegistrationDetailsPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    // states
    const [date, setDate] = useState<Date | undefined>()
    const [dateError, setDateError] = useState<string | null>(null)

    const [country, setCountry] = useState("🇮🇩 +62")

    const countries = [
        "🇮🇩 +62",
        "🇺🇸 +1",
        "🇬🇧 +44",
        "🇯🇵 +81",
        "🇮🇳 +91",
    ]

    const onSubmit = (data: FormData) => {
        if (!date) {
            setDateError("Date of birth is required")
            return
        }

        setDateError(null)

        console.log({ ...data, date, country })
        router.push("/auth/register/identity_verification")
    }

    return (
        <main className="bg-background min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* background blur */}
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px]" />
            <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px]" />

            <div className="z-10 p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 via-slate-800 to-slate-700">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-gradient-to-b from-[#15182B] to-[#1C2140] w-full max-w-xl flex flex-col gap-4 p-6 rounded-[30px]"
                >
                    {/* header */}
                    <div className="flex gap-4 items-center">
                        <ArrowLeft
                            size={40}
                            className="text-white cursor-pointer"
                            onClick={() => router.back()}
                        />
                        <h1 className="text-3xl text-white font-bold">
                            Register
                        </h1>
                    </div>

                    <div className="space-y-2">
                        {/* Name */}
                        <div>
                            <label className="text-white font-bold">Name</label>
                            <input
                                {...register("name")}
                                type="text"
                                placeholder="e.g. John Doe"
                                className="bg-input font-bold w-full mt-1 rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground focus:outline-none"
                            />
                            {errors.name && (
                                <p className="text-red-400 font-semibold text-sm flex items-center gap-2 mt-1">
                                    <CircleAlert size={16} />
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* NIK */}
                        <div>
                            <label className="text-white font-bold">NI Number</label>
                            <input
                                {...register("nik")}
                                type="text"
                                placeholder="e.g. 3273012345670001"
                                className="font-bold bg-input w-full mt-1 rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground focus:outline-none"
                            />
                            {errors.nik && (
                                <p className=" font-semibold text-red-400 text-sm flex items-center gap-2 mt-1">
                                    <CircleAlert size={16} />
                                    {errors.nik.message}
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="text-white font-bold">Date of Birth</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="font-bold bg-input w-full text-left mt-1 rounded-lg px-6 py-4 text-white"
                                    >
                                        {date ? format(date, "PPP") : "Pick a date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => {
                                            setDate(d)
                                            setDateError(null)
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {dateError && (
                                <p className="font-semibold text-red-400 text-sm flex items-center gap-2 mt-1">
                                    <CircleAlert size={16} />
                                    {dateError}
                                </p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="text-white font-bold">Address</label>
                            <input
                                {...register("address")}
                                type="text"
                                placeholder="e.g. Jl. Merdeka No. 123"
                                className="font-bold bg-input w-full mt-1 rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground focus:outline-none"
                            />
                            {errors.address && (
                                <p className="font-semibold text-red-400 text-sm flex items-center gap-2 mt-1">
                                    <CircleAlert size={16} />
                                    {errors.address.message}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-white font-bold">Phone Number</label>
                            <div className="flex gap-2 mt-1">
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="bg-input text-white rounded-lg px-4 py-2"
                                >
                                    {countries.map((c, i) => (
                                        <option key={i} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    {...register("phone")}
                                    type="tel"
                                    placeholder="Your Phone Number"
                                    className="font-bold bg-input w-full rounded-lg px-6 py-4 text-white placeholder:text-muted-foreground focus:outline-none"
                                />
                            </div>

                            {errors.phone && (
                                <p className="text-red-400 font-semibold text-sm flex items-center gap-2 mt-1">
                                    <CircleAlert size={16} />
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-1">
                            <input type="checkbox" id="risk_agreement" />
                            <label htmlFor="risk_agreement" className="text-white text-sm font-semibold">I understand that crypto trading involves risk and I may lose money</label>
                        </div>
                        <div className="flex items-start gap-1">
                            <input type="checkbox" id="tos_agreement"/>
                            <label htmlFor="tos_agreement" className="text-white text-sm font-semibold">By creating an account, I agree to the Terms of Service, Privacy Policy, and Risk Disclosure, as well as applicable Indonesian regulations (OJK)</label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 rounded-lg text-white font-bold"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </main>
    )
}