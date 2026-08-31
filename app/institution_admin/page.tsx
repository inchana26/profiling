"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./institutionadmin.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
const images = {
  profile: "/assets/institutionimages/profile.png",

  camera: "/assets/institutionicons/camera.svg",
  edit: "/assets/institutionicons/edit.svg",
  editBig: "/assets/institutionicons/editbig.svg",
  lock: "/assets/institutionicons/lock.svg",
  save: "/assets/institutionicons/tick.svg",
  cancel: "/assets/institutionicons/cancel.svg",
  arrowDown: "/assets/institutionicons/arrow-down.svg",
  completed: "/assets/institutionicons/checkmark.svg",
  calendar: "/assets/institutionicons/calendar.svg",
  upload: "/assets/institutionicons/upload.svg",
  clap: "/assets/institutionicons/clap.svg",
  sad: "/assets/institutionicons/sad.svg",

  basicInformation: "/assets/institutionicons/user.svg",
  basicSection: "/assets/institutionicons/graduation-cap.svg",

  registration: "/assets/institutionicons/file-edit.svg",
  identity: "/assets/institutionicons/users.svg",
  professional: "/assets/institutionicons/graduation-cap.svg",
  documents: "/assets/institutionicons/file.svg",
  confirmation: "/assets/institutionicons/checkmark-circlewhite.svg",
};

type SectionName = "registration" | "basic" | "documents";


const MB = 1024 * 1024;

const DOCUMENT_UPLOAD_LIMITS = {
  "Profile Photo": {
    accept: "image/jpeg,image/png,image/webp",
    label: "JPG, PNG or WebP — max 10 MB",
  },
  "Govt Id Proof": {
    accept: "image/jpeg,image/png,image/webp,application/pdf,.doc,.docx",
    label: "JPG, PNG, WebP, PDF, DOC or DOCX",
  },
  "Supporting Documents": {
    accept:
      "image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.ppt,.pptx,.mp3,.aac,.mp4,.zip,.xlsx,.vtt,.srt",
    label: "Files accepted within LMS hard limits",
  },
} as const;

const getDocumentHardLimit = (file: File) => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(name)) return 10 * MB;
  if (type === "application/pdf" || name.endsWith(".pdf")) return 100 * MB;
  if (name.endsWith(".doc") || name.endsWith(".docx")) return 50 * MB;
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return 100 * MB;
  if (type.startsWith("audio/") || name.endsWith(".mp3") || name.endsWith(".aac")) return 100 * MB;
  if (type.startsWith("video/") || name.endsWith(".mp4")) return 2 * 1024 * MB;
  if (name.endsWith(".zip")) return 500 * MB;
  if (name.endsWith(".xlsx")) return 25 * MB;
  if (name.endsWith(".vtt") || name.endsWith(".srt")) return 5 * MB;

  return null;
};

const isAcceptedDocumentFile = (
  label: "Profile Photo" | "Govt Id Proof" | "Supporting Documents",
  file: File
) => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (label === "Profile Photo") {
    return (
      type === "image/jpeg" ||
      type === "image/png" ||
      type === "image/webp" ||
      /\.(jpe?g|png|webp)$/i.test(name)
    );
  }

  if (label === "Govt Id Proof") {
    return (
      type.startsWith("image/") ||
      type === "application/pdf" ||
      /\.(jpe?g|png|webp|pdf|doc|docx)$/i.test(name)
    );
  }

  return /\.(jpe?g|png|webp|pdf|doc|docx|ppt|pptx|mp3|aac|mp4|zip|xlsx|vtt|srt)$/i.test(
    name
  );
};

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
};

function DisplayField({
  label,
  value,
  placeholder,
  className = "",
}: DisplayFieldProps) {
  return (
    <div className={`institutionField ${className}`}>
      <div className="institutionFieldLabel">{label}</div>
      <div
        className={`institutionFieldValue ${!value ? "institutionPlaceholder" : ""
          }`}
      >
        {value || placeholder || "--"}
      </div>
    </div>
  );
}

type IconDisplayFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon?: "lock" | "edit" | "select";
  className?: string;
};

