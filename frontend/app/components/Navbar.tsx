// "use client";

// import { useRouter, usePathname } from "next/navigation";
// import { clearUser, getUser } from "../../utils/auth";
// import { useEffect, useState } from "react";

// export default function Navbar() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     const u = getUser();
//     setUser(u);
//   }, []);

//   const handleLogout = () => {
//     clearUser();
//     router.push("/");
//   };

//   const links = [
//     { label: "Dashboard", href: "/dashboard" },
//     { label: "Decisions", href: "/decisions" },
//     { label: "Goals", href: "/goals" },
//     { label: "Analytics", href: "/analytics" },
//   ];

//   return (
//     <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
//       <div className="flex gap-6 items-center">
//         <span className="font-bold text-gray-800 text-sm tracking-wide">
//           HDGI Platform
//         </span>
//         <div className="flex gap-4">
//           {links.map((link) => (
//             <a
//               key={link.href}
//               href={link.href}
//               className={`text-sm ${
//                 pathname === link.href
//                   ? "text-blue-600 font-semibold"
//                   : "text-gray-500 hover:text-gray-800"
//               }`}
//             >
//               {link.label}
//             </a>
//           ))}
//         </div>
//       </div>
//       <div className="flex items-center gap-4">
//         <span className="text-xs text-gray-400">{user?.email}</span>
//         <button
//           onClick={handleLogout}
//           className="text-xs text-red-500 hover:underline"
//         >
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }
