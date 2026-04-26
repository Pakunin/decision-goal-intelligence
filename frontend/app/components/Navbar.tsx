"use client";

import { useRouter, usePathname } from "next/navigation";
import { clearUser, getUser } from "../../utils/auth";
import { useEffect, useState } from "react";
import navbar from "../../public/navbar.svg";
import Image from "next/image";
import logout from "../../public/logout.svg";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u);
  }, []);

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  const links = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Decisions", href: "/decisions" },
    { label: "Goals", href: "/goals" },
    { label: "Analytics", href: "/analytics" },
  ];

  return (
    <nav className="relative w-full flex justify-center items-center">
      <div className="relative w-[1200px] h-[110px] flex items-center justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={navbar}
            alt="background"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex gap-[150px]">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? "text-blue-600 font-hand text-[45px]"
                  : "text-black hover:text-gray-800 font-hand text-[45px]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="absolute right-20">
        <button
          onClick={handleLogout}
          className="relative flex w-[210px] h-[100px] justify-center items-center group cursor-pointer text-red-500 hover:underline"
        >
          <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
            <Image
              src={logout}
              alt="background"
              fill
              className="object-cover transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
              priority
            />
          </div>
          <span className="relative z-3 bottom-1.5 font-hand text-[48px] text-red-500 select-none transition-all duration-300 group-hover:scale-105">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}
