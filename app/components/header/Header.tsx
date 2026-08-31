"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./header.css";

const SUPER_ADMIN_ROUTES: Record<string, string> = {
  "/super_admin": "Profile and Identity",
  "/superadmin_security": "Security and Access",
  "/superadmin_preferences": "Preferences",
  "/superadmin_audit": "Audit and system",
};

const PLATFORM_ADMIN_ROUTES: Record<string, string> = {
  "/platform_admin": "Profile and Identity",
  "/platformadmin": "Profile and Identity",
  "/platformadmin_profile": "Profile and Identity",
  "/platformadmin_security": "Security and Access",
  "/platformadmin_preferences": "Preferences",
  "/platformadmin_audit": "Audit and system",
};

const INSTITUTION_ADMIN_ROUTES: Record<string, string> = {
  "/institution_admin": "Profile and Identity",
  "/institutionadmin": "Profile and Identity",
  "/institutionadmin_profile": "Profile and Identity",
  "/institutionadmin_security": "Security and Access",
  "/institutionadmin_preferences": "Preferences",
  "/institutionadmin_audit": "Audit and system",
};

const BOOTCAMP_ROUTES: Record<string, string> = {
  "/bootcamp": "Profile and Identity",
  "/bootcamp_profile": "Profile and Identity",
  "/bootcamp/profile": "Profile and Identity",
  "/bootcamp_security": "Security and Access",
  "/bootcamp/security": "Security and Access",
  "/bootcamp_preferences": "Preferences",
  "/bootcamp/preferences": "Preferences",
  "/bootcamp_audit": "Audit and system",
  "/bootcamp/audit": "Audit and system",
};

const GOVERNMENT_ROUTES: Record<string, string> = {
  "/government": "Profile and Identity",
  "/government_profile": "Profile and Identity",
  "/government/profile": "Profile and Identity",
  "/government_coordinator": "Profile and Identity",
  "/government_coordinator/profile": "Profile and Identity",
  "/government_security": "Security and Access",
  "/government/security": "Security and Access",
  "/government_preferences": "Preferences",
  "/government/preferences": "Preferences",
  "/government_audit": "Audit and system",
  "/government/audit": "Audit and system",
};

const UNIVERSITY_ROUTES: Record<string, string> = {
  "/coordinator_university": "Profile and Identity",
  "/university": "Profile and Identity",
  "/university_profile": "Profile and Identity",
  "/university/profile": "Profile and Identity",
  "/university_security": "Security and Access",
  "/university/security": "Security and Access",
  "/university_preferences": "Preferences",
  "/university/preferences": "Preferences",
  "/university_audit": "Audit and system",
  "/university/audit": "Audit and system",
};

const STUDENT_ROUTES: Record<string, string[]> = {
  "/student_profile": ["Student Profile", "Student Profile"],
  "/studentprofile": ["Student Profile", "Student Profile"],
  "/student_profile/profile": ["Student Profile", "Student Profile"],
  "/studentprofile/profile": ["Student Profile", "Student Profile"],
  "/student_profile/student-profile": [
    "Student Profile",
    "Student Profile",
  ],
  "/studentprofile/student-profile": [
    "Student Profile",
    "Student Profile",
  ],

  "/student_profile/registration": [
    "Student Profile",
    "Registration",
  ],
  "/studentprofile/registration": [
    "Student Profile",
    "Registration",
  ],
  "/student_registration": [
    "Student Profile",
    "Registration",
  ],

  "/student_profile/consent": [
    "Student Profile",
    "Consent",
  ],
  "/studentprofile/consent": [
    "Student Profile",
    "Consent",
  ],
  "/student_consent": [
    "Student Profile",
    "Consent",
  ],
};

