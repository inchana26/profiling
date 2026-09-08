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
import "./sngo.css";
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
  visualIcon?: "lock" | "edit" | "select" | "calendar";
  validate?: (value: string) => string | null;
  onValidationError?: (message: string) => void;
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
}: EditFieldProps) {
  const inputId = useId();
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

    if (message) {
      if (lastValidationErrorRef.current !== message) {
        lastValidationErrorRef.current = message;
        onValidationError?.(message);
      }
      return;
    }

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
            onChange={(event) => {
              const nextValue = event.target.value;
              onChange?.(nextValue);
              scheduleValidation(nextValue);
            }}
            onBlur={(event) => {
              if (validationTimerRef.current) {
                window.clearTimeout(validationTimerRef.current);
                validationTimerRef.current = null;
              }
              runValidation(event.currentTarget.value);
            }}
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
};

function CalendarDateField({
  label,
  value,
  onChange,
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

export default function StudentNgoPage() {
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
    employeeId: "LRN-2026-0145",
    fullName: "Antony Thomas",
    gender: "Male",
    dateOfBirth: "17-05-2004",
    mobileNumber: "+91 98765 43210",
    email: "antony.thomas@gov.in",
    address: "Bengaluru, Karnataka",
    programmeName: "Youth Skill Development",
    projectName: "Digital Employability",
    batchName: "YSD-2026-A",
    batchId: "BTH-0261",
    courseName: "Data Analytics",
    enrollmentDate: "15 Jun 2026",
    trainerName: "Rahul Kumar",
    centerName: "Bengaluru Skill Centre",
    qualification: "B.Com",
    occupation: "Student",
    annualIncome: "₹2.4 Lakh",
    socialCategory: "General",
    organizationName: "ABC Technologies",
    employmentStatus: "Unemployed",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    nationality: "",
    language: [] as string[],
    location: "",
    education: "",
    learning: [] as string[],
    learningMode: [] as string[],
    onlineExperience: "",
    devices: [] as string[],
    internetAccess: "",
    learningTime: "",
    hoursPerWeek: "",
    contentFormat: [] as string[],
    accessibilityNeeds: [] as string[],
  });

  const [skillsInfo, setSkillsInfo] = useState({
    careerSkills: "",
    skillsToAcquire: [] as string[],
    industry: [] as string[],
    workDomain: "",
    workExperience: "",
    digitalLiteracy: "",
    technicalSkills: [] as string[],
    softSkills: [] as string[],
    skillGaps: [] as string[],
    certifications: [] as string[],
    careerGoal: "",
    preferredRole: [] as string[],
    workLocation: [] as string[],
    salaryRange: "",
    workMode: "",
    trainingMotivation: [] as string[],
    portfolioEvidence: [] as string[],
    portfolio: "",
    instagramId: "",
    facebookUrl: "",
    twitterX: "",
    githubUrl: "",
    linkedinUrl: "",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [mobileCountry, setMobileCountry] = useState<Country | null>(null);
  const [alternatePhoneCountry, setAlternatePhoneCountry] =
    useState<Country | null>(null);
  const [professionalDraft, setProfessionalDraft] = useState(professionalInfo);
  const [skillsDraft, setSkillsDraft] = useState(skillsInfo);
  const [careerResumeFile, setCareerResumeFile] = useState<File | null>(null);

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

    let personalLearningReady = professionalProfileCompleted;
    let careerSkillsReady = skillsDevelopmentCompleted;

    if (editingSection && editingSection !== section) {
      if (editingSection === "professional") {
        const complete = Boolean(
          professionalDraft.nationality &&
          professionalDraft.language.length > 0 &&
          professionalDraft.location &&
          professionalDraft.education &&
          professionalDraft.learning.length > 0 &&
          professionalDraft.learningMode.length > 0 &&
          professionalDraft.onlineExperience &&
          professionalDraft.devices.length > 0 &&
          professionalDraft.internetAccess &&
          professionalDraft.learningTime &&
          professionalDraft.hoursPerWeek &&
          professionalDraft.contentFormat.length > 0 &&
          professionalDraft.accessibilityNeeds.length > 0
        );

        if (!complete) {
          showSectionError(
            "professional",
            "Please complete Personal & Learning."
          );
          return;
        }

        setProfessionalInfo({
          ...professionalDraft,
          language: [...professionalDraft.language],
          learning: [...professionalDraft.learning],
          learningMode: [...professionalDraft.learningMode],
          devices: [...professionalDraft.devices],
          contentFormat: [...professionalDraft.contentFormat],
          accessibilityNeeds: [...professionalDraft.accessibilityNeeds],
        });

        setProfessionalProfileCompleted(true);
        personalLearningReady = true;
      }

      if (editingSection === "skills") {
        const complete = Boolean(
          skillsDraft.careerSkills &&
          skillsDraft.skillsToAcquire.length > 0 &&
          skillsDraft.industry.length > 0 &&
          skillsDraft.workDomain &&
          skillsDraft.workExperience &&
          skillsDraft.digitalLiteracy &&
          skillsDraft.technicalSkills.length > 0 &&
          skillsDraft.softSkills.length > 0 &&
          skillsDraft.skillGaps.length > 0 &&
          skillsDraft.certifications.length > 0 &&
          skillsDraft.careerGoal &&
          skillsDraft.preferredRole.length > 0 &&
          skillsDraft.workLocation.length > 0 &&
          skillsDraft.salaryRange &&
          skillsDraft.workMode &&
          skillsDraft.trainingMotivation.length > 0 &&
          skillsDraft.portfolioEvidence.length > 0
        );

        if (!complete) {
          showSectionError(
            "skills",
            "Please complete Career & Skills."
          );
          return;
        }

        setSkillsInfo({
          ...skillsDraft,
          skillsToAcquire: [...skillsDraft.skillsToAcquire],
          industry: [...skillsDraft.industry],
          technicalSkills: [...skillsDraft.technicalSkills],
          softSkills: [...skillsDraft.softSkills],
          skillGaps: [...skillsDraft.skillGaps],
          certifications: [...skillsDraft.certifications],
          preferredRole: [...skillsDraft.preferredRole],
          workLocation: [...skillsDraft.workLocation],
          trainingMotivation: [...skillsDraft.trainingMotivation],
          portfolioEvidence: [...skillsDraft.portfolioEvidence],
        });

        setSkillsDevelopmentCompleted(true);
        careerSkillsReady = true;
      }

      if (editingSection === "documents") {
        const hasGovernmentId =
          governmentIdDocumentType.trim() !== "" &&
          documentFiles["Government ID Proof"] !== null;

        if (!hasGovernmentId) {
          showSectionError(
            "documents",
            "Please select Document Type and upload Government ID Proof."
          );
          return;
        }

        setDocumentsCompleted(true);
        documentFilesBeforeEditRef.current = null;
        governmentIdDocumentTypeBeforeEditRef.current = null;
      }
    }

    if (section === "skills" && !personalLearningReady) {
      showFlowPopup(
        "Please Complete Personal & Learning",
        "professional"
      );
      return;
    }

    if (section === "documents" && !careerSkillsReady) {
      showFlowPopup(
        "Please Complete Career & Skills",
        "skills"
      );
      return;
    }

    if (section === "professional") {
      setProfessionalDraft({
        ...professionalInfo,
        language: [...professionalInfo.language],
        learning: [...professionalInfo.learning],
        learningMode: [...professionalInfo.learningMode],
        devices: [...professionalInfo.devices],
        contentFormat: [...professionalInfo.contentFormat],
        accessibilityNeeds: [...professionalInfo.accessibilityNeeds],
      });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        skillsToAcquire: [...skillsInfo.skillsToAcquire],
        industry: [...skillsInfo.industry],
        technicalSkills: [...skillsInfo.technicalSkills],
        softSkills: [...skillsInfo.softSkills],
        skillGaps: [...skillsInfo.skillGaps],
        certifications: [...skillsInfo.certifications],
        preferredRole: [...skillsInfo.preferredRole],
        workLocation: [...skillsInfo.workLocation],
        trainingMotivation: [...skillsInfo.trainingMotivation],
        portfolioEvidence: [...skillsInfo.portfolioEvidence],
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

  const isValidWebAddress = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true;

    try {
      const candidate = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      const parsed = new URL(candidate);

      return (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        parsed.hostname.includes(".")
      );
    } catch {
      return false;
    }
  };

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

  const saveProfile = () => {
    const professionalSource =
      editingSection === "professional" ? professionalDraft : professionalInfo;

    const skillsSource =
      editingSection === "skills" ? skillsDraft : skillsInfo;

    const professionalComplete = Boolean(
      professionalSource.nationality &&
      professionalSource.language.length > 0 &&
      professionalSource.location &&
      professionalSource.education &&
      professionalSource.learning.length > 0 &&
      professionalSource.learningMode.length > 0 &&
      professionalSource.onlineExperience &&
      professionalSource.devices.length > 0 &&
      professionalSource.internetAccess &&
      professionalSource.learningTime &&
      professionalSource.hoursPerWeek &&
      professionalSource.contentFormat.length > 0 &&
      professionalSource.accessibilityNeeds.length > 0
    );

    const skillsComplete = Boolean(
      skillsSource.careerSkills &&
      skillsSource.skillsToAcquire.length > 0 &&
      skillsSource.industry.length > 0 &&
      skillsSource.workDomain &&
      skillsSource.workExperience &&
      skillsSource.digitalLiteracy &&
      skillsSource.technicalSkills.length > 0 &&
      skillsSource.softSkills.length > 0 &&
      skillsSource.skillGaps.length > 0 &&
      skillsSource.certifications.length > 0 &&
      skillsSource.careerGoal &&
      skillsSource.preferredRole.length > 0 &&
      skillsSource.workLocation.length > 0 &&
      skillsSource.salaryRange &&
      skillsSource.workMode &&
      skillsSource.trainingMotivation.length > 0 &&
      skillsSource.portfolioEvidence.length > 0
    );

    const documentsComplete =
      governmentIdDocumentType.trim() !== "" &&
      documentFiles["Government ID Proof"] !== null;

    const hasDocumentError = Object.values(documentUploadErrors).some(
      (message) => Boolean(message)
    );

    if (!profilePhotoCompleted) {
      showFlowPopup(
        "Please complete Profile Photo before saving the profile.",
        "profile"
      );
      return;
    }

    if (!professionalComplete) {
      showFlowPopup(
        "Please complete Personal & Learning before saving the profile.",
        "professional"
      );
      return;
    }

    if (!skillsComplete) {
      showFlowPopup(
        "Please complete Career & Skills before saving the profile.",
        "skills"
      );
      return;
    }

    if (hasDocumentError) {
      showFlowPopup(
        "Please correct the document upload error before saving the profile.",
        "documents"
      );
      return;
    }

    if (!documentsComplete) {
      showFlowPopup(
        "Please complete Documents before saving the profile.",
        "documents"
      );
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
      setProfessionalInfo({
        ...professionalDraft,
        language: [...professionalDraft.language],
        learning: [...professionalDraft.learning],
        learningMode: [...professionalDraft.learningMode],
        devices: [...professionalDraft.devices],
        contentFormat: [...professionalDraft.contentFormat],
        accessibilityNeeds: [...professionalDraft.accessibilityNeeds],
      });
    }

    if (editingSection === "skills") {
      setSkillsInfo({
        ...skillsDraft,
        skillsToAcquire: [...skillsDraft.skillsToAcquire],
        industry: [...skillsDraft.industry],
        technicalSkills: [...skillsDraft.technicalSkills],
        softSkills: [...skillsDraft.softSkills],
        skillGaps: [...skillsDraft.skillGaps],
        certifications: [...skillsDraft.certifications],
        preferredRole: [...skillsDraft.preferredRole],
        workLocation: [...skillsDraft.workLocation],
        trainingMotivation: [...skillsDraft.trainingMotivation],
        portfolioEvidence: [...skillsDraft.portfolioEvidence],
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
      nationality: "",
      language: [] as string[],
      location: "",
      education: "",
      learning: [] as string[],
      learningMode: [] as string[],
      onlineExperience: "",
      devices: [] as string[],
      internetAccess: "",
      learningTime: "",
      hoursPerWeek: "",
      contentFormat: [] as string[],
      accessibilityNeeds: [] as string[],
    };

    const emptySkillsInfo = {
      careerSkills: "",
      skillsToAcquire: [] as string[],
      industry: [] as string[],
      workDomain: "",
      workExperience: "",
      digitalLiteracy: "",
      technicalSkills: [] as string[],
      softSkills: [] as string[],
      skillGaps: [] as string[],
      certifications: [] as string[],
      careerGoal: "",
      preferredRole: [] as string[],
      workLocation: [] as string[],
      salaryRange: "",
      workMode: "",
      trainingMotivation: [] as string[],
      portfolioEvidence: [] as string[],
      portfolio: "",
      instagramId: "",
      facebookUrl: "",
      twitterX: "",
      githubUrl: "",
      linkedinUrl: "",
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
    setCareerResumeFile(null);

    setGovernmentIdDocumentType("");
    setDocumentFiles({
      "Profile Photo": null,
      "Government ID Proof": null,
      "Supporting Documents": null,
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
      const message = `Unsupported file type. ${DOCUMENT_UPLOAD_LIMITS[label].label}`;

      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: message,
      }));
      showSectionError("documents", message);
      return;
    }

    const recommendedSize = getDocumentRecommendedSize(file);

    if (recommendedSize === null) {
      const message = "Unsupported file type.";

      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: message,
      }));
      showSectionError("documents", message);
      return;
    }

    if (
      file.size < recommendedSize.min ||
      file.size > recommendedSize.max
    ) {
      const message = `Recommended file size is ${recommendedSize.label}.`;

      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: message,
      }));
      showSectionError("documents", message);
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
      source.nationality &&
      source.language.length > 0 &&
      source.location &&
      source.education &&
      source.learning.length > 0 &&
      source.onlineExperience &&
      source.devices.length > 0 &&
      source.internetAccess &&
      source.learningTime &&
      source.hoursPerWeek &&
      source.contentFormat.length > 0 &&
      source.accessibilityNeeds.length > 0
    );

    setProfessionalProfileCompleted(complete);
  }, [editingSection, professionalDraft, professionalInfo]);

  useEffect(() => {
    const source = editingSection === "skills" ? skillsDraft : skillsInfo;

    const complete = Boolean(
      source.careerSkills &&
      source.skillsToAcquire.length > 0 &&
      source.industry.length > 0 &&
      source.workDomain &&
      source.workExperience &&
      source.digitalLiteracy &&
      source.technicalSkills.length > 0 &&
      source.softSkills.length > 0 &&
      source.skillGaps.length > 0 &&
      source.certifications.length > 0 &&
      source.careerGoal &&
      source.preferredRole.length > 0 &&
      source.workLocation.length > 0 &&
      source.salaryRange &&
      source.workMode &&
      source.trainingMotivation.length > 0 &&
      source.portfolioEvidence.length > 0
    );

    setSkillsDevelopmentCompleted(complete);
  }, [editingSection, skillsDraft, skillsInfo]);

  useEffect(() => {
    const complete =
      governmentIdDocumentType.trim() !== "" &&
      documentFiles["Government ID Proof"] !== null &&
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
    document.title = "NGO Trainee Profile | Neuro LXP";
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
                <h1>NGO Trainee Profile</h1>
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
                  <div className="institutionRole">NGO Trainee</div>

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
                    <span>Personal &amp; Learning</span>
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
                    <span>Career &amp; Skills</span>
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
                <div className="institutionGrid">
                  <EditField label="Employee ID" value={registrationInfo.employeeId} locked />
                  <EditField label="Full Name" value={registrationInfo.fullName} locked />
                  <EditField label="Gender" value={registrationInfo.gender} locked />
                  <EditField label="Date of Birth" value={registrationInfo.dateOfBirth} locked />
                  <EditField label="Mobile Number" value={registrationInfo.mobileNumber} locked />
                  <EditField label="Email" value={registrationInfo.email} locked />
                  <EditField label="Address" value={registrationInfo.address} locked />
                  <EditField label="Programme Name" value={registrationInfo.programmeName} locked />
                  <EditField label="Project Name" value={registrationInfo.projectName} locked />
                  <EditField label="Batch Name" value={registrationInfo.batchName} locked />
                  <EditField label="Batch ID" value={registrationInfo.batchId} locked />
                  <EditField label="Course Name" value={registrationInfo.courseName} locked />
                  <EditField label="Enrollment Date" value={registrationInfo.enrollmentDate} locked />
                  <EditField label="Trainer Name" value={registrationInfo.trainerName} locked />
                  <EditField label="Center Name" value={registrationInfo.centerName} locked />
                  <EditField label="Qualification" value={registrationInfo.qualification} locked />
                  <EditField label="Occupation" value={registrationInfo.occupation} locked />
                  <EditField label="Annual Income" value={registrationInfo.annualIncome} locked />
                  <EditField label="Social Category" value={registrationInfo.socialCategory} locked />
                  <EditField label="Organization Name" value={registrationInfo.organizationName} locked />
                  <EditField label="Employment Status" value={registrationInfo.employmentStatus} locked />
                </div>
              ) : (
                <div className="institutionGrid">
                  <DisplayField label="Employee ID" value={registrationInfo.employeeId} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField label="Gender" value={registrationInfo.gender} />
                  <DisplayField label="Date of Birth" value={registrationInfo.dateOfBirth} />
                  <DisplayField label="Mobile Number" value={registrationInfo.mobileNumber} />
                  <DisplayField label="Email" value={registrationInfo.email} />
                  <DisplayField label="Address" value={registrationInfo.address} />
                  <DisplayField label="Programme Name" value={registrationInfo.programmeName} />
                  <DisplayField label="Project Name" value={registrationInfo.projectName} />
                  <DisplayField label="Batch Name" value={registrationInfo.batchName} />
                  <DisplayField label="Batch ID" value={registrationInfo.batchId} />
                  <DisplayField label="Course Name" value={registrationInfo.courseName} />
                  <DisplayField label="Enrollment Date" value={registrationInfo.enrollmentDate} />
                  <DisplayField label="Trainer Name" value={registrationInfo.trainerName} />
                  <DisplayField label="Center Name" value={registrationInfo.centerName} />
                  <DisplayField label="Qualification" value={registrationInfo.qualification} />
                  <DisplayField label="Occupation" value={registrationInfo.occupation} />
                  <DisplayField label="Annual Income" value={registrationInfo.annualIncome} />
                  <DisplayField label="Social Category" value={registrationInfo.socialCategory} />
                  <DisplayField label="Organization Name" value={registrationInfo.organizationName} />
                  <DisplayField label="Employment Status" value={registrationInfo.employmentStatus} />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Personal & Learning"
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
                <div className="institutionGrid">
                  <SelectField
                    label="Nationality"
                    value={professionalDraft.nationality}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Indian", "American", "British", "Canadian", "Australian", "Other"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, nationality: value }))
                    }
                  />

                  <MultiSelectField
                    label="Language"
                    value={professionalDraft.language}
                    placeholder="Select"
                    options={["English", "Kannada", "Hindi", "Tamil", "Telugu", "Malayalam", "Marathi", "Other"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, language: value }))
                    }
                  />

                  <SelectField
                    label="Location"
                    value={professionalDraft.location}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Chennai", "Hyderabad", "Mumbai", "Delhi NCR", "Other"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, location: value }))
                    }
                  />

                  <SelectField
                    label="Education"
                    value={professionalDraft.education}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["10th", "12th", "Diploma", "Undergraduate", "Postgraduate", "Doctoral", "Professional Certification"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, education: value }))
                    }
                  />

                  <MultiSelectField
                    label="Learning"
                    value={professionalDraft.learning}
                    placeholder="Select"
                    options={["Commerce", "Finance", "Management", "HR", "IT", "Data Analytics", "AI & ML", "Leadership", "Entrepreneurship"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, learning: value }))
                    }
                  />

                  <MultiSelectField
                    label="Learning Mode"
                    value={professionalDraft.learningMode}
                    placeholder="Select"
                    options={["Online", "Classroom", "Blended", "Self-paced", "Instructor-led", "Hands-on"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, learningMode: value }))
                    }
                  />

                  <SelectField
                    label="Online Experience"
                    value={professionalDraft.onlineExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Beginner", "Some Experience", "Experienced", "Advanced"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, onlineExperience: value }))
                    }
                  />

                  <MultiSelectField
                    label="Devices"
                    value={professionalDraft.devices}
                    placeholder="Select"
                    options={["Laptop", "Desktop", "Tablet", "Mobile", "Shared Device"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, devices: value }))
                    }
                  />

                  <SelectField
                    label="Internet Access"
                    value={professionalDraft.internetAccess}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Broadband", "Wi-Fi", "Mobile Data", "Limited Connectivity", "No Reliable Access"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, internetAccess: value }))
                    }
                  />

                  <SelectField
                    label="Learning Time"
                    value={professionalDraft.learningTime}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Morning", "Afternoon", "Evening", "Night", "Flexible"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, learningTime: value }))
                    }
                  />

                  <SelectField
                    label="Hours / Week"
                    value={professionalDraft.hoursPerWeek}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Less than 2 Hours", "2–5 Hours", "6–10 Hours", "11–15 Hours", "16+ Hours"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, hoursPerWeek: value }))
                    }
                  />

                  <MultiSelectField
                    label="Content Format"
                    value={professionalDraft.contentFormat}
                    placeholder="Select"
                    options={["Video", "PDF", "Presentation", "Interactive Course", "Quiz", "Webinar", "Audio", "Hands-on"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, contentFormat: value }))
                    }
                  />

                  <MultiSelectField
                    label="Accessibility Needs"
                    value={professionalDraft.accessibilityNeeds}
                    placeholder="Select"
                    options={["None", "Visual Support", "Hearing Support", "Mobility Support", "Learning Support", "Assistive Technology", "Other"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, accessibilityNeeds: value }))
                    }
                  />
                </div>
              ) : (
                <div className="institutionGrid">
                  <DisplayField label="Nationality" value={professionalInfo.nationality} placeholder="Select" />
                  <DisplayField label="Language" value={professionalInfo.language.join(", ")} placeholder="Select" />
                  <DisplayField label="Location" value={professionalInfo.location} placeholder="Select" />
                  <DisplayField label="Education" value={professionalInfo.education} placeholder="Select" />
                  <DisplayField label="Learning" value={professionalInfo.learning.join(", ")} placeholder="Select" />
                  <DisplayField label="Learning Mode" value={professionalInfo.learningMode.join(", ")} placeholder="Select" />
                  <DisplayField label="Online Experience" value={professionalInfo.onlineExperience} placeholder="Select" />
                  <DisplayField label="Devices" value={professionalInfo.devices.join(", ")} placeholder="Select" />
                  <DisplayField label="Internet Access" value={professionalInfo.internetAccess} placeholder="Select" />
                  <DisplayField label="Learning Time" value={professionalInfo.learningTime} placeholder="Select" />
                  <DisplayField label="Hours / Week" value={professionalInfo.hoursPerWeek} placeholder="Select" />
                  <DisplayField label="Content Format" value={professionalInfo.contentFormat.join(", ")} placeholder="Select" />
                  <DisplayField label="Accessibility Needs" value={professionalInfo.accessibilityNeeds.join(", ")} placeholder="Select" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Career & Skills"
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
                <div className="institutionGrid">
                  <SelectField
                    label="Career & Skills"
                    value={skillsDraft.careerSkills}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Postgraduate"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        careerSkills: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Skills to Acquire"
                    value={skillsDraft.skillsToAcquire}
                    placeholder="Select"
                    options={["Python", "Data Analytics", "AI/ML", "Cloud Computing", "Cybersecurity", "Power BI", "Leadership", "Communication"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        skillsToAcquire: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Industry"
                    value={skillsDraft.industry}
                    placeholder="Select"
                    options={["IT & Technology", "Banking & Finance", "Healthcare", "Education", "Manufacturing", "E-Commerce", "Consulting", "Government"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        industry: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Work Domain"
                    value={skillsDraft.workDomain}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Software Development", "Data Analytics", "AI & ML", "HR", "Finance", "Marketing", "Training & L&D", "Operations", "Administration"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        workDomain: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Work Experience"
                    value={skillsDraft.workExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["No Experience", "0–2 Years", "3–5 Years", "6–10 Years", "11–15 Years", "15+ Years"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        workExperience: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Digital Literacy"
                    value={skillsDraft.digitalLiteracy}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Basic", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        digitalLiteracy: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Technical Skills"
                    value={skillsDraft.technicalSkills}
                    placeholder="Select"
                    options={["Python", "Java", "SQL", "Excel", "Power BI", "JavaScript", "React", "Cloud", "LMS"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        technicalSkills: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Soft Skills"
                    value={skillsDraft.softSkills}
                    placeholder="Select"
                    options={["Communication", "Leadership", "Teamwork", "Problem Solving", "Time Management", "Presentation", "Adaptability"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        softSkills: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Skill Gaps"
                    value={skillsDraft.skillGaps}
                    placeholder="Select"
                    options={["Technical Skills", "Digital Skills", "Communication", "Leadership", "Domain Knowledge", "Project Management"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        skillGaps: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Certifications"
                    value={skillsDraft.certifications}
                    placeholder="Select"
                    options={["PMP", "Google Data Analytics", "AWS", "Microsoft", "NPTEL", "TOT", "Scrum Master"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        certifications: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Career Goal"
                    value={skillsDraft.careerGoal}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Get First Job", "Career Advancement", "Career Change", "Become a Specialist", "Become a Manager", "Entrepreneurship", "Higher Studies"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        careerGoal: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Preferred Role"
                    value={skillsDraft.preferredRole}
                    placeholder="Select"
                    options={["Data Analyst", "Software Developer", "Data Scientist", "AI Engineer", "HR Manager", "Project Manager", "Trainer"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        preferredRole: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Work Location"
                    value={skillsDraft.workLocation}
                    placeholder="Select"
                    options={["Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi NCR", "Remote", "Anywhere in India"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        workLocation: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Salary Range"
                    value={skillsDraft.salaryRange}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Below ₹3 LPA", "₹3–5 LPA", "₹5–8 LPA", "₹8–12 LPA", "₹12–20 LPA", "₹20+ LPA"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        salaryRange: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Work Mode"
                    value={skillsDraft.workMode}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["On-site", "Hybrid", "Remote", "Flexible"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        workMode: value,
                      }))
                    }
                  />

                  <MultiSelectField
                    label="Training Motivation"
                    value={skillsDraft.trainingMotivation}
                    placeholder="Select"
                    options={["Career Growth", "Job Placement", "Skill Improvement", "Certification", "Promotion", "Career Change", "Personal Development"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        trainingMotivation: value,
                      }))
                    }
                  />

                  <div className="institutionField institutionCareerResumeField">
                    <div className="institutionFieldLabel">Resume</div>

                    <div className="institutionFilePicker">
                      <label className="institutionFilePickerControl">
                        <input
                          className="institutionNativeFileInput"
                          type="file"
                          name="career-skills-resume"
                          aria-label="Resume"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(event) => {
                            setCareerResumeFile(event.target.files?.[0] ?? null);
                            event.target.value = "";
                          }}
                        />

                        <span
                          className={`institutionChooseFileButton ${
                            careerResumeFile
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
                        {careerResumeFile?.name || "No File Chosen"}
                      </span>
                    </div>
                  </div>

                  <EditField
                    label="Portfolio"
                    value={skillsDraft.portfolio}
                    placeholder="Enter Portfolio"
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        portfolio: value,
                      }))
                    }
                    validate={(value) =>
                      isValidWebAddress(value)
                        ? null
                        : "Please enter a valid Portfolio URL."
                    }
                    onValidationError={(message) =>
                      showSectionError("skills", message)
                    }
                    visualIcon="edit"
                  />

                  <EditField
                    label="Instagram ID"
                    value={skillsDraft.instagramId}
                    placeholder="Enter Instagram ID"
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        instagramId: value,
                      }))
                    }
                    visualIcon="edit"
                  />

                  <EditField
                    label="Facebook ID / URL"
                    value={skillsDraft.facebookUrl}
                    placeholder="Enter Facebook ID / URL"
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        facebookUrl: value,
                      }))
                    }
                    visualIcon="edit"
                  />

                  <EditField
                    label="Twitter / X"
                    value={skillsDraft.twitterX}
                    placeholder="Enter Twitter / X"
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        twitterX: value,
                      }))
                    }
                    visualIcon="edit"
                  />

                  <EditField
                    label="GitHub URL"
                    value={skillsDraft.githubUrl}
                    placeholder="Enter GitHub URL"
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        githubUrl: value,
                      }))
                    }
                    validate={(value) =>
                      isValidWebAddress(value)
                        ? null
                        : "Please enter a valid GitHub URL."
                    }
                    onValidationError={(message) =>
                      showSectionError("skills", message)
                    }
                    visualIcon="edit"
                  />

                  <EditField
                    label="LinkedIn"
                    value={skillsDraft.linkedinUrl}
                    placeholder="Enter LinkedIn"
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        linkedinUrl: value,
                      }))
                    }
                    validate={(value) =>
                      isValidWebAddress(value)
                        ? null
                        : "Please enter a valid LinkedIn URL."
                    }
                    onValidationError={(message) =>
                      showSectionError("skills", message)
                    }
                    visualIcon="edit"
                  />

                  <MultiSelectField
                    label="Portfolio Evidence"
                    value={skillsDraft.portfolioEvidence}
                    placeholder="Select"
                    options={["Training Dashboard", "Academic Project", "Industry Project", "Hackathon", "Research Project", "Case Study", "Certification Project"]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        portfolioEvidence: value,
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="institutionGrid">
                  <DisplayField
                    label="Career & Skills"
                    value={skillsInfo.careerSkills}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Skills to Acquire"
                    value={skillsInfo.skillsToAcquire.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Industry"
                    value={skillsInfo.industry.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Work Domain"
                    value={skillsInfo.workDomain}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Work Experience"
                    value={skillsInfo.workExperience}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Digital Literacy"
                    value={skillsInfo.digitalLiteracy}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Technical Skills"
                    value={skillsInfo.technicalSkills.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Soft Skills"
                    value={skillsInfo.softSkills.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Skill Gaps"
                    value={skillsInfo.skillGaps.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Certifications"
                    value={skillsInfo.certifications.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Career Goal"
                    value={skillsInfo.careerGoal}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Preferred Role"
                    value={skillsInfo.preferredRole.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Work Location"
                    value={skillsInfo.workLocation.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Salary Range"
                    value={skillsInfo.salaryRange}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Work Mode"
                    value={skillsInfo.workMode}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Training Motivation"
                    value={skillsInfo.trainingMotivation.join(", ")}
                    placeholder="Select"
                  />
                  <DisplayField
                    label="Resume"
                    value={careerResumeFile?.name || ""}
                    placeholder="Choose File"
                  />
                  <DisplayField
                    label="Portfolio"
                    value={skillsInfo.portfolio}
                    placeholder="Enter Portfolio"
                  />
                  <DisplayField
                    label="Instagram ID"
                    value={skillsInfo.instagramId}
                    placeholder="Enter Instagram ID"
                  />
                  <DisplayField
                    label="Facebook ID / URL"
                    value={skillsInfo.facebookUrl}
                    placeholder="Enter Facebook ID / URL"
                  />
                  <DisplayField
                    label="Twitter / X"
                    value={skillsInfo.twitterX}
                    placeholder="Enter Twitter / X"
                  />
                  <DisplayField
                    label="GitHub URL"
                    value={skillsInfo.githubUrl}
                    placeholder="Enter GitHub URL"
                  />
                  <DisplayField
                    label="LinkedIn"
                    value={skillsInfo.linkedinUrl}
                    placeholder="Enter LinkedIn"
                  />
                  <DisplayField
                    label="Portfolio Evidence"
                    value={skillsInfo.portfolioEvidence.join(", ")}
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
