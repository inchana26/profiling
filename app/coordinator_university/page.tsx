"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./university.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";

const images = {
  profile: "/assets/institutionimages/profile.png",

  camera: "/assets/universityicons/camera.svg",
  edit: "/assets/universityicons/edit.svg",
  editBig: "/assets/universityicons/editbig.svg",
  lock: "/assets/universityicons/lock.svg",
  save: "/assets/universityicons/tick.svg",
  cancel: "/assets/universityicons/cancel.svg",
  arrowDown: "/assets/universityicons/arrow-down.svg",
  completed: "/assets/universityicons/checkmark.svg",
  calendar: "/assets/universityicons/calendar.svg",
  upload: "/assets/universityicons/upload.svg",
  clap: "/assets/universityicons/clap.svg",
  sad: "/assets/universityicons/sad.svg",

  basicInformation: "/assets/universityicons/user.svg",
  basicSection: "/assets/universityicons/graduation-cap.svg",

  registration: "/assets/universityicons/file-edit.svg",
  identity: "/assets/universityicons/users.svg",
  professional: "/assets/universityicons/graduation-cap.svg",
  documents: "/assets/universityicons/file.svg",
  confirmation: "/assets/universityicons/checkmark-circlewhite.svg",

  publication: "/assets/universityicons/publication.svg",
  researchProjects: "/assets/universityicons/research-projects.svg",
  researchOutput: "/assets/universityicons/research-output.svg",
  collaboration: "/assets/universityicons/collaboration.svg",
  researchInnovation: "/assets/universityicons/flask.svg",

  add: "/assets/universityicons/add.svg",
  delete: "/assets/universityicons/delete.svg",
};

type SectionName = "registration" | "researchInnovation" | "documents";

/* Recommended upload sizes from the provided LMS guide.
   Files above these recommended sizes are rejected. */
const RECOMMENDED_UPLOAD_LIMITS_MB: Record<string, number> = {
  ".jpg": 2,
  ".jpeg": 2,
  ".png": 2,
  ".webp": 2,
  ".pdf": 25,
  ".doc": 10,
  ".docx": 10,
  ".ppt": 30,
  ".pptx": 30,
  ".mp3": 20,
  ".aac": 20,
  ".mp4": 500,
  ".zip": 300,
  ".xlsx": 5,
  ".vtt": 0.5,
  ".srt": 0.5,
};

const getFileExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
};

const getRecommendedUploadLimitMB = (fileName: string) => {
  const extension = getFileExtension(fileName);
  return RECOMMENDED_UPLOAD_LIMITS_MB[extension];
};

const formatUploadLimit = (sizeMB: number) =>
  sizeMB < 1 ? `${Math.round(sizeMB * 1000)} KB` : `${sizeMB} MB`;


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
        {value || (placeholder !== undefined ? placeholder : "")}
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
          {value || (placeholder !== undefined ? placeholder : "--")}
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
  visualIcon?: "edit" | "lock" | "select";
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
        <span
          className="institutionStaticSelectIcon institutionFieldSelectIcon"
          aria-hidden="true"
        >
          <IconImage
            src={images.arrowDown}
            width={16}
            height={16}
            className="institutionFieldSelectArrow"
          />
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
};

function SelectField({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
  className = "",
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectId = useId();
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;

  useEffect(() => {
    const closeOtherDropdown = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== selectId) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "institution-dropdown-open",
      closeOtherDropdown as EventListener
    );

    return () => {
      document.removeEventListener(
        "institution-dropdown-open",
        closeOtherDropdown as EventListener
      );
    };
  }, [selectId]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div
      className={`institutionField institutionSelectField ${className} ${
        open ? "institutionSelectFieldOpen" : ""
      }`}
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
              document.dispatchEvent(
                new CustomEvent("institution-dropdown-open", {
                  detail: selectId,
                })
              );
            }

            setOpen(nextOpen);
          }}
        >
          <span>{value || placeholder}</span>

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
            className={`institutionCustomSelectList institutionRadioSelectList ${options.length > 4 ? "institutionRadioSelectListScrollable" : ""}`}
            role="listbox"
            aria-labelledby={labelId}
          >

            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`institutionCustomSelectOption institutionRadioSelectOption ${
                  value === option ? "institutionCustomSelectOptionActive" : ""
                }`}
                role="option"
                aria-selected={value === option}
                onClick={() => handleSelect(option)}
              >
                <span className={`institutionRadioSelectCircle ${value === option ? "institutionRadioSelectCircleActive" : ""}`}>
                  {value === option && <span className="institutionRadioSelectCheck">✓</span>}
                </span>
                <span className="institutionRadioSelectOptionText">{option}</span>
              </button>
            ))}
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
  placeholder?: string;
};

type CalendarView = "days" | "months" | "years";

