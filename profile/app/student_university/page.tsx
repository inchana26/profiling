"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import {
  getExampleNumber,
  validatePhoneNumberLength,
} from "libphonenumber-js/max";
import examples from "libphonenumber-js/examples.mobile.json";
import "./suniversity.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
const images = {
  profile: "/assets/studenticons/profile.png",
  camera: "/assets/studenticons/camera.svg",
  edit: "/assets/studenticons/edit.svg",
  editBig: "/assets/studenticons/editbig.svg",
  lock: "/assets/studenticons/lock.svg",
  cancel: "/assets/studenticons/cancel.svg",
  arrowDown: "/assets/studenticons/arrow-down.svg",
  calendar: "/assets/studenticons/calendar.svg",
  completed: "/assets/studenticons/checkmark.svg",
  upload: "/assets/studenticons/upload.svg",
  clap: "/assets/studenticons/clap.svg",
  sad: "/assets/studenticons/sad.svg",
  registration: "/assets/studenticons/file-edit.svg",
  academicProfessional: "/assets/studenticons/bag.svg",
  skillsDevelopment: "/assets/studenticons/target.svg",
  documents: "/assets/studenticons/file.svg",
  confirmation: "/assets/studenticons/checkmark-circlewhite.svg",
};

type SectionName = "registration" | "professional" | "skills" | "documents";

const MB = 1024 * 1024;

const DOCUMENT_UPLOAD_LIMITS = {
  "Government ID Proof": {
    accept: "image/jpeg,image/png,image/webp,application/pdf,.doc,.docx",
    label: "Use the recommended LMS upload size for the selected file type",
  },
  "Resume": {
    accept: "application/pdf,.pdf,.doc,.docx",
    label: "PDF, DOC or DOCX — maximum 5 MB",
  },
} as const;

const KB = 1024;

const getDocumentRecommendedSize = (file: File) => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(name)) {
    return { min: 200 * KB, max: 2 * MB, label: "200 KB – 2 MB" };
  }

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return { min: 5 * MB, max: 25 * MB, label: "5 – 25 MB" };
  }

  if (name.endsWith(".doc") || name.endsWith(".docx")) {
    return { min: 1 * MB, max: 10 * MB, label: "1 – 10 MB" };
  }

  if (name.endsWith(".ppt") || name.endsWith(".pptx")) {
    return { min: 5 * MB, max: 30 * MB, label: "5 – 30 MB" };
  }

  if (
    type.startsWith("audio/") ||
    name.endsWith(".mp3") ||
    name.endsWith(".aac")
  ) {
    return { min: 2 * MB, max: 20 * MB, label: "2 – 20 MB" };
  }

  if (type.startsWith("video/") || name.endsWith(".mp4")) {
    return { min: 50 * MB, max: 500 * MB, label: "50 – 500 MB" };
  }

  if (name.endsWith(".zip")) {
    return { min: 10 * MB, max: 100 * MB, label: "10 – 100 MB" };
  }

  if (name.endsWith(".xlsx")) {
    return { min: 0, max: 5 * MB, label: "< 5 MB" };
  }

  if (name.endsWith(".vtt") || name.endsWith(".srt")) {
    return { min: 0, max: 500 * KB, label: "< 500 KB" };
  }

  return null;
};

const isAcceptedDocumentFile = (
  label: "Government ID Proof" | "Resume", file: File
) => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (label === "Government ID Proof") {
    return (type === "image/jpeg" || type === "image/png" || type === "image/webp" ||
      type === "application/pdf" || /\.(jpe?g|png|webp|pdf|doc|docx)$/i.test(name));
  }
  // Resume upload: accept document formats only.
  return /\.(pdf|doc|docx)$/i.test(name) &&
    (!type || [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ].includes(type));
};

type DigitalLinkName = "portfolioLink" | "linkedinUrl" | "githubUrl" | "personalWebsite";
type DigitalLinks = Record<DigitalLinkName, string>;

const parseDigitalLink = (value: string): URL | null => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048 || /\s|\\/.test(trimmed)) return null;
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed);
    const host = url.hostname.toLowerCase();
    const labels = host.split(".");
    const validHost = labels.length >= 2 && host.length <= 253 &&
      labels.every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(part)) &&
      /^[a-z]{2,24}$/i.test(labels[labels.length - 1]);
    return (validHost && (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username && !url.password) ? url : null;
  } catch { return null; }
};

const digitalLinkError = (field: DigitalLinkName, value: string): string | null => {
  if (!value.trim()) return null;
  const url = parseDigitalLink(value);
  const hostname = url?.hostname.toLowerCase() || "";
  const parts = url?.pathname.split("/").filter(Boolean) || [];
  if (field === "linkedinUrl") {
    return url && (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) &&
      ["in", "pub", "company", "school"].includes(parts[0] || "") && parts.length >= 2
      ? null : "Enter a valid LinkedIn URL (https://www.linkedin.com/in/username).";
  }
  if (field === "githubUrl") {
    return url && (hostname === "github.com" || hostname === "www.github.com") && parts.length >= 1
      ? null : "Enter a valid GitHub URL (https://github.com/username).";
  }
  if (field === "portfolioLink") {
    return url ? null : "Enter a valid Portfolio Link (https://portfolio.example.com).";
  }
  return url ? null : "Enter a valid Personal Website URL (https://example.com).";
};

const getDigitalLinkError = (value: DigitalLinks): string | null =>
  digitalLinkError("portfolioLink", value.portfolioLink) ||
  digitalLinkError("linkedinUrl", value.linkedinUrl) ||
  digitalLinkError("githubUrl", value.githubUrl) ||
  digitalLinkError("personalWebsite", value.personalWebsite);

const normalizeDigitalLink = (value: string): string =>
  value.trim() ? (parseDigitalLink(value)?.href || value.trim()) : "";


const PROFILE_PHOTO_MAX_BYTES = 2 * MB;

const getProfilePhotoValidationError = async (file: File): Promise<string | null> => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const validType =
    (type === "image/jpeg" && /\.jpe?g$/.test(name)) ||
    (type === "image/png" && /\.png$/.test(name)) ||
    (type === "image/webp" && /\.webp$/.test(name));

  if (!validType) return "Profile Photo: only JPG, PNG or WebP files are allowed.";
  if (file.size > PROFILE_PHOTO_MAX_BYTES) return "Profile Photo must be 2 MB or less.";
  if (file.size === 0) return "Profile Photo is empty or corrupted.";

  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (part, i) => bytes[i] === part
    );
    const webp = [82, 73, 70, 70].every((part, i) => bytes[i] === part) &&
      [87, 69, 66, 80].every((part, i) => bytes[i + 8] === part);
    if (!((type === "image/jpeg" && jpeg) ||
          (type === "image/png" && png) ||
          (type === "image/webp" && webp))) {
      return "Profile Photo is corrupted or does not match its file type.";
    }

    // A valid header alone is insufficient: the complete image must decode.
    if (typeof window !== "undefined" && "createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file);
      const validDimensions = bitmap.width > 0 && bitmap.height > 0;
      bitmap.close();
      if (!validDimensions) return "Profile Photo is corrupted or unreadable.";
    } else if (typeof window !== "undefined") {
      const objectUrl = URL.createObjectURL(file);
      try {
        await new Promise<void>((resolve, reject) => {
          const testImage = new window.Image();
          testImage.onload = () => testImage.naturalWidth && testImage.naturalHeight
            ? resolve() : reject(new Error("Invalid dimensions"));
          testImage.onerror = () => reject(new Error("Cannot decode image"));
          testImage.src = objectUrl;
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
    return null;
  } catch {
    return "Profile Photo is corrupted or unreadable.";
  }
};

const validatePreferredName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return null; // Keep the existing optional-field behavior.
  if (name.length > 50 || !/^\p{L}+(?:[ .'-]\p{L}+)*$/u.test(trimmed)) {
    return "Enter correct Preferred Name.";
  }
  return null;
};

// Academic and credential validations are evaluated on blur, section change and Save.
// Optional fields remain optional unless the corresponding document type is selected.
const validateIdentityDocumentNumber = (type: string, value: string): string | null => {
  const id = value.trim();
  if (!type && !id) return null;
  if (!type || !id || id.length > 30) return "Enter correct Identity Document Number.";
  const upper = id.toUpperCase();
  const valid = type === "Aadhaar"
    ? /^\d{12}$/.test(id)
    : type === "PAN Card"
      ? /^[A-Z]{5}\d{4}[A-Z]$/.test(upper)
      : type === "Passport"
        ? /^[A-Z0-9]{6,12}$/.test(upper) && /[0-9]/.test(upper)
        : type === "Driving Licence"
          ? /^[A-Z]{2}[ -]?\d{2}[ -]?\d{11}$/.test(upper)
          : type === "Voter ID"
            ? /^[A-Z]{3}\d{7}$/.test(upper)
            : /^[A-Z0-9]+(?:[-/][A-Z0-9]+)*$/.test(upper) && upper.length >= 5;
  return valid ? null : "Enter correct Identity Document Number.";
};

const validateAlternateContact = (value: string): string | null =>
  !value.trim() || /^[6-9]\d{9}$/.test(value.trim())
    ? null : "Enter correct Alternate Contact.";

const validateAlternateEmail = (value: string): string | null => {
  const email = value.trim();
  if (!email) return null;
  return email.length <= 254 && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email)
    ? null : "Enter correct Alternate Email.";
};

const validateUniversityGrade = (system: string, value: string): string | null => {
  const grade = value.trim();
  if (!grade) return null;
  if (!system || grade.length > 8) return "Enter correct Grade / Score.";
  if (system === "Grade") {
    return /^(?:[A-F][+-]?|[A-F][1-3]|O|S|P)$/i.test(grade)
      ? null : "Enter correct Grade / Score.";
  }
  const percentage = system === "Percentage";
  const numericText = percentage && grade.endsWith("%") ? grade.slice(0,-1) : grade;
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(numericText)) return "Enter correct Grade / Score.";
  const number = Number(numericText);
  const maximum = percentage ? 100 : system === "CGPA – 10 Point Scale" ? 10 : 4;
  return number >= 0 && number <= maximum ? null : "Enter correct Grade / Score.";
};

const getTodayForUniversity = (): string => {
  const today = new Date();
  return [today.getFullYear(), String(today.getMonth()+1).padStart(2,"0"), String(today.getDate()).padStart(2,"0")].join("-");
};

const validateUniversityIssueDate = (value: string): string | null =>
  value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value > getTodayForUniversity())
    ? "Issue Date cannot be after today." : null;

const validateCredentialID = (value: string): string | null => {
  const id = value.trim();
  if (!id) return null;
  return id.length >= 4 && id.length <= 50 && /^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/.test(id)
    ? null : "Enter correct Credential ID.";
};

const validateCredentialVerificationUrl = (value: string): string | null => {
  const address = value.trim();
  if (!address) return null;
  if (address.length > 150 || /\s/.test(address)) return "Enter correct Credential URL.";
  try {
    const normalized = /^https?:\/\//i.test(address) ? address : 'https://' + address;
    const url = new URL(normalized);
    const validHost = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/.test(url.hostname);
    return (['http:', 'https:'].includes(url.protocol) && validHost && !url.username && !url.password)
      ? null : "Enter correct Credential URL.";
  } catch {
    return "Enter correct Credential URL.";
  }
};