export default function Header() {
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const normalizedPath =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const isPlatformAdmin =
    normalizedPath.startsWith("/platform_admin") ||
    normalizedPath.startsWith("/platformadmin");

  const isInstitutionAdmin =
    normalizedPath.startsWith("/institution_admin") ||
    normalizedPath.startsWith("/institutionadmin");

  const isBootcamp =
    normalizedPath === "/bootcamp" ||
    normalizedPath.startsWith("/bootcamp_") ||
    normalizedPath.startsWith("/bootcamp/");

  const isUniversity =
    normalizedPath === "/coordinator_university" ||
    normalizedPath.startsWith("/coordinator_university/") ||
    normalizedPath === "/university" ||
    normalizedPath.startsWith("/university_") ||
    normalizedPath.startsWith("/university/");

  const isGovernment =
    normalizedPath === "/government" ||
    normalizedPath.startsWith("/government_") ||
    normalizedPath.startsWith("/government/") ||
    normalizedPath.startsWith("/government_coordinator");

  const isStudent =
    normalizedPath.startsWith("/student_profile") ||
    normalizedPath.startsWith("/studentprofile") ||
    normalizedPath.startsWith("/student_");

  const currentPage = isGovernment
    ? GOVERNMENT_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isUniversity
    ? UNIVERSITY_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isBootcamp
      ? BOOTCAMP_ROUTES[normalizedPath] ??
        "Profile and Identity"
      : isInstitutionAdmin
        ? INSTITUTION_ADMIN_ROUTES[normalizedPath] ??
          "Profile and Identity"
        : isPlatformAdmin
          ? PLATFORM_ADMIN_ROUTES[normalizedPath] ??
            "Profile and Identity"
          : SUPER_ADMIN_ROUTES[normalizedPath] ??
            "Profile and Identity";

  const profileTitle = isGovernment
    ? "Government Coordinator Profile"
    : isUniversity
    ? "University Coordinator Profile"
    : isBootcamp
      ? "Bootcamp Coordinator Profile"
      : isInstitutionAdmin
        ? "Institution admin Profile"
        : isPlatformAdmin
          ? "Platform admin Profile"
          : "Super admin Profile";

  const userName = isGovernment
    ? "Antony Thomas"
    : isUniversity
    ? "Antony Thomas"
    : isBootcamp
      ? "Antony Thomas"
      : isInstitutionAdmin
        ? "Antony Thomas"
        : isPlatformAdmin
          ? "Suresh Kumar"
          : isStudent
            ? "Student"
            : "Rajesh Mehta";

  const userRole = isGovernment
    ? "Government Coordinator"
    : isUniversity
    ? "University Coordinator"
    : isBootcamp
      ? "Bootcamp Coordinator"
      : isInstitutionAdmin
        ? "Institution admin"
        : isPlatformAdmin
          ? "Platform admin"
          : isStudent
            ? "Student"
            : "Super admin";

  const arrowRightIcon = isGovernment
    ? "/assets/superadminicons/arrowright.svg"
    : isBootcamp
    ? "/assets/bootcampicons/arrowright.svg"
    : isUniversity
      ? "/assets/superadminicons/arrowright.svg"
      : isPlatformAdmin
        ? "/assets/platformadmin.imagesandicons/arrowright.svg"
        : "/assets/superadminicons/arrowright.svg";

  const notificationIcon = isGovernment
    ? "/assets/universityicons/notification.svg"
    : isBootcamp
    ? "/assets/bootcampicons/notification.svg"
    : isUniversity
      ? "/assets/universityicons/notification.svg"
      : isPlatformAdmin
        ? "/assets/platformadmin.imagesandicons/notification.svg"
        : "/assets/superadminicons/notification.svg";

  const profileImage = isGovernment
    ? "/assets/institutionimages/profile.png"
    : isUniversity
    ? "/assets/institutionimages/profile.png"
    : isBootcamp
      ? "/assets/institutionimages/profile.png"
      : isInstitutionAdmin
        ? "/assets/institutionimages/profile.png"
        : isPlatformAdmin
          ? "/assets/platformadmin.imagesandicons/profile.png"
          : "/assets/superadminimages/profile.png";

  useEffect(() => {
    document.body.classList.toggle(
      "mobileSidebarOpen",
      isMobileMenuOpen
    );

    return () => {
      document.body.classList.remove(
        "mobileSidebarOpen"
      );
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const studentBreadcrumb =
    STUDENT_ROUTES[normalizedPath] ??
    (() => {
      if (normalizedPath.includes("consent")) {
        return ["Student Profile", "Consent"];
      }

      if (normalizedPath.includes("registration")) {
        return ["Student Profile", "Registration"];
      }

      return [
        "Student Profile",
        "Student Profile",
      ];
    })();

  const breadcrumbContent = isStudent ? (
    <>
      {studentBreadcrumb.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="breadcrumbSegment"
        >
          {index > 0 && (
            <Image
              src={arrowRightIcon}
              alt=""
              width={15}
              height={15}
            />
          )}

          <span>{item}</span>
        </span>
      ))}
    </>
  ) : (
    <>
      <span>{profileTitle}</span>

      <Image
        src={arrowRightIcon}
        alt=""
        width={15}
        height={15}
      />

      <span>{currentPage}</span>
    </>
  );

  return (
    <>
      <header className="topHeader">
        <div className="breadcrumb desktopBreadcrumb">
          {breadcrumbContent}
        </div>

        <div className="headerRight">
          <button
            type="button"
            className="notificationButton"
            aria-label="Notifications"
          >
            <Image
              src={notificationIcon}
              alt=""
              width={18}
              height={18}
            />

            <span
              className="notificationDot"
              aria-hidden="true"
            />
          </button>

          <div className="headerDivider" />

          <div className="topUserProfile">
            <div className="smallAvatar">
              <Image
                src={profileImage}
                alt=""
                fill
                sizes="36px"
                className="avatarImage"
              />
            </div>

            <div className="topUserDetails">
              <h1 className="topUserName">
                {userName}
              </h1>

              <div className="topUserRole">
                {userRole}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mobileMenuButton"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            onClick={() =>
              setIsMobileMenuOpen(
                (current) => !current
              )
            }
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className="breadcrumb mobileBreadcrumb">
        {breadcrumbContent}
      </div>
    </>
  );
}
