"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { City } from "country-state-city";
import "./ngo.css";
import Sidebar from "../components/sidebar/sidebar";
import Header from "../components/header/header";

const images = {
  profile: "/assets/institutionimages/profile.png",

  camera: "/assets/ngoicons/camera.svg",
  edit: "/assets/ngoicons/edit.svg",
  editBig: "/assets/ngoicons/editbig.svg",
  lock: "/assets/ngoicons/lock.svg",
  save: "/assets/ngoicons/tick.svg",
  cancel: "/assets/ngoicons/cancel.svg",
  arrowDown: "/assets/ngoicons/arrow-down.svg",
  completed: "/assets/ngoicons/checkmark.svg",
  calendar: "/assets/ngoicons/calendar.svg",
  upload: "/assets/ngoicons/upload.svg",
  clap: "/assets/ngoicons/clap.svg",
  sad: "/assets/ngoicons/sad.svg",

  registration: "/assets/ngoicons/file-edit.svg",
  professional: "/assets/ngoicons/bag.svg",
  skills: "/assets/ngoicons/target.svg",
  documents: "/assets/ngoicons/file.svg",
  confirmation: "/assets/ngoicons/checkmark-circlewhite.svg",
};

type SectionName = "registration" | "professional" | "skills" | "documents";
type PopupType = "saved" | "discarded" | "invalid";

type IconProps = {
  src: string;
  width?: number;
  height?: number;
  className?: string;
};

function Icon({
  src,
  width = 18,
  height = 18,
  className = "",
}: IconProps) {
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    />
  );
}

