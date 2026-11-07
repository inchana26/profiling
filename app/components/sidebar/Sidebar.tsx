"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./sidebar.css";

const sidebarItems = [
  { title: "Dashboard", icon: "/assets/superadminicons/dashboardsquare.svg", href: "/super_admin" },
  { title: "Analytics", icon: "/assets/superadminicons/chart.svg", href: "/analytics" },
  { title: "Users", icon: "/assets/superadminicons/group.svg", href: "/users" },
  { title: "Courses", icon: "/assets/superadminicons/bookopen.svg", href: "/courses" },
  { title: "Instructors", icon: "/assets/superadminicons/teaching.svg", href: "/instructors" },
  { title: "Tenants", icon: "/assets/superadminicons/building.svg", href: "/tenants" },
  { title: "Assessment", icon: "/assets/superadminicons/clipboard.svg", href: "/assessment" },
  { title: "Certificate", icon: "/assets/superadminicons/graduation-cap.svg", href: "/certificate" },
  { title: "Reports", icon: "/assets/superadminicons/trending-down.svg", href: "/reports" },
  { title: "Billing", icon: "/assets/superadminicons/creditcard.svg", href: "/billing" },
  { title: "Configuration", icon: "/assets/superadminicons/settings.svg", href: "/configuration" },
];

const MOBILE_BREAKPOINT = "(max-width: 767px)";

/** Only identify a hamburger/menu control at the top-right of the shared header. */
function isHeaderMenuToggle(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  // The X shown over the same header toggle handles its own close event.
  if (target.closest("[data-mobile-sidebar-header-close]")) return false;

  const control = target.closest<HTMLElement>(
    'button, [role="button"], [aria-label], [data-sidebar-toggle], ' +
    '[class*="hamburger"], [class*="Hamburger"], ' +
    '[class*="menuToggle"], [class*="MenuToggle"], ' +
    '[class*="mobileMenu"], [class*="MobileMenu"]'
  );
  if (!control || control.closest(".sidebar, [data-mobile-sidebar-backdrop]")) return false;

  const rect = control.getBoundingClientRect();
  // Navigation hamburger is in the mobile header, never in the page content.
  const atHeaderRight = rect.top >= 0 && rect.top < 155 &&
    rect.left >= window.innerWidth - 125 && rect.right <= window.innerWidth + 5;
  if (!atHeaderRight) return false;

  const description = [
    control.getAttribute("aria-label"),
    control.getAttribute("title"),
    control.getAttribute("data-sidebar-toggle"),
    typeof control.className === "string" ? control.className : "",
  ].filter(Boolean).join(" ");

  if (/menu|hamburger|sidebar|navigation|nav[-_ ]?toggle/i.test(description)) return true;

  // Some Header variants render the three bars as an SVG or three spans,
  // without an accessible label. Restrict this fallback to the top-right.
  const icon = control.querySelector("svg");
  const hasThreeBars = control.querySelectorAll("svg line, span").length >= 3;
  return Boolean(icon || hasThreeBars);
}