type AcademicValidationSource = {
  preferredName: string; identityDocumentType: string; identityDocumentNumber: string;
  alternateContact: string; alternateEmail: string; gradingSystem: string; gradeScore: string;
};
const getUniversityAcademicError = (info: AcademicValidationSource): string | null =>
  validatePreferredName(info.preferredName) ||
  validateIdentityDocumentNumber(info.identityDocumentType, info.identityDocumentNumber) ||
  validateAlternateContact(info.alternateContact) ||
  validateAlternateEmail(info.alternateEmail) ||
  validateUniversityGrade(info.gradingSystem, info.gradeScore);

type CredentialValidationSource = {
  issueDate: string; credentialId: string; credentialUrl: string;
};
const getUniversityCredentialError = (info: CredentialValidationSource): string | null =>
  validateUniversityIssueDate(info.issueDate) ||
  validateCredentialID(info.credentialId) ||
  validateCredentialVerificationUrl(info.credentialUrl);

type IconImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

function IconImage({
  src,
  alt = "",
  width = 18,
  height = 18,
  className = "",
}: IconImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      aria-hidden={alt ? undefined : true}
    />
  );
}

type DisplayFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  className?: string;
  isLink?: boolean;
};

function DisplayField({
  label,
  value,
  placeholder,
  className = "",
  isLink = false,
}: DisplayFieldProps) {
  return (
    <div className={`institutionField ${className}`}>
      <div className="institutionFieldLabel">{label}</div>
      <div
        className={`institutionFieldValue ${!value ? "institutionPlaceholder" : ""
          }`}
      >
        {isLink && value && parseDigitalLink(value) ? (
          <a className="institutionSavedProfileLink" href={normalizeDigitalLink(value)} target="_blank" rel="noopener noreferrer">{value}</a>
        ) : value || placeholder || "--"}
      </div>
    </div>
  );
}

type EditFieldProps = {
  label: string;
  value: string;
  locked?: boolean;
  type?: "text" | "email" | "date" | "tel";
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  visualIcon?: "lock" | "edit" | "select" | "calendar";
  validate?: (value: string) => string | null;
  onValidationError?: (message: string) => void;
  onValidationClear?: () => void;
  validateOnBlurOnly?: boolean;
  clearInvalidOnBlur?: boolean;
  maxLength?: number;
};

function EditField({
  label,
  value,
  locked = false,
  type = "text",
  placeholder,
  onChange,
  className = "",
  visualIcon,
  validate,
  onValidationError,
  onValidationClear,
  validateOnBlurOnly = false,
  clearInvalidOnBlur = false,
  maxLength,
}: EditFieldProps) {
  const inputId = useId();
  const [fieldError, setFieldError] = useState<string | null>(null);
  const validationTimerRef = useRef<number | null>(null);
  const lastValidationErrorRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        window.clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  const runValidation = (nextValue: string) => {
    if (!validate) return;

    const message = validate(nextValue);
    setFieldError(message);

    if (message) {
      if (lastValidationErrorRef.current !== message) {
        lastValidationErrorRef.current = message;
        onValidationError?.(message);
      }
      return;
    }

    if (lastValidationErrorRef.current) onValidationClear?.();
    lastValidationErrorRef.current = null;
  };

  const scheduleValidation = (nextValue: string) => {
    if (!validate) return;

    if (validationTimerRef.current) {
      window.clearTimeout(validationTimerRef.current);
    }

    validationTimerRef.current = window.setTimeout(() => {
      runValidation(nextValue);
      validationTimerRef.current = null;
    }, 500);
  };

  return (
    <div className={`institutionField institutionEditableField ${className}`}>
      <div className="institutionFieldText">
        {locked ? (
          <div className="institutionFieldLabel">{label}</div>
        ) : (
          <label htmlFor={inputId} className="institutionFieldLabel">
            {label}
          </label>
        )}

        {locked ? (
          <div className="institutionFieldValue">
            {value || placeholder || "--"}
          </div>
        ) : (
          <input
            id={inputId}
            name={inputId}
            type={type}
            className="institutionFieldInput"
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? `${inputId}-error` : undefined}
            onChange={(event) => {
              const nextValue = event.target.value;
              onChange?.(nextValue);
              if (fieldError && validate) runValidation(nextValue);
              else if (!validateOnBlurOnly) scheduleValidation(nextValue);
            }}
            onBlur={(event) => {
              if (validationTimerRef.current) {
                window.clearTimeout(validationTimerRef.current);
                validationTimerRef.current = null;
              }
              const invalid = Boolean(validate?.(event.currentTarget.value));
              runValidation(event.currentTarget.value);
              if (invalid && clearInvalidOnBlur) {
                onChange?.("");
                setFieldError(null);
                lastValidationErrorRef.current = null;
              }
            }}
          />
        )}
        {fieldError && !locked && (
          <span id={`${inputId}-error`} className="institutionEditFieldError" role="alert">{fieldError}</span>
        )}
      </div>

      {visualIcon === "select" ? (
        <span className="institutionFieldInlineArrow" aria-hidden="true">
          <IconImage src={images.arrowDown} width={16} height={16} />
        </span>
      ) : (
        <span
          className={`institutionFieldAction ${
            (visualIcon ?? (locked ? "lock" : "edit")) === "lock"
              ? "institutionFieldLocked"
              : (visualIcon ?? (locked ? "lock" : "edit")) === "calendar"
                ? "institutionFieldCalendar"
                : "institutionFieldPencil"
          }`}
          aria-hidden="true"
        >
          <IconImage
            src={
              (visualIcon ?? (locked ? "lock" : "edit")) === "lock"
                ? images.lock
                : (visualIcon ?? (locked ? "lock" : "edit")) === "calendar"
                  ? images.calendar
                  : images.edit
            }
            width={18}
            height={18}
          />
        </span>
      )}
    </div>
  );
}


type CalendarDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxDate?: string;
  onValidationError?: (message: string) => void;
};

