"use client"

import { 
    StarIcon,
    BellRing,
    Wallet,
    Book,
    UserIcon,
    ArrowRightLeft,
    HouseIcon,
    InfoIcon,
    EyeClosed,
    EyeIcon
} from "lucide-react"

import Image from "next/image"

import { useEffect, useState } from "react";

type Coin = {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    total_volume: number;
    price_change_percentage_24h: number | null;
};

export default function WalletPage() {
    const [selected, setSelected] = useState(1); // default pilih Category 1
    const [sideSelected, setSideSelected] = useState(0);
    
    const [viewAsset, setViewAsset] = useState(false);
    const [viewBalance, setViewBalance] = useState(false);

    const [markets, setMarkets] = useState<Coin[]>([]);
    
    // PAKEEE APIIII MENNNNNNNNN

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr"
            );
            const data = await res.json();
            setMarkets(data);
        };

        fetchData();
    }, []);

    // INI CUMAN SEMENTARA YA
    /* const market = [
        { pair: "BTC/IDR", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/500px-Bitcoin.svg.png", name: "Bitcoin", price: 1045000000, volume: "12.5T", change: 2.35, balance: 0.0021 },
        { pair: "ETH/IDR", logo: <UserIcon/>, name: "Ethereum", price: 56000000, volume: "8.2T", change: -1.12, balance: 0.15 },
        { pair: "SOL/IDR", logo: <UserIcon/>, name: "Solana", price: 2450000, volume: "3.1T", change: 5.67, balance: 12 },
        { pair: "BNB/IDR", logo: <UserIcon/>, name: "BNB", price: 8900000, volume: "2.4T", change: -0.85, balance: 1.2 },
        { pair: "ADA/IDR", logo: <UserIcon/>, name: "Cardano", price: 7800, volume: "1.1T", change: 3.45, balance: 500 },
        { pair: "DOGE/IDR", logo: <UserIcon/>, name: "Dogecoin", price: 2100, volume: "950B", change: -4.22, balance: 2000 },
    ]; */

    // INI CUMAN SEMENTARA YA
   const menu = [
        { name: "Dashboard", icon: <Wallet size={20} />, icon_mobile: <Wallet size={26} />},
        { name: "Portfolio", icon: <Book size={20} />, icon_mobile: <Book size={26} />},
        { name: "News", icon: <BellRing size={20} />, icon_mobile: <BellRing size={26} />},
        { name: "Daily Investation", icon: <ArrowRightLeft size={20} />, icon_mobile: <ArrowRightLeft size={26} />},
        { name: "Staking", icon: <StarIcon size={20} />, icon_mobile: <StarIcon size={26} />},
        { name: "Information", icon: <InfoIcon size={20} />, icon_mobile: <InfoIcon size={26} /> },
    ];

    const profilePreview = {
        name: "Wylder, the Nightfarer",
        username: "Wylder",
        icon: <UserIcon size={50} />
    };
    
    const allowed = ["btc", "eth", "bnb", "usdt", "trx"];

    const filteredMarkets = markets.filter((coin) =>
        allowed.includes(coin.symbol.toLowerCase())
    );

    return (
        <main className="bg-[#15182B] grid md:grid-cols-[auto_1fr] min-h-screen">
            
            {/* sidebar */}
            <div className="hidden md:flex group bg-[#1A233D] h-screen w-17 hover:w-64 transition-all duration-300 flex-col overflow-hidden text-sm text-slate-300">

                {/* PROFILE */}
                    <div className="p-3 mb-4 relative h-50">

                        {/* ICON (default) */}
                        <div
                            className={"absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out opacity-100 group-hover:opacity-0"}
                        >
                            <UserIcon size={24} />
                        </div>

                        {/* FULL PROFILE */}
                        <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100"
                        >
                            <div className="flex flex-col items-center gap-2 text-center">
                                {profilePreview.icon}

                                <div>
                                    <p className="text-white text-lg font-semibold whitespace-nowrap">
                                        {profilePreview.name}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-400">
                                        {profilePreview.username}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* MENU */}
                {menu.map((item, i) => {
                    const sidebarActive = sideSelected == i
                    return (
                        <div 
                            key={i}
                            onClick={() => setSideSelected(i)} 
                            className={`flex items-center gap-4 px-6 py-3 
                                hover:bg-white/10 hover:text-white cursor-pointer transition
                                ${sidebarActive 
                                    ? "bg-[#303F64] border-l-4 border-[#00E5FF] text-[#00E5FF] font-semibold" 
                                    : "border-gray-700 hover:border-white hover:text-white"
                                }`} 
                        >
                            <span className="w-5 flex justify-center">
                                {item.icon}
                            </span>

                            <span className="opacity-0 group-hover:opacity-100 transition duration-300 whitespace-nowrap">
                                {item.name}
                            </span>
                        </div>
                    )
                    
                })}
                   
            </div>

            {/* right side */}
            <div className="flex flex-col p-4 gap-4 md:h-screen">

                {/* profile box */}
                <div className="bg-[#1A233D] p-4 rounded-4xl shadow-xl shadow-black/10 border border-gray-700">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex flex-col gap-4 lg:gap-0 justify-between">
                            <Image 
                                width={164}
                                height={164}
                                src="/logo_drexa.svg"
                                alt="logo drexa"
                            />
                            <div>
                                <p className="text-md text-neutral-400">Estimated Asset Value (IDR)</p>

                                <div className="flex items-center gap-2">

                                    {viewAsset ? (
                                        <h1 className="text-xl text-white font-semibold">6.767.676.767</h1>
                                    ) : (
                                        <input
                                            type="password"
                                            value="6.767.676.767"
                                            disabled
                                            className="text-white font-semibold w-32"
                                        />
                                    )}

                                    {viewAsset ? (
                                        <EyeIcon
                                            size={20}
                                            onClick={() => setViewAsset(false)}
                                            className="text-white cursor-pointer hover:text-[#00E5FF] transition"
                                        />
                                    ) : (
                                        <EyeClosed
                                            size={20}
                                            onClick={() => setViewAsset(true)}
                                            className="text-white cursor-pointer hover:text-[#00E5FF] transition"
                                        />
                                    )}
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-col items-start justify-between md:items-center border border-slate-600 p-3 rounded-xl">
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex justify-between items-center gap-2">
                                    <div>
                                        
                                        <p className="text-sm text-neutral-400">Account Balance (IDR)</p>
                                        <div className="flex items-center gap-2">
                                            {viewBalance ? (
                                                <h1 className="text-xl text-white font-semibold">6.767.676.767</h1>
                                            ) : (
                                                <input
                                                    type="password"
                                                    value="6.767.676.767"
                                                    disabled
                                                    className="text-white font-semibold w-32"
                                                />
                                            )}

                                            {viewBalance ? (
                                                <EyeIcon
                                                    size={20}
                                                    onClick={() => setViewBalance(false)}
                                                    className="text-white cursor-pointer hover:text-[#00E5FF] transition"
                                                />
                                            ) : (
                                                <EyeClosed
                                                    size={20}
                                                    onClick={() => setViewBalance(true)}
                                                    className="text-white cursor-pointer hover:text-[#00E5FF] transition"
                                                />
                                            )}
                                        </div>
                                        
                                    </div>
                                    <div className="border border-slate-600 p-3 rounded-md hover:border-white transition durastion-300 cursor-pointer">
                                        <BellRing size={20} fill="white" color="white"/>
                                    </div>
                                </div>

                                {/* CONSISTENT BUTTON */}
                                <div className="flex flex-col sm:flex-row gap-2 text-white text-sm w-full">
                                    <button className="flex-1 flex gap-2 items-center justify-center px-6 py-2 rounded-md bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] hover:opacity-90 font-semibold transition">
                                        <Wallet size={20} fill="white"/>Top up
                                    </button>
                                    <button className="flex-1 flex gap-2 items-center justify-center px-6 py-2 rounded-md bg-slate-700 hover:opacity-90 font-semibold transition">
                                        <ArrowRightLeft size={20} fill="white"/>Transfer
                                    </button>
                                    <button className="flex-1 flex gap-2 items-center justify-center px-6 py-2 rounded-md bg-slate-700 hover:opacity-90 font-semibold transition">
                                        <HouseIcon size={18} />Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Watchlist */}
                <div className="flex flex-col gap-2 px-2">
                    <h1 className="text-white text-xl font-semibold">
                        Watchlist
                    </h1>

                    <div className="flex gap-2 text-sm text-slate-300 flex-wrap ">
                        {[1,2].map((i) => {
                            const isActive = selected === i;

                            return (
                                <div 
                                    key={i}
                                    onClick={() => setSelected(i)}
                                    className={`
                                        px-4 py-2 rounded-md border cursor-pointer transition
                                        ${isActive 
                                            ? "bg-white text-black font-semibold border-white" 
                                            : "border-gray-700 hover:border-white hover:text-white"}
                                    `}
                                >
                                    Category {i}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* list markets */}
                <div className="bg-[#1A233D] flex-1 rounded-4xl shadow-xl shadow-black/10 flex flex-col overflow-hidden">

                    {/* header */}
                    <div className="hidden md:grid grid-cols-[auto_3fr_1fr_1fr_1fr_1fr] px-6 py-4 text-sm text-neutral-400 font-semibold border-b border-gray-700">
                        <div className="pr-4">Fav</div>
                        <div>Nama</div>
                        <div className="text-right">Harga Terakhir</div>
                        <div className="text-right">24H Vol</div>
                        <div className="text-right">24H Chg</div>
                        <div className="text-right">Saldo</div>
                    </div>
                    
                    {/* mobile */}
                    <div className="px-6 py-4 text-neutral-400 font-semibold border-b border-gray-700 flex md:hidden">
                        <div>Stock List</div>
                    </div>

                    {/* content */}
                    <div className="overflow-visible md:overflow-y-auto md:flex-1 text-white text-sm">

                        {filteredMarkets.map((coin) => (
                            <div
                                key={coin.id}
                                className="border-b border-gray-800 hover:bg-white/5 transition"
                            >

                                {/* MOBILE */}
                                <div className="md:hidden flex flex-col gap-2 px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <Image  
                                                src={coin.image}
                                                width={36}
                                                height={36}
                                                alt={coin.name}
                                            />
                                            <div>
                                                <h1 className="text-md font-semibold">
                                                    {coin.symbol.toUpperCase()}/IDR
                                                </h1>
                                                <p className="text-xs text-neutral-400">{coin.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-right text-sm">
                                            <span className={(coin.price_change_percentage_24h ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
                                                {(coin.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                                                {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                                            </span>
                                            
                                            <span>
                                                Vol: {(coin.total_volume / 1e12).toFixed(1)}T
                                            </span>
                                            <span>Bal: -</span>
                                  
                                        </div>
                                        
                                    </div>
                                    
                                </div>

                                {/* DESKTOP */}
                                <div className="hidden md:grid grid-cols-[auto_3fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center text-sm">

                                    <div className="pr-4">
                                        <StarIcon size={18} fill="gold" color="transparent"/>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Image 
                                            width={30}
                                            height={30}
                                            src={coin.image}
                                            alt={coin.name}
                                        />
                                        <div>
                                            <h1 className="font-semibold">
                                                {coin.symbol.toUpperCase()}/IDR
                                            </h1>
                                            <p className="text-xs text-neutral-400">{coin.name}</p>
                                        </div>    
                                    </div>

                                    <div className="text-right font-medium">
                                        {coin.current_price.toLocaleString("id-ID")}
                                    </div>

                                    <div className="text-right">
                                        {(coin.total_volume / 1e12).toFixed(1)}T
                                    </div>

                                    <div className={`text-right font-medium ${
                                        (coin.price_change_percentage_24h ?? 0) >= 0 
                                            ? "text-green-400" 
                                            : "text-red-400"
                                    }`}>
                                        {(coin.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                                        {coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                                    </div>

                                    <div className="text-right">
                                        -
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* NAVBAR BUAT GANTI SIDEBAR (BINGUNG MAU KAYA GIMANA)*/}
                <div className="fixed md:hidden bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-[#1A233D]/90 backdrop-blur-md p-3 flex gap-2 items-center rounded-3xl border border-white/10 shadow-xl">
                        
                        {menu.map((item, i) => {
                            const sidebarActive = sideSelected == i;

                            return (
                                <div 
                                    key={i}
                                    onClick={() => setSideSelected(i)} 
                                    className={`
                                        flex items-center justify-center p-2 sm:px-3 sm:py-2  rounded-xl cursor-pointer transition
                                        ${sidebarActive 
                                            ? "bg-[#303F64] text-[#00E5FF]" 
                                            : "text-slate-400 hover:text-white hover:bg-white/10"}
                                    `}
                                >
                                    {item.icon_mobile}
                                </div>
                            );
                        })}

                    </div>
                </div>
            

            </div>
        </main>
    )
}