const CALENDAR_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MultiSelectFieldProps = SelectFieldProps;

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

  useEffect(() => {
    const closeOtherDropdown = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== selectId) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "institution-dropdown-open",
      closeOtherDropdown as EventListener
    );

    return () => {
      document.removeEventListener(
        "institution-dropdown-open",
        closeOtherDropdown as EventListener
      );
    };
  }, [selectId]);

  const selectedValues = value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const toggleOption = (option: string) => {
    const next = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];
    onChange(next.join(", "));
  };

  return (
    <div className={`institutionField institutionSelectField ${className} ${open ? "institutionSelectFieldOpen" : ""}`}>
      <div className="institutionFieldLabel">{label}</div>
      <div className="institutionSelectWrap">
        <button
          type="button"
          className="institutionSelect institutionCustomSelectTrigger"
          aria-expanded={open}
          onClick={() => {
            const nextOpen = !open;

            if (nextOpen) {
              document.dispatchEvent(
                new CustomEvent("institution-dropdown-open", {
                  detail: selectId,
                })
              );
            }

            setOpen(nextOpen);
          }}
        >
          <span>{selectedValues.length ? selectedValues.join(", ") : placeholder}</span>
          <IconImage src={images.arrowDown} width={30} height={30} className={`institutionSelectArrow ${open ? "institutionSelectArrowOpen" : ""}`} />
        </button>
        {open && (
          <div className={`institutionCustomSelectList institutionRadioSelectList ${options.length > 4 ? "institutionRadioSelectListScrollable" : ""}`} role="listbox" aria-multiselectable="true">
            {options.map((option) => {
              const active = selectedValues.includes(option);
              return (
                <button key={option} type="button" className={`institutionCustomSelectOption institutionRadioSelectOption ${active ? "institutionCustomSelectOptionActive" : ""}`} aria-selected={active} onClick={() => toggleOption(option)}>
                  <span className={`institutionRadioSelectCircle ${active ? "institutionRadioSelectCircleActive" : ""}`}>{active && <span className="institutionRadioSelectCheck">✓</span>}</span>
                  <span className="institutionRadioSelectOptionText">{option}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
}: DateFieldProps) {
  const inputId = useId();
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
  const [view, setView] = useState<CalendarView>("days");
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor(initialDate.getFullYear() / 12) * 12
  );

  useEffect(() => {
    const closeCalendar = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false);
        setView("days");
      }
    };

    const closeCalendarForDropdown = () => {
      setOpen(false);
      setView("days");
    };

    document.addEventListener("mousedown", closeCalendar);
    document.addEventListener(
      "institution-dropdown-open",
      closeCalendarForDropdown
    );

    return () => {
      document.removeEventListener("mousedown", closeCalendar);
      document.removeEventListener(
        "institution-dropdown-open",
        closeCalendarForDropdown
      );
    };
  }, []);

  const formatDate = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const moveMonth = (amount: number) => {
    const next = new Date(displayYear, displayMonth + amount, 1);
    setDisplayMonth(next.getMonth());
    setDisplayYear(next.getFullYear());
  };

  const selectDay = (year: number, month: number, day: number) => {
    onChange(formatDate(year, month, day));
    setDisplayYear(year);
    setDisplayMonth(month);
    setOpen(false);
    setView("days");
  };

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDay = new Date(displayYear, displayMonth, 1).getDay();
  const previousMonthDays = new Date(displayYear, displayMonth, 0).getDate();
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstDay + 1;
    if (dayNumber < 1) {
      const date = new Date(displayYear, displayMonth - 1, previousMonthDays + dayNumber);
      return { day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), muted: true };
    }
    if (dayNumber > daysInMonth) {
      const date = new Date(displayYear, displayMonth + 1, dayNumber - daysInMonth);
      return { day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), muted: true };
    }
    return { day: dayNumber, month: displayMonth, year: displayYear, muted: false };
  });

  const selected = value ? new Date(`${value}T00:00:00`) : null;

  return (
    <div className="institutionField institutionEditableField institutionDateField" ref={popupRef}>
      <div className="institutionFieldText">
        <label htmlFor={inputId} className="institutionFieldLabel">{label}</label>
        <input
          id={inputId}
          name={inputId}
          type="text"
          readOnly
          className="institutionFieldInput institutionDateInput"
          value={
            value
              ? (() => {
                  const [year, month, day] = value.split("-");
                  return year && month && day
                    ? `${day}/${month}/${year}`
                    : value;
                })()
              : ""
          }
          placeholder={placeholder}
          onClick={() => {
            document.dispatchEvent(
              new CustomEvent("institution-dropdown-open", {
                detail: `calendar-${inputId}`,
              })
            );
            setOpen(true);
          }}
          aria-haspopup="dialog"
          aria-expanded={open}
        />
      </div>

      <button
        type="button"
        className="institutionFieldAction institutionCalendarAction"
        aria-label={`Open ${label} calendar`}
        onClick={() => {
          const nextOpen = !open;

          if (nextOpen) {
            document.dispatchEvent(
              new CustomEvent("institution-dropdown-open", {
                detail: `calendar-${inputId}`,
              })
            );
          }

          setOpen(nextOpen);
        }}
      >
        <IconImage src={images.calendar} width={18} height={18} />
      </button>

      {open && (
        <div className="institutionCalendarPopup" role="dialog" aria-label={`${label} calendar`}>
          <div className="institutionCalendarTopRow">
            <button type="button" className="institutionCalendarArrow" onClick={() => moveMonth(-1)} aria-label="Previous month">‹</button>
            <button type="button" className="institutionCalendarSelect institutionCalendarMonthSelect" onClick={() => setView("months")}>
              <span>{new Date(displayYear, displayMonth).toLocaleString("en-US", { month: "long" })}</span><span>⌄</span>
            </button>
            <button type="button" className="institutionCalendarSelect institutionCalendarYearSelect" onClick={() => { setYearPageStart(Math.floor(displayYear / 12) * 12); setView("years"); }}>
              <span>{displayYear}</span><span>⌄</span>
            </button>
            <button type="button" className="institutionCalendarArrow" onClick={() => moveMonth(1)} aria-label="Next month">›</button>
          </div>

          {view === "days" && (
            <>
              <div className="institutionCalendarWeekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="institutionCalendarDays">
                {calendarCells.map((cell, index) => {
                  const isSelected = selected && selected.getFullYear() === cell.year && selected.getMonth() === cell.month && selected.getDate() === cell.day;
                  return (
                    <button
                      type="button"
                      key={`${cell.year}-${cell.month}-${cell.day}-${index}`}
                      className={`institutionCalendarDay ${cell.muted ? "institutionCalendarMuted" : ""} ${isSelected ? "institutionCalendarSelected" : ""}`}
                      onClick={() => selectDay(cell.year, cell.month, cell.day)}
                    >{cell.day}</button>
                  );
                })}
              </div>
            </>
          )}

          {view === "months" && (
            <div className="institutionCalendarMonths">
              {CALENDAR_MONTHS.map((month, index) => (
                <button type="button" key={month} className="institutionCalendarChoice" onClick={() => { setDisplayMonth(index); setView("days"); }}>
                  {month}
                </button>
              ))}
            </div>
          )}

          {view === "years" && (
            <>
              <div className="institutionCalendarYearRange">
                <button type="button" className="institutionCalendarRoundArrow" onClick={() => setYearPageStart((current) => current - 12)} aria-label="Previous years">‹</button>
                <strong>{yearPageStart} - {yearPageStart + 11}</strong>
                <button type="button" className="institutionCalendarRoundArrow" onClick={() => setYearPageStart((current) => current + 12)} aria-label="Next years">›</button>
              </div>
              <div className="institutionCalendarYears">
                {Array.from({ length: 12 }, (_, index) => yearPageStart + index).map((year) => (
                  <button type="button" key={year} className="institutionCalendarChoice" onClick={() => { setDisplayYear(year); setView("days"); }}>
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

type SectionHeaderProps = {
  title: string;
  iconSrc: string;
  iconTone: "purple" | "pink";
  editing: boolean;
  popupType?: "saved" | "discarded" | null;
  validationMessage?: string | null;
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
  validationMessage = null,
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
        {validationMessage && (
          <div
            className="institutionInlinePopup institutionInlinePopupDiscarded"
            role="alert"
            aria-live="assertive"
          >
            <IconImage
              src={images.sad}
              width={18}
              height={18}
              className="institutionInlinePopupIcon"
            />
            <span>{validationMessage}</span>
          </div>
        )}

        {popupType && (
          <div
            className={`institutionInlinePopup ${
              popupType === "saved"
                ? "institutionInlinePopupSaved"
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

type ActivityHeaderProps = {
  title: string;
  iconSrc: string;
  tone: "blue" | "orange" | "green" | "red";
  editing: boolean;
  popupType?: "saved" | "discarded" | null;
  validationMessage?: string | null;
  onEdit: () => void;
  onAdd: () => void;
  onDelete: () => void;
};

function ActivityHeader({
  title,
  iconSrc,
  tone,
  editing,
  popupType = null,
  validationMessage = null,
  onEdit,
  onAdd,
  onDelete,
}: ActivityHeaderProps) {
  return (
    <div className="institutionInformationHeader institutionActivityHeader">
      <div className="institutionInformationTitle">
        <span
          className={`institutionActivityIcon institutionActivityIcon-${tone}`}
        >
          <IconImage
            src={iconSrc}
            width={16}
            height={16}
            className="institutionActivitySectionIcon"
          />
        </span>
        <h2>{title}</h2>
      </div>

      <div className="institutionActivityHeaderRight">
        {validationMessage && (
          <div
            className="institutionInlinePopup institutionInlinePopupDiscarded"
            role="alert"
            aria-live="assertive"
          >
            <IconImage
              src={images.sad}
              width={18}
              height={18}
              className="institutionInlinePopupIcon"
            />
            <span>{validationMessage}</span>
          </div>
        )}

        {popupType && (
          <div
            className={`institutionInlinePopup ${
              popupType === "saved"
                ? "institutionInlinePopupSaved"
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
                : "Changes Discarded"}
            </span>
          </div>
        )}

        {editing ? (
          <div className="institutionActivityActions">
            <button
              type="button"
              className="institutionMiniAction institutionMiniAdd"
              onClick={onAdd}
            >
              <IconImage
                src={images.add}
                width={16}
                height={16}
                className="institutionMiniActionIcon"
              />
              <span>Add</span>
            </button>

            <button
              type="button"
              className="institutionMiniAction institutionMiniDelete"
              onClick={onDelete}
            >
              <IconImage
                src={images.delete}
                width={16}
                height={16}
                className="institutionMiniActionIcon"
              />
              <span>Delete</span>
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

type ActivityFieldProps = {
  label: string;
  value: string;
  editing: boolean;
  placeholder?: string;
  selectOptions?: string[];
  onChange: (value: string) => void;
  className?: string;
};

function ActivityField({
  label,
  value,
  editing,
  placeholder,
  selectOptions,
  onChange,
  className = "",
}: ActivityFieldProps) {
  if (!editing) {
    return (
      <DisplayField
        label={label}
        value={value}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  if (selectOptions) {
    return (
      <SelectField
        label={label}
        value={value}
        options={selectOptions}
        placeholder={placeholder || "Select"}
        onChange={onChange}
        className={className}
      />
    );
  }

  return (
    <EditField
      label={label}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={className}
    />
  );
}

type UploadFieldProps = {
  label: string;
  editing: boolean;
  className?: string;
  maxSizeMB?: number;
  accept?: string;
  fileName?: string;
  onFileNameChange?: (fileName: string) => void;
  onFileStatusChange?: (hasFile: boolean) => void;
};

function UploadField({
  label,
  editing,
  className = "",
  maxSizeMB,
  accept = ".pdf,image/*",
  fileName: controlledFileName,
  onFileNameChange,
  onFileStatusChange,
}: UploadFieldProps) {
  const inputId = useId();
  const [localFileName, setLocalFileName] = useState("No File Chosen");
  const [fileError, setFileError] = useState("");

  const fileName =
    controlledFileName !== undefined ? controlledFileName : localFileName;

  const updateFileName = (nextFileName: string) => {
    if (onFileNameChange) {
      onFileNameChange(nextFileName);
    } else {
      setLocalFileName(nextFileName);
    }
  };

  // Before Edit:
  // keep the upload button visible, but do not allow interaction
  // and do not show/fetch any selected-file details.
  if (!editing) {
    return (
      <div className={`institutionField institutionUploadField ${className}`}>
        <div className="institutionFieldLabel">{label}</div>

        <div className="institutionFilePicker">
          <span
            className="institutionChooseFileButton institutionChooseFileButtonDisabled"
            aria-disabled="true"
          >
            <IconImage
              src={images.upload}
              width={14}
              height={14}
              className="institutionChooseFileIcon"
            />
            <span>Choose File</span>
          </span>

          <span className="institutionFileName">
            {fileName || "No File Chosen"}
          </span>
        </div>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      updateFileName("");
      setFileError("");
      onFileStatusChange?.(false);
      return;
    }

    const recommendedLimitMB =
      maxSizeMB ?? getRecommendedUploadLimitMB(file.name);

    if (
      recommendedLimitMB !== undefined &&
      file.size > recommendedLimitMB * 1024 * 1024
    ) {
      updateFileName("");
      setFileError(
        `Recommended maximum size for this file type is ${formatUploadLimit(
          recommendedLimitMB
        )}`
      );
      onFileStatusChange?.(false);
      event.target.value = "";
      return;
    }

    updateFileName(file.name);
    setFileError("");
    onFileStatusChange?.(true);
  };

  return (
    <div className={`institutionField institutionUploadField ${className}`}>
      <div className="institutionFieldLabel">{label}</div>

      <label htmlFor={inputId} className="institutionFilePicker">
        <input
          id={inputId}
          className="institutionNativeFileInput"
          type="file"
          name={label.toLowerCase().replace(/\s+/g, "-")}
          aria-label={label}
          accept={accept}
          onChange={handleFileChange}
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

        <span className="institutionFileName">{fileName}</span>
      </label>

      {fileError && (
        <div className="institutionFileError" role="alert">
          {fileError}
        </div>
      )}
    </div>
  );
}


type GovernmentIdUploadFieldProps = {
  editing: boolean;
  documentType: string;
  onDocumentTypeChange: (value: string) => void;
  fileName: string;
  onFileNameChange: (fileName: string) => void;
  onFileStatusChange?: (hasFile: boolean) => void;
};

function GovernmentIdUploadField({
  editing,
  documentType,
  onDocumentTypeChange,
  fileName,
  onFileNameChange,
  onFileStatusChange,
}: GovernmentIdUploadFieldProps) {
  const inputId = useId();
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [fileError, setFileError] = useState("");


  const documentTypes = [
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
  ];

  useEffect(() => {
    const closeOtherDropdown = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== dropdownId) {
        setOpen(false);
      }
    };

    const closeOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "institution-dropdown-open",
      closeOtherDropdown as EventListener
    );
    document.addEventListener("mousedown", closeOutside);

    return () => {
      document.removeEventListener(
        "institution-dropdown-open",
        closeOtherDropdown as EventListener
      );
      document.removeEventListener("mousedown", closeOutside);
    };
  }, [dropdownId]);

  // Before Edit:
  // keep Document Type and Choose File visible,
  // but disable both and do not show/fetch file details.
  // This remains AFTER all hooks so hook order never changes.
  if (!editing) {
    return (
      <div className="institutionField institutionUploadField institutionGovernmentIdField" ref={dropdownRef}>
        <div className="institutionFieldLabel">Government ID Proof</div>

        <div className="institutionGovernmentIdPicker">
          <div className="institutionDocumentTypeWrap">
            <button
              type="button"
              className="institutionDocumentTypeSelect institutionDocumentTypeSelectDisabled"
              disabled
              aria-disabled="true"
            >
              <span>{documentType || "Document Type"}</span>
              <IconImage
                src={images.arrowDown}
                width={16}
                height={16}
                className="institutionDocumentTypeArrow"
              />
            </button>
          </div>

          <span
            className="institutionFilePickerControl"
            aria-disabled="true"
          >
            <span className="institutionChooseFileButton institutionChooseFileButtonDisabled">
              <IconImage
                src={images.upload}
                width={14}
                height={14}
                className="institutionChooseFileIcon"
              />
              <span>Choose File</span>
            </span>
          </span>

          <span className="institutionFileName">
            {fileName || "No File Chosen"}
          </span>
        </div>
      </div>
    );
  }


  const toggleDropdown = () => {
    if (!editing) return;

    const nextOpen = !open;

    if (nextOpen) {
      document.dispatchEvent(
        new CustomEvent("institution-dropdown-open", {
          detail: dropdownId,
        })
      );
    }

    setOpen(nextOpen);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      onFileNameChange("");
      setFileError("");
      onFileStatusChange?.(false);
      return;
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      onFileNameChange("");
      setFileError("Accepted files: JPG, JPEG, PNG, WebP or PDF");
      onFileStatusChange?.(false);
      event.target.value = "";
      return;
    }

    const recommendedLimitMB = getRecommendedUploadLimitMB(file.name);

    if (
      recommendedLimitMB !== undefined &&
      file.size > recommendedLimitMB * 1024 * 1024
    ) {
      onFileNameChange("");
      setFileError(
        `Recommended maximum size for this file type is ${formatUploadLimit(
          recommendedLimitMB
        )}`
      );
      onFileStatusChange?.(false);
      event.target.value = "";
      return;
    }

    onFileNameChange(file.name);
    setFileError("");
    onFileStatusChange?.(true);
  };

  return (
    <div className="institutionField institutionUploadField institutionGovernmentIdField">
      <div className="institutionFieldLabel">Government ID Proof</div>

      <div className="institutionGovernmentIdPicker">
        <div className="institutionDocumentTypeWrap">
          <button
            type="button"
            className={`institutionDocumentTypeSelect ${
              !editing ? "institutionDocumentTypeSelectDisabled" : ""
            }`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={toggleDropdown}
          >
            <span>{documentType || "Document Type"}</span>
            <IconImage
              src={images.arrowDown}
              width={16}
              height={16}
              className={`institutionDocumentTypeArrow ${
                open ? "institutionDocumentTypeArrowOpen" : ""
              }`}
            />
          </button>
        </div>

        <label htmlFor={inputId} className="institutionFilePickerControl">
          <input
            id={inputId}
            className="institutionNativeFileInput"
            type="file"
            name="govt-id-proof"
            aria-label="Govt Id Proof"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            disabled={!editing}
            onChange={handleFileChange}
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

        <span className="institutionFileName">{fileName}</span>
      </div>

          {open && (
            <div
              className="institutionDocumentTypeMenu institutionGovernmentIdMenuExactWidth"
              role="listbox"
              aria-label="Government ID document type"
            >
              {documentTypes.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="institutionDocumentTypeOption"
                  role="option"
                  aria-selected={documentType === option}
                  onClick={() => {
                    onDocumentTypeChange(option);
                    setOpen(false);
                  }}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>
          )}

      {fileError && (
        <div className="institutionFileError" role="alert">
          {fileError}
        </div>
      )}
    </div>
  );
}

type ResearchInnovationRecord = {
  id: string;
  activityType: string;
  title: string;
  year: string;
  role: string;
  organizationAgency: string;
  link: string;
  additionalDetails: string;
};

const createResearchInnovationRecord = (
  id: string,
  firstRecord = false
): ResearchInnovationRecord => ({
  id,
  activityType: "",
  title: "",
  year: "",
  role: "",
  organizationAgency: "",
  link: "",
  additionalDetails: "",
});

export default function CoordinatorUniversityPage() {
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [showDraftSaved, setShowDraftSaved] = useState(true);
  const [draftSavedTime, setDraftSavedTime] = useState("02:26PM");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<SectionName | null>(null);
  const [confirmation, setConfirmation] = useState(false);

  const [profilePhotoCompleted, setProfilePhotoCompleted] = useState(false);
  const [registrationSectionCompleted, setRegistrationSectionCompleted] =
    useState(false);
  const [researchInnovationSectionCompleted, setResearchInnovationSectionCompleted] =
    useState(false);
  const [documentsSectionCompleted, setDocumentsSectionCompleted] =
    useState(false);

  const [documentFileStatus, setDocumentFileStatus] = useState({
    profilePhoto: false,
    govtIdProof: false,
    supportingDocuments: false,
  });

  /* Document file names follow Save / Cancel exactly like the other fields.
     Draft names are shown while editing. Saved names are shown after Save. */
  const [savedDocumentFileNames, setSavedDocumentFileNames] = useState({
    profilePhoto: "",
    govtIdProof: "",
    supportingDocuments: "",
  });

  const [documentFileNamesDraft, setDocumentFileNamesDraft] = useState({
    profilePhoto: "",
    govtIdProof: "",
    supportingDocuments: "",
  });

  /* Government ID type follows the same Save / Cancel draft flow. */
  const [savedGovernmentDocumentType, setSavedGovernmentDocumentType] =
    useState("");
  const [governmentDocumentTypeDraft, setGovernmentDocumentTypeDraft] =
    useState("");

  type SequenceSection =
    | "registration"
    | "researchInnovation"
    | "documents"
    | "confirmation";

  const [sequenceValidationPopup, setSequenceValidationPopup] = useState<{
    section: SequenceSection;
    message: string;
  } | null>(null);

  const showSequenceValidation = (
    section: SequenceSection,
    message: string
  ) => {
    setSequenceValidationPopup({ section, message });

    window.setTimeout(() => {
      setSequenceValidationPopup((current) =>
        current?.section === section && current.message === message
          ? null
          : current
      );
    }, 3000);
  };

  const [researchProofStatus, setResearchProofStatus] = useState<
    Record<string, boolean>
  >({});

  const isRegistrationEditing = editingSection === "registration";
  const isResearchInnovationEditing = editingSection === "researchInnovation";
  const isDocumentsEditing = editingSection === "documents";

  const [sectionPopup, setSectionPopup] = useState<{
    section: SectionName;
    type: "saved" | "discarded";
  } | null>(null);

  const [registrationValidationPopup, setRegistrationValidationPopup] =
    useState<string | null>(null);

  const showRegistrationValidationPopup = (message: string) => {
    setRegistrationValidationPopup(message);
    window.setTimeout(() => {
      setRegistrationValidationPopup((current) =>
        current === message ? null : current
      );
    }, 3000);
  };

  const isValidEmail = (value: string) =>
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(
      value.trim()
    );

  const isValidIndianPhone = (value: string) =>
    /^[6-9]\d{9}$/.test(value.replace(/\s+/g, ""));

  const validateRegistrationContactFields = () => {
    if (!isValidEmail(registrationDraft.officialEmail)) {
      showRegistrationValidationPopup(
        "Please Enter a Valid Official Email"
      );
      return false;
    }

    if (
      registrationDraft.alternateEmail.trim() &&
      !isValidEmail(registrationDraft.alternateEmail)
    ) {
      showRegistrationValidationPopup(
        "Please Enter a Valid Alternate Email"
      );
      return false;
    }

    if (!isValidIndianPhone(registrationDraft.mobileNumber)) {
      showRegistrationValidationPopup(
        "Please Enter a Valid Mobile Number"
      );
      return false;
    }

    if (
      registrationDraft.alternatePhone.trim() &&
      !isValidIndianPhone(registrationDraft.alternatePhone)
    ) {
      showRegistrationValidationPopup(
        "Please Enter a Valid Alternate Phone"
      );
      return false;
    }

    setRegistrationValidationPopup(null);
    return true;
  };

  const [registrationInfo, setRegistrationInfo] = useState({
    coordinatorId: "PRGEEQJQCBU006B",
    fullName: "Antony Thomas",
    dateOfBirth: "",
    gender: "",
    highestQualification: "",
    employeeCode: "eg.EMP-0042",
    officialEmail: "",
    mobileNumber: "",
    alternateEmail: "",
    alternatePhone: "",
    totalExperience: "",
    dateOfJoining: "17-05-2004",
    department: "",
    designation: "",
    assignedCourse: "",
    assignedBatch: "",
    academicYear: "",
    reportingAuthority: "",
    status: "eg. Active",
  });

  const [researchInnovationInfo, setResearchInnovationInfo] = useState<
    ResearchInnovationRecord[]
  >([createResearchInnovationRecord("activity-1", true)]);

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [researchInnovationDraft, setResearchInnovationDraft] =
    useState<ResearchInnovationRecord[]>(researchInnovationInfo);

  const editingSectionRef = useRef<SectionName | null>(editingSection);
  const registrationDraftRef = useRef(registrationDraft);
  const researchInnovationDraftRef = useRef(researchInnovationDraft);

  useEffect(() => {
    editingSectionRef.current = editingSection;
    registrationDraftRef.current = registrationDraft;
    researchInnovationDraftRef.current = researchInnovationDraft;
  }, [
    editingSection,
    registrationDraft,
    researchInnovationDraft,
  ]);

  const resetDrafts = (section: SectionName) => {
    if (section === "registration") {
      setRegistrationDraft(registrationInfo);
    }

    if (section === "researchInnovation") {
      setResearchInnovationDraft(researchInnovationInfo);
    }
  };

  const startSectionEdit = (section: SectionName) => {
    setSectionPopup(null);
    setRegistrationValidationPopup(null);
    setSequenceValidationPopup(null);

    /* Do not allow jumping between sections with unsaved edits. */
    if (editingSection && editingSection !== section) {
      showSequenceValidation(
        section,
        "Please Save or Cancel the current section before continuing."
      );
      return;
    }

    /* Required order:
       1. Profile Photo
       2. Registration
       3. Research and innovation
       4. Documents
       5. Confirmation
    */
    if (section === "registration" && !profilePhotoCompleted) {
      showSequenceValidation(
        "registration",
        "Please Upload the Profile Photo"
      );
      return;
    }

    if (
      section === "researchInnovation" &&
      !registrationSectionCompleted
    ) {
      showSequenceValidation(
        "researchInnovation",
        "Please Complete and Save Registration"
      );
      return;
    }

    if (
      section === "documents" &&
      !researchInnovationSectionCompleted
    ) {
      showSequenceValidation(
        "documents",
        "Please complete and Save Research and innovation"
      );
      return;
    }

    resetDrafts(section);

    if (section === "documents") {
      setGovernmentDocumentTypeDraft(savedGovernmentDocumentType);
      setDocumentFileNamesDraft(savedDocumentFileNames);
      setDocumentFileStatus({
        profilePhoto: Boolean(savedDocumentFileNames.profilePhoto),
        govtIdProof: Boolean(savedDocumentFileNames.govtIdProof),
        supportingDocuments: Boolean(savedDocumentFileNames.supportingDocuments),
      });
    }

    setEditingSection(section);
  };

  const saveSection = (section: SectionName) => {
    if (section === "registration") {
      if (!validateRegistrationContactFields()) return;

      setRegistrationInfo(registrationDraft);
      setRegistrationSectionCompleted(true);
    }

    if (section === "researchInnovation") {
      setResearchInnovationInfo(researchInnovationDraft);
      setResearchInnovationSectionCompleted(true);
    }

    if (section === "documents") {
      if (!governmentDocumentTypeDraft) {
        showSequenceValidation(
          "documents",
          "Please select a Government ID Document Type before saving."
        );
        return;
      }

      const allDocumentsUploaded =
        Boolean(documentFileNamesDraft.profilePhoto) &&
        Boolean(documentFileNamesDraft.govtIdProof) &&
        Boolean(documentFileNamesDraft.supportingDocuments);

      if (!allDocumentsUploaded) {
        showSequenceValidation(
          "documents",
          "Please upload all required Documents before saving."
        );
        return;
      }

      setSavedGovernmentDocumentType(governmentDocumentTypeDraft);
      setSavedDocumentFileNames(documentFileNamesDraft);
      setDocumentFileStatus({
        profilePhoto: true,
        govtIdProof: true,
        supportingDocuments: true,
      });
      setDocumentsSectionCompleted(true);
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
    setRegistrationValidationPopup(null);
    setSequenceValidationPopup(null);
    resetDrafts(section);

    if (section === "documents") {
      setGovernmentDocumentTypeDraft(savedGovernmentDocumentType);
      setDocumentFileNamesDraft(savedDocumentFileNames);
      setDocumentFileStatus({
        profilePhoto: Boolean(savedDocumentFileNames.profilePhoto),
        govtIdProof: Boolean(savedDocumentFileNames.govtIdProof),
        supportingDocuments: Boolean(savedDocumentFileNames.supportingDocuments),
      });
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
    if (editingSection === "registration") {
      setRegistrationInfo(registrationDraft);
      setRegistrationSectionCompleted(true);
    }

    if (editingSection === "researchInnovation") {
      setResearchInnovationInfo(researchInnovationDraft);
      setResearchInnovationSectionCompleted(true);
    }

    /* Documents completion is controlled only by the Documents Save button.
       This prevents the loader/checkmark from changing before the section
       has actually been saved. */

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

    const recommendedLimitMB = getRecommendedUploadLimitMB(file.name) ?? 2;

    if (file.size > recommendedLimitMB * 1024 * 1024) {
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

  useEffect(() => {
    let popupTimer: number | undefined;

    const autoSaveDraft = () => {
      // Draft values stay temporary while editing.
      // Only the section Save button commits them.
      // Cancel restores the last explicitly saved values.

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
      if (popupTimer) window.clearTimeout(popupTimer);
    };
  }, []);

  const confirmationCompleted = confirmation;

  const completionItems = [
    /* Keep the VISUAL order exactly as the existing design/image.
       Completion still happens in the required step-by-step sequence:
       Profile Photo -> Registration -> Research -> Documents -> Confirmation. */
    { label: "Profile Photo", completed: profilePhotoCompleted },
    {
      label: "Research and innovation",
      completed: researchInnovationSectionCompleted,
    },
    { label: "Confirmation", completed: confirmationCompleted },
    { label: "Registration", completed: registrationSectionCompleted },
    { label: "Documents", completed: documentsSectionCompleted },
  ];

  const completedItemCount = completionItems.filter(
    (item) => item.completed
  ).length;

  const completionPercentage = completedItemCount * 20;

const addResearchInnovationActivity = (afterIndex?: number) => {
    setResearchInnovationDraft((current) => {
      const newRecord = createResearchInnovationRecord(
        `activity-${Date.now()}-${current.length + 1}`
      );

      if (
        typeof afterIndex !== "number" ||
        afterIndex < 0 ||
        afterIndex >= current.length
      ) {
        return [...current, newRecord];
      }

      return [
        ...current.slice(0, afterIndex + 1),
        newRecord,
        ...current.slice(afterIndex + 1),
      ];
    });
  };

  const deleteResearchInnovationActivity = (index?: number) => {
    setResearchInnovationDraft((current) => {
      if (current.length <= 1) {
        return current;
      }

      const deleteIndex =
        typeof index === "number" &&
        index >= 0 &&
        index < current.length
          ? index
          : current.length - 1;

      const removedId = current[deleteIndex]?.id;

      if (removedId) {
        setResearchProofStatus((status) => {
          const next = { ...status };
          delete next[removedId];
          return next;
        });
      }

      return current.filter((_, itemIndex) => itemIndex !== deleteIndex);
    });
  };

  return (
    <main className="superAdminPage institutionAdminPage">
      <title>University Coordinator Profile | Neuro LXP</title>
      <div className="dashboardLayout">
        <Sidebar />

        <section className="mainContent">
          <Header />

          <div className="institutionScrollArea">
            <div className="pageContent institutionPageContent">
            <div className="institutionHeadingRow">
              <div>
                <h1>University Coordinator Profile</h1>
                <p>
                  Manage Your Identity, Access, Preferences, And Activity With
                  Ease.
                </p>
              </div>

              {showDraftSaved && (
                <div className="savedBadge" role="status" aria-live="polite">
                  <IconImage src={images.completed} width={16} height={16} />
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
                        <div className="institutionAvatarEmpty" aria-hidden="true" />
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
                  <div className="institutionRole">College Coordinator</div>
                  <div className="institutionActiveBadge">
                    <span className="institutionActiveDot" aria-hidden="true" />
                    <span>Active</span>
                  </div>
                </div>
              </div>

              <div className="institutionDivider" />

              <div className="institutionCompletion">
                <div className="institutionCompletionHeader">
                  <h3>Profile Completion</h3>
                  <span>{completionPercentage}% Completed</span>
                </div>

                <div className="institutionProgressTrack">
                  <div
                    className="institutionProgressBar"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="institutionCompletionSteps institutionCoordinatorSteps">
                  {completionItems.map(({ label, completed }) => (
                    <div
                      className={`institutionCompletionStep ${
                        completed ? "completed" : ""
                      }`}
                      key={label}
                    >
                      {completed ? (
                        <span
                          className="institutionCompletedCircle institutionProfileStepCheck"
                          aria-hidden="true"
                        >
                          <span className="institutionProfileStepCheckMark" />
                        </span>
                      ) : (
                        <span className="institutionEmptyCircle" aria-hidden="true" />
                      )}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Registration Data"
                iconSrc={images.registration}
                iconTone="purple"
                editing={isRegistrationEditing}
                validationMessage={
                  registrationValidationPopup ||
                  (sequenceValidationPopup?.section === "registration"
                    ? sequenceValidationPopup.message
                    : null)
                }
                popupType={
                  sectionPopup?.section === "registration"
                    ? sectionPopup.type
                    : null
                }
                onEdit={() => startSectionEdit("registration")}
                onSave={() => saveSection("registration")}
                onCancel={() => cancelSection("registration")}
              />

              {isRegistrationEditing ? (
                <div className="institutionGrid institutionRegistrationGrid">
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
                  <DateField
                    label="Date of Birth"
                    placeholder="dd/mm/yyyy"
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
                    placeholder="Select"
                    value={registrationDraft.gender}
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
                    placeholder="Select"
                    value={registrationDraft.highestQualification}
                    options={[
                      "PhD",
                      "M.Phil",
                      "Master's Degree",
                      "Bachelor's Degree",
                      "Diploma",
                      "PG Diploma",
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
                    placeholder="Enter official email"
                    type="email"
                    value={registrationDraft.officialEmail}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        officialEmail: value,
                      }))
                    }
                                      visualIcon="edit"
                  />
                  <EditField
                    label="Mobile Number"
                    placeholder="Enter mobile number"
                    type="tel"
                    value={registrationDraft.mobileNumber}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        mobileNumber: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                                      visualIcon="edit"
                  />
                  <EditField
                    label="Alternate Email"
                    placeholder="Enter alternate email"
                    type="email"
                    value={registrationDraft.alternateEmail}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternateEmail: value,
                      }))
                    }
                                      visualIcon="edit"
                  />

                  <EditField
                    label="Alternate Phone"
                    placeholder="Enter alternate phone number"
                    type="tel"
                    value={registrationDraft.alternatePhone}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternatePhone: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                                      visualIcon="edit"
                  />
                  <SelectField
                    label="Total Experience"
                    placeholder="Select"
                    value={registrationDraft.totalExperience}
                    options={["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16–20 years", "20+ years"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, totalExperience: value }))
                    }
                  />
                  <EditField
                    label="Date of Joining"
                    value={registrationDraft.dateOfJoining}
                    locked
                  />

                  <SelectField
                    label="Department"
                    placeholder="Select"
                    value={registrationDraft.department}
                    options={["Academic", "Training", "Administration", "IT", "HR", "Finance", "Research & Development", "Operations", "Placement", "Quality", "Other"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, department: value }))
                    }
                  />
                  <SelectField
                    label="Coordinator Role"
                    placeholder="Select"
                    value={registrationDraft.designation}
                    options={[
                      "Academic Coordinator",
                      "Program Coordinator",
                      "Training Coordinator",
                      "Placement Coordinator",
                      "Course Coordinator",
                      "Research Coordinator",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        designation: value,
                      }))
                    }
                  />
                  <MultiSelectField
                    label="Assigned Course"
                    placeholder="Select"
                    value={registrationDraft.assignedCourse}
                    options={["Course 1", "Course 2", "Course 3", "Course 4", "Course 5"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, assignedCourse: value }))
                    }
                  />

                  <MultiSelectField
                    label="Assigned Batch"
                    placeholder="Select"
                    value={registrationDraft.assignedBatch}
                    options={["Batch A", "Batch B", "Batch C", "Batch D", "Batch E"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, assignedBatch: value }))
                    }
                  />
                  <SelectField
                    label="Academic Year"
                    placeholder="Select"
                    value={registrationDraft.academicYear}
                    options={["2024–25", "2025–26", "2026–27", "2027–28", "2028–29"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, academicYear: value }))}
                  />
                  <SelectField
                    label="Reporting Authority"
                    placeholder="Select"
                    value={registrationDraft.reportingAuthority}
                    options={["Institute Admin", "Principal", "Director", "Program Head", "Department Head", "Platform Admin", "Other"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, reportingAuthority: value }))}
                  />

                  <EditField
                    label="Status"
                    value={registrationDraft.status}
                    locked
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionRegistrationGrid">
                  <DisplayField label="Coordinator ID" value={registrationInfo.coordinatorId} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField label="Date of Birth"
                    placeholder="dd/mm/yyyy" value={registrationInfo.dateOfBirth} />

                  <DisplayField label="Gender"
                    placeholder="Select" value={registrationInfo.gender} />
                  <DisplayField
                    label="Highest Qualification"
                    placeholder="Select"
                    value={registrationInfo.highestQualification}
                  />
                  <DisplayField label="Employee Code" value={registrationInfo.employeeCode} />

                  <DisplayField label="Official Email"
                    placeholder="Enter official email" value={registrationInfo.officialEmail} />
                  <DisplayField label="Mobile Number"
                    placeholder="Enter mobile number" value={registrationInfo.mobileNumber} />
                  <DisplayField label="Alternate Email"
                    placeholder="Enter alternate email" value={registrationInfo.alternateEmail} />

                  <DisplayField label="Alternate Phone"
                    placeholder="Enter alternate phone number" value={registrationInfo.alternatePhone} />
                  <DisplayField label="Total Experience"
                    placeholder="Select" value={registrationInfo.totalExperience} />
                  <DisplayField label="Date of Joining" value={registrationInfo.dateOfJoining} />

                  <DisplayField label="Department"
                    placeholder="Select" value={registrationInfo.department} />
                  <DisplayField label="Designation" value={registrationInfo.designation} placeholder="Select" />
                  <DisplayField label="Assigned Course"
                    placeholder="Select" value={registrationInfo.assignedCourse} />

                  <DisplayField
                    label="Assigned Batch"
                    placeholder="Select"
                    value={registrationInfo.assignedBatch}
                  />
                  <DisplayField label="Academic Year"
                    placeholder="Select" value={registrationInfo.academicYear} />
                  <DisplayField label="Reporting Authority"
                    placeholder="Select" value={registrationInfo.reportingAuthority} />

                  <DisplayField label="Status" value={registrationInfo.status} />
                </div>
              )}
            </section>

            <section className="institutionInformationCard institutionActivityCard institutionResearchInnovationCard">
              <ActivityHeader
                title="Research and innovation"
                iconSrc={images.researchInnovation}
                tone="orange"
                editing={isResearchInnovationEditing}
                popupType={
                  sectionPopup?.section === "researchInnovation"
                    ? sectionPopup.type
                    : null
                }
                validationMessage={
                  sequenceValidationPopup?.section === "researchInnovation"
                    ? sequenceValidationPopup.message
                    : null
                }
                onEdit={() => startSectionEdit("researchInnovation")}
                onAdd={() => addResearchInnovationActivity()}
                onDelete={() => deleteResearchInnovationActivity()}
              />

              {isResearchInnovationEditing ? (
                <div className="institutionResearchActivities">
                  {researchInnovationDraft.map((activity, index) => (
                    <div
                      className="institutionResearchActivityBlock"
                      key={activity.id}
                    >
                      {index > 0 && (
                        <div className="institutionResearchActivityTopRow">
                          <div className="institutionResearchActivityNumber">
                            Activity {index + 1}
                          </div>

                          <div className="institutionResearchItemActions">
                            <button
                              type="button"
                              className="institutionMiniAction institutionMiniAdd institutionResearchItemAction"
                              onClick={() => addResearchInnovationActivity(index)}
                            >
                              <IconImage
                                src={images.add}
                                width={16}
                                height={16}
                                className="institutionMiniActionIcon"
                              />
                              <span>Add</span>
                            </button>

                            <button
                              type="button"
                              className="institutionMiniAction institutionMiniDelete institutionResearchItemAction"
                              onClick={() => deleteResearchInnovationActivity(index)}
                            >
                              <IconImage
                                src={images.delete}
                                width={16}
                                height={16}
                                className="institutionMiniActionIcon"
                              />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="institutionResearchInnovationGrid">
                        <SelectField
                          label="Activity Type"
                          value={activity.activityType}
                          placeholder="Select"
                          options={[
                            "Publication",
                            "Research Project",
                            "Research Output",
                            "Innovation & Collaboration",
                          ]}
                          onChange={(value) =>
                            setResearchInnovationDraft((current) =>
                              current.map((item) =>
                                item.id === activity.id
                                  ? { ...item, activityType: value }
                                  : item
                              )
                            )
                          }
                        />

                        <EditField
                          label="Title"
                          value={activity.title}
                          placeholder="Enter activity title"
                          onChange={(value) =>
                            setResearchInnovationDraft((current) =>
                              current.map((item) =>
                                item.id === activity.id
                                  ? { ...item, title: value }
                                  : item
                              )
                            )
                          }
                                                  visualIcon="edit"
                        />

                        <SelectField
                          label="Year"
                          value={activity.year}
                          placeholder="Select"
                          options={["2026", "2025", "2024", "2023", "2022"]}
                          onChange={(value) =>
                            setResearchInnovationDraft((current) =>
                              current.map((item) =>
                                item.id === activity.id
                                  ? { ...item, year: value }
                                  : item
                              )
                            )
                          }
                        />

                        <SelectField
                          label="Role"
                          value={activity.role}
                          placeholder="Select"
                          options={["Principal Investigator", "Co-Principal Investigator", "Author", "Co-Author", "Researcher", "Project Coordinator", "Research Coordinator", "Consultant", "Mentor", "Contributor", "Other"]}
                          onChange={(value) =>
                            setResearchInnovationDraft((current) =>
                              current.map((item) => item.id === activity.id ? { ...item, role: value } : item)
                            )
                          }
                        />

                        <EditField
                          label="Organization / Agency"
                          value={activity.organizationAgency}
                          placeholder="Enter organization or agency"
                          onChange={(value) =>
                            setResearchInnovationDraft((current) =>
                              current.map((item) =>
                                item.id === activity.id
                                  ? { ...item, organizationAgency: value }
                                  : item
                              )
                            )
                          }
                                                  visualIcon="edit"
                        />

                        <EditField
                          label="Link"
                          value={activity.link}
                          placeholder="Enter activity link"
                          onChange={(value) =>
                            setResearchInnovationDraft((current) =>
                              current.map((item) =>
                                item.id === activity.id
                                  ? { ...item, link: value }
                                  : item
                              )
                            )
                          }
                                                  visualIcon="edit"
                        />

                        <div className="institutionField institutionResearchDetailsField">
                          <label
                            htmlFor={`institution-research-details-${activity.id}`}
                            className="institutionFieldLabel"
                          >
                            Additional Details (Maximum 250words)
                          </label>
                          <textarea
                            id={`institution-research-details-${activity.id}`}
                            className="institutionTextarea institutionResearchDetailsTextarea"
                            value={activity.additionalDetails}
                            placeholder="Enter additional details"
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              const currentValue = activity.additionalDetails;

                              const currentWords = currentValue.trim()
                                ? currentValue.trim().split(/\s+/)
                                : [];

                              const nextWords = nextValue.trim()
                                ? nextValue.trim().split(/\s+/)
                                : [];

                              const isDeleting =
                                nextValue.length < currentValue.length;

                              /*
                               * Accept normally until 250 words.
                               * Once 250 words are reached, do not accept
                               * another character, space, punctuation mark,
                               * or word. Deleting remains allowed.
                               */
                              const canAccept =
                                nextWords.length < 250 ||
                                (nextWords.length === 250 &&
                                  currentWords.length < 250) ||
                                isDeleting;

                              if (!canAccept) return;

                              setResearchInnovationDraft((current) =>
                                current.map((item) =>
                                  item.id === activity.id
                                    ? {
                                        ...item,
                                        additionalDetails: nextValue,
                                      }
                                    : item
                                )
                              );
                            }}
                          />
                        </div>

                        <UploadField
                          label="Proof "
                          editing
                          className="institutionResearchProofField"
                          onFileStatusChange={(hasFile) =>
                            setResearchProofStatus((current) => ({
                              ...current,
                              [activity.id]: hasFile,
                            }))
                          }
                        />

                        {index === researchInnovationDraft.length - 1 && (
                          <div className="institutionResearchBottomActions">
                            <button
                              type="button"
                              className="institutionActionButton institutionSaveButton institutionResearchSaveCancelButton"
                              onClick={() => saveSection("researchInnovation")}
                            >
                              <IconImage
                                src={images.save}
                                width={16}
                                height={16}
                              />
                              <span>Save</span>
                            </button>

                            <button
                              type="button"
                              className="institutionActionButton institutionCancelButton institutionResearchSaveCancelButton"
                              onClick={() => cancelSection("researchInnovation")}
                            >
                              <IconImage
                                src={images.cancel}
                                width={16}
                                height={16}
                              />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="institutionResearchActivities">
                  {researchInnovationInfo.map((activity, index) => (
                    <div
                      className="institutionResearchActivityBlock"
                      key={activity.id}
                    >
                      {researchInnovationInfo.length > 1 && (
                        <div className="institutionResearchActivityNumber">
                          Activity {index + 1}
                        </div>
                      )}

                      <div className="institutionResearchInnovationGrid institutionResearchInnovationReadOnly">
                        <DisplayField
                          label="Activity Type"
                          value={activity.activityType}
                          placeholder="Select"
                        />
                        <DisplayField
                          label="Title"
                          value={activity.title}
                          placeholder="Enter activity title"
                        />
                        <DisplayField
                          label="Year"
                          value={activity.year}
                          placeholder="Select"
                        />

                        <DisplayField
                          label="Role"
                          value={activity.role}
                          placeholder="Enter Role"
                        />
                        <DisplayField
                          label="Organization / Agency"
                          value={activity.organizationAgency}
                          placeholder="Enter organization or agency"
                        />
                        <DisplayField
                          label="Link"
                          value={activity.link}
                          placeholder="Enter activity link"
                        />

                        <div className="institutionField institutionResearchDetailsField">
                          <div className="institutionFieldLabel">
                            Additional Details (Maximum 250words)
                          </div>
                          <div className="institutionFieldValue">
                            {activity.additionalDetails ||
                              "Enter additional details"}
                          </div>
                        </div>

                        <UploadField
                          label="Proof"
                          editing={false}
                          className="institutionResearchProofField"
                          onFileStatusChange={(hasFile) =>
                            setResearchProofStatus((current) => ({
                              ...current,
                              [activity.id]: hasFile,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="institutionInformationCard institutionDocumentsCard">
              <SectionHeader
                title="Documents"
                iconSrc={images.documents}
                iconTone="pink"
                editing={isDocumentsEditing}
                popupType={
                  sectionPopup?.section === "documents"
                    ? sectionPopup.type
                    : null
                }
                validationMessage={
                  sequenceValidationPopup?.section === "documents"
                    ? sequenceValidationPopup.message
                    : null
                }
                onEdit={() => startSectionEdit("documents")}
                onSave={() => saveSection("documents")}
                onCancel={() => cancelSection("documents")}
              />

              <div className="institutionGrid institutionDocumentsGrid">
                <UploadField
                  label="Profile Photo"
                  editing={isDocumentsEditing}
                  fileName={
                    isDocumentsEditing
                      ? documentFileNamesDraft.profilePhoto
                      : savedDocumentFileNames.profilePhoto
                  }
                  onFileNameChange={(fileName) =>
                    setDocumentFileNamesDraft((current) => ({
                      ...current,
                      profilePhoto: fileName,
                    }))
                  }
                  onFileStatusChange={(hasFile) =>
                    setDocumentFileStatus((current) => ({
                      ...current,
                      profilePhoto: hasFile,
                    }))
                  }
                />
                <GovernmentIdUploadField
                  editing={isDocumentsEditing}
                  documentType={
                    isDocumentsEditing
                      ? governmentDocumentTypeDraft
                      : savedGovernmentDocumentType
                  }
                  onDocumentTypeChange={setGovernmentDocumentTypeDraft}
                  fileName={
                    isDocumentsEditing
                      ? documentFileNamesDraft.govtIdProof
                      : savedDocumentFileNames.govtIdProof
                  }
                  onFileNameChange={(fileName) =>
                    setDocumentFileNamesDraft((current) => ({
                      ...current,
                      govtIdProof: fileName,
                    }))
                  }
                  onFileStatusChange={(hasFile) =>
                    setDocumentFileStatus((current) => ({
                      ...current,
                      govtIdProof: hasFile,
                    }))
                  }
                />
                <UploadField
                  label="Supporting Documents"
                  editing={isDocumentsEditing}
                  fileName={
                    isDocumentsEditing
                      ? documentFileNamesDraft.supportingDocuments
                      : savedDocumentFileNames.supportingDocuments
                  }
                  onFileNameChange={(fileName) =>
                    setDocumentFileNamesDraft((current) => ({
                      ...current,
                      supportingDocuments: fileName,
                    }))
                  }
                  onFileStatusChange={(hasFile) =>
                    setDocumentFileStatus((current) => ({
                      ...current,
                      supportingDocuments: hasFile,
                    }))
                  }
                />
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
                {sequenceValidationPopup?.section === "confirmation" && (
                  <div
                    className="institutionInlinePopup institutionInlinePopupDiscarded"
                    role="alert"
                    aria-live="assertive"
                  >
                    <IconImage
                      src={images.sad}
                      width={18}
                      height={18}
                      className="institutionInlinePopupIcon"
                    />
                    <span>{sequenceValidationPopup.message}</span>
                  </div>
                )}

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
                    aria-disabled={!documentsSectionCompleted}
                    onChange={(event) => {
                      if (!documentsSectionCompleted) {
                        showSequenceValidation(
                          "confirmation",
                          "Please complete and Save Documents first."
                        );
                        return;
                      }

                      setSequenceValidationPopup(null);
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
