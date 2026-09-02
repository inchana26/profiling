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

const COORDINATOR_BOOTCAMP_ROUTES: Record<string, string> = {
  "/coordinator_bootcamp": "Profile and Identity",
};

const COORDINATOR_CORPORATE_ROUTES: Record<string, string> = {
  "/coordinator_corporate": "Profile and Identity",
};

const COORDINATOR_GOVERNMENT_ROUTES: Record<string, string> = {
  "/coordinator_government": "Profile and Identity",
};

const COORDINATOR_NGO_ROUTES: Record<string, string> = {
  "/coordinator_ngo": "Profile and Identity",
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

  const [headerProfileImage, setHeaderProfileImage] =
    useState<string | null>(null);

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
    normalizedPath === "/coordinator_bootcamp" ||
    normalizedPath.startsWith("/coordinator_bootcamp/") ||
    normalizedPath === "/bootcamp" ||
    normalizedPath.startsWith("/bootcamp_") ||
    normalizedPath.startsWith("/bootcamp/");

  const isUniversity =
    normalizedPath === "/coordinator_university" ||
    normalizedPath.startsWith("/coordinator_university/") ||
    normalizedPath === "/university" ||
    normalizedPath.startsWith("/university_") ||
    normalizedPath.startsWith("/university/");

  const isCorporate =
    normalizedPath === "/coordinator_corporate" ||
    normalizedPath.startsWith("/coordinator_corporate/");

  const isCoordinatorGovernment =
    normalizedPath === "/coordinator_government" ||
    normalizedPath.startsWith("/coordinator_government/");

  const isNgo =
    normalizedPath === "/coordinator_ngo" ||
    normalizedPath.startsWith("/coordinator_ngo/");

  const isGovernment =
    isCoordinatorGovernment ||
    normalizedPath === "/government" ||
    normalizedPath.startsWith("/government_") ||
    normalizedPath.startsWith("/government/") ||
    normalizedPath.startsWith("/government_coordinator");

  const isStudent =
    normalizedPath.startsWith("/student_profile") ||
    normalizedPath.startsWith("/studentprofile") ||
    normalizedPath.startsWith("/student_");

  const isSuperAdmin =
    normalizedPath.startsWith("/super_admin") ||
    normalizedPath.startsWith("/superadmin");

  const profileStorageKey = isPlatformAdmin
    ? "platformAdminProfileImage"
    : isInstitutionAdmin
      ? "institutionAdminProfileImage"
      : isSuperAdmin
        ? "superAdminProfileImage"
        : isUniversity
          ? "universityCoordinatorProfileImage"
          : isBootcamp
            ? "bootcampCoordinatorProfileImage"
            : isCorporate
              ? "corporateCoordinatorProfileImage"
              : isCoordinatorGovernment
                ? "governmentCoordinatorProfileImage"
                : isNgo
                  ? "ngoCoordinatorProfileImage"
                  : null;

  const currentPage = isCorporate
    ? COORDINATOR_CORPORATE_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isNgo
    ? COORDINATOR_NGO_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isCoordinatorGovernment
    ? COORDINATOR_GOVERNMENT_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isGovernment
    ? GOVERNMENT_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isUniversity
    ? UNIVERSITY_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isBootcamp
      ? COORDINATOR_BOOTCAMP_ROUTES[normalizedPath] ??
        BOOTCAMP_ROUTES[normalizedPath] ??
        "Profile and Identity"
      : isInstitutionAdmin
        ? INSTITUTION_ADMIN_ROUTES[normalizedPath] ??
          "Profile and Identity"
        : isPlatformAdmin
          ? PLATFORM_ADMIN_ROUTES[normalizedPath] ??
            "Profile and Identity"
          : SUPER_ADMIN_ROUTES[normalizedPath] ??
            "Profile and Identity";

  const profileTitle = isCorporate
    ? "Corporate Coordinator Profile"
    : isNgo
    ? "NGO Coordinator Profile"
    : isGovernment
    ? "Government Coordinator Profile"
    : isUniversity
    ? "University/ College Coordinator Profile"
    : isBootcamp
      ? "Bootcamp Coordinator Profile"
      : isInstitutionAdmin
        ? "Institution admin Profile"
        : isPlatformAdmin
          ? "Platform admin Profile"
          : "Super admin Profile";

  const userName = isCorporate
    ? "Antony Thomas"
    : isNgo
    ? "Antony Thomas"
    : isGovernment
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

  const userRole = isCorporate
    ? "Corporate Coordinator"
    : isNgo
    ? "NGO Coordinator"
    : isGovernment
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

  const arrowRightIcon = isCorporate
    ? "/assets/superadminicons/arrowright.svg"
    : isNgo
    ? "/assets/superadminicons/arrowright.svg"
    : isGovernment
    ? "/assets/superadminicons/arrowright.svg"
    : isBootcamp
    ? "/assets/superadminicons/arrowright.svg"
    : isUniversity
      ? "/assets/superadminicons/arrowright.svg"
      : isPlatformAdmin
        ? "/assets/platformadmin.imagesandicons/arrowright.svg"
        : "/assets/superadminicons/arrowright.svg";

  const notificationIcon = isCorporate
    ? "/assets/superadminicons/notification.svg"
    : isNgo
    ? "/assets/superadminicons/notification.svg"
    : isGovernment
    ? "/assets/superadminicons/notification.svg"
    : isBootcamp
    ? "/assets/superadminicons/notification.svg"
    : isUniversity
      ? "/assets/superadminicons/notification.svg"
      : isPlatformAdmin
        ? "/assets/platformadmin.imagesandicons/notification.svg"
        : "/assets/superadminicons/notification.svg";

  const profileImage = isCorporate
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isNgo
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isCoordinatorGovernment
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isUniversity
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isBootcamp
      ? headerProfileImage || "/assets/institutionimages/profile.png"
      : isInstitutionAdmin
        ? headerProfileImage || "/assets/institutionimages/profile.png"
        : isPlatformAdmin
          ? headerProfileImage || "/assets/platformadmin.imagesandicons/profile.png"
          : isSuperAdmin
            ? headerProfileImage || "/assets/superadminimages/profile.png"
            : "/assets/superadminimages/profile.png";

  useEffect(() => {
    if (!profileStorageKey) {
      setHeaderProfileImage(null);
      return;
    }

    const loadHeaderProfileImage = () => {
      const savedImage = localStorage.getItem(profileStorageKey);
      setHeaderProfileImage(savedImage);
    };

    loadHeaderProfileImage();

    window.addEventListener(
      "profileImageUpdated",
      loadHeaderProfileImage
    );
    window.addEventListener(
      "storage",
      loadHeaderProfileImage
    );

    return () => {
      window.removeEventListener(
        "profileImageUpdated",
        loadHeaderProfileImage
      );
      window.removeEventListener(
        "storage",
        loadHeaderProfileImage
      );
    };
  }, [profileStorageKey]);

  useEffect(() => {
    const isCoordinatorPage =
      isUniversity ||
      isBootcamp ||
      isCorporate ||
      isCoordinatorGovernment ||
      isNgo;

    if (!isCoordinatorPage || !profileStorageKey) {
      return;
    }

    const handleCoordinatorProfileUpload = (event: Event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      if (
        input.type !== "file" ||
        !input.classList.contains("institutionProfileImageInput")
      ) {
        return;
      }

      const file = input.files?.[0];

      if (!file || !file.type.startsWith("image/")) {
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          return;
        }

        // IMPORTANT:
        // profileStorageKey belongs ONLY to the coordinator page
        // currently being used. No other coordinator key is changed.
        localStorage.setItem(
          profileStorageKey,
          reader.result
        );

        setHeaderProfileImage(reader.result);

        window.dispatchEvent(
          new Event("profileImageUpdated")
        );
      };

      reader.readAsDataURL(file);
    };

    document.addEventListener(
      "change",
      handleCoordinatorProfileUpload,
      true
    );

    return () => {
      document.removeEventListener(
        "change",
        handleCoordinatorProfileUpload,
        true
      );
    };
  }, [
    isUniversity,
    isBootcamp,
    isCorporate,
    isCoordinatorGovernment,
    isNgo,
    profileStorageKey,
  ]);

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