function DisplayField({
  label,
  value,
  placeholder = "Select",
}: {
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div className="institutionField">
      <div className="institutionFieldLabel">{label}</div>
      <div
        className={`institutionFieldValue ${
          !value ? "institutionPlaceholder" : ""
        }`}
      >
        {value || placeholder}
      </div>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  locked = false,
  type = "text",
  visualIcon,
  maxLength,
  pattern,
  inputMode,
  sanitize,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  locked?: boolean;
  type?: "text" | "email" | "tel";
  visualIcon?: "lock" | "edit" | "arrow";
  maxLength?: number;
  pattern?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  sanitize?: (value: string) => string;
  placeholder?: string;
}) {
  const id = useId();

  return (
    <div className="institutionField institutionEditableField">
      <div className="institutionFieldText">
        {locked ? (
          <div className="institutionFieldLabel">{label}</div>
        ) : (
          <label className="institutionFieldLabel" htmlFor={id}>
            {label}
          </label>
        )}

        {locked ? (
          <div className="institutionFieldValue">{value}</div>
        ) : (
          <input
            id={id}
            name={id}
            className="institutionFieldInput"
            type={type}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            pattern={pattern}
            inputMode={inputMode}
            onChange={(event) => {
              const nextValue = sanitize
                ? sanitize(event.target.value)
                : event.target.value;

              onChange?.(nextValue);
            }}
          />
        )}
      </div>

      {visualIcon === "arrow" ? (
        <span className="institutionFieldInlineArrow" aria-hidden="true">
          <Icon src={images.arrowDown} width={16} height={16} />
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
          <Icon
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

const NGO_DROPDOWN_OPEN_EVENT = "ngo-dropdown-open";

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  searchable = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }

    const query = searchTerm.trim().toLowerCase();

    return options.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }, [options, searchTerm, searchable]);

  useEffect(() => {
    const closeWhenAnotherDropdownOpens = (event: Event) => {
      const openedId = (event as CustomEvent<string>).detail;

      if (openedId !== id) {
        setOpen(false);
      }
    };

    window.addEventListener(
      NGO_DROPDOWN_OPEN_EVENT,
      closeWhenAnotherDropdownOpens
    );

    return () => {
      window.removeEventListener(
        NGO_DROPDOWN_OPEN_EVENT,
        closeWhenAnotherDropdownOpens
      );
    };
  }, [id]);

  const toggleDropdown = () => {
    const next = !open;

    if (next) {
      window.dispatchEvent(
        new CustomEvent<string>(NGO_DROPDOWN_OPEN_EVENT, {
          detail: id,
        })
      );
    } else {
      setSearchTerm("");
    }

    setOpen(next);
  };

  return (
    <div className={`institutionField institutionSelectField ${open ? "institutionSelectFieldOpen" : ""}`}>
      <div id={labelId} className="institutionFieldLabel">
        {label}
      </div>

      <div className="institutionSelectWrap">
        <button
          id={id}
          type="button"
          className="institutionCustomSelectTrigger institutionRaisedSelectTrigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-label={`${label}: ${value || placeholder}`}
          onClick={toggleDropdown}
        >
          <span className={!value ? "institutionPlaceholder" : ""}>
            {value || placeholder}
          </span>
          <Icon
            src={images.arrowDown}
            width={16}
            height={16}
            className={`institutionSelectArrow ${
              open ? "institutionSelectArrowOpen" : ""
            }`}
          />
        </button>

        {open && (
          <div
            id={listId}
            className={`institutionCustomSelectList institutionFigmaOptionList ${
              options.length > 4
                ? "institutionFigmaOptionListScrollable"
                : "institutionFigmaOptionListCompact"
            }`}
            role="listbox"
            aria-labelledby={labelId}
          >
            {searchable && (
              <div className="institutionLocationSearchWrap">
                <input
                  type="search"
                  className="institutionLocationSearchInput"
                  value={searchTerm}
                  placeholder="Search location"
                  aria-label="Search location"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length === 0 && (
              <div className="institutionLocationNoResults">
                No location found
              </div>
            )}

            {filteredOptions.map((option) => {
              const selected = value === option;

              return (
                <button
                  key={option}
                  type="button"
                  className={`institutionCustomSelectOption institutionFigmaOption ${
                    selected ? "institutionCustomSelectOptionActive" : ""
                  }`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option);
                    setSearchTerm("");
                    setOpen(false);
                  }}
                >
                  <span
                    className={`institutionFigmaRadio ${
                      selected ? "institutionFigmaRadioSelected" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <span className="institutionFigmaOptionText">{option}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MultiSelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeWhenAnotherDropdownOpens = (event: Event) => {
      const openedId = (event as CustomEvent<string>).detail;

      if (openedId !== id) {
        setOpen(false);
      }
    };

    window.addEventListener(
      NGO_DROPDOWN_OPEN_EVENT,
      closeWhenAnotherDropdownOpens
    );

    return () => {
      window.removeEventListener(
        NGO_DROPDOWN_OPEN_EVENT,
        closeWhenAnotherDropdownOpens
      );
    };
  }, [id]);

  const toggleDropdown = () => {
    const next = !open;

    if (next) {
      window.dispatchEvent(
        new CustomEvent<string>(NGO_DROPDOWN_OPEN_EVENT, {
          detail: id,
        })
      );
    }

    setOpen(next);
  };

  const selectedValues = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => options.includes(item));

  const toggleOption = (option: string) => {
    const next = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];

    onChange(next.join(", "));
  };

  return (
    <div className={`institutionField institutionSelectField institutionMultiSelectField ${open ? "institutionSelectFieldOpen" : ""}`}>
      <div id={labelId} className="institutionFieldLabel">
        {label}
      </div>

      <div className="institutionSelectWrap">
        <button
          id={id}
          type="button"
          className="institutionCustomSelectTrigger institutionRaisedSelectTrigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-label={`${label}: ${value || placeholder}`}
          onClick={toggleDropdown}
        >
          <span className={!value ? "institutionPlaceholder" : ""}>
            {value || placeholder}
          </span>
          <Icon
            src={images.arrowDown}
            width={16}
            height={16}
            className={`institutionSelectArrow ${
              open ? "institutionSelectArrowOpen" : ""
            }`}
          />
        </button>

        {open && (
          <div
            id={listId}
            className={`institutionCustomSelectList institutionFigmaOptionList ${
              options.length > 4
                ? "institutionFigmaOptionListScrollable"
                : "institutionFigmaOptionListCompact"
            }`}
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={labelId}
          >
            {options.map((option) => {
              const selected = selectedValues.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  className={`institutionCustomSelectOption institutionFigmaOption ${
                    selected ? "institutionCustomSelectOptionActive" : ""
                  }`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggleOption(option)}
                >
                  <span
                    className={`institutionFigmaCheckbox ${
                      selected ? "institutionFigmaCheckboxSelected" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <span className="institutionFigmaOptionText">{option}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DateOfBirthField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const popupRef = useRef<HTMLDivElement>(null);
  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
  const [yearPageStart, setYearPageStart] = useState(
    initialDate.getFullYear() - 5
  );

  useEffect(() => {
    const closeCalendar = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setView("days");
      }
    };

    document.addEventListener("mousedown", closeCalendar);

    return () => {
      document.removeEventListener("mousedown", closeCalendar);
    };
  }, []);

  const openCalendar = () => {
    const selectedDate = value
      ? new Date(`${value}T00:00:00`)
      : new Date();

    setDisplayMonth(selectedDate.getMonth());
    setDisplayYear(selectedDate.getFullYear());
    setYearPageStart(selectedDate.getFullYear() - 5);
    setView("days");
    setOpen(true);
  };

  const moveMonth = (amount: number) => {
    const next = new Date(displayYear, displayMonth + amount, 1);
    setDisplayMonth(next.getMonth());
    setDisplayYear(next.getFullYear());
  };

  const formatDate = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

  const selectDay = (year: number, month: number, day: number) => {
    onChange(formatDate(year, month, day));
    setDisplayYear(year);
    setDisplayMonth(month);
    setOpen(false);
    setView("days");
  };

  const daysInMonth = new Date(
    displayYear,
    displayMonth + 1,
    0
  ).getDate();

  const firstDay = new Date(
    displayYear,
    displayMonth,
    1
  ).getDay();

  const previousMonthDays = new Date(
    displayYear,
    displayMonth,
    0
  ).getDate();

  const calendarCellCount =
    firstDay + daysInMonth <= 35 ? 35 : 42;

  const calendarCells = Array.from(
    { length: calendarCellCount },
    (_, index) => {
      const dayNumber = index - firstDay + 1;

      if (dayNumber < 1) {
        const date = new Date(
          displayYear,
          displayMonth - 1,
          previousMonthDays + dayNumber
        );

        return {
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          muted: true,
        };
      }

      if (dayNumber > daysInMonth) {
        const date = new Date(
          displayYear,
          displayMonth + 1,
          dayNumber - daysInMonth
        );

        return {
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          muted: true,
        };
      }

      return {
        day: dayNumber,
        month: displayMonth,
        year: displayYear,
        muted: false,
      };
    }
  );

  const selected = value
    ? new Date(`${value}T00:00:00`)
    : null;

  const monthNames = [
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

  const shortMonthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const years = Array.from(
    { length: 12 },
    (_, index) => yearPageStart + index
  );

  return (
    <div
      className="institutionField institutionEditableField institutionDateField"
      ref={popupRef}
    >
      <div className="institutionFieldText">
        <div id={`${id}-label`} className="institutionFieldLabel">
          Date of Birth
        </div>

        <button
          id={id}
          type="button"
          className="institutionDateValueButton"
          onClick={openCalendar}
          aria-labelledby={`${id}-label`}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={!value ? "institutionPlaceholder" : ""}>
            {value || "Select date of birth"}
          </span>
        </button>
      </div>

      <button
        type="button"
        className="institutionFieldAction institutionCalendarAction"
        aria-label="Open Date of Birth calendar"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openCalendar();
          }
        }}
      >
        <Icon src={images.calendar} width={18} height={18} />
      </button>

      {open && (
        <div
          className="institutionCalendarPopup"
          role="dialog"
          aria-label="Select Date of Birth"
        >
          <div className="institutionCalendarTopRow">
            <button
              type="button"
              className="institutionCalendarArrow"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>

            <button
              type="button"
              className="institutionCalendarSelect institutionCalendarMonthSelect"
              aria-label={`Choose month, current month ${monthNames[displayMonth]}`}
              onClick={() => setView("months")}
            >
              <span>{monthNames[displayMonth]}</span>
            </button>

            <button
              type="button"
              className="institutionCalendarSelect institutionCalendarYearSelect"
              aria-label={`Choose year, current year ${displayYear}`}
              onClick={() => {
                setYearPageStart(displayYear - 5);
                setView("years");
              }}
            >
              <span>{displayYear}</span>
            </button>

            <button
              type="button"
              className="institutionCalendarArrow"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {view === "days" && (
            <>
              <div className="institutionCalendarWeekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  )
                )}
              </div>

              <div className="institutionCalendarDays">
                {calendarCells.map((cell, index) => {
                  const isSelected =
                    selected &&
                    selected.getFullYear() === cell.year &&
                    selected.getMonth() === cell.month &&
                    selected.getDate() === cell.day;

                  return (
                    <button
                      type="button"
                      key={`${cell.year}-${cell.month}-${cell.day}-${index}`}
                      aria-pressed={Boolean(isSelected)}
                      className={`institutionCalendarDay ${
                        cell.muted
                          ? "institutionCalendarMuted"
                          : ""
                      } ${
                        isSelected
                          ? "institutionCalendarSelected"
                          : ""
                      }`}
                      onClick={() =>
                        selectDay(
                          cell.year,
                          cell.month,
                          cell.day
                        )
                      }
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === "months" && (
            <div className="institutionCalendarMonths">
              {shortMonthNames.map((monthName, index) => (
                <button
                  type="button"
                  key={monthName}
                  className={`institutionCalendarChoice ${
                    displayMonth === index
                      ? "institutionCalendarSelected"
                      : ""
                  }`}
                  onClick={() => {
                    setDisplayMonth(index);
                    setView("days");
                  }}
                >
                  {monthName}
                </button>
              ))}
            </div>
          )}

          {view === "years" && (
            <>
              <div className="institutionCalendarYearRange">
                <button
                  type="button"
                  className="institutionCalendarRoundArrow"
                  aria-label="Previous years"
                  onClick={() =>
                    setYearPageStart(
                      (current) => current - 12
                    )
                  }
                >
                  ‹
                </button>

                <strong>
                  {yearPageStart} - {yearPageStart + 11}
                </strong>

                <button
                  type="button"
                  className="institutionCalendarRoundArrow"
                  aria-label="Next years"
                  onClick={() =>
                    setYearPageStart(
                      (current) => current + 12
                    )
                  }
                >
                  ›
                </button>
              </div>

              <div className="institutionCalendarYears">
                {years.map((year) => (
                  <button
                    type="button"
                    key={year}
                    className={`institutionCalendarChoice ${
                      displayYear === year
                        ? "institutionCalendarSelected"
                        : ""
                    }`}
                    onClick={() => {
                      setDisplayYear(year);
                      setView("days");
                    }}
                  >
                    {year}
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

function SectionHeader({
  title,
  icon,
  tone,
  editing,
  popup,
  popupMessage,
  onEdit,
  onSave,
  onCancel,
}: {
  title: string;
  icon: string;
  tone: "pink" | "green" | "blue" | "orange";
  editing: boolean;
  popup?: PopupType | null;
  popupMessage?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="institutionInformationHeader">
      <div className="institutionInformationTitle">
        <span
          className={`institutionSectionIcon ngoSectionIcon ngoSectionIcon-${tone}`}
        >
          <Icon
            src={icon}
            width={15}
            height={15}
            className="institutionWhiteIcon"
          />
        </span>
        <h2>{title}</h2>
      </div>

      <div className="institutionHeaderActions">
        {popup && (
          <div
            className={`institutionInlinePopup ${
              popup === "saved"
                ? "institutionInlinePopupSaved"
                : popup === "invalid"
                ? "institutionInlinePopupInvalid"
                : "institutionInlinePopupDiscarded"
            }`}
            role="status"
            aria-live="polite"
          >
            <Icon
              src={popup === "saved" ? images.clap : images.sad}
              width={24}
              height={24}
              className="institutionInlinePopupIcon"
            />
            <span>
              {popupMessage ??
                (popup === "saved"
                  ? "Changes Saved"
                  : popup === "invalid"
                  ? "Check Email / Phone"
                  : "Changes Discarded")}
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
              <Icon src={images.save} width={14} height={14} />
              <span>Save</span>
            </button>

            <button
              type="button"
              className="institutionActionButton institutionCancelButton"
              onClick={onCancel}
            >
              <Icon src={images.cancel} width={14} height={14} />
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
            <Icon src={images.editBig} width={22} height={22} />
          </button>
        )}
      </div>
    </div>
  );
}

function UploadField({
  label,
  editing,
  onFileChange,
  onTooLarge,
  onInvalidType,
  accept,
}: {
  label: string;
  editing: boolean;
  onFileChange?: (hasFile: boolean) => void;
  onTooLarge?: () => void;
  onInvalidType?: () => void;
  accept?: string;
}) {
  const id = useId();
  const [fileName, setFileName] = useState("No File Chosen");
  const MAX_FILE_SIZE = 50 * 1024; // 50 KB

  return (
    <div className="institutionField institutionUploadField">
      <div className="institutionFieldLabel">{label}</div>

      <label
        htmlFor={editing ? id : undefined}
        className="institutionFilePicker"
        aria-disabled={!editing}
      >
        <input
          id={id}
          name={label.toLowerCase().replace(/\s+/g, "-")}
          className="institutionNativeFileInput"
          type="file"
          accept={accept}
          aria-label={label}
          disabled={!editing}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              setFileName("No File Chosen");
              onFileChange?.(false);
              return;
            }

            if (accept) {
              const acceptedTypes = accept
                .split(",")
                .map((item) => item.trim().toLowerCase());

              const fileNameLower = file.name.toLowerCase();
              const fileTypeLower = file.type.toLowerCase();

              const validType = acceptedTypes.some((type) => {
                if (type.startsWith(".")) {
                  return fileNameLower.endsWith(type);
                }

                if (type.endsWith("/*")) {
                  return fileTypeLower.startsWith(type.replace("/*", "/"));
                }

                return fileTypeLower === type;
              });

              if (!validType) {
                onInvalidType?.();
                event.target.value = "";
                setFileName("No File Chosen");
                onFileChange?.(false);
                return;
              }
            }

            if (file.size > MAX_FILE_SIZE) {
              onTooLarge?.();
              event.target.value = "";
              setFileName("No File Chosen");
              onFileChange?.(false);
              return;
            }

            setFileName(file.name);
            onFileChange?.(true);
          }}
        />

        <span className="institutionChooseFileButton">
          <Icon
            src={images.upload}
            width={13}
            height={13}
            className="institutionChooseFileIcon"
          />
          <span>Choose File</span>
        </span>

        <span className="institutionFileName">{fileName}</span>
      </label>
    </div>
  );
}

export default function CoordinatorNgoProfile() {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profilePhotoUploaded, setProfilePhotoUploaded] = useState(false);
  const [editing, setEditing] = useState<SectionName | null>(null);
  const editingRef = useRef<SectionName | null>(null);

  const [confirmation, setConfirmation] = useState(false);
  const [sectionPopup, setSectionPopup] = useState<{
    section: SectionName;
    type: PopupType;
  } | null>(null);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);

  const [autoSavePopup, setAutoSavePopup] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState("02:26PM");

  const [documentFiles, setDocumentFiles] = useState({
    profilePhoto: false,
    govtIdProof: false,
    supportingDocuments: false,
  });

  const showDocumentUploadError = (message: string) => {
    setDocumentUploadError(message);

    window.setTimeout(() => {
      setDocumentUploadError(null);
    }, 2500);
  };

  const [registration, setRegistration] = useState({
    coordinatorId: "PRGEEQIQCBU006B",
    fullName: "Antony Thomas",
    dob: "",
    gender: "",
    qualification: "",
    employeeCode: "eg.EMP-0042",
    officialEmail: "",
    mobile: "",
    alternateEmail: "",
    alternatePhone: "",
    experience: "",
    joining: "17-05-2004",
    assignedProject: "",
    assignedLocation: "",
    designation: "",
    tenantId: "LXP-COL-001",
    onboarding: "Yes",
    status: "eg. Active",
  });

  const [professional, setProfessional] = useState({
    ngoUnit: "",
    programUnit: "",
    employmentType: "",
    focusArea: "",
    expertise: "",
    responsibilities: "",
    projects: "",
    targetCommunities: "",
    fieldExperience: "",
    coordinationExperience: "",
    stakeholders: "",
    volunteerCoordination: "",
  });

  const [skills, setSkills] = useState({
    coreSkills: "",
    communitySkills: "",
    digitalSkills: "",
    proficiency: "",
    skillsToDevelop: "",
    learningInterests: "",
    careerGoals: "",
  });

  const [draftRegistration, setDraftRegistration] = useState(registration);
  const [draftProfessional, setDraftProfessional] = useState(professional);
  const [draftSkills, setDraftSkills] = useState(skills);

  const draftRegistrationRef = useRef(draftRegistration);
  const draftProfessionalRef = useRef(draftProfessional);
  const draftSkillsRef = useRef(draftSkills);

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  useEffect(() => {
    draftRegistrationRef.current = draftRegistration;
  }, [draftRegistration]);

  useEffect(() => {
    draftProfessionalRef.current = draftProfessional;
  }, [draftProfessional]);

  useEffect(() => {
    draftSkillsRef.current = draftSkills;
  }, [draftSkills]);

  useEffect(() => {
    let hideTimer: number | null = null;

    const autoSave = () => {
      const currentEditing = editingRef.current;

      if (currentEditing === "registration") {
        setRegistration(draftRegistrationRef.current);
      }

      if (currentEditing === "professional") {
        setProfessional(draftProfessionalRef.current);
      }

      if (currentEditing === "skills") {
        setSkills(draftSkillsRef.current);
      }

      const formattedTime = new Date()
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      setLastSavedTime(formattedTime);
      setAutoSavePopup(true);

      if (hideTimer !== null) {
        window.clearTimeout(hideTimer);
      }

      hideTimer = window.setTimeout(() => {
        setAutoSavePopup(false);
      }, 2000);
    };

    const interval = window.setInterval(autoSave, 10000);

    return () => {
      window.clearInterval(interval);

      if (hideTimer !== null) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  const startEdit = (section: SectionName) => {
    setDraftRegistration(registration);
    setDraftProfessional(professional);
    setDraftSkills(skills);
    setSectionPopup(null);
    setEditing(section);
  };

  const finishPopup = (section: SectionName, type: PopupType) => {
    setSectionPopup({ section, type });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === section && current.type === type ? null : current
      );
      setEditing((current) => (current === section ? null : current));
    }, 2500);
  };

  const showInvalidRegistrationPopup = () => {
    setSectionPopup({ section: "registration", type: "invalid" });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === "registration" && current.type === "invalid"
          ? null
          : current
      );
    }, 2500);
  };

  const save = (section: SectionName) => {
    if (section === "registration") {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com$/;
      const indianPhoneRegex = /^[6-9][0-9]{9}$/;

      const validOfficialEmail = emailRegex.test(draftRegistration.officialEmail);
      const validAlternateEmail = emailRegex.test(draftRegistration.alternateEmail);
      const validMobile = indianPhoneRegex.test(draftRegistration.mobile);
      const validAlternatePhone = indianPhoneRegex.test(draftRegistration.alternatePhone);

      if (
        !validOfficialEmail ||
        !validAlternateEmail ||
        !validMobile ||
        !validAlternatePhone
      ) {
        showInvalidRegistrationPopup();
        return;
      }

      setRegistration(draftRegistration);
    }

    if (section === "professional") {
      setProfessional(draftProfessional);
    }

    if (section === "skills") {
      setSkills(draftSkills);
    }

    finishPopup(section, "saved");
  };

  const cancel = (section: SectionName) => {
    if (section === "registration") {
      setDraftRegistration(registration);
    }

    if (section === "professional") {
      setDraftProfessional(professional);
    }

    if (section === "skills") {
      setDraftSkills(skills);
    }

    finishPopup(section, "discarded");
  };

  const hasText = (value: string) => value.trim().length > 0;

  const profilePhotoCompleted = profilePhotoUploaded;
  const registrationCompleted = Object.values(registration).every((value) =>
    hasText(String(value))
  );
  const professionalCompleted = Object.values(professional).every((value) =>
    hasText(String(value))
  );
  const skillsCompleted = Object.values(skills).every((value) =>
    hasText(String(value))
  );
  const documentsCompleted =
    documentFiles.profilePhoto &&
    documentFiles.govtIdProof &&
    documentFiles.supportingDocuments;

  const steps = [
    { label: "Profile Photo", done: profilePhotoCompleted },
    { label: "Professional Profile", done: professionalCompleted },
    { label: "Documents", done: documentsCompleted },
    { label: "Registration Data", done: registrationCompleted },
    { label: "Skill and Development", done: skillsCompleted },
    { label: "Confirmation", done: confirmation },
  ];

  const completedCount = steps.filter((step) => step.done).length;
  const completion = Math.round((completedCount / steps.length) * 100);

  const lockedRegistration = new Set([
    "coordinatorId",
    "fullName",
    "employeeCode",
    "joining",
    "tenantId",
    "onboarding",
    "status",
  ]);

  // Figma field symbols shown while a section is in edit mode.
  // This only changes the displayed icon; existing field behavior remains unchanged.
  const registrationVisualIcons: Record<string, "lock" | "edit" | "arrow"> = {
    coordinatorId: "lock",
    fullName: "lock",
    employeeCode: "lock",
    officialEmail: "edit",
    mobile: "edit",
    alternateEmail: "edit",
    alternatePhone: "edit",
    joining: "lock",
    tenantId: "lock",
    onboarding: "lock",
    status: "lock",
  };

  const registrationFields = [
    ["Coordinator ID", "coordinatorId"],
    ["Full Name", "fullName"],
    ["Date of Birth", "dob"],
    ["Gender", "gender"],
    ["Highest Qualification", "qualification"],
    ["Employee Code", "employeeCode"],
    ["Official Email", "officialEmail"],
    ["Mobile Number", "mobile"],
    ["Alternate Email", "alternateEmail"],
    ["Alternate Phone", "alternatePhone"],
    ["Total Experience", "experience"],
    ["Date of Joining", "joining"],
    ["Assigned Project", "assignedProject"],
    ["Assigned Location", "assignedLocation"],
    ["Designation", "designation"],
    ["Tenant ID", "tenantId"],
    ["Onboarding Completed", "onboarding"],
    ["Status", "status"],
  ] as const;

  const registrationPlaceholders: Record<string, string> = {
    dob: "Select date of birth",
    gender: "Select",
    qualification: "Select",
    officialEmail: "Enter email address",
    mobile: "Enter mobile number",
    alternateEmail: "Enter alternate email",
    alternatePhone: "Enter alternate phone number",
    experience: "Select",
    assignedProject: "Select",
    assignedLocation: "Select",
    designation: "Select",
  };

  const professionalPlaceholders: Record<string, string> = {
    ngoUnit: "Select",
    programUnit: "Select",
    employmentType: "Select",
    focusArea: "Select",
    expertise: "Select",
    responsibilities: "Select",
    projects: "Select",
    targetCommunities: "Select",
    fieldExperience: "Select",
    coordinationExperience: "Select",
    stakeholders: "Select",
    volunteerCoordination: "Select",
  };

  const skillsPlaceholders: Record<string, string> = {
    coreSkills: "Select",
    communitySkills: "Select",
    digitalSkills: "Select",
    proficiency: "Select",
    skillsToDevelop: "Select",
    learningInterests: "Select",
    careerGoals: "Select",
  };

  const professionalFields = [
    ["NGO Unit", "ngoUnit"],
    ["Program Unit", "programUnit"],
    ["Employment Type", "employmentType"],
    ["Focus Area", "focusArea"],
    ["Expertise", "expertise"],
    ["Key Responsibilities", "responsibilities"],
    ["Projects", "projects"],
    ["Target Communities", "targetCommunities"],
    ["Field Experience", "fieldExperience"],
    ["Coordination Experience", "coordinationExperience"],
    ["Stakeholders", "stakeholders"],
    ["Volunteer Coordination", "volunteerCoordination"],
  ] as const;

  const skillsFields = [
    ["Core Skills", "coreSkills"],
    ["Community Skills", "communitySkills"],
    ["Digital Skills", "digitalSkills"],
    ["Proficiency", "proficiency"],
    ["Skills to Develop", "skillsToDevelop"],
    ["Learning Interests", "learningInterests"],
    ["Career Goals", "careerGoals"],
  ] as const;


  const indiaLocations = useMemo(() => {
    const cities = City.getCitiesOfCountry("IN") ?? [];

    return Array.from(
      new Set(
        cities
          .map((city) => city.name?.trim())
          .filter((cityName): cityName is string => Boolean(cityName))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, []);

  const sanitizeIndianPhone = (value: string) =>
    value.replace(/\D/g, "").slice(0, 10);

  const indianPhonePattern = "[6-9][0-9]{9}";
  const emailPattern = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com$";

  const registrationDropdownOptions: Record<string, string[]> = {
    gender: ["Male", "Female", "Other", "Prefer not to say"],
    qualification: [
      "PhD",
      "Master's Degree",
      "Bachelor's Degree",
      "Diploma",
      "PG Diploma",
      "Other",
    ],
    experience: ["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16–20 years", "20+ years"],
    assignedProject: [
      "Youth Skills Program",
      "Women Empowerment Project",
      "Rural Development Project",
    ],
    assignedLocation: indiaLocations,
    designation: [
      "Coordinator",
      "Project Coordinator",
      "Community Coordinator",
      "Field Coordinator",
      "Program Coordinator",
      "Senior Coordinator",
    ],
  };

  const professionalDropdownOptions: Record<string, string[]> = {
    ngoUnit: [
      "Community Development",
      "Education",
      "Livelihood",
      "Women Empowerment",
      "Youth Development",
      "Rural Development",
    ],
    programUnit: [
      "Skill Development",
      "Community Outreach",
      "Education & Training",
      "Livelihood Development",
      "Social Development",
    ],
    employmentType: ["Full-time", "Part-time", "Contract", "Consultant", "Volunteer"],
    fieldExperience: ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"],
    coordinationExperience: ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"],
  };

  const professionalMultiSelectOptions: Record<string, string[]> = {
    focusArea: [
      "Education",
      "Livelihood",
      "Youth Development",
      "Women Empowerment",
      "Rural Development",
      "Digital Literacy",
      "Employment",
      "Entrepreneurship",
    ],
    expertise: [
      "Community Outreach",
      "Mobilization",
      "Training",
      "Program Management",
      "Field Operations",
      "Counselling",
      "Stakeholder Management",
    ],
    responsibilities: [
      "Field Planning",
      "Reporting",
      "Community Mobilization",
      "Program Coordination",
      "Training Coordination",
      "Documentation",
      "Monitoring & Evaluation",
    ],
    projects: [
      "Youth Skills Program",
      "Digital Literacy Program",
      "Women Entrepreneurship Program",
      "Rural Employment Program",
    ],
    targetCommunities: [
      "Youth",
      "Women",
      "Rural Communities",
      "Urban Poor",
      "Students",
      "Persons with Disabilities",
      "Farmers",
      "Job Seekers",
    ],
    stakeholders: [
      "Government",
      "NGOs",
      "CSR Partners",
      "Community Leaders",
      "Schools",
      "Colleges",
      "Employers",
      "Local Bodies",
    ],
    volunteerCoordination: [
      "Volunteer Mobilization",
      "Volunteer Training",
      "Volunteer Scheduling",
      "Field Deployment",
      "Volunteer Reporting",
    ],
  };

  const skillsDropdownOptions: Record<string, string[]> = {
    proficiency: ["Beginner", "Intermediate", "Advanced", "Expert"],
    careerGoals: [
      "Program Manager",
      "Project Manager",
      "Senior Coordinator",
      "Program Head",
      "Community Development Manager",
      "Operations Manager",
      "Other",
    ],
  };

  const skillsMultiSelectOptions: Record<string, string[]> = {
    coreSkills: [
      "Communication",
      "Planning",
      "Teamwork",
      "Problem Solving",
      "Reporting",
      "Leadership",
      "Project Management",
    ],
    communitySkills: [
      "Community Mobilization",
      "Counselling",
      "Awareness Campaigns",
      "Field Survey",
      "Stakeholder Engagement",
      "Community Facilitation",
    ],
    digitalSkills: [
      "MS Office",
      "Excel",
      "LMS",
      "MIS",
      "Google Workspace",
      "Power BI",
      "Data Entry",
      "Digital Reporting",
    ],
    skillsToDevelop: [
      "Data Analytics",
      "Leadership",
      "Project Management",
      "Digital Skills",
      "Communication",
      "Monitoring & Evaluation",
    ],
    learningInterests: [
      "Leadership",
      "Data Analytics",
      "AI",
      "Community Development",
      "Project Management",
      "Digital Learning",
      "Social Entrepreneurship",
    ],
  };

  return (
    <main className="superAdminPage institutionAdminPage ngoCoordinatorPage">
      <title>NGO Coordinator Profile | Neuro LXP</title>

      <div className="dashboardLayout ngoFixedDashboard">
        <div className="ngoFixedSidebar">
          <Sidebar />
        </div>

        <section className="mainContent ngoFixedMainContent">
          <div className="ngoFixedHeader">
            <Header />
          </div>

          <div className="pageContent institutionPageContent ngoScrollableContent">
            <div className="institutionHeadingRow">
              <div>
                <h1>NGO Coordinator Profile</h1>
                <p>
                  Manage Your Identity, Access, Preferences, And Activity With
                  Ease.
                </p>
              </div>

              {autoSavePopup && (
                <div className="savedBadge" role="status" aria-live="polite">
                  <Icon src={images.completed} width={16} height={16} />
                  <span>Draft Saved at {lastSavedTime}</span>
                </div>
              )}
            </div>

            <section className="institutionOverviewCard">
              <div className="institutionIdentity">
                <div className="institutionAvatarWrap">
                  <div className="institutionAvatar">
                    <div className="institutionAvatarInner">
                      {profileImage && (
                        <Image
                          src={profileImage}
                          alt=""
                          fill
                          sizes="88px"
                          className="institutionAvatarImage"
                          unoptimized={profileImage.startsWith("data:")}
                        />
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="institutionCameraButton"
                    aria-label="Change profile photo"
                    onClick={() => profileInputRef.current?.click()}
                  >
                    <Icon src={images.camera} width={21} height={21} />
                  </button>

                  <input
                    id="ngo-profile-photo"
                    name="ngoProfilePhoto"
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Choose profile photo"
                    className="institutionProfileImageInput"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file || !file.type.startsWith("image/")) {
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setProfileImage(reader.result);
                          setProfilePhotoUploaded(true);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>

                <div className="institutionIdentityText">
                  <h2>Antony Thomas</h2>
                  <div className="institutionRole">NGO Coordinator</div>
                  <div className="institutionActiveBadge">
                    <span className="institutionActiveDot" aria-hidden="true" />
                    <span>Active</span>
                  </div>
                </div>
              </div>

              <div className="institutionDivider" aria-hidden="true" />

              <div
                className="institutionCompletion"
                aria-label="Profile completion summary"
              >
                <div className="institutionCompletionHeader">
                  <h3>Profile Completion</h3>
                  <span>{completion}% Completed</span>
                </div>

                <div
                  className="institutionProgressTrack"
                  role="progressbar"
                  aria-label="Profile completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completion}
                >
                  <div
                    className="institutionProgressBar"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="institutionCompletionSteps institutionCoordinatorSteps">
                  {steps.map((step) => (
                    <div className="institutionCompletionStep" key={step.label}>
                      <span
                        className={
                          step.done
                            ? "institutionCompletedCircle ngoStepDone"
                            : "institutionEmptyCircle"
                        }
                        aria-hidden="true"
                      >
                        {step.done && <span className="ngoCompletionCheckMark" />}
                      </span>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Registration Data"
                icon={images.registration}
                tone="pink"
                editing={editing === "registration"}
                popup={
                  sectionPopup?.section === "registration"
                    ? sectionPopup.type
                    : null
                }
                onEdit={() => startEdit("registration")}
                onSave={() => save("registration")}
                onCancel={() => cancel("registration")}
              />

              <div className="institutionGrid ngoRegistrationGrid">
                {registrationFields.map(([label, key]) => {
                  if (editing !== "registration") {
                    return (
                      <DisplayField
                        key={key}
                        label={label}
                        value={registration[key]}
                        placeholder={registrationPlaceholders[key] ?? "Select"}
                      />
                    );
                  }

                  if (key === "dob") {
                    return (
                      <DateOfBirthField
                        key={key}
                        value={draftRegistration.dob}
                        onChange={(value) =>
                          setDraftRegistration((current) => ({
                            ...current,
                            dob: value,
                          }))
                        }
                      />
                    );
                  }

                  if (registrationDropdownOptions[key]) {
                    return (
                      <SelectField
                        key={key}
                        label={label}
                        value={draftRegistration[key]}
                        options={registrationDropdownOptions[key]}
                        placeholder="Select"
                        searchable={key === "assignedLocation"}
                        onChange={(value) =>
                          setDraftRegistration((current) => ({
                            ...current,
                            [key]: value,
                          }))
                        }
                      />
                    );
                  }

                  return (
                    <EditField
                      key={key}
                      label={label}
                      value={draftRegistration[key]}
                      locked={lockedRegistration.has(key)}
                      visualIcon={registrationVisualIcons[key]}
                      type={
                        key === "officialEmail" || key === "alternateEmail"
                          ? "email"
                          : key === "mobile" || key === "alternatePhone"
                          ? "tel"
                          : "text"
                      }
                      maxLength={
                        key === "mobile" || key === "alternatePhone"
                          ? 10
                          : undefined
                      }
                      pattern={
                        key === "officialEmail" || key === "alternateEmail"
                          ? emailPattern
                          : key === "mobile" || key === "alternatePhone"
                          ? indianPhonePattern
                          : undefined
                      }
                      inputMode={
                        key === "officialEmail" || key === "alternateEmail"
                          ? "email"
                          : key === "mobile" || key === "alternatePhone"
                          ? "numeric"
                          : "text"
                      }
                      sanitize={
                        key === "mobile" || key === "alternatePhone"
                          ? sanitizeIndianPhone
                          : undefined
                      }
                      placeholder={registrationPlaceholders[key] ?? ""}
                      onChange={(value) =>
                        setDraftRegistration((current) => ({
                          ...current,
                          [key]: value,
                        }))
                      }
                    />
                  );
                })}
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Professional Profile"
                icon={images.professional}
                tone="green"
                editing={editing === "professional"}
                popup={
                  sectionPopup?.section === "professional"
                    ? sectionPopup.type
                    : null
                }
                onEdit={() => startEdit("professional")}
                onSave={() => save("professional")}
                onCancel={() => cancel("professional")}
              />

              <div className="institutionGrid ngoProfessionalGrid">
                {professionalFields.map(([label, key]) => {
                  if (editing !== "professional") {
                    return (
                      <DisplayField
                        key={key}
                        label={label}
                        value={professional[key]}
                        placeholder={professionalPlaceholders[key] ?? "Select"}
                      />
                    );
                  }

                  if (professionalDropdownOptions[key]) {
                    return (
                      <SelectField
                        key={key}
                        label={label}
                        value={draftProfessional[key]}
                        options={professionalDropdownOptions[key]}
                        placeholder="Select"
                        onChange={(value) =>
                          setDraftProfessional((current) => ({
                            ...current,
                            [key]: value,
                          }))
                        }
                      />
                    );
                  }

                  return (
                    <MultiSelectField
                      key={key}
                      label={label}
                      value={draftProfessional[key]}
                      options={professionalMultiSelectOptions[key] ?? []}
                      onChange={(value) =>
                        setDraftProfessional((current) => ({
                          ...current,
                          [key]: value,
                        }))
                      }
                    />
                  );
                })}
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Skills & Development"
                icon={images.skills}
                tone="blue"
                editing={editing === "skills"}
                popup={
                  sectionPopup?.section === "skills"
                    ? sectionPopup.type
                    : null
                }
                onEdit={() => startEdit("skills")}
                onSave={() => save("skills")}
                onCancel={() => cancel("skills")}
              />

              <div className="institutionGrid ngoSkillsGrid">
                {skillsFields.map(([label, key]) => {
                  if (editing !== "skills") {
                    return (
                      <DisplayField
                        key={key}
                        label={label}
                        value={skills[key]}
                        placeholder={skillsPlaceholders[key] ?? "Select"}
                      />
                    );
                  }

                  if (skillsDropdownOptions[key]) {
                    return (
                      <SelectField
                        key={key}
                        label={label}
                        value={draftSkills[key]}
                        options={skillsDropdownOptions[key]}
                        placeholder="Select"
                        onChange={(value) =>
                          setDraftSkills((current) => ({
                            ...current,
                            [key]: value,
                          }))
                        }
                      />
                    );
                  }

                  return (
                    <MultiSelectField
                      key={key}
                      label={label}
                      value={draftSkills[key]}
                      options={skillsMultiSelectOptions[key] ?? []}
                      onChange={(value) =>
                        setDraftSkills((current) => ({
                          ...current,
                          [key]: value,
                        }))
                      }
                    />
                  );
                })}
              </div>
            </section>

            <section className="institutionInformationCard institutionDocumentsCard">
              <SectionHeader
                title="Documents"
                icon={images.documents}
                tone="orange"
                editing={editing === "documents"}
                popup={
                  documentUploadError
                    ? "invalid"
                    : sectionPopup?.section === "documents"
                    ? sectionPopup.type
                    : null
                }
                popupMessage={documentUploadError ?? undefined}
                onEdit={() => startEdit("documents")}
                onSave={() => save("documents")}
                onCancel={() => cancel("documents")}
              />

              <div className="institutionGrid institutionDocumentsGrid">
                <UploadField
                  label="Profile Photo"
                  editing={editing === "documents"}
                  accept="image/*"
                  onTooLarge={() =>
                    showDocumentUploadError(
                      "Profile Photo must be 50 KB or less"
                    )
                  }
                  onInvalidType={() =>
                    showDocumentUploadError(
                      "Profile Photo must be an image file"
                    )
                  }
                  onFileChange={(hasFile) =>
                    setDocumentFiles((current) => ({
                      ...current,
                      profilePhoto: hasFile,
                    }))
                  }
                />

                <UploadField
                  label="Govt Id Proof"
                  editing={editing === "documents"}
                  accept="image/*,.pdf"
                  onTooLarge={() =>
                    showDocumentUploadError(
                      "Govt Id Proof must be 50 KB or less"
                    )
                  }
                  onInvalidType={() =>
                    showDocumentUploadError(
                      "Govt Id Proof must be an image or PDF"
                    )
                  }
                  onFileChange={(hasFile) =>
                    setDocumentFiles((current) => ({
                      ...current,
                      govtIdProof: hasFile,
                    }))
                  }
                />

                <UploadField
                  label="Supporting Documents"
                  editing={editing === "documents"}
                  accept=".pdf,.doc,.docx,image/*"
                  onTooLarge={() =>
                    showDocumentUploadError(
                      "Supporting Documents must be 50 KB or less"
                    )
                  }
                  onInvalidType={() =>
                    showDocumentUploadError(
                      "Supporting Documents must be PDF, DOC, DOCX, or image"
                    )
                  }
                  onFileChange={(hasFile) =>
                    setDocumentFiles((current) => ({
                      ...current,
                      supportingDocuments: hasFile,
                    }))
                  }
                />
              </div>
            </section>

            <section className="institutionInformationCard institutionConfirmationCard">
              <div className="institutionInformationTitle institutionConfirmationTitle">
                <span className="institutionSectionIcon ngoSectionIcon ngoSectionIcon-purple">
                  <Icon
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
                  htmlFor="ngo-confirmation"
                  className="institutionCheckRow"
                >
                  <input
                    id="ngo-confirmation"
                    name="ngoConfirmation"
                    className="institutionConfirmationCheckbox"
                    type="checkbox"
                    checked={confirmation}
                    onChange={(event) => setConfirmation(event.target.checked)}
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
                onClick={() => {
                  if (editing === "registration") {
                    setRegistration(draftRegistration);
                  }

                  if (editing === "professional") {
                    setProfessional(draftProfessional);
                  }

                  if (editing === "skills") {
                    setSkills(draftSkills);
                  }

                  setEditing(null);
                  setLastSavedTime(
                    new Date()
                      .toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(" ", "")
                  );
                  setAutoSavePopup(true);
                }}
              >
                Save Profile
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