function IconDisplayField({
  label,
  value,
  placeholder,
  icon,
  className = "",
}: IconDisplayFieldProps) {
  return (
    <div
      className={`institutionField ${
        icon ? "institutionEditableField" : ""
      } ${className}`}
    >
      <div className="institutionFieldText">
        <div className="institutionFieldLabel">{label}</div>
        <div
          className={`institutionFieldValue ${
            !value ? "institutionPlaceholder" : ""
          }`}
        >
          {value || placeholder || "--"}
        </div>
      </div>

      {icon === "lock" && (
        <span className="institutionFieldAction" aria-hidden="true">
          <IconImage src={images.lock} width={18} height={18} />
        </span>
      )}

      {icon === "edit" && (
        <span className="institutionFieldAction" aria-hidden="true">
          <IconImage src={images.edit} width={18} height={18} />
        </span>
      )}

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
  visualIcon?: "lock" | "edit" | "select";
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
}: EditFieldProps) {
  const inputId = useId();

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
            onChange={(event) => onChange?.(event.target.value)}
          />
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
              : "institutionFieldPencil"
          }`}
          aria-hidden="true"
        >
          <IconImage
            src={
              (visualIcon ?? (locked ? "lock" : "edit")) === "lock"
                ? images.lock
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

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  visualIcon?: "select" | "edit";
  menuStyle?: "default" | "radio";
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

    document.addEventListener("mousedown", closeSelect);

    return () => {
      document.removeEventListener("mousedown", closeSelect);
    };
  }, []);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const isRadioMenu = menuStyle === "radio";
  const shouldScroll = isRadioMenu && options.length > 4;

  return (
    <div
      ref={selectRef}
      className={`institutionField institutionSelectField ${
        isRadioMenu ? "institutionRadioSelectField" : ""
      } ${open ? "institutionSelectFieldOpen" : ""} ${className}`}
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
          onClick={() => setOpen((current) => !current)}
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

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const calendarRef = useRef<HTMLDivElement>(null);

  const initialDate = value
    ? new Date(`${value}T00:00:00`)
    : new Date();

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [yearPageStart, setYearPageStart] = useState(() => {
    const year = initialDate.getFullYear();
    return Math.floor(year / 12) * 12;
  });

  useEffect(() => {
    if (!value) return;

    const selected = new Date(`${value}T00:00:00`);

    setVisibleMonth(
      new Date(selected.getFullYear(), selected.getMonth(), 1)
    );

    setYearPageStart(
      Math.floor(selected.getFullYear() / 12) * 12
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

    document.addEventListener("mousedown", closeCalendar);

    return () => {
      document.removeEventListener("mousedown", closeCalendar);
    };
  }, []);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

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

  const firstDay = new Date(year, month, 1).getDay();

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    return new Date(year, month, 1 - firstDay + index);
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

  return (
    <div
      className="institutionField institutionEditableField institutionDateField"
      ref={calendarRef}
    >
      <div className="institutionFieldText">
        <div className="institutionFieldLabel">{label}</div>

        <button
          type="button"
          className="institutionDateTrigger"
          onClick={() => {
            setMode("days");
            setYearPageStart(Math.floor(year / 12) * 12);
            setOpen((current) => !current);
          }}
        >
          {displayDate}
        </button>
      </div>

      <button
        type="button"
        className="institutionFieldAction institutionCalendarAction"
        onClick={() => {
          setMode("days");
          setYearPageStart(Math.floor(year / 12) * 12);
          setOpen((current) => !current);
        }}
      >
        <IconImage src={images.calendar} width={18} height={18} />
      </button>

      {open && (
        <div className="institutionCalendarPopup">
          <div className="institutionCalendarTopRow">
            <button
              type="button"
              className="institutionCalendarArrow"
              onClick={() => {
                setVisibleMonth(new Date(year, month - 1, 1));
                setMode("days");
              }}
            >
              ‹
            </button>

            <button
              type="button"
              className="institutionCalendarHeaderButton"
              onClick={() =>
                setMode((current) =>
                  current === "months" ? "days" : "months"
                )
              }
            >
              <span>{months[month]}</span>
              <span>⌄</span>
            </button>

            <button
              type="button"
              className="institutionCalendarHeaderButton institutionCalendarYearButton"
              onClick={() => {
                setYearPageStart(Math.floor(year / 12) * 12);
                setMode((current) =>
                  current === "years" ? "days" : "years"
                );
              }}
            >
              <span>{year}</span>
              <span>⌄</span>
            </button>

            <button
              type="button"
              className="institutionCalendarArrow"
              onClick={() => {
                setVisibleMonth(new Date(year, month + 1, 1));
                setMode("days");
              }}
            >
              ›
            </button>
          </div>

          {mode === "years" ? (
            <div>
              <div className="institutionCalendarRangeRow">
                <button
                  type="button"
                  className="institutionCalendarRangeArrow"
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
                  className="institutionCalendarRangeArrow"
                  onClick={() =>
                    setYearPageStart((current) => current + 12)
                  }
                >
                  ›
                </button>
              </div>

              <div className="institutionCalendarYearGrid">
                {yearOptions.map((yearOption) => (
                  <button
                    key={yearOption}
                    type="button"
                    className={`institutionCalendarYearOption ${
                      yearOption === year
                        ? "institutionCalendarSelected"
                        : ""
                    }`}
                    onClick={() => {
                      setVisibleMonth(
                        new Date(yearOption, month, 1)
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
            <div className="institutionCalendarMonthGrid">
              {months.map((monthName, index) => (
                <button
                  key={monthName}
                  type="button"
                  className={`institutionCalendarMonthOption ${
                    index === month
                      ? "institutionCalendarSelected"
                      : ""
                  }`}
                  onClick={() => {
                    setVisibleMonth(new Date(year, index, 1));
                    setMode("days");
                  }}
                >
                  {monthName}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="institutionCalendarWeekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  )
                )}
              </div>

              <div className="institutionCalendarGrid">
                {calendarDays.map((date) => {
                  const dateValue = formatDate(date);
                  const isCurrentMonth = date.getMonth() === month;
                  const isSelected = value === dateValue;

                  return (
                    <button
                      key={dateValue}
                      type="button"
                      className={`institutionCalendarDay ${
                        !isCurrentMonth
                          ? "institutionCalendarDayOutside"
                          : ""
                      } ${
                        isSelected
                          ? "institutionCalendarDaySelected"
                          : ""
                      }`}
                      onClick={() => {
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

type SectionHeaderProps = {
  title: string;
  iconSrc: string;
  iconTone: "purple" | "pink";
  editing: boolean;
  popupType?: "saved" | "discarded" | "error" | null;
  popupMessage?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

function SectionHeader({
  title,
  iconSrc,
  iconTone,
  editing,
  popupType = null,
  popupMessage,
  onEdit,
  onSave,
  onCancel,
}: SectionHeaderProps) {
  return (
    <div className="institutionInformationHeader">
      <div className="institutionInformationTitle">
        <span
          className={`institutionSectionIcon ${iconTone === "pink"
              ? "institutionPinkIcon"
              : "institutionPurpleIcon"
            }`}
        >
          <IconImage
            src={iconSrc}
            width={16}
            height={16}
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

        {editing ? (
          <div className="institutionEditActions">
            <button
              type="button"
              className="institutionActionButton institutionSaveButton"
              onClick={onSave}
            >
              <IconImage src={images.save} width={13} height={13} />
              <span>Save</span>
            </button>

            <button
              type="button"
              className="institutionActionButton institutionCancelButton"
              onClick={onCancel}
            >
              <IconImage src={images.cancel} width={13} height={13} />
              <span>Cancel</span>
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default function InstitutionAdminProfilePage() {
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("02:26PM");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<SectionName | null>(null);
  const [confirmation, setConfirmation] = useState(false);

  const [profilePhotoCompleted, setProfilePhotoCompleted] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [identityCompleted, setIdentityCompleted] = useState(false);
  const [professionalProfileCompleted, setProfessionalProfileCompleted] = useState(false);
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
  const [governmentIdMenuOpen, setGovernmentIdMenuOpen] = useState(false);

  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({
    "Profile Photo": null,
    "Govt Id Proof": null,
    "Supporting Documents": null,
  });

  const [documentUploadErrors, setDocumentUploadErrors] = useState<
    Record<string, string>
  >({});

  // Snapshots used only while editing Documents.
  // Save keeps the new values; Cancel restores these previous saved values.
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
    institutionAdminId: "PRGEEQJQCBU006B",
    fullName: "Antony Thomas",

    // User-editable output fields are empty on the first page.
    // They will show only after the user edits and saves.
    dateOfBirth: "",
    officialEmail: "",
    mobileNumber: "",
    alternateEmail: "",
    alternatePhone: "",

    tenantId: "LXP-COL-001",
    onboardingCompleted: "Yes",
  });

  const [identityInfo, setIdentityInfo] = useState({
    employeeCode: "eg.EMP-0042",

    // Editable output fields start empty.
    gender: "",
    reportingAuthority: "",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    // Editable output fields start empty and appear after Save.
    highestQualification: "",
    leadershipExperience: "",
    totalExperience: "",
    designation: "",
    adminRole: "",

    // Locked fields stay unchanged.
    dateOfJoining: "2004-05-17",
    institutionName: "eg.enter name",

    campusName: "",
    departmentsManaged: "",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [identityDraft, setIdentityDraft] = useState(identityInfo);
  const [professionalDraft, setProfessionalDraft] =
    useState(professionalInfo);

  const editingSectionRef = useRef<SectionName | null>(editingSection);
  const registrationDraftRef = useRef(registrationDraft);
  const identityDraftRef = useRef(identityDraft);
  const professionalDraftRef = useRef(professionalDraft);

  useEffect(() => {
    editingSectionRef.current = editingSection;
    registrationDraftRef.current = registrationDraft;
    identityDraftRef.current = identityDraft;
    professionalDraftRef.current = professionalDraft;
  }, [
    editingSection,
    registrationDraft,
    identityDraft,
    professionalDraft,
  ]);

  const startSectionEdit = (section: SectionName) => {
    setSectionPopup(null);

    // Strict profile flow:
    // 1 Profile Photo -> 2 Registration Data -> 3 Identity
    // -> 4 Professional Profile -> 5 Documents -> 6 Confirmation
    if (section === "registration" && !profilePhotoCompleted) {
      showFlowPopup("Please Complete Profile Photo", "registration");
      return;
    }

    if (section === "basic" && !registrationCompleted) {
      showFlowPopup("Please Save Registration Data", "basic");
      return;
    }

    if (section === "documents" && !professionalProfileCompleted) {
      showFlowPopup("Please Complete and Save Basic Information", "documents");
      return;
    }


    if (section === "registration") {
      setRegistrationDraft({
        ...registrationInfo,

        // Editable fields must start empty.
        // Locked fields keep their existing values.
        dateOfBirth: "",
        officialEmail: "",
        mobileNumber: "",
        alternateEmail: "",
        alternatePhone: "",
      });
    }

    if (section === "basic") {
      // Load the latest saved Basic Information into the edit form.
      // This prevents the first Save from appearing successful while
      // professional changes are still left unsaved.
      setIdentityDraft({ ...identityInfo });
      setProfessionalDraft({ ...professionalInfo });
    }

    if (section === "documents") {
      documentFilesBeforeEditRef.current = { ...documentFiles };
      governmentIdDocumentTypeBeforeEditRef.current =
        governmentIdDocumentType;

      setDocumentUploadErrors({});
    }

    setEditingSection(section);
  };

  const isValidPhoneNumber = (value: string) => {
    return /^[6-9]\d{9}$/.test(value);
  };

  const isValidEmail = (value: string) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
  };

  const showRegistrationError = (message: string) => {
    setSectionPopup({
      section: "registration",
      type: "error",
      message,
    });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === "registration" && current.type === "error"
          ? null
          : current
      );
    }, 2500);
  };

  const saveSection = (section: SectionName) => {
    if (section === "registration") {
      const officialEmail = registrationDraft.officialEmail.trim();
      const alternateEmail = registrationDraft.alternateEmail.trim();

      if (!isValidEmail(officialEmail)) {
        showRegistrationError("Enter a valid Official Email");
        return;
      }

      if (alternateEmail && !isValidEmail(alternateEmail)) {
        showRegistrationError("Enter a valid Alternate Email");
        return;
      }

      if (!isValidPhoneNumber(registrationDraft.mobileNumber)) {
        showRegistrationError(
          "Mobile Number must be 10 digits and start with 6, 7, 8, or 9"
        );
        return;
      }

      if (
        registrationDraft.alternatePhone &&
        !isValidPhoneNumber(registrationDraft.alternatePhone)
      ) {
        showRegistrationError(
          "Alternate Phone must be 10 digits and start with 6, 7, 8, or 9"
        );
        return;
      }

      setRegistrationInfo({
        ...registrationDraft,
        officialEmail,
        alternateEmail,
      });
      setRegistrationCompleted(true);
    }

    if (section === "basic") {
      // Save ALL Basic Information changes in one click.
      // Identity and Professional Profile are committed together.

      if (!identityDraft.gender || !identityDraft.reportingAuthority) {
        setSectionPopup({
          section: "basic",
          type: "error",
          message: "Please complete the required Identity fields before saving.",
        });
        return;
      }

      const professionalComplete =
        professionalDraft.highestQualification.trim() &&
        professionalDraft.leadershipExperience.trim() &&
        professionalDraft.totalExperience.trim() &&
        professionalDraft.designation.trim() &&
        professionalDraft.adminRole.trim();

      if (!professionalComplete) {
        setSectionPopup({
          section: "basic",
          type: "error",
          message:
            "Please complete the required Professional Profile fields before saving.",
        });
        return;
      }

      // Commit both groups during this same Save click.
      setIdentityInfo({ ...identityDraft });
      setProfessionalInfo({ ...professionalDraft });

      setIdentityCompleted(true);
      setProfessionalProfileCompleted(true);
    }

    if (section === "documents") {
      const hasGovernmentId =
        governmentIdDocumentType.trim() !== "" &&
        documentFiles["Govt Id Proof"] !== null;

      if (!hasGovernmentId) {
        setSectionPopup({
          section: "documents",
          type: "error",
          message: "Please select Document Type and upload Government ID Proof before saving.",
        });
        return;
      }

      setDocumentsCompleted(true);

      // Current document changes are now the saved values.
      documentFilesBeforeEditRef.current = null;
      governmentIdDocumentTypeBeforeEditRef.current = null;
      setDocumentUploadErrors({});
    }

    setEditingSection(null);
    setSectionPopup({ section, type: "saved" });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === section && current.type === "saved"
          ? null
          : current
      );
    }, 2500);
  };

  const cancelSection = (section: SectionName) => {
    if (section === "registration") {
      // Discard everything typed during this edit session.
      setRegistrationDraft(registrationInfo);
    }

    if (section === "basic") {
      // Discard every dropdown/text change made during this edit session.
      setIdentityDraft(identityInfo);
      setProfessionalDraft(professionalInfo);
    }

    if (section === "documents") {
      // Restore the files and Govt ID document type that existed
      // before the user clicked Edit.
      if (documentFilesBeforeEditRef.current) {
        setDocumentFiles({ ...documentFilesBeforeEditRef.current });
      }

      if (governmentIdDocumentTypeBeforeEditRef.current !== null) {
        setGovernmentIdDocumentType(
          governmentIdDocumentTypeBeforeEditRef.current
        );
      }

      documentFilesBeforeEditRef.current = null;
      governmentIdDocumentTypeBeforeEditRef.current = null;
      setDocumentUploadErrors({});
    }

    setEditingSection(null);
    setSectionPopup({ section, type: "discarded" });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === section && current.type === "discarded"
          ? null
          : current
      );
    }, 2500);
  };

  const saveProfile = () => {
    const nextIncompleteStep =
      !profilePhotoCompleted
        ? "Profile Photo"
        : !registrationCompleted
          ? "Registration Data"
          : !identityCompleted
            ? "Identity"
            : !professionalProfileCompleted
              ? "Professional Profile"
              : !documentsCompleted
                ? "Documents"
                : !confirmation
                  ? "Confirmation"
                  : null;

    if (nextIncompleteStep) {
      showFlowPopup(
        `Please complete ${nextIncompleteStep} before saving the profile.`,
        "confirmation"
      );
      return;
    }

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
  };

  const handleProfileImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        setProfilePhotoCompleted(true);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };


  const handleDocumentFileSelect = (
    label: "Profile Photo" | "Govt Id Proof" | "Supporting Documents",
    file: File | null
  ) => {
    if (!file) return;

    if (!isAcceptedDocumentFile(label, file)) {
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: `Unsupported file type. ${DOCUMENT_UPLOAD_LIMITS[label].label}`,
      }));
      return;
    }

    const hardLimit = getDocumentHardLimit(file);

    if (hardLimit === null) {
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: "Unsupported file type.",
      }));
      return;
    }

    if (file.size > hardLimit) {
      const limitText =
        hardLimit >= 1024 * MB
          ? `${hardLimit / (1024 * MB)} GB`
          : `${hardLimit / MB} MB`;

      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: `File is too large. Maximum allowed size is ${limitText}.`,
      }));
      return;
    }

    setDocumentFiles((current) => ({
      ...current,
      [label]: file,
    }));

    setDocumentUploadErrors((current) => ({
      ...current,
      [label]: "",
    }));
  };

  useEffect(() => {
    let popupTimer: number | undefined;

    const autoSaveDraft = () => {
      const currentSection = editingSectionRef.current;

      // IMPORTANT:
      // Auto-save must never commit edit drafts into the saved/output data.
      // Only the section Save button (or explicit profile Save) may commit.
      // This keeps Cancel working correctly even after 10+ seconds.
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

  const completionItems = [
    profilePhotoCompleted,
    registrationCompleted,
    identityCompleted,
    professionalProfileCompleted,
    documentsCompleted,
    confirmation,
  ];

  const completedItemCount = completionItems.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedItemCount / completionItems.length) * 100
  );

  useEffect(() => {
    document.title = "Institution Admin Profile | Neuro LXP";
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
                <h1>Institution admin Profile</h1>
                <p>
                  Manage Your Identity, Access, Preferences, And Activity With
                  Ease.
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
                    accept="image/*"
                    className="institutionProfileImageInput"
                    onChange={handleProfileImageSelect}
                  />
                </div>

                <div className="institutionIdentityText">
                  <h2>Antony Thomas</h2>
                  <div className="institutionRole">Institution admin</div>

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
                  {identityCompleted && professionalProfileCompleted ? (
                    <span className="institutionCompletedCircle institutionProfileStepCheck">
                      <span className="institutionProfileStepCheckMark" />
                    </span>
                  ) : (
                    <span className="institutionEmptyCircle" />
                  )}
                  <span>Basic Information</span>
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

                <div className="institutionCompletionStep">
                  {registrationCompleted ? (
                    <span className="institutionCompletedCircle institutionProfileStepCheck">
                      <span className="institutionProfileStepCheckMark" />
                    </span>
                  ) : (
                    <span className="institutionEmptyCircle" />
                  )}
                  <span>Registration Data</span>
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
              </div>
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Registration Data"
                iconSrc={images.registration}
                iconTone="purple"
                editing={editingSection === "registration"}
                popupType={sectionPopup?.section === "registration" ? sectionPopup.type : null}
                popupMessage={
                  sectionPopup?.section === "registration"
                    ? sectionPopup.message
                    : undefined
                }
                onEdit={() => startSectionEdit("registration")}
                onSave={() => saveSection("registration")}
                onCancel={() => cancelSection("registration")}
              />
              {flowPopup && flowPopupSection === "registration" && (
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

              {editingSection === "registration" ? (
                <div className="institutionGrid">
                  <EditField
                    label="Institution admin ID"
                    value={registrationDraft.institutionAdminId}
                    locked
                  />
                  <EditField
                    label="Full Name"
                    value={registrationDraft.fullName}
                    locked
                  />
                  <DateField
                    label="Date of Birth"
                    value={registrationDraft.dateOfBirth}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        dateOfBirth: value,
                      }))
                    }
                  />
                  <EditField
                    label="Official Email"
                    type="email"
                    value={registrationDraft.officialEmail}
                    placeholder="Enter Official Email"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        officialEmail: value,
                      }))
                    }
                  />
                  <EditField
                    label="Mobile Number"
                    type="tel"
                    value={registrationDraft.mobileNumber}
                    placeholder="Enter Mobile Number"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        mobileNumber: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                  />
                  <EditField
                    label="Alternate Email"
                    type="email"
                    value={registrationDraft.alternateEmail}
                    placeholder="Enter Alternate Email"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternateEmail: value,
                      }))
                    }
                  />
                  <EditField
                    label="Alternate Phone"
                    type="tel"
                    value={registrationDraft.alternatePhone}
                    placeholder="Enter Alternate Phone"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternatePhone: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                  />
                  <EditField
                    label="Tenant ID"
                    value={registrationDraft.tenantId}
                    locked
                  />
                  <EditField
                    label="Onboarding Completed"
                    value={registrationDraft.onboardingCompleted}
                    locked
                  />
                </div>
              ) : (
                <div className="institutionGrid">
                  <DisplayField
                    label="Institution admin ID"
                    value={registrationInfo.institutionAdminId}
                  />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField
                    label="Date of Birth"
                    value={registrationInfo.dateOfBirth}
                    placeholder="dd/mm/yyyy"
                  />
                  <DisplayField
                    label="Official Email"
                    value={registrationInfo.officialEmail}
                    placeholder="Enter Official Email"
                  />
                  <DisplayField
                    label="Mobile Number"
                    value={registrationInfo.mobileNumber}
                    placeholder="Enter Mobile Number"
                  />
                  <DisplayField
                    label="Alternate Email"
                    value={registrationInfo.alternateEmail}
                    placeholder="Enter Alternate Email"
                  />
                  <DisplayField
                    label="Alternate Phone"
                    value={registrationInfo.alternatePhone}
                    placeholder="Enter Alternate Phone"
                  />
                  <DisplayField label="Tenant ID" value={registrationInfo.tenantId} />
                  <DisplayField
                    label="Onboarding Completed"
                    value={registrationInfo.onboardingCompleted}
                  />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Basic Information"
                iconSrc={images.basicSection}
                iconTone="purple"
                editing={editingSection === "basic"}
                popupType={
                  sectionPopup?.section === "basic"
                    ? sectionPopup.type
                    : null
                }
                onEdit={() => startSectionEdit("basic")}
                onSave={() => saveSection("basic")}
                onCancel={() => cancelSection("basic")}
              />
              {flowPopup && flowPopupSection === "basic" && (
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

              {editingSection === "basic" ? (
                <div className="institutionGrid institutionBasicInfoGrid">
                  <EditField
                    label="Employee Code"
                    value={identityDraft.employeeCode}
                    locked
                  />

                  <SelectField
                    label="Gender"
                    placeholder="Select"
                    value={identityDraft.gender}
                    menuStyle="radio"
                    options={[
                      "Male",
                      "Female",
                      "Other",
                      "Prefer not to say",
                    ]}
                    onChange={(value) =>
                      setIdentityDraft((current) => ({
                        ...current,
                        gender: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Designation"
                    placeholder="Select"
                    value={professionalDraft.designation}
                    menuStyle="radio"
                    options={[
                      "Principal",
                      "Vice Principal",
                      "Director",
                      "Administrator",
                      "Dean",
                      "Registrar",
                      "Head of Institution",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        designation: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Highest Qualification"
                    placeholder="Select"
                    value={professionalDraft.highestQualification}
                    menuStyle="radio"
                    options={[
                      "PhD",
                      "Master's Degree",
                      "Bachelor's Degree",
                      "M.Phil",
                      "Postgraduate Diploma",
                      "Diploma",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        highestQualification: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Leadership Experience"
                    placeholder="Select"
                    value={professionalDraft.leadershipExperience}
                    menuStyle="radio"
                    options={[
                      "Less than 1 year",
                      "1–3 years",
                      "3–5 years",
                      "5–10 years",
                      "10–15 years",
                      "15+ years",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        leadershipExperience: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Total Experience"
                    placeholder="Select"
                    value={professionalDraft.totalExperience}
                    menuStyle="radio"
                    options={[
                      "0–2 years",
                      "3–5 years",
                      "6–10 years",
                      "11–15 years",
                      "16–20 years",
                      "20+ years",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        totalExperience: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Reporting Authority"
                    placeholder="Select"
                    value={identityDraft.reportingAuthority}
                    menuStyle="radio"
                    options={[
                      "Governing Body",
                      "Board of Directors",
                      "Chancellor",
                      "Vice Chancellor",
                      "CEO",
                      "Director",
                      "Principal",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setIdentityDraft((current) => ({
                        ...current,
                        reportingAuthority: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Admin Role"
                    placeholder="Select"
                    value={professionalDraft.adminRole}
                    menuStyle="radio"
                    options={[
                      "Super Admin",
                      "Platform Admin",
                      "Institution Admin",
                      "Operations Admin",
                      "Academic Admin",
                      "Content Admin",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        adminRole: value,
                      }))
                    }
                  />

                  <EditField
                    label="Date of Joining"
                    value="17-05-2004"
                    locked
                  />

                  <EditField
                    label="Institution Name"
                    value={professionalDraft.institutionName}
                    className="institutionBasicHalfField"
                    locked
                  />

                  <EditField
                    label="Campus Name"
                    value={professionalDraft.campusName}
                    placeholder="Enter Campus Name"
                    className="institutionBasicHalfField institutionCampusNameField"
                    visualIcon="edit"
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        campusName: value,
                      }))
                    }
                  />

                  <div className="institutionField institutionDepartmentsField institutionBasicDepartmentsField institutionDepartmentsTextareaField">
                    <label
                      htmlFor="departments-managed"
                      className="institutionFieldLabel"
                    >
                      Departments Managed(Maximum 250words)
                    </label>

                    <div className="institutionDepartmentsTextareaWrap">
                      <textarea
                        id="departments-managed"
                        name="departmentsManaged"
                        className="institutionTextarea institutionDepartmentsTextarea"
                        value={professionalDraft.departmentsManaged}
                        placeholder="Type departments separated by Commas"
                        aria-label="Departments Managed, maximum 250 words"
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          const currentValue = professionalDraft.departmentsManaged;

                          const currentWords = currentValue.trim()
                            ? currentValue.trim().split(/\s+/)
                            : [];

                          const nextWords = nextValue.trim()
                            ? nextValue.trim().split(/\s+/)
                            : [];

                          const isDeletingOrShortening =
                            nextValue.length < currentValue.length;

                          const canAccept =
                            nextWords.length < 250 ||
                            (nextWords.length === 250 &&
                              (currentWords.length < 250 ||
                                isDeletingOrShortening));

                          if (canAccept || isDeletingOrShortening) {
                            setProfessionalDraft((current) => ({
                              ...current,
                              departmentsManaged: nextValue,
                            }));
                          }
                        }}
                      />

                      <span
                        className="institutionFieldAction institutionDepartmentsEditAction"
                        aria-hidden="true"
                      >
                        <IconImage src={images.edit} width={18} height={18} />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="institutionGrid institutionBasicInfoGrid institutionBasicInfoReadOnly">
                  <DisplayField
                    label="Employee Code"
                    value={identityInfo.employeeCode}
                  />

                  <DisplayField
                    label="Gender"
                    value={identityInfo.gender}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Designation"
                    value={professionalInfo.designation}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Highest Qualification"
                    value={professionalInfo.highestQualification}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Leadership Experience"
                    value={professionalInfo.leadershipExperience}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Total Experience"
                    value={professionalInfo.totalExperience}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Reporting Authority"
                    value={identityInfo.reportingAuthority}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Admin Role"
                    value={professionalInfo.adminRole}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Date of Joining"
                    value="17-05-2004"
                  />

                  <DisplayField
                    label="Institution Name"
                    value={professionalInfo.institutionName}
                    className="institutionBasicHalfField"
                  />

                  <IconDisplayField
                    label="Campus Name"
                    value={professionalInfo.campusName}
                    placeholder="Enter Campus Name"
                    icon="edit"
                    className="institutionBasicHalfField institutionCampusNameField"
                  />

                  <div className="institutionField institutionDepartmentsField institutionBasicDepartmentsField institutionDepartmentsTextareaField">
                    <label
                      htmlFor="departments-managed-readonly"
                      className="institutionFieldLabel"
                    >
                      Departments Managed(Maximum 250words)
                    </label>

                    <div className="institutionDepartmentsTextareaWrap institutionDepartmentsTextareaWrapReadOnly">
                      <textarea
                        id="departments-managed-readonly"
                        name="departmentsManagedReadOnly"
                        className="institutionTextarea institutionDepartmentsTextarea institutionDepartmentsTextareaReadOnly"
                        value={professionalInfo.departmentsManaged}
                        placeholder="Type departments separated by Commas"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="institutionInformationCard institutionDocumentsCard">
              <SectionHeader
                title="Documents"
                iconSrc={images.documents}
                iconTone="pink"
                editing={editingSection === "documents"}
                popupType={sectionPopup?.section === "documents" ? sectionPopup.type : null}
                onEdit={() => startSectionEdit("documents")}
                onSave={() => saveSection("documents")}
                onCancel={() => cancelSection("documents")}
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
                {["Profile Photo", "Govt Id Proof", "Supporting Documents"].map(
                  (label) => (
                    <div
                      className={`institutionField institutionUploadField ${
                        label === "Govt Id Proof"
                          ? `institutionGovernmentIdField ${
                              governmentIdMenuOpen
                                ? "institutionGovernmentIdFieldOpen"
                                : ""
                            }`
                          : ""
                      }`}
                      key={label}
                    >
                      <div className="institutionFieldLabel">
                        {label === "Govt Id Proof"
                          ? "Government ID Proof"
                          : label}
                      </div>
                      {editingSection === "documents" ? (
                        <div
                          className={`institutionFilePicker ${
                            label === "Govt Id Proof"
                              ? "institutionGovernmentIdPicker"
                              : ""
                          }`}
                        >
                          {label === "Govt Id Proof" && (
                            <div className="institutionDocumentTypeWrap">
                              <button
                                type="button"
                                className="institutionDocumentTypeSelect"
                                aria-haspopup="listbox"
                                aria-expanded={governmentIdMenuOpen}
                                onClick={() =>
                                  setGovernmentIdMenuOpen((current) => !current)
                                }
                              >
                                <span>
                                  {governmentIdDocumentType || "Document Type"}
                                </span>
                                <IconImage
                                  src={images.arrowDown}
                                  width={16}
                                  height={16}
                                  className={`institutionDocumentTypeArrow ${
                                    governmentIdMenuOpen
                                      ? "institutionDocumentTypeArrowOpen"
                                      : ""
                                  }`}
                                />
                              </button>

                              {governmentIdMenuOpen && (
                              <div
                                className="institutionDocumentTypeMenu"
                                role="listbox"
                              >
                                {[
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
                                ].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    role="option"
                                    aria-selected={
                                      governmentIdDocumentType === option
                                    }
                                    className="institutionDocumentTypeOption"
                                    onClick={() => {
                                      setGovernmentIdDocumentType(option);
                                      setGovernmentIdMenuOpen(false);
                                    }}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                              )}
                            </div>
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
                                    | "Profile Photo"
                                    | "Govt Id Proof"
                                    | "Supporting Documents"
                                ].accept
                              }
                              onChange={(event) => {
                                handleDocumentFileSelect(
                                  label as
                                    | "Profile Photo"
                                    | "Govt Id Proof"
                                    | "Supporting Documents",
                                  event.target.files?.[0] ?? null
                                );
                                event.target.value = "";
                              }}
                            />
                            <span className="institutionChooseFileButton">
                              <IconImage
                                src={images.upload}
                                width={14}
                                height={14}
                                className="institutionChooseFileIcon"
                              />
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
                            label === "Govt Id Proof"
                              ? "institutionGovernmentIdPicker"
                              : ""
                          }`}
                        >
                          {label === "Govt Id Proof" && (
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
                            className="institutionChooseFileButton"
                            aria-label={`Choose ${label}`}
                          >
                            <IconImage
                              src={images.upload}
                              width={14}
                              height={14}
                              className="institutionChooseFileIcon"
                            />
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
                  Self Declaration Confirmmation
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
                      if (event.target.checked && !documentsCompleted) {
                        showFlowPopup(
                          "Please complete and save Documents before Confirmation.",
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
                className="institutionBottomButton institutionReviewButton"
              >
                Review Profile
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
