"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./corporate.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
const images = {
  profile: "/assets/funiversityimages/profile.png",

  camera: "/assets/corporateicons/camera.svg",
  edit: "/assets/corporateicons/edit.svg",
  editBig: "/assets/corporateicons/editbig.svg",
  lock: "/assets/corporateicons/lock.svg",
  save: "/assets/corporateicons/tick.svg",
  cancel: "/assets/corporateicons/cancel.svg",
  arrowDown: "/assets/corporateicons/arrow-down.svg",
  completed: "/assets/corporateicons/checkmark.svg",
  upload: "/assets/corporateicons/upload.svg",
  calendar: "/assets/corporateicons/calendar.svg",
  clap: "/assets/corporateicons/clap.svg",
  sad: "/assets/corporateicons/sad.svg",

  registration: "/assets/corporateicons/file-edit.svg",
  academicProfessional: "/assets/corporateicons/bag.svg",
  skillsDevelopment: "/assets/corporateicons/target.svg",
  documents: "/assets/corporateicons/file.svg",
  confirmation: "/assets/corporateicons/checkmark-circlewhite.svg",
};

type SectionName = "registration" | "professional" | "skills" | "documents";

const MB = 1024 * 1024;

const DOCUMENT_UPLOAD_LIMITS = {
  "Profile Photo": {
    accept: "image/jpeg,image/png,image/webp",
    label: "JPG, PNG or WebP — recommended 200 KB – 2 MB",
  },
  "Government ID Proof": {
    accept: "image/jpeg,image/png,image/webp,application/pdf,.doc,.docx",
    label: "Use the recommended LMS upload size for the selected file type",
  },
  "Supporting Documents": {
    accept:
      "image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.ppt,.pptx,.mp3,.aac,.mp4,.zip,.xlsx,.vtt,.srt",
    label: "Use the recommended LMS upload size for the selected file type",
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

  if (name.endsWith(".zip") && name.includes("scorm")) {
    return { min: 20 * MB, max: 300 * MB, label: "20 – 300 MB" };
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
  label: "Profile Photo" | "Government ID Proof" | "Supporting Documents",
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

  if (label === "Government ID Proof") {
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
      className={`institutionField institutionSelectField institutionRadioSelectField ${
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



const DOB_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOB_MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DOB_WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDob(value: string) {
  const result = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);
  if (!result) return new Date();
  return new Date(Number(result[1]), Number(result[2]) - 1, Number(result[3]));
}

function formatDob(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDobDisplay(value: string) {
  const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!result) return value || "dd/mm/yyyy";
  return `${result[3]}/${result[2]}/${result[1]}`;
}

function DateOfBirthCalendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const initial = parseDob(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear] = useState(initial.getFullYear());
  const [yearStart, setYearStart] = useState(initial.getFullYear() - 5);

  const selected = parseDob(value);

  const showCalendar = () => {
    const current = parseDob(value);
    setMonth(current.getMonth());
    setYear(current.getFullYear());
    setYearStart(current.getFullYear() - 5);
    setView("days");
    setOpen(true);
  };

  const moveMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const calendarCellCount =
    firstWeekday + daysInMonth <= 35 ? 35 : 42;

  const dayCells = Array.from({ length: calendarCellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1) return { day: daysInPreviousMonth + day, offset: -1 };
    if (day > daysInMonth) return { day: day - daysInMonth, offset: 1 };
    return { day, offset: 0 };
  });

  const years = Array.from({ length: 12 }, (_, index) => yearStart + index);

  return (
    <div className="institutionField institutionEditableField dobNeumorphicField">
      <div className="institutionFieldText">
        <div className="institutionFieldLabel">Date of Birth</div>
        <button
          type="button"
          className={`dobNeumorphicValue ${
            !value ? "dobNeumorphicPlaceholder" : ""
          }`}
          onClick={showCalendar}
        >
          {value ? formatDobDisplay(value) : "dd/mm/yyyy"}
        </button>
      </div>

      <button
        type="button"
        className="institutionFieldAction dobNeumorphicIconButton"
        aria-label="Open Date of Birth calendar"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : showCalendar())}
      >
        <IconImage src={images.calendar} width={18} height={18} />
      </button>

      {open && (
        <div className="dobNeumorphicCalendar" role="dialog" aria-label="Select Date of Birth">
          <div className="dobCalendarToolbar">
            <button type="button" className="dobCalendarArrow" onClick={() => moveMonth(-1)} aria-label="Previous month">‹</button>

            <button type="button" className="dobCalendarPicker" onClick={() => setView("months")}>
              <span>{DOB_MONTH_NAMES[month]}</span><span>⌄</span>
            </button>

            <button
              type="button"
              className="dobCalendarPicker"
              onClick={() => {
                setYearStart(year - 5);
                setView("years");
              }}
            >
              <span>{year}</span><span>⌄</span>
            </button>

            <button type="button" className="dobCalendarArrow" onClick={() => moveMonth(1)} aria-label="Next month">›</button>
          </div>

          {view === "days" && (
            <>
              <div className="dobCalendarWeekdays">
                {DOB_WEEK_DAYS.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="dobCalendarDayGrid">
                {dayCells.map((item, index) => {
                  const date = new Date(year, month + item.offset, item.day);
                  const isSelected =
                    selected.getFullYear() === date.getFullYear() &&
                    selected.getMonth() === date.getMonth() &&
                    selected.getDate() === date.getDate();

                  return (
                    <button
                      type="button"
                      key={`${item.offset}-${item.day}-${index}`}
                      className={`dobCalendarDay ${item.offset !== 0 ? "dobCalendarMuted" : ""} ${isSelected ? "dobCalendarSelected" : ""}`}
                      onClick={() => {
                        onChange(formatDob(date));
                        setOpen(false);
                      }}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === "months" && (
            <div className="dobCalendarPillGrid">
              {DOB_MONTH_SHORT.map((name, index) => (
                <button
                  type="button"
                  key={name}
                  className={`dobCalendarPill ${month === index ? "dobCalendarPillSelected" : ""}`}
                  onClick={() => {
                    setMonth(index);
                    setView("days");
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {view === "years" && (
            <>
              <div className="dobCalendarYearRange">
                <button type="button" className="dobCalendarRoundArrow" onClick={() => setYearStart((v) => v - 12)}>‹</button>
                <strong>{yearStart} - {yearStart + 11}</strong>
                <button type="button" className="dobCalendarRoundArrow" onClick={() => setYearStart((v) => v + 12)}>›</button>
              </div>
              <div className="dobCalendarPillGrid">
                {years.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`dobCalendarPill ${year === item ? "dobCalendarPillSelected" : ""}`}
                    onClick={() => {
                      setYear(item);
                      setView("days");
                    }}
                  >
                    {item}
                  </button>
                ))}
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
    <div
      className={`institutionInformationHeader ${
        popupType ? "institutionInformationHeaderHasPopup" : ""
      } ${editing ? "institutionInformationHeaderEditing" : ""}`}
    >
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
                : "institutionInlinePopupDiscarded"
            }`}
            role={popupType === "error" ? "alert" : "status"}
            aria-live={popupType === "error" ? "assertive" : "polite"}
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

        {!editing && !popupType && (
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
  const [confirmation, setConfirmation] = useState(false);

  const [profilePhotoCompleted, setProfilePhotoCompleted] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
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
    "Profile Photo": null,
    "Government ID Proof": null,
    "Supporting Documents": null,
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
    coordinatorId: "PRGEEQJQCBU006B",
    fullName: "Antony Thomas",
    dob: "",
    gender: "",
    qualification: "",
    employeeCode: "EMP-0042",
    officialEmail: "",
    alternateEmail: "",
    mobileNumber: "",
    alternatePhone: "",
    totalExperience: "",
    dateOfJoining: "2004-05-17",
    department: "",
    programmes: [] as string[],
    designation: "",
    batches: [] as string[],
    academicYear: "",
    tenantId: "LXP-COL-001",
    reportingAuthority: "",
    status: "Active",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    jobLevel: "",
    workLocation: "",
    primaryDomain: "",
    expertise: [] as string[],
    responsibilities: [] as string[],
    programmes: [] as string[],
    coordinationExperience: "",
    trainingExperience: "",
  });

  const [skillsInfo, setSkillsInfo] = useState({
    coreSkills: [] as string[],
    digitalSkills: [] as string[],
    skillLevel: "",
    developmentAreas: [] as string[],
    learningInterests: [] as string[],
    careerGoals: "",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
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

  const isValidPhoneNumber = (value: string) =>
    /^\d{10}$/.test(value.replace(/\D/g, ""));

  const isValidEmail = (value: string) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const registrationFormComplete = Boolean(
    registrationDraft.dob &&
      registrationDraft.gender &&
      registrationDraft.qualification &&
      registrationDraft.officialEmail.trim() &&
      isValidEmail(registrationDraft.officialEmail.trim()) &&
      isValidPhoneNumber(registrationDraft.mobileNumber) &&
      (!registrationDraft.alternateEmail.trim() ||
        isValidEmail(registrationDraft.alternateEmail.trim())) &&
      (!registrationDraft.alternatePhone ||
        isValidPhoneNumber(registrationDraft.alternatePhone)) &&
      registrationDraft.totalExperience &&
      registrationDraft.department &&
      registrationDraft.programmes.length > 0 &&
      registrationDraft.designation &&
      registrationDraft.batches.length > 0 &&
      registrationDraft.academicYear &&
      registrationDraft.reportingAuthority &&
      registrationDraft.status
  );

  const professionalFormComplete = Boolean(
    professionalDraft.jobLevel &&
      professionalDraft.workLocation &&
      professionalDraft.primaryDomain &&
      professionalDraft.expertise.length > 0 &&
      professionalDraft.responsibilities.length > 0 &&
      professionalDraft.programmes.length > 0 &&
      professionalDraft.coordinationExperience &&
      professionalDraft.trainingExperience
  );

  const skillsFormComplete = Boolean(
    skillsDraft.coreSkills.length > 0 &&
      skillsDraft.digitalSkills.length > 0 &&
      skillsDraft.skillLevel &&
      skillsDraft.developmentAreas.length > 0 &&
      skillsDraft.learningInterests.length > 0 &&
      skillsDraft.careerGoals
  );

  const documentsFormComplete = Boolean(
    governmentIdDocumentType.trim() &&
      documentFiles["Profile Photo"] &&
      documentFiles["Government ID Proof"] &&
      documentFiles["Supporting Documents"]
  );

  const registrationStepComplete = Boolean(
    profilePhotoCompleted && registrationFormComplete
  );

  const professionalStepComplete = Boolean(
    registrationStepComplete && professionalFormComplete
  );

  const skillsStepComplete = Boolean(
    professionalStepComplete && skillsFormComplete
  );

  const documentsStepComplete = Boolean(
    skillsStepComplete && documentsFormComplete
  );

  useEffect(() => {
    setRegistrationCompleted(registrationStepComplete);
  }, [registrationStepComplete]);

  useEffect(() => {
    setProfessionalProfileCompleted(professionalStepComplete);
  }, [professionalStepComplete]);

  useEffect(() => {
    setSkillsDevelopmentCompleted(skillsStepComplete);
  }, [skillsStepComplete]);

  useEffect(() => {
    setDocumentsCompleted(documentsStepComplete);
  }, [documentsStepComplete]);

  /* Live validation in the same existing section popup position. */
  useEffect(() => {
    if (editingSection !== "registration") {
      return;
    }

    const officialEmail = registrationDraft.officialEmail.trim();
    const alternateEmail = registrationDraft.alternateEmail.trim();
    const mobileNumber = registrationDraft.mobileNumber.replace(/\D/g, "");
    const alternatePhone =
      registrationDraft.alternatePhone.replace(/\D/g, "");

    let message: string | null = null;

    if (officialEmail && !isValidEmail(officialEmail)) {
      message = "Enter a valid Official Email";
    } else if (alternateEmail && !isValidEmail(alternateEmail)) {
      message = "Enter a valid Alternate Email";
    } else if (mobileNumber && !isValidPhoneNumber(mobileNumber)) {
      message = "Mobile Number must be 10 digits";
    } else if (alternatePhone && !isValidPhoneNumber(alternatePhone)) {
      message = "Alternate Phone must be 10 digits";
    }

    setSectionPopup((current) => {
      if (message) {
        return {
          section: "registration",
          type: "error",
          message,
        };
      }

      if (
        current?.section === "registration" &&
        current.type === "error"
      ) {
        return null;
      }

      return current;
    });
  }, [
    editingSection,
    registrationDraft.officialEmail,
    registrationDraft.alternateEmail,
    registrationDraft.mobileNumber,
    registrationDraft.alternatePhone,
  ]);

  const showSectionError = (section: SectionName, message: string) => {
    setSectionPopup({ section, type: "error", message });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === section &&
        current.type === "error" &&
        current.message === message
          ? null
          : current
      );
    }, 2500);
  };

  const commitCurrentSection = (section: SectionName) => {
    if (section === "registration") {
      const officialEmail = registrationDraft.officialEmail.trim();
      const alternateEmail = registrationDraft.alternateEmail.trim();

      if (officialEmail && !isValidEmail(officialEmail)) {
        setSectionPopup({
          section: "registration",
          type: "error",
          message: "Enter a valid Official Email",
        });
        return false;
      }

      if (alternateEmail && !isValidEmail(alternateEmail)) {
        setSectionPopup({
          section: "registration",
          type: "error",
          message: "Enter a valid Alternate Email",
        });
        return false;
      }

      if (
        registrationDraft.mobileNumber &&
        !isValidPhoneNumber(registrationDraft.mobileNumber)
      ) {
        setSectionPopup({
          section: "registration",
          type: "error",
          message: "Mobile Number must be 10 digits",
        });
        return false;
      }

      if (
        registrationDraft.alternatePhone &&
        !isValidPhoneNumber(registrationDraft.alternatePhone)
      ) {
        setSectionPopup({
          section: "registration",
          type: "error",
          message: "Alternate Phone must be 10 digits",
        });
        return false;
      }

      if (!registrationFormComplete) {
        showSectionError(
          "registration",
          "Please complete all required Registration Data fields."
        );
        return false;
      }

      setRegistrationInfo({
        ...registrationDraft,
        officialEmail,
        alternateEmail,
        programmes: [...registrationDraft.programmes],
        batches: [...registrationDraft.batches],
      });

      return true;
    }

    if (section === "professional") {
      if (!professionalFormComplete) {
        showSectionError(
          "professional",
          "Please complete the required Trainer Profile fields."
        );
        return false;
      }

      setProfessionalInfo({
        ...professionalDraft,
        expertise: [...professionalDraft.expertise],
        responsibilities: [...professionalDraft.responsibilities],
        programmes: [...professionalDraft.programmes],
      });

      return true;
    }

    if (section === "skills") {
      if (!skillsFormComplete) {
        showSectionError(
          "skills",
          "Please complete the required Skills & Growth fields."
        );
        return false;
      }

      setSkillsInfo({
        ...skillsDraft,
        coreSkills: [...skillsDraft.coreSkills],
        digitalSkills: [...skillsDraft.digitalSkills],
        developmentAreas: [...skillsDraft.developmentAreas],
        learningInterests: [...skillsDraft.learningInterests],
      });

      return true;
    }

    if (section === "documents") {
      if (!documentsFormComplete) {
        showSectionError(
          "documents",
          "Please complete all Documents fields and uploads."
        );
        return false;
      }

      documentFilesBeforeEditRef.current = null;
      governmentIdDocumentTypeBeforeEditRef.current = null;
      setDocumentUploadErrors({});

      return true;
    }

    return false;
  };

  const startSectionEdit = (section: SectionName) => {
    setSectionPopup(null);

    if (editingSection && editingSection !== section) {
      const committed = commitCurrentSection(editingSection);

      if (!committed) {
        return;
      }
    }

    if (section === "registration" && !profilePhotoCompleted) {
      showFlowPopup(
        "Please complete Profile Photo before Registration Data.",
        "registration"
      );
      return;
    }

    if (section === "professional" && !registrationStepComplete) {
      showFlowPopup(
        "Please complete Registration Data before Trainer Profile.",
        "professional"
      );
      return;
    }

    if (section === "skills" && !professionalStepComplete) {
      showFlowPopup(
        "Please complete Trainer Profile before Skills & Growth.",
        "skills"
      );
      return;
    }

    if (section === "documents" && !skillsStepComplete) {
      showFlowPopup(
        "Please complete Skills & Growth before Documents.",
        "documents"
      );
      return;
    }

    if (section === "registration") {
      setRegistrationDraft({
        ...registrationInfo,
        programmes: [...registrationInfo.programmes],
        batches: [...registrationInfo.batches],
      });
    }

    if (section === "professional") {
      setProfessionalDraft({
        ...professionalInfo,
        expertise: [...professionalInfo.expertise],
        responsibilities: [...professionalInfo.responsibilities],
        programmes: [...professionalInfo.programmes],
      });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        coreSkills: [...skillsInfo.coreSkills],
        digitalSkills: [...skillsInfo.digitalSkills],
        developmentAreas: [...skillsInfo.developmentAreas],
        learningInterests: [...skillsInfo.learningInterests],
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

  const cancelProfile = () => {
    const initialRegistration = {
      coordinatorId: "PRGEEQJQCBU006B",
      fullName: "Antony Thomas",
      dob: "",
      gender: "",
      qualification: "",
      employeeCode: "EMP-0042",
      officialEmail: "",
      alternateEmail: "",
      mobileNumber: "",
      alternatePhone: "",
      totalExperience: "",
      dateOfJoining: "2004-05-17",
      department: "",
      programmes: [] as string[],
      designation: "",
      batches: [] as string[],
      academicYear: "",
      tenantId: "LXP-COL-001",
      reportingAuthority: "",
      status: "Active",
    };

    const initialProfessional = {
      jobLevel: "",
      workLocation: "",
      primaryDomain: "",
      expertise: [] as string[],
      responsibilities: [] as string[],
      programmes: [] as string[],
      coordinationExperience: "",
      trainingExperience: "",
    };

    const initialSkills = {
      coreSkills: [] as string[],
      digitalSkills: [] as string[],
      skillLevel: "",
      developmentAreas: [] as string[],
      learningInterests: [] as string[],
      careerGoals: "",
    };

    setProfileImage(null);

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }

    setRegistrationInfo(initialRegistration);
    setRegistrationDraft(initialRegistration);

    setProfessionalInfo(initialProfessional);
    setProfessionalDraft(initialProfessional);

    setSkillsInfo(initialSkills);
    setSkillsDraft(initialSkills);

    setGovernmentIdDocumentType("");
    setDocumentFiles({
      "Profile Photo": null,
      "Government ID Proof": null,
      "Supporting Documents": null,
    });
    setDocumentUploadErrors({});

    documentFilesBeforeEditRef.current = null;
    governmentIdDocumentTypeBeforeEditRef.current = null;

    setProfilePhotoCompleted(false);
    setRegistrationCompleted(false);
    setProfessionalProfileCompleted(false);
    setSkillsDevelopmentCompleted(false);
    setDocumentsCompleted(false);
    setConfirmation(false);

    setEditingSection(null);
    setSectionPopup(null);
    setFlowPopup(null);
    setFlowPopupSection(null);
    setShowDraftSaved(false);
  };

  const saveProfile = () => {
    setSectionPopup(null);

    if (editingSection) {
      const committed = commitCurrentSection(editingSection);

      if (!committed) {
        return;
      }
    }

    const nextIncompleteStep =
      !profilePhotoCompleted
        ? "Profile Photo"
        : !registrationStepComplete
          ? "Registration Data"
          : !professionalStepComplete
            ? "Trainer Profile"
            : !skillsStepComplete
              ? "Skills & Growth"
              : !documentsStepComplete
                ? "Documents"
                : !confirmation
                  ? "Confirmation"
                  : null;

    if (nextIncompleteStep) {
      showFlowPopup(
        `Please complete ${nextIncompleteStep} before saving the profile.`,
        nextIncompleteStep === "Registration Data"
          ? "registration"
          : nextIncompleteStep === "Trainer Profile"
            ? "professional"
            : nextIncompleteStep === "Skills & Growth"
              ? "skills"
              : nextIncompleteStep === "Documents"
                ? "documents"
                : "confirmation"
      );
      return;
    }

    setEditingSection(null);
    window.location.assign("/sign_in");
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
    label: "Profile Photo" | "Government ID Proof" | "Supporting Documents",
    file: File | null
  ) => {
    if (!file) return;

    if (!isAcceptedDocumentFile(label, file)) {
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: "",
      }));
      showSectionError(
        "documents",
        `Unsupported file type. ${DOCUMENT_UPLOAD_LIMITS[label].label}`
      );
      return;
    }

    const recommendedSize = getDocumentRecommendedSize(file);

    if (recommendedSize === null) {
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: "",
      }));
      showSectionError("documents", "Unsupported file type.");
      return;
    }

    if (
      file.size < recommendedSize.min ||
      file.size > recommendedSize.max
    ) {
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: "",
      }));
      showSectionError(
        "documents",
        `${label}: recommended file size is ${recommendedSize.label}.`
      );
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
    setSectionPopup(null);
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
    document.title = "Corporate Coordinator Profile | Neuro LXP";
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
                <h1>Corporate Coordinator Profile</h1>
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
                  <div className="institutionRole">Corporate Coordinator</div>

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
                    <span>Trainer Profile</span>
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
                    <span>Registration Data</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {skillsDevelopmentCompleted ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Skills &amp; Development</span>
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
                editing={editingSection === "registration"}
                popupType={sectionPopup?.section === "registration" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "registration" ? sectionPopup.message : undefined}
                onEdit={() => startSectionEdit("registration")}
              />

              {flowPopup && flowPopupSection === "registration" && (
                <div className="institutionSectionFlowPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} className="institutionInlinePopupIcon" />
                  <span>{flowPopup}</span>
                </div>
              )}

              {editingSection === "registration" ? (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <EditField label="Coordinator ID" value={registrationDraft.coordinatorId} locked />
                  <EditField label="Full Name" value={registrationDraft.fullName} locked />
                  <DateOfBirthCalendar
                    value={registrationDraft.dob}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        dob: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Gender"
                    value={registrationDraft.gender}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Male", "Female", "Other", "Prefer not to say."]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, gender: value }))}
                  />
                  <SelectField
                    label="Highest Qualification"
                    value={registrationDraft.qualification}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["PhD", "M.Phil", "Master's Degree", "Bachelor's Degree", "PG Diploma", "Diploma", "Other"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, qualification: value }))}
                  />
                  <EditField label="Employee Code" value={registrationDraft.employeeCode} locked />

                  <EditField
                    label="Official Email"
                    type="email"
                    value={registrationDraft.officialEmail}
                    placeholder="Enter Official Email"
                    visualIcon="edit"
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, officialEmail: value }))}
                  />
                  <EditField
                    label="Alternate Email"
                    type="email"
                    value={registrationDraft.alternateEmail}
                    placeholder="Enter Alternate Email"
                    visualIcon="edit"
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, alternateEmail: value }))}
                  />
                  <EditField
                    label="Mobile Number"
                    type="tel"
                    value={registrationDraft.mobileNumber}
                    placeholder="Enter Mobile Number"
                    visualIcon="edit"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        mobileNumber: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                  />

                  <EditField
                    label="Alternate Phone"
                    type="tel"
                    value={registrationDraft.alternatePhone}
                    placeholder="Enter Alternate Phone"
                    visualIcon="edit"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternatePhone: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                  />
                  <SelectField
                    label="Total Experience"
                    value={registrationDraft.totalExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16–20 years", "20+ years"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, totalExperience: value }))}
                  />
                  <EditField
                    label="Date of Joining"
                    value={registrationDraft.dateOfJoining}
                    locked
                  />

                  <SelectField
                    label="Assigned Department"
                    value={registrationDraft.department}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Academic", "Training", "Operations", "Administration", "IT", "HR", "Finance", "Research", "Placement", "Quality", "Other"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, department: value }))}
                  />
                  <MultiSelectField
                    label="Assigned Programmes"
                    value={registrationDraft.programmes}
                    placeholder="Select"
                    options={["Programs available in the institution"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, programmes: value }))}
                  />
                  <SelectField
                    label="Designation"
                    value={registrationDraft.designation}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Coordinator", "Senior Coordinator", "Program Coordinator", "Academic Coordinator", "Training Coordinator", "Operations Coordinator", "Other"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, designation: value }))}
                  />

                  <MultiSelectField
                    label="Assigned Batch"
                    value={registrationDraft.batches}
                    placeholder="Select"
                    options={["Batches related to selected programme"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, batches: value }))}
                  />
                  <SelectField
                    label="Academic Year"
                    value={registrationDraft.academicYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2024–25", "2025–26", "2026–27", "2027–28", "2028–29"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, academicYear: value }))}
                  />
                  <EditField label="Tenant ID" value={registrationDraft.tenantId} locked />

                  <SelectField
                    label="Reporting Authority"
                    value={registrationDraft.reportingAuthority}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Institute Admin", "Principal", "Director", "Program Head", "Department Head", "Platform Admin"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, reportingAuthority: value }))}
                  />
                  <EditField label="Status" value={registrationDraft.status} locked />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <DisplayField label="Coordinator ID" value={registrationInfo.coordinatorId} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField label="Date of Birth" value={registrationInfo.dob ? formatDobDisplay(registrationInfo.dob) : ""} placeholder="dd/mm/yyyy" />

                  <DisplayField label="Gender" value={registrationInfo.gender} placeholder="Select" />
                  <DisplayField label="Highest Qualification" value={registrationInfo.qualification} placeholder="Select" />
                  <DisplayField label="Employee Code" value={registrationInfo.employeeCode} />

                  <DisplayField label="Official Email" value={registrationInfo.officialEmail} placeholder="Enter Official Email" />
                  <DisplayField label="Alternate Email" value={registrationInfo.alternateEmail} placeholder="Enter Alternate Email" />
                  <DisplayField
                    label="Mobile Number"
                    value={registrationInfo.mobileNumber}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Alternate Phone"
                    value={registrationInfo.alternatePhone}
                    placeholder="Select"
                  />
                  <DisplayField label="Total Experience" value={registrationInfo.totalExperience} placeholder="Select" />
                  <DisplayField label="Date of Joining" value={registrationInfo.dateOfJoining} />

                  <DisplayField label="Assigned Department" value={registrationInfo.department} placeholder="Select" />
                  <DisplayField label="Assigned Programmes" value={registrationInfo.programmes.join(", ")} placeholder="Select" />
                  <DisplayField label="Designation" value={registrationInfo.designation} placeholder="Select" />

                  <DisplayField label="Assigned Batch" value={registrationInfo.batches.join(", ")} placeholder="Select" />
                  <DisplayField label="Academic Year" value={registrationInfo.academicYear} placeholder="Select" />
                  <DisplayField label="Tenant ID" value={registrationInfo.tenantId} />

                  <DisplayField label="Reporting Authority" value={registrationInfo.reportingAuthority} placeholder="Select" />
                  <DisplayField label="Status" value={registrationInfo.status} />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Trianer Profile"
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
                  <SelectField
                    label="Job Level"
                    value={professionalDraft.jobLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Entry Level", "Junior", "Mid-Level", "Senior", "Manager", "Senior Manager", "Head / Lead"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, jobLevel: value }))}
                  />
                  <SelectField
                    label="Work Location"
                    value={professionalDraft.workLocation}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["On-site", "Remote", "Hybrid"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, workLocation: value }))}
                  />
                  <SelectField
                    label="Primary Domain"
                    value={professionalDraft.primaryDomain}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Training & L&D", "Academic", "Operations", "Technology", "Program Management", "Administration", "HR", "Research", "Placement", "Other"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, primaryDomain: value }))}
                  />

                  <MultiSelectField
                    label="Expertise"
                    value={professionalDraft.expertise}
                    placeholder="Select"
                    options={["Training", "Operations", "Program Management", "Academic Coordination", "Curriculum Development", "Batch Management", "Faculty Coordination", "Student Support", "Assessment", "Industry Engagement"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, expertise: value }))}
                  />
                  <MultiSelectField
                    label="Key Responsibilities"
                    value={professionalDraft.responsibilities}
                    placeholder="Select"
                    options={["Program Planning", "Training Coordination", "Batch Management", "Faculty Coordination", "Curriculum Management", "Assessment Coordination", "Reporting", "Student Support", "Event Management"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, responsibilities: value }))}
                  />
                  <MultiSelectField
                    label="Programs / Initiatives"
                    value={professionalDraft.programmes}
                    placeholder="Select"
                    options={["Leadership Bootcamp", "AI Foundations", "Data Analytics Program", "Faculty Development Program", "Industry Connect", "Skill Development Program", "Other"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, programmes: value }))}
                  />

                  <SelectField
                    label="Coordination Experience"
                    value={professionalDraft.coordinationExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, coordinationExperience: value }))}
                  />
                  <SelectField
                    label="Training / L&D Experience"
                    value={professionalDraft.trainingExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["No Experience", "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, trainingExperience: value }))}
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <DisplayField label="Job Level" value={professionalInfo.jobLevel} placeholder="Select" />
                  <DisplayField label="Work Location" value={professionalInfo.workLocation} placeholder="Select" />
                  <DisplayField label="Primary Domain" value={professionalInfo.primaryDomain} placeholder="Select" />
                  <DisplayField label="Expertise" value={professionalInfo.expertise.join(", ")} placeholder="Select" />
                  <DisplayField label="Key Responsibilities" value={professionalInfo.responsibilities.join(", ")} placeholder="Select" />
                  <DisplayField label="Programs / Initiatives" value={professionalInfo.programmes.join(", ")} placeholder="Select" />
                  <DisplayField label="Coordination Experience" value={professionalInfo.coordinationExperience} placeholder="Select" />
                  <DisplayField label="Training / L&D Experience" value={professionalInfo.trainingExperience} placeholder="Select" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Skills & Growth"
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
                  <MultiSelectField
                    label="Core Skills"
                    value={skillsDraft.coreSkills}
                    placeholder="Select"
                    options={["Communication", "Leadership", "Problem Solving", "Team Management", "Time Management", "Decision Making", "Project Management", "Conflict Resolution"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, coreSkills: value }))}
                  />
                  <MultiSelectField
                    label="Digital Skills"
                    value={skillsDraft.digitalSkills}
                    placeholder="Select"
                    options={["LMS", "Excel", "Power BI", "SQL", "Python", "MS Office", "Google Workspace", "CRM", "AI Tools"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, digitalSkills: value }))}
                  />
                  <SelectField
                    label="Skill Level"
                    value={skillsDraft.skillLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, skillLevel: value }))}
                  />

                  <MultiSelectField
                    label="Development Areas"
                    value={skillsDraft.developmentAreas}
                    placeholder="Select"
                    options={["Leadership", "Communication", "Data Analytics", "Project Management", "AI", "Digital Transformation", "Strategic Planning", "People Management"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, developmentAreas: value }))}
                  />
                  <MultiSelectField
                    label="Learning Interests"
                    value={skillsDraft.learningInterests}
                    placeholder="Select"
                    options={["AI", "Leadership", "Data Analytics", "Cloud Computing", "Cybersecurity", "Project Management", "Instructional Design", "Digital Learning"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, learningInterests: value }))}
                  />
                  <SelectField
                    label="Career Goals"
                    value={skillsDraft.careerGoals}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["L&D Manager", "Program Manager", "Training Manager", "Operations Manager", "Academic Manager", "Program Head", "Senior Coordinator", "Other"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, careerGoals: value }))}
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <DisplayField label="Core Skills" value={skillsInfo.coreSkills.join(", ")} placeholder="Select" />
                  <DisplayField label="Digital Skills" value={skillsInfo.digitalSkills.join(", ")} placeholder="Select" />
                  <DisplayField label="Skill Level" value={skillsInfo.skillLevel} placeholder="Select" />
                  <DisplayField label="Development Areas" value={skillsInfo.developmentAreas.join(", ")} placeholder="Select" />
                  <DisplayField label="Learning Interests" value={skillsInfo.learningInterests.join(", ")} placeholder="Select" />
                  <DisplayField label="Career Goals" value={skillsInfo.careerGoals} placeholder="Select" />
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
                {["Profile Photo", "Government ID Proof", "Supporting Documents"].map(
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
                              onChange={setGovernmentIdDocumentType}
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
                                    | "Profile Photo"
                                    | "Government ID Proof"
                                    | "Supporting Documents"
                                ].accept
                              }
                              onChange={(event) => {
                                handleDocumentFileSelect(
                                  label as
                                    | "Profile Photo"
                                    | "Government ID Proof"
                                    | "Supporting Documents",
                                  event.target.files?.[0] ?? null
                                );
                                event.target.value = "";
                              }}
                            />
                            <span className={`institutionChooseFileButton ${
                                documentFiles[label]
                                  ? "institutionChooseFileButtonUploaded"
                                  : "institutionChooseFileButtonEmpty"
                              }`}>
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
                                  : "institutionChooseFileButtonEmpty"
                              }`}
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
                          "Please complete Profile Photo before Confirmation.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !registrationCompleted) {
                        showFlowPopup(
                          "Please complete Registration Data before Confirmation.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !professionalProfileCompleted) {
                        showFlowPopup(
                          "Please complete Trainer Profile before Confirmation.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !skillsDevelopmentCompleted) {
                        showFlowPopup(
                          "Please complete Skills & Growth before Confirmation.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !documentsCompleted) {
                        showFlowPopup(
                          "Please complete Documents before Confirmation.",
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
                className="institutionBottomButton institutionProfileCancelButton"
                onClick={cancelProfile}
              >
                <IconImage
                  src={images.cancel}
                  width={16}
                  height={16}
                  className="institutionProfileCancelIcon"
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