function setMobileMenuTop(trigger?: Element | null): void {
  const header = trigger?.closest("header") ??
    document.querySelector("header") ??
    trigger?.closest("[class*='Header'], [class*='header']") ??
    document.querySelector("[class*='mainHeader'], [class*='MainHeader']");
  if (header) {
    const rect = header.getBoundingClientRect();
    if (rect.bottom > 45 && rect.top < 150 && rect.bottom < window.innerHeight * 0.4) {
      document.documentElement.style.setProperty(
        "--mobile-sidebar-top", `${Math.round(rect.bottom + 8)}px`
      );
      return;
    }
  }
  // Some actor headers are div-based instead of using a <header> element.
  if (trigger) {
    const rect = trigger.getBoundingClientRect();
    document.documentElement.style.setProperty(
      "--mobile-sidebar-top", `${Math.round(rect.bottom + 32)}px`
    );
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const headerToggleRef = useRef<HTMLElement | null>(null);
  const [headerToggleBounds, setHeaderToggleBounds] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const rememberHeaderToggle = useCallback((control: HTMLElement | null) => {
    if (!control) return;
    headerToggleRef.current = control;
    const rect = control.getBoundingClientRect();
    setHeaderToggleBounds({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const closeMenu = useCallback(() => {
    document.body.classList.remove("mobileSidebarOpen");
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(MOBILE_BREAKPOINT);
    const onMediaChange = () => {
      setIsMobile(media.matches);
      if (!media.matches) {
        document.body.classList.remove("mobileSidebarOpen");
        setIsOpen(false);
      }
    };

    onMediaChange();
    media.addEventListener("change", onMediaChange);
    return () => {
      media.removeEventListener("change", onMediaChange);
      document.body.classList.remove("mobileSidebarOpen");
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    closeMenu();
  }, [pathname, mounted, closeMenu]);

  useEffect(() => {
    if (!mounted) return;

    const syncFromHeader = () => {
      const open = window.matchMedia(MOBILE_BREAKPOINT).matches &&
        document.body.classList.contains("mobileSidebarOpen");
      setIsOpen(open);
      if (open) {
        setMobileMenuTop(headerToggleRef.current);
        if (headerToggleRef.current?.isConnected) {
          rememberHeaderToggle(headerToggleRef.current);
        }
      }
    };

    // Header implementations in the different actors may manage this body
    // class themselves. Observe it to keep the shared menu in sync.
    const observer = new MutationObserver(syncFromHeader);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const onHeaderClick = (event: MouseEvent) => {
      if (!window.matchMedia(MOBILE_BREAKPOINT).matches) return;
      if (!isHeaderMenuToggle(event.target)) return;

      // Handle both open and close here, preventing a second Header handler
      // from adding the class back and leaving the dropdown stuck open.
      event.preventDefault();
      event.stopImmediatePropagation();
      const headerToggle = event.target instanceof Element
        ? event.target.closest<HTMLElement>('button, [role="button"], [data-sidebar-toggle]')
        : null;
      rememberHeaderToggle(headerToggle);
      setMobileMenuTop(headerToggle);
      const nextOpen = !document.body.classList.contains("mobileSidebarOpen");
      document.body.classList.toggle("mobileSidebarOpen", nextOpen);
      setIsOpen(nextOpen);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && document.body.classList.contains("mobileSidebarOpen")) {
        closeMenu();
      }
    };

    document.addEventListener("click", onHeaderClick, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", syncFromHeader);
    syncFromHeader();

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onHeaderClick, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", syncFromHeader);
    };
  }, [mounted, closeMenu, rememberHeaderToggle]);

  const handleLogout = () => {
    closeMenu();
    router.replace("/sign_in");
  };

  const navigation = () => (
    <nav className="sidebarNav" aria-label="Super admin navigation">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            href={item.href}
            key={item.title}
            className={`sidebarItem ${
              item.title === "Dashboard" ? "dashboardItem" : ""
            } ${isActive ? "sidebarItemActive" : ""}`}
            onClick={closeMenu}
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
  );

  const logout = () => (
    <div className="sidebarBottom">
      <button type="button" className="logoutButton" onClick={handleLogout}>
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
  );

  return (
    <>
      {/* Original desktop/tablet sidebar; hidden on mobile only. */}
      <aside className="sidebar" data-shared-sidebar>
        <div className="logoArea">
          <Image
            src="/assets/superadminicons/logo.png"
            alt="Neuro LXP"
            width={150}
            height={70}
            className="mainLogo"
            priority
          />
        </div>
        {navigation()}
        {logout()}
      </aside>

      {/* Portal avoids page-specific layout/sidebar rules that trap the menu. */}
      {mounted && isMobile && createPortal(
        <>
          <div
            data-mobile-sidebar-backdrop
            className="mobileSidebarBackdrop"
            aria-hidden="true"
            onClick={closeMenu}
          />
          <aside
            className="sidebar"
            data-mobile-sidebar
            id="shared-mobile-sidebar"
            aria-label="Mobile navigation"
            aria-hidden={!isOpen}
          >
            {navigation()}
            {logout()}
          </aside>
          {/* The existing hamburger stays in its original position. While open,
              show X directly on top of it rather than inside the menu. */}
          {isOpen && headerToggleBounds && (
            <button
              type="button"
              data-mobile-sidebar-header-close
              className="mobileSidebarHeaderClose"
              style={{
                top: headerToggleBounds.top,
                left: headerToggleBounds.left,
                width: headerToggleBounds.width,
                height: headerToggleBounds.height,
              }}
              aria-label="Close sidebar"
              aria-controls="shared-mobile-sidebar"
              aria-expanded={true}
              onClick={closeMenu}
            >
              <span className="mobileSidebarHeaderCloseIcon" aria-hidden="true" />
            </button>
          )}
        </>,
        document.body
      )}
    </>
  );
}
