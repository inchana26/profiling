"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./sidebar.css";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: "/assets/superadminicons/dashboardsquare.svg",
    href: "/super_admin",
  },
  {
    title: "Analytics",
    icon: "/assets/superadminicons/chart.svg",
    href: "/analytics",
  },
  {
    title: "Users",
    icon: "/assets/superadminicons/group.svg",
    href: "/users",
  },
  {
    title: "Courses",
    icon: "/assets/superadminicons/bookopen.svg",
    href: "/courses",
  },
  {
    title: "Instructors",
    icon: "/assets/superadminicons/teaching.svg",
    href: "/instructors",
  },
  {
    title: "Tenants",
    icon: "/assets/superadminicons/building.svg",
    href: "/tenants",
  },
  {
    title: "Assessment",
    icon: "/assets/superadminicons/clipboard.svg",
    href: "/assessment",
  },
  {
    title: "Certificate",
    icon: "/assets/superadminicons/graduation-cap.svg",
    href: "/certificate",
  },
  {
    title: "Reports",
    icon: "/assets/superadminicons/trending-down.svg",
    href: "/reports",
  },
  {
    title: "Billing",
    icon: "/assets/superadminicons/creditcard.svg",
    href: "/billing",
  },

  /* ================= CONFIGURATION ================= */

  {
    title: "Configuration",
    icon: "/assets/superadminicons/settings.svg",
    href: "/configuration",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">

      {/* ================= LOGO ================= */}

      <div className="logoArea">
        <Image
          src="/assets/superadminimages/logo.png"
          alt="Neuro LXP"
          width={150}
          height={70}
          className="mainLogo"
          priority
        />
      </div>

      {/* ================= NAVIGATION ================= */}

      <nav
        className="sidebarNav"
        aria-label="Super admin navigation"
      >
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              href={item.href}
              key={item.title}
              className={`sidebarItem ${
                item.title === "Dashboard"
                  ? "dashboardItem"
                  : ""
              } ${
                isActive
                  ? "sidebarItemActive"
                  : ""
              }`}
              onClick={() => {
                document.body.classList.remove(
                  "mobileSidebarOpen"
                );
              }}
            >
              <Image
                src={item.icon}
                alt=""
                aria-hidden="true"
                width={18}
                height={18}
                className="sidebarIcon"
              />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* ================= LOGOUT ================= */}

      <div className="sidebarBottom">
        <button
          type="button"
          className="logoutButton"
        >
          <Image
            src="/assets/superadminicons/log-out.svg"
            alt=""
            aria-hidden="true"
            width={18}
            height={18}
            className="sidebarIcon"
          />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
