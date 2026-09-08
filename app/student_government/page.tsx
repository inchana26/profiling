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
import "./sgvt.css";
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
  onBlur?: () => void;
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
  onBlur,
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
    }, 400);
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
              onBlur?.();
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

  const parseCalendarDate = (dateValue: string) => {
    const trimmedValue = dateValue.trim();

    if (!trimmedValue) {
      return null;
    }

    const isoMatch = trimmedValue.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (isoMatch) {
      const [, yearPart, monthPart, dayPart] = isoMatch;
      const parsedDate = new Date(
        Number(yearPart),
        Number(monthPart) - 1,
        Number(dayPart)
      );

      return Number.isNaN(parsedDate.getTime())
        ? null
        : parsedDate;
    }

    const dmyMatch = trimmedValue.match(
      /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/
    );

    if (dmyMatch) {
      const [, dayPart, monthPart, yearPart] = dmyMatch;
      const parsedDate = new Date(
        Number(yearPart),
        Number(monthPart) - 1,
        Number(dayPart)
      );

      return Number.isNaN(parsedDate.getTime())
        ? null
        : parsedDate;
    }

    const parsedTimestamp = Date.parse(trimmedValue);

    if (Number.isNaN(parsedTimestamp)) {
      return null;
    }

    return new Date(parsedTimestamp);
  };

  const initialDate = parseCalendarDate(value) ?? new Date();

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1
    )
  );

  const [yearPageStart, setYearPageStart] = useState(() => {
    const initialYear = initialDate.getFullYear();

    return Math.floor(initialYear / 12) * 12;
  });

  useEffect(() => {
    const selectedDate = parseCalendarDate(value);

    if (!selectedDate) {
      return;
    }

    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    setVisibleMonth(
      new Date(
        selectedYear,
        selectedMonth,
        1
      )
    );

    setYearPageStart(
      Math.floor(selectedYear / 12) * 12
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

  const selectedDisplayDate = parseCalendarDate(value);

  const displayDate = selectedDisplayDate
    ? `${String(selectedDisplayDate.getDate()).padStart(2, "0")}/${String(
        selectedDisplayDate.getMonth() + 1
      ).padStart(2, "0")}/${selectedDisplayDate.getFullYear()}`
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

export default function StudentGovernmentPage() {
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

    const sectionSelector =
      section === "profile"
        ? ".institutionOverviewCard"
        : section === "registration"
          ? ".bootcampRegistrationCard"
          : section === "professional"
            ? ".bootcampPersonalCard"
            : section === "skills"
              ? ".bootcampCareerCard"
              : section === "documents"
                ? ".institutionDocumentsCard"
                : ".institutionConfirmationCard";

    window.requestAnimationFrame(() => {
      const targetSection = document.querySelector(sectionSelector);

      targetSection?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

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
    employeeId: "GOV-EMP-2026-0145",
    fullName: "Antony Thomas",
    gender: "Male",
    dateOfBirth: "17-05-2004",
    mobileNumber: "+91 98765 43210",
    email: "antonythomas@gov.in",
    departmentName: "Skill Development",
    designation: "Training Officer",
    district: "Bengaluru",
    state: "Karnataka",
    officeName: "District Skill Office",
    officeCode: "DSDO-014",
    ministryName: "Skill Development Ministry",
    schemeName: "Skill Development",
    reportingOffices: "State Skill Directorate",
    employeeType: "Government",
    joiningDate: "17-05-2019",
    batchName: "SD-2026-01",
    courseName: "Digital Skills",
    trainingCenterName: "Govt. Skill Centre",
    serviceStatus: "Active",
    qualification: "MBA – HR",
    status: "Verified",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    language: [] as string[],
    communicationMode: [] as string[],
    responsibilities: [] as string[],
    workDomain: "",
    learningPace: "",
    learningMode: [] as string[],
    contentFormat: [] as string[],
    roleCompetency: "",
    digitalCompetency: "",
    leadershipLevel: "",
    governanceArea: [] as string[],
    erpSystemSkills: [] as string[],
    certifications: [] as string[],
    serviceCategory: "",
    roleType: "",
    supervisoryLevel: "",
    costCentre: "",
    currentRole: "",
    govtService: "",
    totalExperience: "",
    previousPostings: [] as string[],
    retirementYear: "",
  });

  const [skillsInfo, setSkillsInfo] = useState({
    educationStatus: "",
    studyArea: "",
    digitalLiteracy: "",
    onlineLearning: "",
    priorCertifications: [] as string[],
    availableDevices: [] as string[],
    mandatedTraining: [] as string[],
    trainingCompliance: "",
    lastTraining: "",
    nextDeadline: "",
    trainingNominator: "",
    connectivity: "",
    bandwidth: "",
    reliability: "",
    primaryDevice: "",
    offlineAccess: "",
    portfolioLink: "",
    linkedinUrl: "",
    githubUrl: "",
    instagramId: "",
    facebookUrl: "",
    twitterX: "",
    portfolioEvidence: "",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [professionalDraft, setProfessionalDraft] = useState(professionalInfo);
  const [skillsDraft, setSkillsDraft] = useState(skillsInfo);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState("");

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

    let roleReady = professionalProfileCompleted;
    let learningReady = skillsDevelopmentCompleted;

    if (editingSection && editingSection !== section) {
      if (editingSection === "professional") {
        const complete =
          professionalDraft.language.length > 0 &&
          professionalDraft.communicationMode.length > 0 &&
          professionalDraft.responsibilities.length > 0 &&
          professionalDraft.workDomain &&
          professionalDraft.learningPace &&
          professionalDraft.learningMode.length > 0 &&
          professionalDraft.contentFormat.length > 0 &&
          professionalDraft.roleCompetency &&
          professionalDraft.digitalCompetency &&
          professionalDraft.leadershipLevel &&
          professionalDraft.governanceArea.length > 0 &&
          professionalDraft.erpSystemSkills.length > 0 &&
          professionalDraft.certifications.length > 0 &&
          professionalDraft.serviceCategory &&
          professionalDraft.roleType &&
          professionalDraft.supervisoryLevel &&
          professionalDraft.costCentre &&
          professionalDraft.currentRole &&
          professionalDraft.govtService &&
          professionalDraft.totalExperience &&
          professionalDraft.previousPostings.length > 0 &&
          professionalDraft.retirementYear;

        if (!complete) {
          showSectionError(
            "professional",
            "Please complete Role & Competency."
          );
          return;
        }

        setProfessionalInfo({
          ...professionalDraft,
          language: [...professionalDraft.language],
          communicationMode: [...professionalDraft.communicationMode],
          responsibilities: [...professionalDraft.responsibilities],
          learningMode: [...professionalDraft.learningMode],
          contentFormat: [...professionalDraft.contentFormat],
          governanceArea: [...professionalDraft.governanceArea],
          erpSystemSkills: [...professionalDraft.erpSystemSkills],
          certifications: [...professionalDraft.certifications],
          previousPostings: [...professionalDraft.previousPostings],
        });

        setProfessionalProfileCompleted(true);
        roleReady = true;
      }

      if (editingSection === "skills") {
        const complete =
          skillsDraft.educationStatus &&
          skillsDraft.studyArea &&
          skillsDraft.digitalLiteracy &&
          skillsDraft.onlineLearning &&
          skillsDraft.priorCertifications.length > 0 &&
          skillsDraft.availableDevices.length > 0 &&
          skillsDraft.mandatedTraining.length > 0 &&
          skillsDraft.trainingCompliance &&
          skillsDraft.lastTraining &&
          skillsDraft.trainingNominator &&
          skillsDraft.connectivity &&
          skillsDraft.bandwidth &&
          skillsDraft.reliability &&
          skillsDraft.primaryDevice &&
          skillsDraft.offlineAccess &&
          skillsDraft.portfolioEvidence &&
          resumeFile;

        if (!complete) {
          showSectionError(
            "skills",
            "Please complete Learning & Digital and upload Resume."
          );
          return;
        }

        setSkillsInfo({
          ...skillsDraft,
          priorCertifications: [...skillsDraft.priorCertifications],
          availableDevices: [...skillsDraft.availableDevices],
          mandatedTraining: [...skillsDraft.mandatedTraining],
        });

        setSkillsDevelopmentCompleted(true);
        learningReady = true;
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

    if (section === "skills" && !roleReady) {
      showFlowPopup(
        "Please Complete Role & Competency",
        "professional"
      );
      return;
    }

    if (section === "documents" && !learningReady) {
      showFlowPopup(
        "Please Complete Learning & Digital",
        "skills"
      );
      return;
    }

    if (section === "professional") {
      setProfessionalDraft({
        ...professionalInfo,
        language: [...professionalInfo.language],
        communicationMode: [...professionalInfo.communicationMode],
        responsibilities: [...professionalInfo.responsibilities],
        learningMode: [...professionalInfo.learningMode],
        contentFormat: [...professionalInfo.contentFormat],
        governanceArea: [...professionalInfo.governanceArea],
        erpSystemSkills: [...professionalInfo.erpSystemSkills],
        certifications: [...professionalInfo.certifications],
        previousPostings: [...professionalInfo.previousPostings],
      });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        priorCertifications: [...skillsInfo.priorCertifications],
        availableDevices: [...skillsInfo.availableDevices],
        mandatedTraining: [...skillsInfo.mandatedTraining],
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

    if (!/^[+()\d\s-]+$/.test(trimmed)) {
      return false;
    }

    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  };

  const isValidOptionalUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true;

    try {
      const normalized = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

      const parsed = new URL(normalized);
      return Boolean(parsed.hostname && parsed.hostname.includes("."));
    } catch {
      return false;
    }
  };

  const handleResumeFileSelect = (file: File | null) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const supported =
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.(pdf|doc|docx)$/i.test(fileName);

    if (!supported) {
      const message = "Resume must be a PDF, DOC or DOCX file.";
      setResumeUploadError(message);
      showSectionError("skills", message);
      return;
    }

    if (file.size > 10 * MB) {
      const message = "Resume file must be 10 MB or less.";
      setResumeUploadError(message);
      showSectionError("skills", message);
      return;
    }

    setResumeFile(file);
    setResumeUploadError("");
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
      professionalSource.language.length > 0 &&
      professionalSource.communicationMode.length > 0 &&
      professionalSource.responsibilities.length > 0 &&
      professionalSource.workDomain &&
      professionalSource.learningPace &&
      professionalSource.learningMode.length > 0 &&
      professionalSource.contentFormat.length > 0 &&
      professionalSource.roleCompetency &&
      professionalSource.digitalCompetency &&
      professionalSource.leadershipLevel &&
      professionalSource.governanceArea.length > 0 &&
      professionalSource.erpSystemSkills.length > 0 &&
      professionalSource.certifications.length > 0 &&
      professionalSource.serviceCategory &&
      professionalSource.roleType &&
      professionalSource.supervisoryLevel &&
      professionalSource.costCentre &&
      professionalSource.currentRole &&
      professionalSource.govtService &&
      professionalSource.totalExperience &&
      professionalSource.previousPostings.length > 0 &&
      professionalSource.retirementYear
    );

    const skillsComplete = Boolean(
      skillsSource.educationStatus &&
      skillsSource.studyArea &&
      skillsSource.digitalLiteracy &&
      skillsSource.onlineLearning &&
      skillsSource.priorCertifications.length > 0 &&
      skillsSource.availableDevices.length > 0 &&
      skillsSource.mandatedTraining.length > 0 &&
      skillsSource.trainingCompliance &&
      skillsSource.lastTraining &&
      skillsSource.trainingNominator &&
      skillsSource.connectivity &&
      skillsSource.bandwidth &&
      skillsSource.reliability &&
      skillsSource.primaryDevice &&
      skillsSource.offlineAccess &&
      skillsSource.portfolioEvidence &&
      resumeFile
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
        "Please complete Role & Competency before saving the profile.",
        "professional"
      );
      return;
    }

    if (!skillsComplete) {
      showFlowPopup(
        "Please complete Learning & Digital and upload Resume before saving the profile.",
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
        communicationMode: [...professionalDraft.communicationMode],
        responsibilities: [...professionalDraft.responsibilities],
        learningMode: [...professionalDraft.learningMode],
        contentFormat: [...professionalDraft.contentFormat],
        governanceArea: [...professionalDraft.governanceArea],
        erpSystemSkills: [...professionalDraft.erpSystemSkills],
        certifications: [...professionalDraft.certifications],
        previousPostings: [...professionalDraft.previousPostings],
      });
    }

    if (editingSection === "skills") {
      setSkillsInfo({
        ...skillsDraft,
        priorCertifications: [...skillsDraft.priorCertifications],
        availableDevices: [...skillsDraft.availableDevices],
        mandatedTraining: [...skillsDraft.mandatedTraining],
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
      language: [] as string[],
      communicationMode: [] as string[],
      responsibilities: [] as string[],
      workDomain: "",
      learningPace: "",
      learningMode: [] as string[],
      contentFormat: [] as string[],
      roleCompetency: "",
      digitalCompetency: "",
      leadershipLevel: "",
      governanceArea: [] as string[],
      erpSystemSkills: [] as string[],
      certifications: [] as string[],
      serviceCategory: "",
      roleType: "",
      supervisoryLevel: "",
      costCentre: "",
      currentRole: "",
      govtService: "",
      totalExperience: "",
      previousPostings: [] as string[],
      retirementYear: "",
    };

    const emptySkillsInfo = {
      educationStatus: "",
      studyArea: "",
      digitalLiteracy: "",
      onlineLearning: "",
      priorCertifications: [] as string[],
      availableDevices: [] as string[],
      mandatedTraining: [] as string[],
      trainingCompliance: "",
      lastTraining: "",
      nextDeadline: "",
      trainingNominator: "",
      connectivity: "",
      bandwidth: "",
      reliability: "",
      primaryDevice: "",
      offlineAccess: "",
      portfolioLink: "",
      linkedinUrl: "",
      githubUrl: "",
      instagramId: "",
      facebookUrl: "",
      twitterX: "",
      portfolioEvidence: "",
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
    setResumeFile(null);
    setResumeUploadError("");

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
      source.language.length > 0 &&
      source.communicationMode.length > 0 &&
      source.responsibilities.length > 0 &&
      source.workDomain &&
      source.learningPace &&
      source.learningMode.length > 0 &&
      source.contentFormat.length > 0 &&
      source.roleCompetency &&
      source.digitalCompetency &&
      source.leadershipLevel &&
      source.governanceArea.length > 0 &&
      source.erpSystemSkills.length > 0 &&
      source.certifications.length > 0 &&
      source.serviceCategory &&
      source.roleType &&
      source.supervisoryLevel &&
      source.costCentre &&
      source.currentRole &&
      source.govtService &&
      source.totalExperience &&
      source.previousPostings.length > 0 &&
      source.retirementYear
    );

    setProfessionalProfileCompleted(complete);
  }, [editingSection, professionalDraft, professionalInfo]);

  useEffect(() => {
    const source = editingSection === "skills" ? skillsDraft : skillsInfo;

    const complete = Boolean(
      source.educationStatus &&
      source.studyArea &&
      source.digitalLiteracy &&
      source.onlineLearning &&
      source.priorCertifications.length > 0 &&
      source.availableDevices.length > 0 &&
      source.mandatedTraining.length > 0 &&
      source.trainingCompliance &&
      source.lastTraining &&
      source.trainingNominator &&
      source.connectivity &&
      source.bandwidth &&
      source.reliability &&
      source.primaryDevice &&
      source.offlineAccess &&
      source.portfolioEvidence &&
      resumeFile
    );

    setSkillsDevelopmentCompleted(complete);
  }, [editingSection, skillsDraft, skillsInfo, resumeFile]);

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
    document.title = "Government Trainee Profile | Neuro LXP";
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
                <h1>Government Trainee Profile</h1>
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
                  <div className="institutionRole">Government Trainee</div>

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
                    <span>Role &amp; Competency</span>
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
                    <span>Learning &amp; Digital</span>
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

            <section className="institutionInformationCard bootcampRegistrationCard">
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
                  <EditField label="Employee ID" value={registrationInfo.employeeId} locked />
                  <EditField label="Full Name" value={registrationInfo.fullName} locked />
                  <EditField label="Gender" value={registrationInfo.gender} locked />
                  <EditField label="Date of Birth" value={registrationInfo.dateOfBirth} locked />
                  <EditField label="Mobile Number" value={registrationInfo.mobileNumber} locked />
                  <EditField label="Email" value={registrationInfo.email} locked />
                  <EditField label="Department Name" value={registrationInfo.departmentName} locked />
                  <EditField label="Designation" value={registrationInfo.designation} locked />
                  <EditField label="District" value={registrationInfo.district} locked />
                  <EditField label="State" value={registrationInfo.state} locked />
                  <EditField label="Office Name" value={registrationInfo.officeName} locked />
                  <EditField label="Office Code" value={registrationInfo.officeCode} locked />
                  <EditField label="Ministry Name" value={registrationInfo.ministryName} locked />
                  <EditField label="Scheme Name" value={registrationInfo.schemeName} locked />
                  <EditField label="Reporting Offices" value={registrationInfo.reportingOffices} locked />
                  <EditField label="Employee Type" value={registrationInfo.employeeType} locked />
                  <EditField label="Joining Date" value={registrationInfo.joiningDate} locked />
                  <EditField label="Batch Name" value={registrationInfo.batchName} locked />
                  <EditField label="Course Name" value={registrationInfo.courseName} locked />
                  <EditField label="Training Center Name" value={registrationInfo.trainingCenterName} locked />
                  <EditField label="Service Status" value={registrationInfo.serviceStatus} locked />
                  <EditField label="Qualification" value={registrationInfo.qualification} locked />
                  <EditField label="Status" value={registrationInfo.status} locked />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <DisplayField label="Employee ID" value={registrationInfo.employeeId} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField label="Gender" value={registrationInfo.gender} />
                  <DisplayField label="Date of Birth" value={registrationInfo.dateOfBirth} />
                  <DisplayField label="Mobile Number" value={registrationInfo.mobileNumber} />
                  <DisplayField label="Email" value={registrationInfo.email} />
                  <DisplayField label="Department Name" value={registrationInfo.departmentName} />
                  <DisplayField label="Designation" value={registrationInfo.designation} />
                  <DisplayField label="District" value={registrationInfo.district} />
                  <DisplayField label="State" value={registrationInfo.state} />
                  <DisplayField label="Office Name" value={registrationInfo.officeName} />
                  <DisplayField label="Office Code" value={registrationInfo.officeCode} />
                  <DisplayField label="Ministry Name" value={registrationInfo.ministryName} />
                  <DisplayField label="Scheme Name" value={registrationInfo.schemeName} />
                  <DisplayField label="Reporting Offices" value={registrationInfo.reportingOffices} />
                  <DisplayField label="Employee Type" value={registrationInfo.employeeType} />
                  <DisplayField label="Joining Date" value={registrationInfo.joiningDate} />
                  <DisplayField label="Batch Name" value={registrationInfo.batchName} />
                  <DisplayField label="Course Name" value={registrationInfo.courseName} />
                  <DisplayField label="Training Center Name" value={registrationInfo.trainingCenterName} />
                  <DisplayField label="Service Status" value={registrationInfo.serviceStatus} />
                  <DisplayField label="Qualification" value={registrationInfo.qualification} />
                  <DisplayField label="Status" value={registrationInfo.status} />
                </div>
              )}
            </section>

            <section className="institutionInformationCard bootcampPersonalCard">
              <SectionHeader
                title="Role & Competency"
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
                  <MultiSelectField
                    label="Language"
                    value={professionalDraft.language}
                    placeholder="Select"
                    options={["English", "Kannada", "Hindi", "Tamil", "Telugu", "Malayalam", "Marathi", "Other"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, language: value }))}
                  />

                  <MultiSelectField
                    label="Communication Mode"
                    value={professionalDraft.communicationMode}
                    placeholder="Select"
                    options={["Email", "Phone", "Video Call", "In-person", "Chat/Messaging", "Written Communication"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, communicationMode: value }))}
                  />

                  <MultiSelectField
                    label="Responsibilities"
                    value={professionalDraft.responsibilities}
                    placeholder="Select"
                    options={["Training & Coordination", "Programme Management", "Administration", "Reporting", "Documentation", "Team Management", "Stakeholder Coordination"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, responsibilities: value }))}
                  />

                  <SelectField
                    label="Work Domain"
                    value={professionalDraft.workDomain}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Skill Development", "Training & L&D", "Administration", "HR", "Finance", "IT", "Programme Management", "Community Development"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, workDomain: value }))}
                  />

                  <SelectField
                    label="Learning Pace"
                    value={professionalDraft.learningPace}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Self-Paced", "Guided", "Instructor-Led", "Flexible"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, learningPace: value }))}
                  />

                  <MultiSelectField
                    label="Learning Mode"
                    value={professionalDraft.learningMode}
                    placeholder="Select"
                    options={["Online", "Classroom", "Blended", "Hybrid", "Self-Learning"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, learningMode: value }))}
                  />

                  <MultiSelectField
                    label="Content Format"
                    value={professionalDraft.contentFormat}
                    placeholder="Select"
                    options={["Video", "PDF", "Presentation", "Interactive Course", "Webinar", "Quiz", "Simulation", "Hands-on"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, contentFormat: value }))}
                  />

                  <SelectField
                    label="Role Competency"
                    value={professionalDraft.roleCompetency}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, roleCompetency: value }))}
                  />

                  <SelectField
                    label="Digital Competency"
                    value={professionalDraft.digitalCompetency}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Basic", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, digitalCompetency: value }))}
                  />

                  <SelectField
                    label="Leadership Level"
                    value={professionalDraft.leadershipLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["No Leadership Responsibility", "Team Lead", "Supervisor", "Manager", "Senior Manager", "Department Head"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, leadershipLevel: value }))}
                  />

                  <MultiSelectField
                    label="Governance Area"
                    value={professionalDraft.governanceArea}
                    placeholder="Select"
                    options={["Programme Management", "Policy Implementation", "Compliance", "Monitoring & Evaluation", "Finance", "HR", "Procurement", "Quality Assurance"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, governanceArea: value }))}
                  />

                  <MultiSelectField
                    label="ERP / System Skills"
                    value={professionalDraft.erpSystemSkills}
                    placeholder="Select"
                    options={["SAP", "HRMS", "LMS", "ERP", "MIS", "CRM", "Tally", "Power BI", "Microsoft 365"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, erpSystemSkills: value }))}
                  />

                  <MultiSelectField
                    label="Certifications"
                    value={professionalDraft.certifications}
                    placeholder="Select"
                    options={["PMP", "TOT", "Microsoft Certification", "AWS", "Google Certification", "Scrum Master", "HR Certification"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, certifications: value }))}
                  />

                  <SelectField
                    label="Service Category"
                    value={professionalDraft.serviceCategory}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Group A", "Group B", "Group C", "Group D", "Contractual", "Outsourced"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, serviceCategory: value }))}
                  />

                  <SelectField
                    label="Role Type"
                    value={professionalDraft.roleType}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Administrative", "Technical", "Training", "Programme Management", "Supervisory", "Support"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, roleType: value }))}
                  />

                  <SelectField
                    label="Supervisory Level"
                    value={professionalDraft.supervisoryLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Individual Contributor", "Team Lead", "Supervisor", "Manager", "Senior Manager", "Department Head"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, supervisoryLevel: value }))}
                  />

                  <SelectField
                    label="Cost Centre"
                    value={professionalDraft.costCentre}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["SD-CC-014", "SD-CC-015", "Training-CC-001"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, costCentre: value }))}
                  />

                  <SelectField
                    label="Current Role"
                    value={professionalDraft.currentRole}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Trainer", "Senior Trainer", "Coordinator", "Programme Officer", "Team Lead", "Training Manager"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, currentRole: value }))}
                  />

                  <SelectField
                    label="Govt. Service"
                    value={professionalDraft.govtService}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Permanent", "Contractual", "Deputation", "Temporary", "Consultant", "Not Applicable"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, govtService: value }))}
                  />

                  <SelectField
                    label="Total Experience"
                    value={professionalDraft.totalExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["0–2 Years", "3–5 Years", "6–10 Years", "11–15 Years", "16–20 Years", "20+ Years"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, totalExperience: value }))}
                  />

                  <MultiSelectField
                    label="Previous Postings"
                    value={professionalDraft.previousPostings}
                    placeholder="Select"
                    options={["Mysuru", "Hubballi", "Bengaluru", "Mangaluru", "Belagavi", "Other"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, previousPostings: value }))}
                  />

                  <SelectField
                    label="Retirement Year"
                    value={professionalDraft.retirementYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2045", "2046", "2047", "2048", "2049"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, retirementYear: value }))}
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <DisplayField label="Language" value={professionalInfo.language.join(", ")} placeholder="Select" />
                  <DisplayField label="Communication Mode" value={professionalInfo.communicationMode.join(", ")} placeholder="Select" />
                  <DisplayField label="Responsibilities" value={professionalInfo.responsibilities.join(", ")} placeholder="Select" />
                  <DisplayField label="Work Domain" value={professionalInfo.workDomain} placeholder="Select" />
                  <DisplayField label="Learning Pace" value={professionalInfo.learningPace} placeholder="Select" />
                  <DisplayField label="Learning Mode" value={professionalInfo.learningMode.join(", ")} placeholder="Select" />
                  <DisplayField label="Content Format" value={professionalInfo.contentFormat.join(", ")} placeholder="Select" />
                  <DisplayField label="Role Competency" value={professionalInfo.roleCompetency} placeholder="Select" />
                  <DisplayField label="Digital Competency" value={professionalInfo.digitalCompetency} placeholder="Select" />
                  <DisplayField label="Leadership Level" value={professionalInfo.leadershipLevel} placeholder="Select" />
                  <DisplayField label="Governance Area" value={professionalInfo.governanceArea.join(", ")} placeholder="Select" />
                  <DisplayField label="ERP / System Skills" value={professionalInfo.erpSystemSkills.join(", ")} placeholder="Select" />
                  <DisplayField label="Certifications" value={professionalInfo.certifications.join(", ")} placeholder="Select" />
                  <DisplayField label="Service Category" value={professionalInfo.serviceCategory} placeholder="Select" />
                  <DisplayField label="Role Type" value={professionalInfo.roleType} placeholder="Select" />
                  <DisplayField label="Supervisory Level" value={professionalInfo.supervisoryLevel} placeholder="Select" />
                  <DisplayField label="Cost Centre" value={professionalInfo.costCentre} placeholder="Select" />
                  <DisplayField label="Current Role" value={professionalInfo.currentRole} placeholder="Select" />
                  <DisplayField label="Govt. Service" value={professionalInfo.govtService} placeholder="Select" />
                  <DisplayField label="Total Experience" value={professionalInfo.totalExperience} placeholder="Select" />
                  <DisplayField label="Previous Postings" value={professionalInfo.previousPostings.join(", ")} placeholder="Select" />
                  <DisplayField label="Retirement Year" value={professionalInfo.retirementYear} placeholder="Select" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard bootcampCareerCard">
              <SectionHeader
                title="Learning & Digital"
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
                    label="Education Status"
                    value={skillsDraft.educationStatus}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Secondary", "Higher Secondary", "Diploma", "Graduate", "Postgraduate", "Doctoral", "Professional Certification"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, educationStatus: value }))}
                  />

                  <SelectField
                    label="Study Area"
                    value={skillsDraft.studyArea}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Human Resources", "Management", "Computer Science", "Engineering", "Finance", "Education", "Public Administration"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, studyArea: value }))}
                  />

                  <SelectField
                    label="Digital Literacy"
                    value={skillsDraft.digitalLiteracy}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Basic", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, digitalLiteracy: value }))}
                  />

                  <SelectField
                    label="Online Learning"
                    value={skillsDraft.onlineLearning}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Beginner", "Experienced", "Advanced User", "Not Used"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, onlineLearning: value }))}
                  />

                  <MultiSelectField
                    label="Prior Certifications"
                    value={skillsDraft.priorCertifications}
                    placeholder="Select"
                    options={["PMP", "Excel", "TOT", "AWS", "Google", "Microsoft", "NPTEL", "Other"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, priorCertifications: value }))}
                  />

                  <MultiSelectField
                    label="Available Devices"
                    value={skillsDraft.availableDevices}
                    placeholder="Select"
                    options={["Laptop", "Desktop", "Tablet", "Mobile", "Shared Device", "No Personal Device"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, availableDevices: value }))}
                  />

                  <MultiSelectField
                    label="Mandated Training"
                    value={skillsDraft.mandatedTraining}
                    placeholder="Select"
                    options={["Leadership Training", "Compliance Training", "Cybersecurity Awareness", "POSH Training", "Data Privacy", "Technical Training", "Safety Training"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, mandatedTraining: value }))}
                  />

                  <SelectField
                    label="Training Compliance"
                    value={skillsDraft.trainingCompliance}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Compliant", "Partially Compliant", "Non-Compliant", "Not Applicable"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, trainingCompliance: value }))}
                  />

                  <SelectField
                    label="Last Training"
                    value={skillsDraft.lastTraining}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Leadership Training — May 2026"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, lastTraining: value }))}
                  />

                  <CalendarDateField
                    label="Next Deadline"
                    value={skillsDraft.nextDeadline}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({
                        ...current,
                        nextDeadline: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Training Nominator"
                    value={skillsDraft.trainingNominator}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Department Head", "Reporting Manager", "HR", "Training Manager", "Self-Nominated", "Government Authority"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, trainingNominator: value }))}
                  />

                  <SelectField
                    label="Connectivity"
                    value={skillsDraft.connectivity}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Broadband", "Mobile Data", "Wi-Fi", "Limited Connectivity", "No Reliable Connection"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, connectivity: value }))}
                  />

                  <SelectField
                    label="Bandwidth"
                    value={skillsDraft.bandwidth}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Below 5 Mbps", "5–10 Mbps", "10–25 Mbps", "25–50 Mbps", "50–100 Mbps", "100+ Mbps"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, bandwidth: value }))}
                  />

                  <SelectField
                    label="Reliability"
                    value={skillsDraft.reliability}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Low", "Medium", "High", "Very High"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, reliability: value }))}
                  />

                  <SelectField
                    label="Primary Device"
                    value={skillsDraft.primaryDevice}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Laptop", "Desktop", "Tablet", "Mobile"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, primaryDevice: value }))}
                  />

                  <SelectField
                    label="Offline Access"
                    value={skillsDraft.offlineAccess}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Available", "Partially Available", "Not Available"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, offlineAccess: value }))}
                  />

                  <div className="institutionField bootcampResumeField">
                    <div className="institutionFieldLabel">Resume</div>

                    <div className="bootcampResumeFileRow">
                      <label className="bootcampResumePickerControl">
                        <input
                          className="institutionNativeFileInput"
                          type="file"
                          name="government-resume"
                          aria-label="Resume"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(event) => {
                            handleResumeFileSelect(event.target.files?.[0] ?? null);
                            event.target.value = "";
                          }}
                        />

                        <span
                          className={`bootcampResumeChooseFile ${
                            resumeFile ? "bootcampResumeChooseFileUploaded" : ""
                          }`}
                        >
                          <IconImage
                            src={images.upload}
                            width={14}
                            height={14}
                            className="bootcampResumeUploadIcon"
                          />
                          <span>Choose File</span>
                        </span>
                      </label>

                      <span className="bootcampResumeFileName">
                        {resumeFile?.name || "No File Chosen"}
                      </span>
                    </div>

                    {resumeUploadError && (
                      <span className="bootcampResumeError" role="alert">
                        {resumeUploadError}
                      </span>
                    )}
                  </div>

                  <EditField
                    label="Portfolio"
                    value={skillsDraft.portfolioLink}
                    placeholder="Enter Portfolio"
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, portfolioLink: value }))}
                    validate={(value) =>
                      isValidOptionalUrl(value)
                        ? null
                        : "Please enter a valid Portfolio."
                    }
                    onValidationError={(message) => showSectionError("skills", message)}
                    visualIcon="edit"
                  />

                  <EditField
                    label="Instagram ID"
                    value={skillsDraft.instagramId}
                    placeholder="Enter Instagram ID"
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, instagramId: value }))}
                    visualIcon="edit"
                  />

                  <EditField
                    label="Facebook ID / URL"
                    value={skillsDraft.facebookUrl}
                    placeholder="Enter Facebook URL"
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, facebookUrl: value }))}
                    visualIcon="edit"
                  />

                  <EditField
                    label="Twitter / X"
                    value={skillsDraft.twitterX}
                    placeholder="Enter Twitter / X"
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, twitterX: value }))}
                    visualIcon="edit"
                  />

                  <EditField
                    label="GitHub URL"
                    value={skillsDraft.githubUrl}
                    placeholder="Enter GitHub URL"
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, githubUrl: value }))}
                    validate={(value) =>
                      isValidOptionalUrl(value)
                        ? null
                        : "Please enter a valid GitHub URL."
                    }
                    onValidationError={(message) => showSectionError("skills", message)}
                    visualIcon="edit"
                  />

                  <EditField
                    label="LinkedIn"
                    value={skillsDraft.linkedinUrl}
                    placeholder="Enter LinkedIn"
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, linkedinUrl: value }))}
                    validate={(value) =>
                      isValidOptionalUrl(value)
                        ? null
                        : "Please enter a valid LinkedIn."
                    }
                    onValidationError={(message) => showSectionError("skills", message)}
                    visualIcon="edit"
                  />

                  <SelectField
                    label="Portfolio Evidence"
                    value={skillsDraft.portfolioEvidence}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Training Dashboard", "Programme Report", "Research Project", "Case Study", "Certification Project", "Policy Document", "Presentation"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, portfolioEvidence: value }))}
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <DisplayField label="Education Status" value={skillsInfo.educationStatus} placeholder="Select" />
                  <DisplayField label="Study Area" value={skillsInfo.studyArea} placeholder="Select" />
                  <DisplayField label="Digital Literacy" value={skillsInfo.digitalLiteracy} placeholder="Select" />
                  <DisplayField label="Online Learning" value={skillsInfo.onlineLearning} placeholder="Select" />
                  <DisplayField label="Prior Certifications" value={skillsInfo.priorCertifications.join(", ")} placeholder="Select" />
                  <DisplayField label="Available Devices" value={skillsInfo.availableDevices.join(", ")} placeholder="Select" />
                  <DisplayField label="Mandated Training" value={skillsInfo.mandatedTraining.join(", ")} placeholder="Select" />
                  <DisplayField label="Training Compliance" value={skillsInfo.trainingCompliance} placeholder="Select" />
                  <DisplayField label="Last Training" value={skillsInfo.lastTraining} placeholder="Select" />
                  <DisplayField label="Next Deadline" value={skillsInfo.nextDeadline} placeholder="dd/mm/yyyy" />
                  <DisplayField label="Training Nominator" value={skillsInfo.trainingNominator} placeholder="Select" />
                  <DisplayField label="Connectivity" value={skillsInfo.connectivity} placeholder="Select" />
                  <DisplayField label="Bandwidth" value={skillsInfo.bandwidth} placeholder="Select" />
                  <DisplayField label="Reliability" value={skillsInfo.reliability} placeholder="Select" />
                  <DisplayField label="Primary Device" value={skillsInfo.primaryDevice} placeholder="Select" />
                  <DisplayField label="Offline Access" value={skillsInfo.offlineAccess} placeholder="Select" />
                  <DisplayField label="Resume" value={resumeFile?.name || ""} placeholder="Choose File" />
                  <DisplayField label="Portfolio" value={skillsInfo.portfolioLink} placeholder="Enter Portfolio" />
                  <DisplayField label="Instagram ID" value={skillsInfo.instagramId} placeholder="Enter Instagram ID" />
                  <DisplayField label="Facebook ID / URL" value={skillsInfo.facebookUrl} placeholder="Enter Facebook URL" />
                  <DisplayField label="Twitter / X" value={skillsInfo.twitterX} placeholder="Enter Twitter / X" />
                  <DisplayField label="GitHub URL" value={skillsInfo.githubUrl} placeholder="Enter GitHub URL" />
                  <DisplayField label="LinkedIn" value={skillsInfo.linkedinUrl} placeholder="Enter LinkedIn" />
                  <DisplayField label="Portfolio Evidence" value={skillsInfo.portfolioEvidence} placeholder="Select" />
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
                          "profile"
                        );
                        return;
                      }

                      if (event.target.checked && !professionalProfileCompleted) {
                        showFlowPopup(
                          "Please complete Role & Competency",
                          "professional"
                        );
                        return;
                      }

                      if (event.target.checked && !skillsDevelopmentCompleted) {
                        showFlowPopup(
                          "Please complete Learning & Digital",
                          "skills"
                        );
                        return;
                      }

                      if (event.target.checked && !documentsCompleted) {
                        showFlowPopup(
                          "Please complete Documents",
                          "documents"
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