function CalendarDateField({
  label,
  value,
  onChange,
  maxDate,
  onValidationError,
}: CalendarDateFieldProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarId = useId();

  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [yearPageStart, setYearPageStart] = useState(() => {
    const year = initialDate.getFullYear();
    return Math.floor(year / 12) * 12;
  });

  useEffect(() => {
    if (!value) return;

    const selectedDate = new Date(`${value}T00:00:00`);

    setVisibleMonth(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );

    setYearPageStart(
      Math.floor(selectedDate.getFullYear() / 12) * 12
    );
  }, [value]);

  useEffect(() => {
    const closeCalendar = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setMode("days");
      }
    };

    const closeOtherDropdown = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== calendarId) {
        setOpen(false);
        setMode("days");
      }
    };

    document.addEventListener("mousedown", closeCalendar);
    window.addEventListener(
      "faculty-profile-dropdown-open",
      closeOtherDropdown as EventListener
    );

    return () => {
      document.removeEventListener("mousedown", closeCalendar);
      window.removeEventListener(
        "faculty-profile-dropdown-open",
        closeOtherDropdown as EventListener
      );
    };
  }, [calendarId]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = visibleMonth.getFullYear();
  const monthIndex = visibleMonth.getMonth();

  const firstDay = new Date(year, monthIndex, 1).getDay();

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    return new Date(year, monthIndex, 1 - firstDay + index);
  });

  const yearOptions = Array.from(
    { length: 12 },
    (_, index) => yearPageStart + index
  );

  const formatDate = (date: Date) => {
    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dateDay = String(date.getDate()).padStart(2, "0");

    return `${dateYear}-${dateMonth}-${dateDay}`;
  };

  const displayDate = value
    ? value.split("-").reverse().join("/")
    : "dd/mm/yyyy";

  const toggleCalendar = () => {
    const nextOpen = !open;

    if (nextOpen) {
      window.dispatchEvent(
        new CustomEvent("faculty-profile-dropdown-open", {
          detail: calendarId,
        })
      );

      setMode("days");
      setYearPageStart(Math.floor(year / 12) * 12);
    }

    setOpen(nextOpen);
  };

  return (
    <div
      ref={calendarRef}
      className={`institutionField institutionEditableField institutionCalendarDateField ${
        open ? "institutionCalendarDateFieldOpen" : ""
      }`}
    >
      <div className="institutionFieldText">
        <div className="institutionFieldLabel">{label}</div>

        <button
          type="button"
          className="institutionCalendarDateTrigger"
          onClick={toggleCalendar}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span
            className={
              value
                ? "institutionCalendarDateValue"
                : "institutionCalendarDatePlaceholder"
            }
          >
            {displayDate}
          </span>
        </button>
      </div>

      <button
        type="button"
        className="institutionFieldAction institutionFieldCalendar institutionCalendarDateAction"
        onClick={toggleCalendar}
        aria-label={`Choose ${label}`}
        aria-expanded={open}
      >
        <IconImage src={images.calendar} width={18} height={18} />
      </button>

      {open && (
        <div
          className="institutionDateCalendarPopup"
          role="dialog"
          aria-label={`Choose ${label}`}
        >
          <div className="institutionDateCalendarTopRow">
            <button
              type="button"
              className="institutionDateCalendarMainArrow"
              aria-label="Previous month"
              onClick={() => {
                setVisibleMonth(
                  new Date(year, monthIndex - 1, 1)
                );
                setMode("days");
              }}
            >
              ‹
            </button>

            <button
              type="button"
              className="institutionDateCalendarHeaderSelect institutionDateCalendarMonthButton"
              aria-label="Choose month"
              aria-expanded={mode === "months"}
              onClick={() =>
                setMode((current) =>
                  current === "months" ? "days" : "months"
                )
              }
            >
              <span>{months[monthIndex]}</span>
              <span
                className="institutionDateCalendarChevron"
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>

            <button
              type="button"
              className="institutionDateCalendarHeaderSelect institutionDateCalendarYearButton"
              aria-label="Choose year"
              aria-expanded={mode === "years"}
              onClick={() => {
                setYearPageStart(Math.floor(year / 12) * 12);
                setMode((current) =>
                  current === "years" ? "days" : "years"
                );
              }}
            >
              <span>{year}</span>
              <span
                className="institutionDateCalendarChevron"
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>

            <button
              type="button"
              className="institutionDateCalendarMainArrow"
              aria-label="Next month"
              onClick={() => {
                setVisibleMonth(
                  new Date(year, monthIndex + 1, 1)
                );
                setMode("days");
              }}
            >
              ›
            </button>
          </div>

          {mode === "years" ? (
            <div className="institutionDateCalendarYearPanel">
              <div className="institutionDateCalendarRangeRow">
                <button
                  type="button"
                  className="institutionDateCalendarRangeArrow"
                  aria-label="Previous years"
                  onClick={() =>
                    setYearPageStart((current) => current - 12)
                  }
                >
                  ‹
                </button>

                <strong>
                  {yearPageStart} - {yearPageStart + 11}
                </strong>

                <button
                  type="button"
                  className="institutionDateCalendarRangeArrow"
                  aria-label="Next years"
                  onClick={() =>
                    setYearPageStart((current) => current + 12)
                  }
                >
                  ›
                </button>
              </div>

              <div className="institutionDateCalendarYearGrid">
                {yearOptions.map((yearOption) => (
                  <button
                    key={yearOption}
                    type="button"
                    className={`institutionDateCalendarYearOption ${
                      yearOption === year
                        ? "institutionDateCalendarOptionSelected"
                        : ""
                    }`}
                    onClick={() => {
                      setVisibleMonth(
                        new Date(yearOption, monthIndex, 1)
                      );
                      setMode("days");
                    }}
                  >
                    {yearOption}
                  </button>
                ))}
              </div>
            </div>
          ) : mode === "months" ? (
            <div className="institutionDateCalendarMonthGrid">
              {months.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  className={`institutionDateCalendarMonthOption ${
                    index === monthIndex
                      ? "institutionDateCalendarOptionSelected"
                      : ""
                  }`}
                  onClick={() => {
                    setVisibleMonth(new Date(year, index, 1));
                    setMode("days");
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div
                className="institutionDateCalendarWeekdays"
                aria-hidden="true"
              >
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                  (weekday) => (
                    <span key={weekday}>{weekday}</span>
                  )
                )}
              </div>

              <div className="institutionDateCalendarGrid">
                {calendarDays.map((date) => {
                  const dateValue = formatDate(date);
                  const isCurrentMonth =
                    date.getMonth() === monthIndex;
                  const isSelected = value === dateValue;
                  const unavailable = Boolean(maxDate && dateValue > maxDate);

                  return (
                    <button
                      key={dateValue}
                      type="button"
                      className={`institutionDateCalendarDay ${
                        !isCurrentMonth
                          ? "institutionDateCalendarDayOutside"
                          : ""
                      } ${
                        isSelected
                          ? "institutionDateCalendarDaySelected"
                          : ""
                      }`}
                      aria-disabled={unavailable}
                      style={unavailable ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                      onClick={() => {
                        if (unavailable) {
                          onValidationError?.("Issue Date cannot be after today.");
                          return;
                        }
                        onChange(dateValue);

                        if (!isCurrentMonth) {
                          setVisibleMonth(
                            new Date(
                              date.getFullYear(),
                              date.getMonth(),
                              1
                            )
                          );
                        }

                        setOpen(false);
                        setMode("days");
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  visualIcon?: "select" | "edit";
  menuStyle?: "default" | "radio";
  entireFieldClickable?: boolean;
};

function SelectField({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
  className = "",
  visualIcon = "select",
  menuStyle = "default",
  entireFieldClickable = true,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectId = useId();
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeSelect = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const closeOtherDropdown = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== selectId) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSelect);
    window.addEventListener(
      "faculty-profile-dropdown-open",
      closeOtherDropdown as EventListener
    );

    return () => {
      document.removeEventListener("mousedown", closeSelect);
      window.removeEventListener(
        "faculty-profile-dropdown-open",
        closeOtherDropdown as EventListener
      );
    };
  }, [selectId]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const isRadioMenu = menuStyle === "radio";
  const shouldScroll = isRadioMenu && options.length > 4;
  const toggleSelectOpen = () => {
    const nextOpen = !open;
    if (nextOpen) {
      window.dispatchEvent(new CustomEvent("faculty-profile-dropdown-open", { detail: selectId }));
    }
    setOpen(nextOpen);
  };

  return (
    <div
      ref={selectRef}
      className={`institutionField institutionSelectField ${
        isRadioMenu ? "institutionRadioSelectField" : ""
      } ${open ? "institutionSelectFieldOpen" : ""} ${className}`}
      onClick={(event) => {
        if (!entireFieldClickable) return;
        if ((event.target as HTMLElement).closest("button")) return;
        toggleSelectOpen();
      }}
    >
      <div id={labelId} className="institutionFieldLabel">
        {label}
      </div>

      <div className="institutionSelectWrap">
        <button
          id={selectId}
          type="button"
          className="institutionSelect institutionCustomSelectTrigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={labelId}
          aria-controls={listboxId}
          onClick={toggleSelectOpen}
        >
          <span
            className={
              value
                ? "institutionSelectCurrentValue"
                : "institutionSelectPlaceholderValue"
            }
          >
            {value || placeholder}
          </span>

          {visualIcon === "edit" ? (
            <span
              className="institutionFieldAction institutionFieldPencil"
              aria-hidden="true"
            >
              <IconImage src={images.edit} width={18} height={18} />
            </span>
          ) : (
            <IconImage
              src={images.arrowDown}
              width={30}
              height={30}
              className={`institutionSelectArrow ${
                open ? "institutionSelectArrowOpen" : ""
              }`}
            />
          )}
        </button>

        {open && (
          <div
            id={listboxId}
            className={`institutionCustomSelectList ${
              isRadioMenu ? "institutionRadioSelectList" : ""
            } ${
              shouldScroll ? "institutionRadioSelectListScrollable" : ""
            }`}
            role="listbox"
            aria-labelledby={labelId}
          >
            {!isRadioMenu && (
              <button
                type="button"
                className={`institutionCustomSelectOption ${
                  !value ? "institutionCustomSelectOptionActive" : ""
                }`}
                role="option"
                aria-selected={!value}
                onClick={() => handleSelect("")}
              >
                {placeholder}
              </button>
            )}

            {options.map((option) => {
              const selected = value === option;

              return (
                <button
                  key={option}
                  type="button"
                  className={`institutionCustomSelectOption ${
                    isRadioMenu ? "institutionRadioSelectOption" : ""
                  } ${
                    selected ? "institutionCustomSelectOptionActive" : ""
                  }`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(option)}
                >
                  {isRadioMenu && (
                    <span
                      className={`institutionRadioSelectCircle ${
                        selected ? "institutionRadioSelectCircleActive" : ""
                      }`}
                      aria-hidden="true"
                    >
                      {selected && (
                        <span className="institutionRadioSelectCheck">✓</span>
                      )}
                    </span>
                  )}

                  <span className="institutionRadioSelectOptionText">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

type MultiSelectFieldProps = {
  label: string;
  value: string[];
  options: string[];
  placeholder?: string;
  onChange: (value: string[]) => void;
  className?: string;
};

function MultiSelectField({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
  className = "",
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectId = useId();
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeSelect = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const closeOtherDropdown = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== selectId) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSelect);
    window.addEventListener(
      "faculty-profile-dropdown-open",
      closeOtherDropdown as EventListener
    );

    return () => {
      document.removeEventListener("mousedown", closeSelect);
      window.removeEventListener(
        "faculty-profile-dropdown-open",
        closeOtherDropdown as EventListener
      );
    };
  }, [selectId]);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const displayValue = value.length ? value.join(", ") : placeholder;
  const shouldScroll = options.length > 4;

  return (
    <div
      ref={selectRef}
      className={`institutionField institutionSelectField institutionRadioSelectField institutionMultiSelectField ${
        open ? "institutionSelectFieldOpen" : ""
      } ${className}`}
    >
      <div id={labelId} className="institutionFieldLabel">
        {label}
      </div>

      <div className="institutionSelectWrap">
        <button
          id={selectId}
          type="button"
          className="institutionSelect institutionCustomSelectTrigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={labelId}
          aria-controls={listboxId}
          onClick={() => {
            const nextOpen = !open;
            if (nextOpen) {
              window.dispatchEvent(
                new CustomEvent("faculty-profile-dropdown-open", {
                  detail: selectId,
                })
              );
            }
            setOpen(nextOpen);
          }}
        >
          <span
            className={
              value.length
                ? "institutionSelectCurrentValue"
                : "institutionSelectPlaceholderValue"
            }
          >
            {displayValue}
          </span>

          <IconImage
            src={images.arrowDown}
            width={30}
            height={30}
            className={`institutionSelectArrow ${
              open ? "institutionSelectArrowOpen" : ""
            }`}
          />
        </button>

        {open && (
          <div
            id={listboxId}
            className={`institutionCustomSelectList institutionRadioSelectList ${
              shouldScroll ? "institutionRadioSelectListScrollable" : ""
            }`}
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={labelId}
          >
            {options.map((option) => {
              const selected = value.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  className={`institutionCustomSelectOption institutionRadioSelectOption ${
                    selected ? "institutionCustomSelectOptionActive" : ""
                  }`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggleOption(option)}
                >
                  <span
                    className={`institutionMultiSelectCheck ${
                      selected ? "institutionMultiSelectCheckActive" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <span className="institutionMultiSelectCheckMark" />
                  </span>

                  <span className="institutionRadioSelectOptionText">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


type PhoneCountrySelectProps = {
  label: string;
  country: Country | null;
  value: string;
  onCountryChange: (country: Country) => void;
  onChange: (value: string) => void;
};

const PHONE_COUNTRIES = getCountries();
const countryNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const getCountryName = (country: Country) =>
  countryNames?.of(country) || country;

const getCountryMaxDigits = (country: Country) => {
  const example = getExampleNumber(country, examples);

  if (example?.nationalNumber) {
    return example.nationalNumber.length;
  }

  // Safe fallback only when the library has no mobile example.
  return 15 - getCountryCallingCode(country).length;
};

function PhoneCountrySelect({
  label,
  country,
  value,
  onCountryChange,
  onChange,
}: PhoneCountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [search, setSearch] = useState("");

  /* Keep edits local until Apply is clicked. */
  const [pendingCountry, setPendingCountry] = useState<Country | null>(country);
  const [pendingValue, setPendingValue] = useState(value);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectId = useId();

  /* Value shown in the CLOSED top field = last applied value only. */
  const callingCode = country
    ? `+${getCountryCallingCode(country)}`
    : "";

  /* Values used inside the OPEN editor. */
  const pendingCallingCode = pendingCountry
    ? `+${getCountryCallingCode(pendingCountry)}`
    : "";

  const pendingMaxDigits = pendingCountry
    ? getCountryMaxDigits(pendingCountry)
    : 15;

  const filteredCountries = PHONE_COUNTRIES.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const name = getCountryName(item).toLowerCase();
    const code = `+${getCountryCallingCode(item)}`;

    return (
      name.includes(q) ||
      item.toLowerCase().includes(q) ||
      code.includes(q)
    );
  });

  /* If the saved parent value changes while closed, keep draft in sync. */
  useEffect(() => {
    if (!open) {
      setPendingCountry(country);
      setPendingValue(value);
    }
  }, [country, value, open]);

  const discardPendingChanges = () => {
    setPendingCountry(country);
    setPendingValue(value);
    setCountryOpen(false);
    setSearch("");
    setOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setPendingCountry(country);
        setPendingValue(value);
        setOpen(false);
        setCountryOpen(false);
        setSearch("");
      }
    };

    const closeOtherDropdown = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== selectId) {
        setPendingCountry(country);
        setPendingValue(value);
        setOpen(false);
        setCountryOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener(
      "faculty-profile-dropdown-open",
      closeOtherDropdown as EventListener
    );

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener(
        "faculty-profile-dropdown-open",
        closeOtherDropdown as EventListener
      );
    };
  }, [selectId, country, value]);

  useEffect(() => {
    if (countryOpen) {
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [countryOpen]);

  const openMainField = () => {
    const nextOpen = !open;

    if (nextOpen) {
      /* Every new open starts from the last applied values. */
      setPendingCountry(country);
      setPendingValue(value);

      window.dispatchEvent(
        new CustomEvent("faculty-profile-dropdown-open", {
          detail: selectId,
        })
      );
    } else {
      /* Closing with the top arrow works like Cancel. */
      setPendingCountry(country);
      setPendingValue(value);
      setCountryOpen(false);
      setSearch("");
    }

    setOpen(nextOpen);
  };

  const openCountryList = () => {
    if (!countryOpen) {
      window.dispatchEvent(
        new CustomEvent("faculty-profile-dropdown-open", {
          detail: selectId,
        })
      );
    }

    setCountryOpen(true);
  };

  const handleNumberChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");

    if (!pendingCountry) {
      setPendingValue("");
      return;
    }

    setPendingValue(digits.slice(0, pendingMaxDigits));
  };

  const selectCountry = (nextCountry: Country) => {
    setPendingCountry(nextCountry);

    const nextMaxDigits = getCountryMaxDigits(nextCountry);
    setPendingValue((current) =>
      current.replace(/\D/g, "").slice(0, nextMaxDigits)
    );

    setCountryOpen(false);
    setSearch("");
  };

  const applyPhoneChanges = () => {
    if (pendingCountry) {
      onCountryChange(pendingCountry);
    }

    onChange(pendingValue);

    setCountryOpen(false);
    setSearch("");
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`institutionPhoneAccordion ${
        open ? "institutionPhoneAccordionOpen" : ""
      }`}
    >
      <button
        type="button"
        className="institutionField institutionPhoneMainTrigger"
        aria-expanded={open}
        onClick={openMainField}
      >
        <span className="institutionPhoneMainText">
          <span className="institutionFieldLabel">{label}</span>

          <span
            className={
              country && value
                ? "institutionPhoneMainSavedValue"
                : "institutionSelectPlaceholderValue"
            }
          >
            {country && value ? `${callingCode} ${value}` : "Select"}
          </span>
        </span>

        <IconImage
          src={images.arrowDown}
          width={30}
          height={30}
          className={`institutionSelectArrow institutionPhoneMainArrow ${
            open ? "institutionSelectArrowOpen" : ""
          }`}
        />
      </button>

      {open && (
        <div className="institutionPhonePanel">
          <div className="institutionPhonePanelLabel">Country Code</div>

          <div className="institutionPhoneCountryBox">
            <div
              className={`institutionPhoneCountryTrigger ${
                countryOpen ? "institutionPhoneCountryTriggerOpen" : ""
              }`}
              onClick={openCountryList}
            >
              <span
                className="institutionPhoneSearchMini"
                aria-hidden="true"
              />

              <input
                ref={searchRef}
                type="text"
                value={
                  countryOpen
                    ? search
                    : pendingCountry
                      ? `${getCountryName(pendingCountry)}`
                      : ""
                }
                onFocus={openCountryList}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCountryOpen(true);
                }}
                className="institutionPhoneCountrySearchInput"
                placeholder="Search Country"
                aria-label="Search Country"
                autoComplete="off"
              />

              {pendingCountry && !countryOpen && (
                <span className="institutionPhoneSelectedCountryCode">
                  {pendingCountry} ({pendingCallingCode})
                </span>
              )}

              <IconImage
                src={images.arrowDown}
                width={24}
                height={24}
                className={`institutionPhoneArrow ${
                  countryOpen ? "institutionPhoneArrowOpen" : ""
                }`}
              />
            </div>

            {countryOpen && (
              <div className="institutionPhoneCountryMenu">
                <div
                  className="institutionPhoneCountryList institutionRadioSelectListScrollable"
                  role="listbox"
                >
                  {filteredCountries.map((item) => {
                    const selected = pendingCountry === item;
                    const ItemFlag = flags[item];
                    const itemCallingCode =
                      `+${getCountryCallingCode(item)}`;

                    return (
                      <button
                        type="button"
                        key={item}
                        className={`institutionCustomSelectOption institutionRadioSelectOption institutionPhoneCountryOption ${
                          selected
                            ? "institutionCustomSelectOptionActive institutionPhoneCountryOptionSelected"
                            : ""
                        }`}
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectCountry(item)}
                      >
                        <span className="institutionPhoneCountryName">
                          <span className="institutionPhoneFlag">
                            {ItemFlag ? (
                              <ItemFlag
                                title={getCountryName(item)}
                              />
                            ) : null}
                          </span>

                          <span className="institutionPhoneCountryText">
                            {item} ({itemCallingCode}) - {getCountryName(item)}
                          </span>
                        </span>

                        <span
                          className={`institutionRadioSelectCircle ${
                            selected
                              ? "institutionRadioSelectCircleActive"
                              : ""
                          }`}
                          aria-hidden="true"
                        >
                          {selected && (
                            <span className="institutionRadioSelectCheck">
                              ✓
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="institutionPhonePanelLabel institutionPhoneNumberTitle">
            {label}
          </div>

          <div
            className={`institutionPhoneNumberInputWrap ${
              !pendingCountry ? "institutionPhoneNumberInputDisabled" : ""
            }`}
          >
            <input
              type="tel"
              inputMode="numeric"
              className="institutionPhoneNumberInput"
              value={pendingValue}
              disabled={!pendingCountry}
              maxLength={pendingMaxDigits}
              placeholder={
                pendingCountry
                  ? `Enter ${pendingMaxDigits} Digit Mobile number`
                  : "Select Country First"
              }
              onChange={(event) =>
                handleNumberChange(event.target.value)
              }
            />
          </div>

          <div className="institutionPhonePanelActions">
            <button
              type="button"
              className="institutionPhonePanelAction institutionPhonePanelCancel"
              onClick={discardPendingChanges}
            >
              Cancel
            </button>

            <button
              type="button"
              className="institutionPhonePanelAction institutionPhonePanelApply"
              onClick={applyPhoneChanges}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  iconSrc: string;
  iconTone: "purple" | "pink" | "green" | "blue" | "orange";
  editing: boolean;
  popupType?: "saved" | "discarded" | "error" | null;
  popupMessage?: string;
  onEdit: () => void;
};

function SectionHeader({
  title,
  iconSrc,
  iconTone,
  editing,
  popupType = null,
  popupMessage,
  onEdit,
}: SectionHeaderProps) {
  return (
    <div className={`institutionInformationHeader ${popupType ? "institutionInformationHeaderHasPopup" : ""} ${editing ? "institutionInformationHeaderEditing" : ""}`}>
      <div className="institutionInformationTitle">
        <span
          className={`institutionSectionIcon ${
            iconTone === "pink"
              ? "institutionPinkIcon"
              : iconTone === "green"
                ? "institutionGreenIcon"
                : iconTone === "blue"
                  ? "institutionBlueIcon"
                  : iconTone === "orange"
                    ? "institutionOrangeIcon"
                    : "institutionPurpleIcon"
          }`}
        >
          <IconImage
            src={iconSrc}
            width={24}
            height={24}
            className="institutionWhiteIcon"
          />
        </span>
        <h2>{title}</h2>
      </div>

      <div className="institutionHeaderActions">
        {popupType && (
          <div
            className={`institutionInlinePopup ${
              popupType === "saved"
                ? "institutionInlinePopupSaved"
                : popupType === "error"
                  ? "institutionInlinePopupDiscarded"
                  : "institutionInlinePopupDiscarded"
            }`}
            role="status"
            aria-live="polite"
          >
            <IconImage
              src={popupType === "saved" ? images.clap : images.sad}
              width={18}
              height={18}
              className="institutionInlinePopupIcon"
            />
            <span>
              {popupType === "saved"
                ? "Changes Saved"
                : popupType === "error"
                  ? popupMessage || "Please enter valid information"
                  : "Changes Discarded"}
            </span>
          </div>
        )}

        {editing && title === "Registration Data" ? (
          <button
            type="button"
            className="institutionEditButton"
            aria-label="Close Registration Data locked view"
            onClick={() => window.dispatchEvent(new CustomEvent("student-registration-lock-close"))}
          >
            <Image
              src={images.lock}
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
          </button>
        ) : !editing && !popupType ? (
          <button
            type="button"
            className="institutionEditButton"
            aria-label={`Edit ${title}`}
            onClick={onEdit}
          >
            <Image
              src={images.editBig}
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

type GovernmentIdRaisedDropdownProps = {
  id: string;
  label?: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  compact?: boolean;
  disabled?: boolean;
};

const GovernmentIdRaisedDropdown = ({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
  compact = false,
  disabled = false,
}: GovernmentIdRaisedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const content = (
    <div
      ref={dropdownRef}
      className={`raisedSelect ${compact ? "raisedSelectCompact" : ""} ${
        isOpen ? "raisedSelectOpen" : ""
      }`}
    >
      <button
        id={id}
        type="button"
        className="raisedSelectButton"
        aria-haspopup="listbox"
        aria-expanded={!disabled && isOpen}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((current) => !current);
        }}
      >
        <span className={!value ? "raisedSelectPlaceholder" : ""}>
          {value || placeholder}
        </span>
        <span
          className={`raisedSelectArrow ${
            isOpen ? "raisedSelectArrowOpen" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {!disabled && isOpen && (
        <div
          className="raisedSelectMenu"
          role="listbox"
          aria-label={label || placeholder}
        >
          {options.map((option) => {
            const selected = value === option;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                className={`raisedSelectOption ${
                  selected ? "raisedSelectOptionSelected" : ""
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span
                  className={`raisedSelectRadio ${
                    selected ? "raisedSelectRadioSelected" : ""
                  }`}
                  aria-hidden="true"
                >
                  {selected ? "✓" : ""}
                </span>
                <span className="raisedSelectOptionText">{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <div
      className={`infoField selectInfoField raisedSelectField ${
        isOpen ? "raisedSelectFieldOpen" : ""
      }`}
    >
      {label && <div className="infoLabel">{label}</div>}
      {content}
    </div>
  );
};

export default function FacultyUniversityPage() {
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("02:26PM");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<SectionName | null>(null);
  const [registrationLockedView, setRegistrationLockedView] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const [profilePhotoCompleted, setProfilePhotoCompleted] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(true);
  const [professionalProfileCompleted, setProfessionalProfileCompleted] = useState(false);
  const [skillsDevelopmentCompleted, setSkillsDevelopmentCompleted] = useState(false);
  const [documentsCompleted, setDocumentsCompleted] = useState(false);
  const [flowPopup, setFlowPopup] = useState<string | null>(null);
  const [flowPopupSection, setFlowPopupSection] = useState<SectionName | "profile" | "confirmation" | null>(null);
  const flowPopupTimerRef = useRef<number | null>(null);

  const showFlowPopup = (
    message: string,
    section: SectionName | "profile" | "confirmation"
  ) => {
    setFlowPopup(message);
    setFlowPopupSection(section);

    if (flowPopupTimerRef.current) {
      window.clearTimeout(flowPopupTimerRef.current);
    }

    flowPopupTimerRef.current = window.setTimeout(() => {
      setFlowPopup(null);
      setFlowPopupSection(null);
      flowPopupTimerRef.current = null;
    }, 3000);
  };
  const [governmentIdDocumentType, setGovernmentIdDocumentType] = useState("");

  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({
    "Government ID Proof": null,
    "Resume": null,
  });

  const [documentUploadErrors, setDocumentUploadErrors] = useState<
    Record<string, string>
  >({});
  const documentFilesBeforeEditRef = useRef<Record<string, File | null> | null>(
    null
  );
  const governmentIdDocumentTypeBeforeEditRef = useRef<string | null>(null);

  const [sectionPopup, setSectionPopup] = useState<{
    section: SectionName;
    type: "saved" | "discarded" | "error";
    message?: string;
  } | null>(null);

  const [registrationInfo, setRegistrationInfo] = useState({
    userId: "STU2026-00125",
    fullName: "Antony Thomas",
    email: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: "2004-05-17",
    academicYear: "",
    passOutYear: "",
    onboardingDate: "18-08-2026",
    department: "",
    branch: "",
    specialization: "",
    yearOfStudy: "",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    preferredName: "",
    nationality: "",
    identityDocumentType: "",
    identityDocumentNumber: "",
    issuingCountry: "",
    alternateContact: "",
    alternateEmail: "",
    educationLevel: "",
    qualification: "",
    institutionName: "",
    fieldOfStudy: "",
    gradingSystem: "",
    gradeScore: "",
    startYear: "",
    endYear: "",
  });

  const [skillsInfo, setSkillsInfo] = useState({
    certificationName: "",
    issuingOrganisation: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    careerGoal: "",
    preferredRole: [] as string[],
    preferredIndustry: [] as string[],
    learningGoal: [] as string[],
    preferredLearningMode: [] as string[],
    skillName: "",
    category: "",
    domain: "",
    selfRatedLevel: "",
    portfolioLink: "",
    linkedinUrl: "",
    instagramId: "",
    facebookUrl: "",
    githubUrl: "",
    twitterX: "",
    portfolioEvidence: "",
    personalWebsite: "",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [mobileCountry, setMobileCountry] = useState<Country | null>(null);
  const [alternatePhoneCountry, setAlternatePhoneCountry] =
    useState<Country | null>(null);
  const [professionalDraft, setProfessionalDraft] = useState(professionalInfo);
  const [skillsDraft, setSkillsDraft] = useState(skillsInfo);

  const editingSectionRef = useRef<SectionName | null>(editingSection);
  const registrationDraftRef = useRef(registrationDraft);
  const professionalDraftRef = useRef(professionalDraft);
  const skillsDraftRef = useRef(skillsDraft);

  useEffect(() => {
    editingSectionRef.current = editingSection;
    registrationDraftRef.current = registrationDraft;
    professionalDraftRef.current = professionalDraft;
    skillsDraftRef.current = skillsDraft;
  }, [editingSection, registrationDraft, professionalDraft, skillsDraft]);

  const startSectionEdit = (section: SectionName) => {
    setSectionPopup(null);
    setRegistrationLockedView(false);

    let professionalReady = professionalProfileCompleted;
    let skillsReady = skillsDevelopmentCompleted;

    if (editingSection && editingSection !== section) {
      if (editingSection === "professional") {
        const nameError = getUniversityAcademicError(professionalDraft);
        if (nameError) {
          showSectionError("professional", nameError);
          return;
        }
        const complete =
          professionalDraft.nationality &&
          professionalDraft.identityDocumentType &&
          professionalDraft.issuingCountry &&
          professionalDraft.educationLevel &&
          professionalDraft.qualification &&
          professionalDraft.institutionName &&
          professionalDraft.fieldOfStudy &&
          professionalDraft.gradingSystem &&
          professionalDraft.startYear &&
          professionalDraft.endYear;

        if (!complete) {
          showSectionError(
            "professional",
            "Please complete the required Academic Profile fields."
          );
          return;
        }

        setProfessionalInfo({ ...professionalDraft });
        setProfessionalProfileCompleted(true);
        professionalReady = true;
      }

      if (editingSection === "skills") {
        const credentialError = getUniversityCredentialError(skillsDraft) || getDigitalLinkError(skillsDraft);
        if (credentialError) {
          showSectionError("skills", credentialError);
          return;
        }
        const complete =
          skillsDraft.certificationName &&
          skillsDraft.issuingOrganisation &&
          skillsDraft.careerGoal &&
          skillsDraft.preferredRole.length > 0 &&
          skillsDraft.preferredIndustry.length > 0 &&
          skillsDraft.learningGoal.length > 0 &&
          skillsDraft.preferredLearningMode.length > 0 &&
          skillsDraft.skillName &&
          skillsDraft.category &&
          skillsDraft.domain &&
          skillsDraft.selfRatedLevel &&
          skillsDraft.portfolioEvidence;

        if (!complete) {
          showSectionError(
            "skills",
            "Please complete the required Digital Profile fields."
          );
          return;
        }

        setSkillsInfo({
          ...skillsDraft,
        portfolioLink: normalizeDigitalLink(skillsDraft.portfolioLink),
        linkedinUrl: normalizeDigitalLink(skillsDraft.linkedinUrl),
        githubUrl: normalizeDigitalLink(skillsDraft.githubUrl),
        personalWebsite: normalizeDigitalLink(skillsDraft.personalWebsite),
          preferredRole: [...skillsDraft.preferredRole],
          preferredIndustry: [...skillsDraft.preferredIndustry],
          learningGoal: [...skillsDraft.learningGoal],
          preferredLearningMode: [...skillsDraft.preferredLearningMode],
        });
        setSkillsDevelopmentCompleted(true);
        skillsReady = true;
      }

      if (editingSection === "documents") {
        const documentError = getDocumentSectionError();
        if (documentError) {
          showSectionError("documents", documentError);
          return;
        }

        setDocumentsCompleted(true);
        documentFilesBeforeEditRef.current = null;
        governmentIdDocumentTypeBeforeEditRef.current = null;
      }
    }

    if (section === "skills" && !professionalReady) {
      showFlowPopup("Please Complete Academic Profile", "skills");
      return;
    }

    if (section === "documents" && !skillsReady) {
      showFlowPopup(
        "Please Complete Digital Profile",
        "documents"
      );
      return;
    }

    if (section === "professional") {
      setProfessionalDraft({ ...professionalInfo });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        preferredRole: [...skillsInfo.preferredRole],
        preferredIndustry: [...skillsInfo.preferredIndustry],
        learningGoal: [...skillsInfo.learningGoal],
        preferredLearningMode: [...skillsInfo.preferredLearningMode],
      });
    }

    if (section === "documents") {
      documentFilesBeforeEditRef.current = { ...documentFiles };
      governmentIdDocumentTypeBeforeEditRef.current =
        governmentIdDocumentType;
      setDocumentUploadErrors({});
    }

    setEditingSection(section);
  };

  const isValidPhoneNumber = (value: string, country: Country | null) => {
    if (!value || !country) return false;

    const digits = value.replace(/\D/g, "");
    const requiredDigits = getCountryMaxDigits(country);

    return digits.length === requiredDigits;
  };

  const isValidEmail = (value: string) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);


  const isValidOptionalContact = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true;

    if (!/^[+()\d\s-]+$/.test(trimmed)) return false;

    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  };

  const showSectionError = (section: SectionName, message: string) => {
    setSectionPopup({ section, type: "error", message });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === section && current.type === "error"
          ? null
          : current
      );
    }, 2500);
  };

  const clearSectionError = (section: SectionName) => {
    setSectionPopup((current) => current?.section === section && current.type === "error" ? null : current);
  };

  const getDocumentSectionError = (): string | null => {
    const uploadError = Object.values(documentUploadErrors).find(Boolean);
    if (uploadError) return uploadError;
    if (!governmentIdDocumentType.trim()) return "Documents: select the Government ID document type.";
    if (!documentFiles["Government ID Proof"]) return "Documents: upload Government ID Proof.";
    if (!documentFiles["Resume"]) return "Documents: upload Resume (PDF, DOC or DOCX).";
    return null;
  };

  const saveProfile = () => {
    const professionalSource =
      editingSection === "professional" ? professionalDraft : professionalInfo;

    const skillsSource =
      editingSection === "skills" ? skillsDraft : skillsInfo;

    const professionalComplete =
      professionalSource.nationality &&
      professionalSource.identityDocumentType &&
      professionalSource.issuingCountry &&
      professionalSource.educationLevel &&
      professionalSource.qualification &&
      professionalSource.institutionName &&
      professionalSource.fieldOfStudy &&
      professionalSource.gradingSystem &&
      professionalSource.startYear &&
      professionalSource.endYear;

    const skillsComplete =
      skillsSource.certificationName &&
      skillsSource.issuingOrganisation &&
      skillsSource.careerGoal &&
      skillsSource.preferredRole.length > 0 &&
      skillsSource.preferredIndustry.length > 0 &&
      skillsSource.learningGoal.length > 0 &&
      skillsSource.preferredLearningMode.length > 0 &&
      skillsSource.skillName &&
      skillsSource.category &&
      skillsSource.domain &&
      skillsSource.selfRatedLevel &&
      skillsSource.portfolioEvidence;

    const documentsComplete =
      governmentIdDocumentType.trim() !== "" &&
      documentFiles["Government ID Proof"] !== null &&
      documentFiles["Resume"] !== null;

    const documentError = getDocumentSectionError();

    if (!profilePhotoCompleted) {
      showFlowPopup(
        "Please complete Profile Photo before saving the profile.",
        "confirmation"
      );
      return;
    }

    const preferredNameError = getUniversityAcademicError(professionalSource);
    if (preferredNameError) {
      showSectionError("professional", preferredNameError);
      return;
    }

    if (!professionalComplete) {
      showFlowPopup(
        "Please complete Academic Profile before saving the profile.",
        "confirmation"
      );
      return;
    }

    const credentialError = getUniversityCredentialError(skillsSource) || getDigitalLinkError(skillsSource);
    if (credentialError) {
      showSectionError("skills", credentialError);
      return;
    }

    if (!skillsComplete) {
      showFlowPopup(
        "Please complete Digital Profile before saving the profile.",
        "confirmation"
      );
      return;
    }

    if (documentError || !documentsComplete) {
      const message = documentError || "Documents: upload Government ID Proof.";
      showSectionError("documents", message);
      showFlowPopup(message, "confirmation");
      return;
    }

    if (!confirmation) {
      showFlowPopup(
        "Please complete Confirmation before saving the profile.",
        "confirmation"
      );
      return;
    }

    if (editingSection === "professional") {
      setProfessionalInfo({ ...professionalDraft });
    }

    if (editingSection === "skills") {
      setSkillsInfo({
        ...skillsDraft,
        portfolioLink: normalizeDigitalLink(skillsDraft.portfolioLink),
        linkedinUrl: normalizeDigitalLink(skillsDraft.linkedinUrl),
        githubUrl: normalizeDigitalLink(skillsDraft.githubUrl),
        personalWebsite: normalizeDigitalLink(skillsDraft.personalWebsite),
        preferredRole: [...skillsDraft.preferredRole],
        preferredIndustry: [...skillsDraft.preferredIndustry],
        learningGoal: [...skillsDraft.learningGoal],
        preferredLearningMode: [...skillsDraft.preferredLearningMode],
      });
    }

    setProfessionalProfileCompleted(true);
    setSkillsDevelopmentCompleted(true);
    setDocumentsCompleted(true);
    setEditingSection(null);
    setShowDraftSaved(true);

    setDraftSavedTime(
      new Date()
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "")
    );

    window.location.assign("/sign_in");
  };

  const cancelProfile = () => {
    const emptyProfessionalInfo = {
      preferredName: "",
      nationality: "",
      identityDocumentType: "",
      identityDocumentNumber: "",
      issuingCountry: "",
      alternateContact: "",
      alternateEmail: "",
      educationLevel: "",
      qualification: "",
      institutionName: "",
      fieldOfStudy: "",
      gradingSystem: "",
      gradeScore: "",
      startYear: "",
      endYear: "",
    };

    const emptySkillsInfo = {
      certificationName: "",
      issuingOrganisation: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      careerGoal: "",
      preferredRole: [] as string[],
      preferredIndustry: [] as string[],
      learningGoal: [] as string[],
      preferredLearningMode: [] as string[],
      skillName: "",
      category: "",
      domain: "",
      selfRatedLevel: "",
      portfolioLink: "",
      linkedinUrl: "",
      instagramId: "",
      facebookUrl: "",
      githubUrl: "",
      twitterX: "",
      portfolioEvidence: "",
      personalWebsite: "",
    };

    setProfileImage(null);
    setProfilePhotoCompleted(false);

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }

    setProfessionalInfo(emptyProfessionalInfo);
    setProfessionalDraft(emptyProfessionalInfo);

    setSkillsInfo(emptySkillsInfo);
    setSkillsDraft(emptySkillsInfo);

    setGovernmentIdDocumentType("");
    setDocumentFiles({
      "Government ID Proof": null,
      "Resume": null,
    });
    setDocumentUploadErrors({});

    documentFilesBeforeEditRef.current = null;
    governmentIdDocumentTypeBeforeEditRef.current = null;

    document
      .querySelectorAll<HTMLInputElement>(".institutionNativeFileInput")
      .forEach((input) => {
        input.value = "";
      });

    setProfessionalProfileCompleted(false);
    setSkillsDevelopmentCompleted(false);
    setDocumentsCompleted(false);
    setConfirmation(false);

    setEditingSection(null);
    setRegistrationLockedView(false);
    setSectionPopup(null);
    setFlowPopup(null);
    setFlowPopupSection(null);
    setShowDraftSaved(false);
  };

  const handleProfileImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = await getProfilePhotoValidationError(file);
    if (error) {
      showFlowPopup(error, "profile");
      return; // Do not accept unsupported, oversized or corrupted photos.
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        setProfilePhotoCompleted(true);
        setFlowPopup(null);
        setFlowPopupSection(null);
      } else {
        showFlowPopup("Profile Photo could not be opened.", "profile");
      }
    };
    reader.onerror = () => {
      showFlowPopup("Profile Photo could not be read.", "profile");
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentFileSelect = (
    label: "Government ID Proof" | "Resume", file: File | null
  ) => {
    if (!file) return;

    const size = label === "Resume"
      ? { min: 0, max: 5 * MB, label: "up to 5 MB" }
      : getDocumentRecommendedSize(file);
    let message: string | null = null;
    if (!isAcceptedDocumentFile(label, file) || !size) {
      message = label === "Resume"
        ? "Resume: upload a PDF, DOC or DOCX file."
        : "Government ID Proof: upload a JPG, PNG, WebP, PDF, DOC or DOCX file.";
    } else if (file.size === 0) {
      message = label + ": the selected file is empty or corrupted.";
    } else if (file.size > size.max) {
      message = label === "Resume"
        ? "Resume must be 5 MB or less."
        : label + ": file exceeds the recommended size (" + size.label + ").";
    } else if (file.size < size.min) {
      message = label + ": file is below the recommended size (" + size.label + ").";
    }

    if (message) {
      setDocumentFiles((previous) => ({ ...previous, [label]: null }));
      setDocumentUploadErrors((previous) => ({ ...previous, [label]: message }));
      showSectionError("documents", message);
      return;
    }

    setDocumentFiles((previous) => ({ ...previous, [label]: file }));
    setDocumentUploadErrors((previous) => ({ ...previous, [label]: "" }));
    clearSectionError("documents");
    if (flowPopupSection === "documents" || flowPopupSection === "confirmation") {
      setFlowPopup(null);
      setFlowPopupSection(null);
    }
  };

  useEffect(() => {
    let popupTimer: number | undefined;

    const autoSaveDraft = () => {
      const currentSection = editingSectionRef.current;
      if (!currentSection) {
        return;
      }

      const formattedTime = new Date()
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      setDraftSavedTime(formattedTime);

      setShowDraftSaved(false);

      window.requestAnimationFrame(() => {
        setShowDraftSaved(true);
      });

      if (popupTimer) {
        window.clearTimeout(popupTimer);
      }

      popupTimer = window.setTimeout(() => {
        setShowDraftSaved(false);
      }, 3000);
    };

    const timer = window.setInterval(autoSaveDraft, 10000);

    return () => {
      window.clearInterval(timer);

      if (popupTimer) {
        window.clearTimeout(popupTimer);
      }
    };
  }, []);

  useEffect(() => {
    const source =
      editingSection === "professional" ? professionalDraft : professionalInfo;

    const complete = Boolean(
      !getUniversityAcademicError(source) &&
        source.nationality &&
        source.identityDocumentType &&
        source.issuingCountry &&
        source.educationLevel &&
        source.qualification &&
        source.institutionName &&
        source.fieldOfStudy &&
        source.gradingSystem &&
        source.startYear &&
        source.endYear
    );

    setProfessionalProfileCompleted(complete);
  }, [editingSection, professionalDraft, professionalInfo]);

  useEffect(() => {
    const source = editingSection === "skills" ? skillsDraft : skillsInfo;

    const complete = Boolean(
      !getUniversityCredentialError(source) &&
      !getDigitalLinkError(source) &&
      source.certificationName &&
        source.issuingOrganisation &&
        source.careerGoal &&
        source.preferredRole.length > 0 &&
        source.preferredIndustry.length > 0 &&
        source.learningGoal.length > 0 &&
        source.preferredLearningMode.length > 0 &&
        source.skillName &&
        source.category &&
        source.domain &&
        source.selfRatedLevel &&
        source.portfolioEvidence
    );

    setSkillsDevelopmentCompleted(complete);
  }, [editingSection, skillsDraft, skillsInfo]);

  useEffect(() => {
    const complete =
      governmentIdDocumentType.trim() !== "" &&
      documentFiles["Government ID Proof"] !== null &&
      documentFiles["Resume"] !== null &&
      !Object.values(documentUploadErrors).some((message) => Boolean(message));

    setDocumentsCompleted(complete);
  }, [governmentIdDocumentType, documentFiles, documentUploadErrors]);

  const completionItems = [
    profilePhotoCompleted,
    registrationCompleted,
    professionalProfileCompleted,
    skillsDevelopmentCompleted,
    documentsCompleted,
    confirmation,
  ];

  const completedItemCount = completionItems.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedItemCount / completionItems.length) * 100
  );

  useEffect(() => {
    document.title = "University Student Profile | Neuro LXP";
  }, []);

  useEffect(() => {
    const closeRegistrationLockedView = () => {
      setRegistrationLockedView(false);
    };

    window.addEventListener(
      "student-registration-lock-close",
      closeRegistrationLockedView
    );

    return () => {
      window.removeEventListener(
        "student-registration-lock-close",
        closeRegistrationLockedView
      );
    };
  }, []);


  return (
    <main className="superAdminPage institutionAdminPage">
      <div className="dashboardLayout">
        <Sidebar />

        <section className="mainContent">
          <Header />

          <div className="institutionScrollArea">
            <div className="pageContent institutionPageContent">
            <div className="institutionHeadingRow">
              <div>
                <h1>University Student Profile</h1>
                <p>
                  Manage Your Identity, Access, Preferences, And Activity With Ease.
                </p>
              </div>

              {showDraftSaved && (
                <div className="savedBadge" role="status" aria-live="polite">
                  <IconImage
                    src={images.completed}
                    width={16}
                    height={16}
                  />
                  <span>Draft Saved at {draftSavedTime}</span>
                </div>
              )}
            </div>

            <section className="institutionOverviewCard">
              {flowPopup && flowPopupSection === "profile" && (
                <div className="institutionProfilePhotoErrorPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} />
                  <span>{flowPopup}</span>
                </div>
              )}
              <div className="institutionIdentity">
                <div className="institutionAvatarWrap">
                  <div className="institutionAvatar">
                    <div className="institutionAvatarInner">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt="Antony Thomas"
                          fill
                          sizes="88px"
                          className="institutionAvatarImage"
                          unoptimized={profileImage.startsWith("data:")}
                        />
                      ) : (
                        <div className="institutionAvatarEmpty" />
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="institutionCameraButton"
                    aria-label="Change profile image"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    <IconImage src={images.camera} width={22} height={22} />
                  </button>

                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="institutionProfileImageInput"
                    onChange={handleProfileImageSelect}
                  />
                </div>

                <div className="institutionIdentityText">
                  <h2>Antony Thomas</h2>
                  <div className="institutionRole">University Student</div>

                  <div className="institutionActiveBadge">
                    <span className="institutionActiveDot" />
                    <span>Active</span>
                  </div>
                </div>
              </div>

              <div className="institutionDivider" />

              <div className="institutionCompletion">
                <div className="institutionCompletionHeader">
                  <h3>Profile Completion</h3>
                  <span
                    className={
                      completionPercentage === 100
                        ? "institutionCompletionComplete"
                        : ""
                    }
                  >
                    {completionPercentage}% Completed
                  </span>
                </div>

                <div className="institutionProgressTrack">
                  <div
                    className={`institutionProgressBar ${
                      completionPercentage === 100
                        ? "institutionProgressBarComplete"
                        : ""
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="institutionCompletionSteps">
                  <div className="institutionCompletionStep">
                    {profilePhotoCompleted ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Profile Photo</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {professionalProfileCompleted ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Academic Profile</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {documentsCompleted ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Documents</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {registrationCompleted ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Registration</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {skillsDevelopmentCompleted ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Digital Profile</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {confirmation ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Confirmation</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Registration Data"
                iconSrc={images.registration}
                iconTone="pink"
                editing={registrationLockedView}
                popupType={sectionPopup?.section === "registration" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "registration" ? sectionPopup.message : undefined}
                onEdit={() => setRegistrationLockedView(true)}
              />

              {registrationLockedView ? (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <EditField label="User ID" value={registrationInfo.userId} locked />
                  <EditField label="Full Name" value={registrationInfo.fullName} locked />
                  <EditField
                    label="Email"
                    value={registrationInfo.email || "Student@college.edu"}
                    locked
                  />

                  <EditField
                    label="Mobile Number"
                    value={
                      registrationInfo.mobileNumber && mobileCountry
                        ? `+${getCountryCallingCode(mobileCountry)} ${registrationInfo.mobileNumber}`
                        : registrationInfo.mobileNumber || "9521221322"
                    }
                    locked
                  />

                  <EditField
                    label="Gender"
                    value={registrationInfo.gender || "Male"}
                    locked
                  />

                  <EditField
                    label="Date of Birth"
                    value={registrationInfo.dateOfBirth}
                    locked
                  />

                  <EditField
                    label="Academic Year"
                    value={registrationInfo.academicYear || "2026–27"}
                    locked
                  />

                  <EditField
                    label="Pass-out Year"
                    value={registrationInfo.passOutYear || "2027"}
                    locked
                  />

                  <EditField
                    label="Onboarding Date"
                    value={registrationInfo.onboardingDate}
                    locked
                  />

                  <EditField
                    label="Department"
                    value={registrationInfo.department || "Computer Science"}
                    locked
                  />

                  <EditField
                    label="Branch"
                    value={registrationInfo.branch || "Computer Science"}
                    locked
                  />

                  <EditField
                    label="Specialization"
                    value={registrationInfo.specialization || "Artificial Intelligence"}
                    locked
                  />

                  <EditField
                    label="Year of Study"
                    value={registrationInfo.yearOfStudy || "3rd Year"}
                    locked
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <DisplayField label="User ID" value={registrationInfo.userId} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField label="Email" value={registrationInfo.email} placeholder="Student@college.edu" />
                  <DisplayField
                    label="Mobile Number"
                    value={
                      registrationInfo.mobileNumber && mobileCountry
                        ? `+${getCountryCallingCode(mobileCountry)} ${registrationInfo.mobileNumber}`
                        : registrationInfo.mobileNumber
                    }
                    placeholder="9521221322"
                  />
                  <DisplayField label="Gender" value={registrationInfo.gender} placeholder="Male" />
                  <DisplayField label="Date of Birth" value={registrationInfo.dateOfBirth} />
                  <DisplayField label="Academic Year" value={registrationInfo.academicYear} placeholder="2026–27" />
                  <DisplayField label="Pass-out Year" value={registrationInfo.passOutYear} placeholder="2027" />
                  <DisplayField label="Onboarding Date" value={registrationInfo.onboardingDate} placeholder="18-08-2026" />
                  <DisplayField label="Department" value={registrationInfo.department} placeholder="Computer Science" />
                  <DisplayField label="Branch" value={registrationInfo.branch} placeholder="Computer Science" />
                  <DisplayField label="Specialization" value={registrationInfo.specialization} placeholder="Artificial Intelligence" />
                  <DisplayField label="Year of Study" value={registrationInfo.yearOfStudy} placeholder="3rd Year" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Academic Profile"
                iconSrc={images.academicProfessional}
                iconTone="green"
                editing={editingSection === "professional"}
                popupType={sectionPopup?.section === "professional" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "professional" ? sectionPopup.message : undefined}
                onEdit={() => startSectionEdit("professional")}
              />

              {flowPopup && flowPopupSection === "professional" && (
                <div className="institutionSectionFlowPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} className="institutionInlinePopupIcon" />
                  <span>{flowPopup}</span>
                </div>
              )}

              {editingSection === "professional" ? (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <EditField
                    label="Preferred Name"
                    value={professionalDraft.preferredName}
                    placeholder="Enter Preferred Name"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, preferredName: value }))}
                    validate={validatePreferredName}
                    onValidationError={(message) => showSectionError("professional", message)}
                    validateOnBlurOnly
                    clearInvalidOnBlur
                    maxLength={50}
                    visualIcon="edit"
                  />

                  <SelectField
                    label="Nationality"
                    value={professionalDraft.nationality}
                    placeholder="Select"
                    menuStyle="radio"
                    entireFieldClickable
                    options={["Indian", "American", "British", "Australian", "Canadian", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, nationality: value }))}
                  />

                  <SelectField
                    label="Identity Document Type"
                    value={professionalDraft.identityDocumentType}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Aadhaar", "Passport", "PAN Card", "Driving Licence", "Voter ID", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, identityDocumentType: value, identityDocumentNumber: "" }))}
                  />

                  <EditField
                    label="Identity Document Number"
                    value={professionalDraft.identityDocumentNumber}
                    placeholder="Enter Document Number"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, identityDocumentNumber: value }))}
                    maxLength={30}
                    validate={(value) => validateIdentityDocumentNumber(professionalDraft.identityDocumentType, value)}
                    onValidationError={(message) => showSectionError("professional", message)}
                    validateOnBlurOnly
                    clearInvalidOnBlur
                    visualIcon="edit"
                  />

                  <SelectField
                    label="Issuing Country"
                    value={professionalDraft.issuingCountry}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["India", "USA", "UK", "Canada", "Australia", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, issuingCountry: value }))}
                  />

                  <EditField
                    label="Contact"
                    type="tel"
                    value={professionalDraft.alternateContact}
                    placeholder="Enter Alternate Contact"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, alternateContact: value }))}
                    maxLength={10}
                    visualIcon="edit"
                    validate={validateAlternateContact}
                    validateOnBlurOnly
                    clearInvalidOnBlur
                    onValidationError={(message) => showSectionError("professional", message)}
                  />

                  <EditField
                    label="Email"
                    type="email"
                    value={professionalDraft.alternateEmail}
                    placeholder="Enter Alternate Email"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, alternateEmail: value }))}
                    maxLength={254}
                    visualIcon="edit"
                    validate={validateAlternateEmail}
                    validateOnBlurOnly
                    clearInvalidOnBlur
                    onValidationError={(message) => showSectionError("professional", message)}
                  />

                  <SelectField
                    label="Education Level"
                    value={professionalDraft.educationLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Undergraduate", "Postgraduate", "Diploma", "Certificate", "Doctoral"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, educationLevel: value }))}
                  />

                  <SelectField
                    label="Qualification"
                    value={professionalDraft.qualification}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["B.Tech", "B.E.", "B.Sc.", "BCA", "BBA", "M.Tech", "M.E.", "MBA", "M.Sc.", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, qualification: value }))}
                  />

                  <SelectField
                    label="Institution Name"
                    value={professionalDraft.institutionName}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["ABC Institute of Technology"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, institutionName: value }))}
                  />

                  <SelectField
                    label="Field of Study"
                    value={professionalDraft.fieldOfStudy}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Computer Science", "Information Technology", "Data Science", "Electronics", "Mechanical"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, fieldOfStudy: value }))}
                  />

                  <SelectField
                    label="Grading System"
                    value={professionalDraft.gradingSystem}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["CGPA – 10 Point Scale", "CGPA – 4 Point Scale", "Percentage", "GPA", "Grade"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, gradingSystem: value, gradeScore: "" }))}
                  />

                  <EditField
                    label="Grade / Score"
                    value={professionalDraft.gradeScore}
                    placeholder="Enter Grade / Score"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, gradeScore: value }))}
                    maxLength={8}
                    validate={(value) => validateUniversityGrade(professionalDraft.gradingSystem, value)}
                    onValidationError={(message) => showSectionError("professional", message)}
                    validateOnBlurOnly
                    clearInvalidOnBlur
                    visualIcon="edit"
                  />

                  <SelectField
                    label="Start Year"
                    value={professionalDraft.startYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2022", "2023", "2024", "2025", "2026"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, startYear: value }))}
                  />

                  <SelectField
                    label="End Year"
                    value={professionalDraft.endYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2026", "2027", "2028", "2029", "2030"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, endYear: value }))}
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <DisplayField label="Preferred Name" value={professionalInfo.preferredName} placeholder="Enter Preferred Name" />
                  <DisplayField label="Nationality" value={professionalInfo.nationality} placeholder="Select" />
                  <DisplayField label="Identity Document Type" value={professionalInfo.identityDocumentType} placeholder="Select" />
                  <DisplayField label="Identity Document Number" value={professionalInfo.identityDocumentNumber} placeholder="Enter Document Number" />
                  <DisplayField label="Issuing Country" value={professionalInfo.issuingCountry} placeholder="Select" />
                  <DisplayField label="Contact" value={professionalInfo.alternateContact} placeholder="Enter Alternate Contact" />
                  <DisplayField label="Email" value={professionalInfo.alternateEmail} placeholder="Enter Alternate Email" />
                  <DisplayField label="Education Level" value={professionalInfo.educationLevel} placeholder="Select" />
                  <DisplayField label="Qualification" value={professionalInfo.qualification} placeholder="Select" />
                  <DisplayField label="Institution Name" value={professionalInfo.institutionName} placeholder="Select" />
                  <DisplayField label="Field of Study" value={professionalInfo.fieldOfStudy} placeholder="Select" />
                  <DisplayField label="Grading System" value={professionalInfo.gradingSystem} placeholder="Select" />
                  <DisplayField label="Grade / Score" value={professionalInfo.gradeScore} placeholder="Enter Grade / Score" />
                  <DisplayField label="Start Year" value={professionalInfo.startYear} placeholder="Select" />
                  <DisplayField label="End Year" value={professionalInfo.endYear} placeholder="Select" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Digital Profile"
                iconSrc={images.skillsDevelopment}
                iconTone="blue"
                editing={editingSection === "skills"}
                popupType={sectionPopup?.section === "skills" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "skills" ? sectionPopup.message : undefined}
                onEdit={() => startSectionEdit("skills")}
              />

              {flowPopup && flowPopupSection === "skills" && (
                <div className="institutionSectionFlowPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} className="institutionInlinePopupIcon" />
                  <span>{flowPopup}</span>
                </div>
              )}

              {editingSection === "skills" ? (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <SelectField
                    label="Certification Name"
                    value={skillsDraft.certificationName}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Python for Data Science", "AWS Cloud Practitioner", "Google Data Analytics"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, certificationName: value }))}
                  />

                  <SelectField
                    label="Issuing Organisation"
                    value={skillsDraft.issuingOrganisation}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["NPTEL", "AWS", "Microsoft", "Google", "IBM", "Coursera", "Udemy"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, issuingOrganisation: value }))}
                  />

                  <CalendarDateField
                    label="Issue Date"
                    value={skillsDraft.issueDate}
                    maxDate={getTodayForUniversity()}
                    onValidationError={(message) => showSectionError("skills", message)}
                    onChange={(value) =>
                      setSkillsDraft((c) => ({ ...c, issueDate: value }))
                    }
                  />

                  <CalendarDateField
                    label="Expiry Date"
                    value={skillsDraft.expiryDate}
                    onChange={(value) =>
                      setSkillsDraft((c) => ({ ...c, expiryDate: value }))
                    }
                  />
                  <EditField
                    label="Credential ID"
                    value={skillsDraft.credentialId}
                    placeholder="Enter Credential ID"
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, credentialId: value }))}
                    maxLength={50}
                    validate={validateCredentialID}
                    onValidationError={(message) => showSectionError("skills", message)}
                    validateOnBlurOnly
                    clearInvalidOnBlur
                  />
                  <EditField
                    label="Credential URL"
                    value={skillsDraft.credentialUrl}
                    placeholder="Enter Verification Link"
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, credentialUrl: value }))}
                    maxLength={150}
                    validate={validateCredentialVerificationUrl}
                    validateOnBlurOnly
                    clearInvalidOnBlur
                    onValidationError={(message) => showSectionError("skills", message)}
                  />

                  <SelectField
                    label="Career Goal"
                    value={skillsDraft.careerGoal}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Become a Data Scientist", "Software Engineer", "Entrepreneur", "Researcher", "Product Manager"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, careerGoal: value }))}
                  />

                  <MultiSelectField
                    label="Preferred Role"
                    value={skillsDraft.preferredRole}
                    placeholder="Select"
                    options={["Data Analyst", "Data Scientist", "Software Developer", "AI Engineer", "ML Engineer", "Product Manager"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, preferredRole: value }))}
                  />

                  <MultiSelectField
                    label="Preferred Industry"
                    value={skillsDraft.preferredIndustry}
                    placeholder="Select"
                    options={["Information Technology", "Finance", "Healthcare", "Education", "Manufacturing", "E-Commerce", "Consulting"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, preferredIndustry: value }))}
                  />

                  <MultiSelectField
                    label="Learning Goal"
                    value={skillsDraft.learningGoal}
                    placeholder="Select"
                    options={["Develop AI Skills", "Improve Programming", "Learn Data Analytics", "Build Leadership Skills", "Prepare for Placement"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, learningGoal: value }))}
                  />

                  <MultiSelectField
                    label="Preferred Learning Mode"
                    value={skillsDraft.preferredLearningMode}
                    placeholder="Select"
                    options={["Classroom", "Online", "Blended", "Self-paced", "Instructor-led", "Hands-on"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, preferredLearningMode: value }))}
                  />

                  <SelectField
                    label="Skill Name"
                    value={skillsDraft.skillName}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Python", "Java", "SQL", "Machine Learning", "Communication", "Excel", "Power BI"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, skillName: value }))}
                  />

                  <SelectField
                    label="Category"
                    value={skillsDraft.category}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Technical Skill", "Soft Skill", "Digital Skill", "Domain Skill", "Leadership Skill"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, category: value }))}
                  />

                  <SelectField
                    label="Domain"
                    value={skillsDraft.domain}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Data Science", "Artificial Intelligence", "Software Development", "Cloud Computing", "Cybersecurity", "Business"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, domain: value }))}
                  />

                  <SelectField
                    label="Self-Rated Level"
                    value={skillsDraft.selfRatedLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, selfRatedLevel: value }))}
                  />
                  <EditField
                    label="Portfolio Link"
                    value={skillsDraft.portfolioLink}
                    placeholder="Enter Portfolio Link"
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, portfolioLink: value }))}
                    maxLength={2048}
                    validate={(value) => digitalLinkError("portfolioLink", value)}
                    onValidationError={(message) => showSectionError("skills", message)}
                    onValidationClear={() => clearSectionError("skills")}
                  />
                  <EditField
                    label="LinkedIn URL"
                    value={skillsDraft.linkedinUrl}
                    placeholder="Enter LinkedIn URL"
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, linkedinUrl: value }))}
                    maxLength={2048}
                    validate={(value) => digitalLinkError("linkedinUrl", value)}
                    onValidationError={(message) => showSectionError("skills", message)}
                    onValidationClear={() => clearSectionError("skills")}
                  />
                  <EditField label="Instagram ID" value={skillsDraft.instagramId} placeholder="Enter Instagram ID" onChange={(value) => setSkillsDraft((c) => ({ ...c, instagramId: value }))} />
                  <EditField label="Facebook ID / URL" value={skillsDraft.facebookUrl} placeholder="Enter Facebook URL" onChange={(value) => setSkillsDraft((c) => ({ ...c, facebookUrl: value }))} />
                  <EditField
                    label="GitHub URL"
                    value={skillsDraft.githubUrl}
                    placeholder="Enter GitHub URL"
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, githubUrl: value }))}
                    maxLength={2048}
                    validate={(value) => digitalLinkError("githubUrl", value)}
                    onValidationError={(message) => showSectionError("skills", message)}
                    onValidationClear={() => clearSectionError("skills")}
                  />
                  <EditField label="Twitter / X" value={skillsDraft.twitterX} placeholder="Enter Twitter / X" onChange={(value) => setSkillsDraft((c) => ({ ...c, twitterX: value }))} />

                  <SelectField
                    label="Portfolio Evidence"
                    value={skillsDraft.portfolioEvidence}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Academic Project",
                      "Personal Project",
                      "Internship Project",
                      "Industry Project",
                      "Hackathon Project",
                      "Research Project",
                      "Open Source Contribution",
                      "Certification Project",
                      "Case Study",
                      "Other",
                    ]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, portfolioEvidence: value }))}
                  />

                  <EditField
                    label="Personal Website"
                    value={skillsDraft.personalWebsite}
                    placeholder="Enter Personal Website"
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, personalWebsite: value }))}
                    maxLength={2048}
                    validate={(value) => digitalLinkError("personalWebsite", value)}
                    onValidationError={(message) => showSectionError("skills", message)}
                    onValidationClear={() => clearSectionError("skills")}
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <DisplayField label="Certification Name" value={skillsInfo.certificationName} placeholder="Select" />
                  <DisplayField label="Issuing Organisation" value={skillsInfo.issuingOrganisation} placeholder="Select" />
                  <DisplayField label="Issue Date" value={skillsInfo.issueDate} placeholder="dd/mm/yyyy" />
                  <DisplayField label="Expiry Date" value={skillsInfo.expiryDate} placeholder="dd/mm/yyyy" />
                  <DisplayField label="Credential ID" value={skillsInfo.credentialId} placeholder="Enter Credential ID" />
                  <DisplayField label="Credential URL" value={skillsInfo.credentialUrl} placeholder="Enter Verification Link" />
                  <DisplayField label="Career Goal" value={skillsInfo.careerGoal} placeholder="Select" />
                  <DisplayField label="Preferred Role" value={skillsInfo.preferredRole.join(", ")} placeholder="Select" className="institutionMultiSelectSavedField" />
                  <DisplayField label="Preferred Industry" value={skillsInfo.preferredIndustry.join(", ")} placeholder="Select" className="institutionMultiSelectSavedField" />
                  <DisplayField label="Learning Goal" value={skillsInfo.learningGoal.join(", ")} placeholder="Select" className="institutionMultiSelectSavedField" />
                  <DisplayField label="Preferred Learning Mode" value={skillsInfo.preferredLearningMode.join(", ")} placeholder="Select" className="institutionMultiSelectSavedField" />
                  <DisplayField label="Skill Name" value={skillsInfo.skillName} placeholder="Select" />
                  <DisplayField label="Category" value={skillsInfo.category} placeholder="Select" />
                  <DisplayField label="Domain" value={skillsInfo.domain} placeholder="Select" />
                  <DisplayField label="Self-Rated Level" value={skillsInfo.selfRatedLevel} placeholder="Select" />
                  <DisplayField label="Portfolio Link" value={skillsInfo.portfolioLink} placeholder="Enter Portfolio Link" isLink />
                  <DisplayField label="LinkedIn URL" value={skillsInfo.linkedinUrl} placeholder="Enter LinkedIn URL" isLink />
                  <DisplayField label="Instagram ID" value={skillsInfo.instagramId} placeholder="Enter Instagram ID" />
                  <DisplayField label="Facebook ID / URL" value={skillsInfo.facebookUrl} placeholder="Enter Facebook URL" />
                  <DisplayField label="GitHub URL" value={skillsInfo.githubUrl} placeholder="Enter GitHub URL" isLink />
                  <DisplayField label="Twitter / X" value={skillsInfo.twitterX} placeholder="Enter Twitter / X" />
                  <DisplayField label="Portfolio Evidence" value={skillsInfo.portfolioEvidence} placeholder="Select" />
                  <DisplayField label="Personal Website" value={skillsInfo.personalWebsite} placeholder="Enter Personal Website" isLink />
                </div>
              )}
            </section>

            <section className="institutionInformationCard institutionDocumentsCard">
              <SectionHeader
                title="Documents"
                iconSrc={images.documents}
                iconTone="orange"
                editing={editingSection === "documents"}
                popupType={sectionPopup?.section === "documents" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "documents" ? sectionPopup.message : undefined}
                onEdit={() => startSectionEdit("documents")}
              />
              {flowPopup && flowPopupSection === "documents" && (
                <div
                  className="institutionSectionFlowPopup"
                  role="alert"
                  aria-live="assertive"
                >
                  <IconImage
                    src={images.sad}
                    width={18}
                    height={18}
                    className="institutionInlinePopupIcon"
                  />
                  <span>{flowPopup}</span>
                </div>
              )}

              <div className="institutionGrid institutionDocumentsGrid">
                {["Government ID Proof", "Resume"].map(
                  (label) => (
                    <div
                      className={`institutionField institutionUploadField ${
                        label === "Government ID Proof"
                          ? "institutionGovernmentIdField governmentIdProofField"
                          : ""
                      }`}
                      key={label}
                    >
                      <div className="institutionFieldLabel">
                        {label === "Government ID Proof"
                          ? "Government ID Proof"
                          : label}
                      </div>
                      {editingSection === "documents" ? (
                        <div
                          className={`institutionFilePicker ${
                            label === "Government ID Proof"
                              ? "institutionGovernmentIdPicker"
                              : ""
                          }`}
                        >
                          {label === "Government ID Proof" && (
                            <GovernmentIdRaisedDropdown
                              id="basic-government-id-document-type"
                              value={governmentIdDocumentType}
                              placeholder="Document Type"
                              compact
                              options={[
                  "National ID",
                  "Passport",
                  "Driver’s License",
                  "Residence Permit",
                  "Permanent Resident Card",
                  "Voter ID",
                  "National Insurance ID",
                  "Tax ID",
                  "Military ID",
                  "Government Employee ID",
                  "Refugee / Asylum ID",
                  "Visa / Immigration Document",
                  "Birth Certificate",
                  "Other Government ID",
                ]}
                              onChange={(value) => {
                                setGovernmentIdDocumentType(value);
                                clearSectionError("documents");
                              }}
                            />
                          )}

                          <label className="institutionFilePickerControl">
                            <input
                              className="institutionNativeFileInput"
                              type="file"
                              name={label.toLowerCase().replace(/\s+/g, "-")}
                              aria-label={label}
                              accept={
                                DOCUMENT_UPLOAD_LIMITS[
                                  label as
                                    | "Government ID Proof"
                                    | "Resume"
                                ].accept
                              }
                              onChange={(event) => {
                                handleDocumentFileSelect(
                                  label as
                                    | "Government ID Proof"
                                    | "Resume",
                                  event.target.files?.[0] ?? null
                                );
                                event.target.value = "";
                              }}
                            />
                            <span
                              className={`institutionChooseFileButton ${
                                documentFiles[label]
                                  ? "institutionChooseFileButtonUploaded"
                                  : ""
                              }`}
                            >
                              <svg
                                className="institutionChooseFileIcon"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                                focusable="false"
                              >
                                <path
                                  d="M12 15V4M12 4L7.5 8.5M12 4L16.5 8.5M5 14.5V19H19V14.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>Choose File</span>
                            </span>
                          </label>

                          <span className="institutionFileName">
                            {documentFiles[label]?.name || "No File Chosen"}
                          </span>
                          {documentUploadErrors[label] && (
                            <span
                              className="institutionDocumentUploadError"
                              role="alert"
                            >
                              {documentUploadErrors[label]}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`institutionFilePreview ${
                            label === "Government ID Proof"
                              ? "institutionGovernmentIdPicker"
                              : ""
                          }`}
                        >
                          {label === "Government ID Proof" && (
                            <div className="institutionDocumentTypeWrap">
                              <div className="institutionDocumentTypeSelect institutionDocumentTypeSelectDisabled">
                                <span>
                                  {governmentIdDocumentType || "Document Type"}
                                </span>
                                <IconImage
                                  src={images.arrowDown}
                                  width={16}
                                  height={16}
                                  className="institutionDocumentTypeArrow"
                                />
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            className={`institutionChooseFileButton ${
                              documentFiles[label]
                                ? "institutionChooseFileButtonUploaded"
                                : ""
                            }`}
                            aria-label={`Choose ${label}`}
                          >
                            <svg
                              className="institutionChooseFileIcon"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                              focusable="false"
                              >
                              <path
                                d="M12 15V4M12 4L7.5 8.5M12 4L16.5 8.5M5 14.5V19H19V14.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              </svg>
                            <span>Choose File</span>
                          </button>
                          <span className="institutionFileName">
                            {documentFiles[label]?.name || "No File Chosen"}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="institutionInformationCard institutionConfirmationCard">
              <div className="institutionInformationTitle institutionConfirmationTitle">
                <span className="institutionSectionIcon institutionPurpleIcon">
                  <IconImage
                    src={images.confirmation}
                    width={15}
                    height={15}
                    className="institutionWhiteIcon"
                  />
                </span>
                <h2>Confirmation</h2>
              </div>

              <div className="institutionConfirmationInner">
                <div className="institutionFieldLabel">
                  Self Declaration Confirmation
                </div>

                <label
                  htmlFor="institution-confirmation"
                  className="institutionCheckRow"
                >
                  <input
                    id="institution-confirmation"
                    name="institutionConfirmation"
                    type="checkbox"
                    className="institutionConfirmationCheckbox"
                    checked={confirmation}
                    onChange={(event) => {
                      if (event.target.checked && !profilePhotoCompleted) {
                        showFlowPopup(
                          "Please complete Profile Photo",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !professionalProfileCompleted) {
                        showFlowPopup(
                          "Please complete Trainer Profile",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !skillsDevelopmentCompleted) {
                        showFlowPopup(
                          "Please complete Skills & Growth",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !documentsCompleted) {
                        showFlowPopup(
                          "Please complete Documents",
                          "confirmation"
                        );
                        return;
                      }

                      setConfirmation(event.target.checked);
                    }}
                  />

                  <span
                    className={`institutionConfirmationCheckBox ${
                      confirmation
                        ? "institutionConfirmationCheckBoxActive"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    <span className="institutionConfirmationCheckMark" />
                  </span>

                  <span>I confirm That the Entered Data is Accurate</span>
                </label>
              </div>
            </section>

            <div className="institutionBottomActions">
              <button
                type="button"
                className="institutionBottomButton institutionCancelProfileButton"
                onClick={cancelProfile}
              >
                <IconImage
                  src={images.cancel}
                  width={14}
                  height={14}
                  className="institutionCancelProfileIcon"
                />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                className="institutionBottomButton institutionFinalSaveButton"
                onClick={saveProfile}
              >
                Save Profile
              </button>
            </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
