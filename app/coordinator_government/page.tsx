"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./gvt.css";
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
  clap: "/assets/corporateicons/clap.svg",
  sad: "/assets/corporateicons/sad.svg",
  calendar: "/assets/corporateicons/calendar.svg",

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


type CalendarDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function CalendarDateField({
  label,
  value,
  onChange,
}: CalendarDateFieldProps) {
  const inputId = useId();
  const calendarRef = useRef<HTMLDivElement>(null);
  const parsedValue =
    value && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : null;

  const today = new Date();
  const initialDate = parsedValue ?? today;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor((initialDate.getFullYear() - 4) / 12) * 12
  );

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  useEffect(() => {
    const closeCalendar = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setView("days");
      }
    };

    document.addEventListener("mousedown", closeCalendar);
    return () => document.removeEventListener("mousedown", closeCalendar);
  }, []);

  useEffect(() => {
    if (!parsedValue) return;
    setDisplayMonth(parsedValue.getMonth());
    setDisplayYear(parsedValue.getFullYear());
    setYearPageStart(
      Math.floor((parsedValue.getFullYear() - 4) / 12) * 12
    );
  }, [value]);

  const formatDisplayDate = (dateValue: string) => {
    if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return "dd/mm/yyyy";
    }

    const [year, month, day] = dateValue.split("-");
    return `${day}/${month}/${year}`;
  };

  const toValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const firstDay = new Date(displayYear, displayMonth, 1);
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const visibleDayCount =
    Math.ceil((firstDay.getDay() + daysInMonth) / 7) * 7;
  const calendarStart = new Date(
    displayYear,
    displayMonth,
    1 - firstDay.getDay()
  );

  const days = Array.from({ length: visibleDayCount }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return {
      date,
      currentMonth: date.getMonth() === displayMonth,
    };
  });

  const selectedValue = parsedValue ? toValue(parsedValue) : "";

  const moveMonth = (amount: number) => {
    const next = new Date(displayYear, displayMonth + amount, 1);
    setDisplayMonth(next.getMonth());
    setDisplayYear(next.getFullYear());
  };

  const selectDay = (date: Date) => {
    onChange(toValue(date));
    setDisplayMonth(date.getMonth());
    setDisplayYear(date.getFullYear());
    setOpen(false);
    setView("days");
  };

  const selectMonth = (monthIndex: number) => {
    setDisplayMonth(monthIndex);
    setView("days");
  };

  const selectYear = (year: number) => {
    setDisplayYear(year);
    setYearPageStart(Math.floor((year - 4) / 12) * 12);
    setView("days");
  };

  return (
    <div
      ref={calendarRef}
      className="institutionField institutionEditableField institutionCoordinatorDateField"
    >
      <div className="institutionFieldText">
        <label htmlFor={inputId} className="institutionFieldLabel">
          {label}
        </label>

        <button
          id={inputId}
          type="button"
          className={`institutionCalendarInputButton ${
            value ? "" : "institutionCalendarInputPlaceholder"
          }`}
          onClick={() => {
            setOpen((current) => !current);
            setView("days");
          }}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {formatDisplayDate(value)}
        </button>
      </div>

      <button
        type="button"
        className="institutionFieldAction institutionCoordinatorCalendarIcon"
        aria-label={`Open ${label} calendar`}
        onClick={() => {
          setOpen((current) => !current);
          setView("days");
        }}
      >
        <IconImage
          src={images.calendar}
          width={18}
          height={18}
          className="institutionCoordinatorCalendarSvg"
        />
      </button>

      {open && (
        <div className="institutionCalendarPopup" role="dialog" aria-label={label}>
          <div className="institutionCalendarTop">
            <button
              type="button"
              className="institutionCalendarHeaderButton"
              onClick={() =>
                setView((current) => (current === "months" ? "days" : "months"))
              }
            >
              {monthNames[displayMonth]}
              <span aria-hidden="true">⌄</span>
            </button>

            <button
              type="button"
              className="institutionCalendarHeaderButton"
              onClick={() => {
                setYearPageStart(
                  Math.floor((displayYear - 4) / 12) * 12
                );
                setView((current) => (current === "years" ? "days" : "years"));
              }}
            >
              {displayYear}
              <span aria-hidden="true">⌄</span>
            </button>
          </div>

          {view === "days" && (
            <>
              <div className="institutionCalendarWeekdays">
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="institutionCalendarDaysGrid">
                {days.map(({ date, currentMonth }) => {
                  const dateValue = toValue(date);
                  return (
                    <button
                      type="button"
                      key={dateValue}
                      className={`institutionCalendarDay ${
                        currentMonth ? "" : "institutionCalendarDayMuted"
                      } ${
                        selectedValue === dateValue
                          ? "institutionCalendarDaySelected"
                          : ""
                      }`}
                      onClick={() => selectDay(date)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === "months" && (
            <div className="institutionCalendarMonthsGrid">
              {shortMonthNames.map((month, index) => (
                <button
                  type="button"
                  key={month}
                  className={`institutionCalendarChoice ${
                    displayMonth === index
                      ? "institutionCalendarChoiceSelected"
                      : ""
                  }`}
                  onClick={() => selectMonth(index)}
                >
                  {month}
                </button>
              ))}
            </div>
          )}

          {view === "years" && (
            <>
              <div className="institutionCalendarYearRange">
                <button
                  type="button"
                  className="institutionCalendarRoundNav"
                  onClick={() => setYearPageStart((current) => current - 12)}
                  aria-label="Previous years"
                >
                  ‹
                </button>

                <strong>
                  {yearPageStart} - {yearPageStart + 11}
                </strong>

                <button
                  type="button"
                  className="institutionCalendarRoundNav"
                  onClick={() => setYearPageStart((current) => current + 12)}
                  aria-label="Next years"
                >
                  ›
                </button>
              </div>

              <div className="institutionCalendarYearsGrid">
                {Array.from({ length: 12 }, (_, index) => yearPageStart + index).map(
                  (year) => (
                    <button
                      type="button"
                      key={year}
                      className={`institutionCalendarChoice ${
                        displayYear === year
                          ? "institutionCalendarChoiceSelected"
                          : ""
                      }`}
                      onClick={() => selectYear(year)}
                    >
                      {year}
                    </button>
                  )
                )}
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
    coordinatorId: "PRGEEQIQC8U006B",
    fullName: "Antony Thomas",
    dateOfBirth: "",
    gender: "",
    highestQualification: "",
    employeeCode: "EMP-0042",
    officialEmail: "",
    mobileNumber: "",
    alternateEmail: "",
    alternatePhone: "",
    totalExperience: "",
    dateOfJoining: "17-05-2004",
    assignedPrograms: [] as string[],
    assignedRegion: "",
    designation: "",
    tenantId: "LXP-COL-001",
    reportingAuthority: "",
    status: "Active",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    department: "",
    division: "",
    grade: "",
    domain: "",
    expertise: [] as string[],
    programs: [] as string[],
    responsibilities: [] as string[],
    coordinationExperience: "",
    stakeholders: [] as string[],
  });

  const [skillsInfo, setSkillsInfo] = useState({
    coreSkills: [] as string[],
    digitalSkills: [] as string[],
    leadershipSkills: [] as string[],
    proficiency: "",
    trainingAttended: [] as string[],
    developmentAreas: [] as string[],
    careerGoal: "",
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

  const allObjectValuesComplete = (value: Record<string, unknown>) =>
    Object.values(value).every((item) => {
      if (Array.isArray(item)) return item.length > 0;
      if (typeof item === "string") return item.trim().length > 0;
      return item !== null && item !== undefined;
    });

  const registrationFormComplete = Boolean(
    registrationDraft.dateOfBirth &&
      registrationDraft.gender &&
      registrationDraft.highestQualification &&
      registrationDraft.officialEmail.trim() &&
      isValidEmail(registrationDraft.officialEmail.trim()) &&
      isValidPhoneNumber(registrationDraft.mobileNumber) &&
      (!registrationDraft.alternateEmail?.trim() ||
        isValidEmail(registrationDraft.alternateEmail.trim())) &&
      (!registrationDraft.alternatePhone ||
        isValidPhoneNumber(registrationDraft.alternatePhone)) &&
      allObjectValuesComplete(registrationDraft)
  );

  const professionalFormComplete = allObjectValuesComplete(professionalDraft);
  const skillsFormComplete = allObjectValuesComplete(skillsDraft);

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

  /* Live validation in the existing popup position. */
  useEffect(() => {
    if (editingSection !== "registration") return;

    const officialEmail = registrationDraft.officialEmail.trim();
    const alternateEmail = registrationDraft.alternateEmail?.trim() || "";
    const mobile = registrationDraft.mobileNumber.replace(/\D/g, "");
    const alternatePhone = registrationDraft.alternatePhone?.replace(/\D/g, "") || "";

    let message: string | null = null;

    if (officialEmail && !isValidEmail(officialEmail)) {
      message = "Enter a valid Official Email";
    } else if (alternateEmail && !isValidEmail(alternateEmail)) {
      message = "Enter a valid Alternate Email";
    } else if (mobile && !isValidPhoneNumber(mobile)) {
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

      if (current?.section === "registration" && current.type === "error") {
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
      if (!registrationFormComplete) {
        showSectionError(
          "registration",
          "Please complete all required Registration Data fields."
        );
        return false;
      }

      setRegistrationInfo({ ...registrationDraft });
      return true;
    }

    if (section === "professional") {
      if (!professionalFormComplete) {
        showSectionError(
          "professional",
          "Please complete all required Professional Profile fields."
        );
        return false;
      }

      setProfessionalInfo({ ...professionalDraft });
      return true;
    }

    if (section === "skills") {
      if (!skillsFormComplete) {
        showSectionError(
          "skills",
          "Please complete all required Skills & Growth fields."
        );
        return false;
      }

      setSkillsInfo({ ...skillsDraft });
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
      if (!committed) return;
    }

    if (section === "registration" && !profilePhotoCompleted) {
      showFlowPopup("Please complete Profile Photo first.", "registration");
      return;
    }

    if (section === "professional" && !registrationStepComplete) {
      showFlowPopup("Please complete Registration Data first.", "professional");
      return;
    }

    if (section === "skills" && !professionalStepComplete) {
      showFlowPopup("Please complete Professional Profile first.", "skills");
      return;
    }

    if (section === "documents" && !skillsStepComplete) {
      showFlowPopup("Please complete Skills & Growth first.", "documents");
      return;
    }

    if (section === "registration") setRegistrationDraft({ ...registrationInfo });
    if (section === "professional") setProfessionalDraft({ ...professionalInfo });
    if (section === "skills") setSkillsDraft({ ...skillsInfo });

    if (section === "documents") {
      documentFilesBeforeEditRef.current = { ...documentFiles };
      governmentIdDocumentTypeBeforeEditRef.current = governmentIdDocumentType;
      setDocumentUploadErrors({});
    }

    setEditingSection(section);
  };

  const cancelProfile = () => {
    const initialRegistration = {
    coordinatorId: "PRGEEQIQC8U006B",
    fullName: "Antony Thomas",
    dateOfBirth: "",
    gender: "",
    highestQualification: "",
    employeeCode: "EMP-0042",
    officialEmail: "",
    mobileNumber: "",
    alternateEmail: "",
    alternatePhone: "",
    totalExperience: "",
    dateOfJoining: "17-05-2004",
    assignedPrograms: [] as string[],
    assignedRegion: "",
    designation: "",
    tenantId: "LXP-COL-001",
    reportingAuthority: "",
    status: "Active",
  };
    const initialProfessional = {
    department: "",
    division: "",
    grade: "",
    domain: "",
    expertise: [] as string[],
    programs: [] as string[],
    responsibilities: [] as string[],
    coordinationExperience: "",
    stakeholders: [] as string[],
  };
    const initialSkills = {
    coreSkills: [] as string[],
    digitalSkills: [] as string[],
    leadershipSkills: [] as string[],
    proficiency: "",
    trainingAttended: [] as string[],
    developmentAreas: [] as string[],
    careerGoal: "",
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
    if (editingSection) {
      const committed = commitCurrentSection(editingSection);
      if (!committed) return;
    }

    const nextIncompleteStep =
      !profilePhotoCompleted
        ? "Profile Photo"
        : !registrationStepComplete
          ? "Registration Data"
          : !professionalStepComplete
            ? "Professional Profile"
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
          : nextIncompleteStep === "Professional Profile"
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
      showSectionError(
        "documents",
        `Unsupported file type. ${DOCUMENT_UPLOAD_LIMITS[label].label}`
      );
      return;
    }

    const recommendedSize = getDocumentRecommendedSize(file);

    if (recommendedSize === null) {
      showSectionError("documents", "Unsupported file type.");
      return;
    }

    if (
      file.size < recommendedSize.min ||
      file.size > recommendedSize.max
    ) {
      showSectionError(
        "documents",
        `Recommended file size is ${recommendedSize.label}.`
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

    setSectionPopup((current) =>
      current?.section === "documents" && current.type === "error"
        ? null
        : current
    );
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
    document.title = "Government Coordinator Profile | Neuro LXP";
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
                <h1>Government Coordinator Profile</h1>
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
                  <div className="institutionRole">Government Coordinator</div>

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
                    <span>Skills & Growth</span>
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
                popupType={
                  sectionPopup?.section === "registration"
                    ? sectionPopup.type
                    : null
                }
                popupMessage={
                  sectionPopup?.section === "registration"
                    ? sectionPopup.message
                    : undefined
                }
                onEdit={() => startSectionEdit("registration")}
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
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <EditField
                    label="Coordinator ID"
                    value={registrationDraft.coordinatorId}
                    locked
                  />

                  <EditField
                    label="Full Name"
                    value={registrationDraft.fullName}
                    locked
                  />

                  <CalendarDateField
                    label="Date of Birth"
                    value={registrationDraft.dateOfBirth}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        dateOfBirth: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Gender"
                    value={registrationDraft.gender}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Male", "Female", "Other", "Prefer not to say"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        gender: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Highest Qualification"
                    value={registrationDraft.highestQualification}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "PhD",
                      "M.Phil",
                      "Master's Degree",
                      "Bachelor's Degree",
                      "PG Diploma",
                      "Diploma",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        highestQualification: value,
                      }))
                    }
                  />

                  <EditField
                    label="Employee Code"
                    value={registrationDraft.employeeCode}
                    locked
                  />

                  <EditField
                    label="Official Email"
                    type="email"
                    value={registrationDraft.officialEmail}
                    placeholder="Enter Official Email"
                    visualIcon="edit"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        officialEmail: value,
                      }))
                    }
                  />

                  <EditField
                    label="Alternate Email"
                    type="email"
                    value={registrationDraft.alternateEmail}
                    placeholder="Enter Alternate Email"
                    visualIcon="edit"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternateEmail: value,
                      }))
                    }
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
                    options={[
                      "0–2 years",
                      "3–5 years",
                      "6–10 years",
                      "11–15 years",
                      "16–20 years",
                      "20+ years",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        totalExperience: value,
                      }))
                    }
                  />

                  <EditField
                    label="Date of Joining"
                    value={registrationDraft.dateOfJoining}
                    locked
                  />

                  <MultiSelectField
                    label="Assigned Programs"
                    value={registrationDraft.assignedPrograms}
                    placeholder="Select"
                    options={[
                      "Skill Development Scheme",
                      "Leadership Program",
                      "Digital Skills Program",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        assignedPrograms: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Assigned Region"
                    value={registrationDraft.assignedRegion}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "North",
                      "South",
                      "East",
                      "West",
                      "Central",
                      "Northeast",
                      "Pan India",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        assignedRegion: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Designation"
                    value={registrationDraft.designation}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Coordinator",
                      "Senior Coordinator",
                      "Program Coordinator",
                      "Training Coordinator",
                      "Operations Coordinator",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        designation: value,
                      }))
                    }
                  />

                  <EditField
                    label="Tenant ID"
                    value={registrationDraft.tenantId}
                    locked
                  />

                  <SelectField
                    label="Reporting Authority"
                    value={registrationDraft.reportingAuthority}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Institute Admin",
                      "Principal",
                      "Director",
                      "Program Head",
                      "Department Head",
                      "Platform Admin",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        reportingAuthority: value,
                      }))
                    }
                  />

                  <EditField
                    label="Status"
                    value={registrationDraft.status}
                    locked
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <DisplayField label="Coordinator ID" value={registrationInfo.coordinatorId} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField label="Date of Birth" value={registrationInfo.dateOfBirth} placeholder="dd/mm/yyyy" />

                  <DisplayField label="Gender" value={registrationInfo.gender} placeholder="Select" />
                  <DisplayField
                    label="Highest Qualification"
                    value={registrationInfo.highestQualification}
                    placeholder="Select"
                  />
                  <DisplayField label="Employee Code" value={registrationInfo.employeeCode} />

                  <DisplayField
                    label="Official Email"
                    value={registrationInfo.officialEmail}
                    placeholder="Enter Official Email"
                  />
                  <DisplayField
                    label="Alternate Email"
                    value={registrationInfo.alternateEmail}
                    placeholder="Enter Alternate Email"
                  />
                  <DisplayField
                    label="Mobile Number"
                    value={registrationInfo.mobileNumber}
                    placeholder="Enter Mobile Number"
                  />

                  <DisplayField
                    label="Alternate Phone"
                    value={registrationInfo.alternatePhone}
                    placeholder="Enter Alternate Phone"
                  />
                  <DisplayField
                    label="Total Experience"
                    value={registrationInfo.totalExperience}
                    placeholder="Select"
                  />
                  <DisplayField label="Date of Joining" value={registrationInfo.dateOfJoining} />

                  <DisplayField
                    label="Assigned Programs"
                    value={registrationInfo.assignedPrograms.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Assigned Region"
                    value={registrationInfo.assignedRegion}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Designation"
                    value={registrationInfo.designation}
                    placeholder="Select"
                  />

                  <DisplayField label="Tenant ID" value={registrationInfo.tenantId} />
                  <DisplayField
                    label="Reporting Authority"
                    value={registrationInfo.reportingAuthority}
                    placeholder="Select"
                  />
                  <DisplayField label="Status" value={registrationInfo.status} />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Trainer Profile"
                iconSrc={images.academicProfessional}
                iconTone="green"
                editing={editingSection === "professional"}
                popupType={
                  sectionPopup?.section === "professional"
                    ? sectionPopup.type
                    : null
                }
                popupMessage={
                  sectionPopup?.section === "professional"
                    ? sectionPopup.message
                    : undefined
                }
                onEdit={() => startSectionEdit("professional")}
              />

              {flowPopup && flowPopupSection === "professional" && (
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

              {editingSection === "professional" ? (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <SelectField
                    label="Department"
                    value={professionalDraft.department}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Training & Development",
                      "Administration",
                      "Academic",
                      "Operations",
                      "HR",
                      "IT",
                      "Finance",
                      "Research",
                      "Placement",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        department: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Division"
                    value={professionalDraft.division}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Training Delivery",
                      "Program Management",
                      "Operations",
                      "Quality",
                      "Administration",
                      "Digital Learning",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        division: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Grade"
                    value={professionalDraft.grade}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Grade A",
                      "Grade B",
                      "Grade C",
                      "Grade D",
                      "Senior Grade",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        grade: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Domain"
                    value={professionalDraft.domain}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Skill Development",
                      "Education",
                      "Training & L&D",
                      "Administration",
                      "Technology",
                      "Operations",
                      "Program Management",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        domain: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Expertise"
                    value={professionalDraft.expertise}
                    placeholder="Select"
                    options={[
                      "Training",
                      "Administration",
                      "Program Management",
                      "Batch Management",
                      "Curriculum Development",
                      "Assessment",
                      "Reporting",
                      "Stakeholder Management",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        expertise: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Programs"
                    value={professionalDraft.programs}
                    placeholder="Select"
                    options={[
                      "Skill Development Scheme",
                      "Leadership Development",
                      "Digital Skills",
                      "Employability Skills",
                      "Entrepreneurship",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        programs: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Responsibilities"
                    value={professionalDraft.responsibilities}
                    placeholder="Select"
                    options={[
                      "Program Planning",
                      "Training Coordination",
                      "Reporting",
                      "Batch Management",
                      "Stakeholder Coordination",
                      "Assessment",
                      "Documentation",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        responsibilities: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Coordination Experience"
                    value={professionalDraft.coordinationExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Less than 1 year",
                      "1–3 years",
                      "3–5 years",
                      "5–10 years",
                      "10+ years",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        coordinationExperience: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Stakeholders"
                    value={professionalDraft.stakeholders}
                    placeholder="Select"
                    options={[
                      "Government",
                      "Students",
                      "Faculty",
                      "Trainers",
                      "Employers",
                      "Industry Partners",
                      "NGOs",
                      "Academic Institutions",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        stakeholders: value,
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <DisplayField
                    label="Department"
                    value={professionalInfo.department}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Division"
                    value={professionalInfo.division}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Grade"
                    value={professionalInfo.grade}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Domain"
                    value={professionalInfo.domain}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Expertise"
                    value={professionalInfo.expertise.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Programs"
                    value={professionalInfo.programs.join(", ")}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Responsibilities"
                    value={professionalInfo.responsibilities.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Coordination Experience"
                    value={professionalInfo.coordinationExperience}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Stakeholders"
                    value={professionalInfo.stakeholders.join(", ")}
                    placeholder="Select"
                  />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Skills & Growth"
                iconSrc={images.skillsDevelopment}
                iconTone="blue"
                editing={editingSection === "skills"}
                popupType={
                  sectionPopup?.section === "skills"
                    ? sectionPopup.type
                    : null
                }
                popupMessage={
                  sectionPopup?.section === "skills"
                    ? sectionPopup.message
                    : undefined
                }
                onEdit={() => startSectionEdit("skills")}
              />

              {flowPopup && flowPopupSection === "skills" && (
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

              {editingSection === "skills" ? (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <MultiSelectField
                    label="Core Skills"
                    value={skillsDraft.coreSkills}
                    placeholder="Select"
                    options={[
                      "Planning",
                      "Communication",
                      "Problem Solving",
                      "Reporting",
                      "Team Management",
                      "Project Management",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        coreSkills: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Digital Skills"
                    value={skillsDraft.digitalSkills}
                    placeholder="Select"
                    options={[
                      "MS Office",
                      "Excel",
                      "LMS",
                      "Power BI",
                      "Google Workspace",
                      "CRM",
                      "Data Analytics",
                      "AI Tools",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        digitalSkills: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Leadership Skills"
                    value={skillsDraft.leadershipSkills}
                    placeholder="Select"
                    options={[
                      "Decision Making",
                      "Team Leadership",
                      "Delegation",
                      "Conflict Resolution",
                      "Strategic Thinking",
                      "Mentoring",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        leadershipSkills: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Proficiency"
                    value={skillsDraft.proficiency}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Beginner",
                      "Intermediate",
                      "Advanced",
                      "Expert",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        proficiency: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Training Attended"
                    value={skillsDraft.trainingAttended}
                    placeholder="Select"
                    options={[
                      "Leadership Development",
                      "Project Management",
                      "AI",
                      "Data Analytics",
                      "Train-the-Trainer",
                      "Communication Skills",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        trainingAttended: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Development Areas"
                    value={skillsDraft.developmentAreas}
                    placeholder="Select"
                    options={[
                      "Leadership",
                      "Data Analytics",
                      "AI",
                      "Project Management",
                      "Communication",
                      "Strategic Planning",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        developmentAreas: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Career Goal"
                    value={skillsDraft.careerGoal}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Senior Coordinator",
                      "Program Manager",
                      "Training Manager",
                      "Operations Manager",
                      "Program Head",
                      "Department Head",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        careerGoal: value,
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <DisplayField
                    label="Core Skills"
                    value={skillsInfo.coreSkills.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Digital Skills"
                    value={skillsInfo.digitalSkills.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Leadership Skills"
                    value={skillsInfo.leadershipSkills.join(", ")}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Proficiency"
                    value={skillsInfo.proficiency}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Training Attended"
                    value={skillsInfo.trainingAttended.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Development Areas"
                    value={skillsInfo.developmentAreas.join(", ")}
                    placeholder="Select"
                  />

                  <DisplayField
                    label="Career Goal"
                    value={skillsInfo.careerGoal}
                    placeholder="Select"
                  />
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
                popupMessage={
                  sectionPopup?.section === "documents"
                    ? sectionPopup.message
                    : undefined
                }
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
                            <span
                              className={`institutionChooseFileButton ${
                                documentFiles[label]
                                  ? "institutionChooseFileButtonUploaded"
                                  : ""
                              }`}
                            >
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
                                : ""
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
                          "Please complete Profile Photo",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !registrationCompleted) {
                        showFlowPopup(
                          "Please complete Registration Data",
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
