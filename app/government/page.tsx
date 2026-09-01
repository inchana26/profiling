"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./government.css";
import Sidebar from "../components/sidebar/sidebar";
import Header from "../components/header/header";

const images = {
  profile: "/assets/institutionimages/profile.png",

  camera: "/assets/governmenticons/camera.svg",
  edit: "/assets/governmenticons/edit.svg",
  editBig: "/assets/governmenticons/editbig.svg",
  lock: "/assets/governmenticons/lock.svg",
  save: "/assets/governmenticons/tick.svg",
  cancel: "/assets/governmenticons/cancel.svg",
  arrowDown: "/assets/governmenticons/arrow-down.svg",
  completed: "/assets/governmenticons/checkmark.svg",
  calendar: "/assets/governmenticons/calendar.svg",
  upload: "/assets/governmenticons/upload.svg",
  clap: "/assets/governmenticons/clap.svg",
  sad: "/assets/governmenticons/sad.svg",

  basicInformation: "/assets/governmenticons/user.svg",
  basicSection: "/assets/governmenticons/graduation-cap.svg",

  registration: "/assets/governmenticons/file-edit.svg",
  identity: "/assets/governmenticons/users.svg",
  professional: "/assets/governmenticons/graduation-cap.svg",
  documents: "/assets/governmenticons/file.svg",
  confirmation: "/assets/governmenticons/checkmark-circlewhite.svg",

  publication: "/assets/governmenticons/publication.svg",
  researchProjects: "/assets/governmenticons/research-projects.svg",
  researchOutput: "/assets/governmenticons/research-output.svg",
  collaboration: "/assets/governmenticons/collaboration.svg",
  researchInnovation: "/assets/governmenticons/flask.svg",

  add: "/assets/governmenticons/add.svg",
  delete: "/assets/governmenticons/delete.svg",
};

type SectionName = "registration" | "researchInnovation" | "documents";

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
};

function EditField({
  label,
  value,
  locked = false,
  type = "text",
  placeholder,
  onChange,
  className = "",
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

      <span
        className={`institutionFieldAction ${locked ? "institutionFieldLocked" : "institutionFieldPencil"
          }`}
        aria-hidden="true"
      >
        <IconImage
          src={locked ? images.lock : images.edit}
          width={18}
          height={18}
        />
      </span>
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
          onClick={() => setOpen((current) => !current)}
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
            className="institutionCustomSelectList"
            role="listbox"
            aria-labelledby={labelId}
          >
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

            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`institutionCustomSelectOption ${
                  value === option ? "institutionCustomSelectOptionActive" : ""
                }`}
                role="option"
                aria-selected={value === option}
                onClick={() => handleSelect(option)}
              >
                {option}
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
};

type CalendarView = "days" | "months" | "years";

const CALENDAR_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function DateField({ label, value, onChange }: DateFieldProps) {
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

    document.addEventListener("mousedown", closeCalendar);
    return () => document.removeEventListener("mousedown", closeCalendar);
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
          value={value}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        />
      </div>

      <button
        type="button"
        className="institutionFieldAction institutionCalendarAction"
        aria-label={`Open ${label} calendar`}
        onClick={() => setOpen((current) => !current)}
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
  onFileStatusChange?: (hasFile: boolean) => void;
};

function UploadField({
  label,
  editing,
  className = "",
  maxSizeMB,
  accept = ".pdf,image/*",
  onFileStatusChange,
}: UploadFieldProps) {
  const inputId = useId();
  const [fileName, setFileName] = useState("No File Chosen");
  const [fileError, setFileError] = useState("");

  const effectiveMaxSizeMB =
    maxSizeMB ?? (label.toLowerCase().includes("max 50 mb") ? 50 : undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName("No File Chosen");
      setFileError("");
      onFileStatusChange?.(false);
      return;
    }

    if (
      effectiveMaxSizeMB &&
      file.size > effectiveMaxSizeMB * 1024 * 1024
    ) {
      setFileName("No File Chosen");
      setFileError(`Maximum file size is ${effectiveMaxSizeMB} MB`);
      onFileStatusChange?.(false);
      event.target.value = "";
      return;
    }

    setFileName(file.name);
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


type GovernmentSectionName =
  | "registration"
  | "professional"
  | "skills"
  | "documents";

export default function GovernmentCoordinatorProfilePage() {
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [showDraftSaved, setShowDraftSaved] = useState(true);
  const [draftSavedTime, setDraftSavedTime] = useState("02:26PM");
  const [profileImage, setProfileImage] = useState<string | null>(images.profile);
  const [editingSection, setEditingSection] =
    useState<GovernmentSectionName | null>(null);

  const [confirmation, setConfirmation] = useState(false);

  const [sectionPopup, setSectionPopup] = useState<{
    section: GovernmentSectionName;
    type: "saved" | "discarded";
  } | null>(null);

  const [registrationInfo, setRegistrationInfo] = useState({
    coordinatorId: "PRGEEQJQCBU006B",
    fullName: "Antony Thomas",
    dateOfBirth: "1982-02-17",
    gender: "Male",
    highestQualification: "",
    employeeCode: "eg.EMP-0042",
    officialEmail: "coordinator@collge.edu",
    mobileNumber: "9521221322",
    alternateEmail: "alter@srki.com",
    alternatePhone: "7418236574",
    totalExperience: "Enter Leadership Experience",
    dateOfJoining: "17-05-2004",
    assignedPrograms: "",
    assignedRegion: "eg.enter name",
    designation: "Coordinator",
    tenantId: "LXP-COL-001",
    reportingAuthority: "eg. Institute Admin",
    onboardingCompleted: "Yes",
    status: "eg. Active",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    department: "Ministry of Skill Development",
    division: "Training & Development",
    grade: "Grade B",
    domain: "Skill Development",
    expertise: "Administration",
    programs: "Skill Development Scheme",
    responsibilities: "Reporting",
    coordinationExperience: "6 Years",
    stakeholders: "Government",
  });

  const [skillsInfo, setSkillsInfo] = useState({
    coreSkills: "Planning",
    digitalSkills: "MS Office",
    leadershipSkills: "Decision Making",
    proficiency: "Intermediate",
    trainingAttended: "Leadership",
    developmentAreas: "Data Analytics",
    careerGoal: "Senior Coordinator",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [professionalDraft, setProfessionalDraft] = useState(professionalInfo);
  const [skillsDraft, setSkillsDraft] = useState(skillsInfo);

  const initialRegistrationRef = useRef(registrationInfo);
  const initialProfessionalRef = useRef(professionalInfo);
  const initialSkillsRef = useRef(skillsInfo);

  const [documentFileStatus, setDocumentFileStatus] = useState({
    profilePhoto: false,
    govtIdProof: false,
    supportingDocuments: false,
  });

  const [profilePhotoCompleted, setProfilePhotoCompleted] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [professionalCompleted, setProfessionalCompleted] = useState(false);
  const [skillsCompleted, setSkillsCompleted] = useState(false);
  const [documentsCompleted, setDocumentsCompleted] = useState(false);

  const resetDraft = (section: GovernmentSectionName) => {
    if (section === "registration") setRegistrationDraft(registrationInfo);
    if (section === "professional") setProfessionalDraft(professionalInfo);
    if (section === "skills") setSkillsDraft(skillsInfo);
  };

  const startSectionEdit = (section: GovernmentSectionName) => {
    setSectionPopup(null);
    resetDraft(section);
    setEditingSection(section);
  };

  const showPopup = (
    section: GovernmentSectionName,
    type: "saved" | "discarded"
  ) => {
    setSectionPopup({ section, type });

    window.setTimeout(() => {
      setSectionPopup((current) =>
        current?.section === section && current.type === type ? null : current
      );
    }, 2500);
  };

  const saveSection = (section: GovernmentSectionName) => {
    if (section === "registration") {
      setRegistrationInfo(registrationDraft);
      setRegistrationCompleted(true);
    }

    if (section === "professional") {
      setProfessionalInfo(professionalDraft);
      setProfessionalCompleted(true);
    }

    if (section === "skills") {
      setSkillsInfo(skillsDraft);
      setSkillsCompleted(true);
    }

    if (section === "documents") {
      const hasAnyDocument =
        documentFileStatus.profilePhoto ||
        documentFileStatus.govtIdProof ||
        documentFileStatus.supportingDocuments;

      if (hasAnyDocument) {
        setDocumentsCompleted(true);
      }
    }

    setEditingSection(null);
    showPopup(section, "saved");
  };

  const cancelSection = (section: GovernmentSectionName) => {
    resetDraft(section);
    setEditingSection(null);
    showPopup(section, "discarded");
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      const formattedTime = new Date()
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      setDraftSavedTime(formattedTime);
      setShowDraftSaved(false);

      window.requestAnimationFrame(() => setShowDraftSaved(true));
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const changed =
      JSON.stringify(registrationDraft) !==
      JSON.stringify(initialRegistrationRef.current);

    if (changed) {
      setRegistrationCompleted(true);
    }
  }, [registrationDraft]);

  useEffect(() => {
    const changed =
      JSON.stringify(professionalDraft) !==
      JSON.stringify(initialProfessionalRef.current);

    if (changed) {
      setProfessionalCompleted(true);
    }
  }, [professionalDraft]);

  useEffect(() => {
    const changed =
      JSON.stringify(skillsDraft) !==
      JSON.stringify(initialSkillsRef.current);

    if (changed) {
      setSkillsCompleted(true);
    }
  }, [skillsDraft]);

  useEffect(() => {
    const hasAnyDocument =
      documentFileStatus.profilePhoto ||
      documentFileStatus.govtIdProof ||
      documentFileStatus.supportingDocuments;

    if (hasAnyDocument) {
      setDocumentsCompleted(true);
    }
  }, [documentFileStatus]);

  const completionItems = [
    { label: "Profile Photo", completed: profilePhotoCompleted },
    { label: "Professional Profile", completed: professionalCompleted },
    { label: "Documents", completed: documentsCompleted },
    { label: "Registration Data", completed: registrationCompleted },
    { label: "Skill and Development", completed: skillsCompleted },
    { label: "Confirmation", completed: confirmation },
  ];

  const completedItemCount = completionItems.filter(
    (item) => item.completed
  ).length;

  const completionPercentage =
    completedItemCount === 0
      ? 0
      : Math.round((completedItemCount / completionItems.length) * 100);

  const saveProfile = () => {
    if (editingSection) {
      saveSection(editingSection);
    }

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

  return (
    <main className="governmentCoordinatorPage">
      <title>Government Coordinator Profile | Neuro LXP</title>

      <div className="dashboardLayout">
        <Sidebar />

        <section className="mainContent">
          <Header />

          <div className="governmentScrollArea">
            <div className="pageContent governmentPageContent">
              <div className="governmentHeadingRow">
                <div>
                  <h1>Government Coordinator Profile</h1>
                  <p>
                    Manage Your Identity, Access, Preferences, And Activity With Ease.
                  </p>
                </div>

                {showDraftSaved && (
                  <div className="savedBadge" role="status" aria-live="polite">
                    <IconImage src={images.completed} width={16} height={16} />
                    <span>Draft Saved at {draftSavedTime}</span>
                  </div>
                )}
              </div>

              <section className="governmentOverviewCard">
                <div className="governmentIdentity">
                  <div className="governmentAvatarWrap">
                    <div className="governmentAvatar">
                      <div className="governmentAvatarInner">
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt="Antony Thomas"
                            fill
                            sizes="88px"
                            className="governmentAvatarImage"
                            unoptimized={profileImage.startsWith("data:")}
                          />
                        ) : (
                          <div className="governmentAvatarEmpty" />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="governmentCameraButton"
                      aria-label="Change profile image"
                      onClick={() => profileImageInputRef.current?.click()}
                    >
                      <IconImage src={images.camera} width={22} height={22} />
                    </button>

                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/*"
                      className="governmentProfileImageInput"
                      onChange={handleProfileImageSelect}
                    />
                  </div>

                  <div className="governmentIdentityText">
                    <h2>Antony Thomas</h2>
                    <div className="governmentRole">Government Coordinator</div>

                    <div className="governmentActiveBadge">
                      <span className="governmentActiveDot" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>

                <div className="governmentDivider" />

                <div className="governmentCompletion">
                  <div className="governmentCompletionHeader">
                    <h3>Profile Completion</h3>
                    <span>{completionPercentage}% Completed</span>
                  </div>

                  <div className="governmentProgressTrack">
                    <div
                      className="governmentProgressBar"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>

                  <div className="governmentCompletionSteps">
                    {completionItems.map(({ label, completed }) => (
                      <div className="governmentCompletionStep" key={label}>
                        {completed ? (
                          <span className="governmentCompletedCircle">✓</span>
                        ) : (
                          <span className="governmentEmptyCircle" />
                        )}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="governmentInformationCard">
                <SectionHeader
                  title="Registration Data"
                  iconSrc={images.registration}
                  iconTone="purple"
                  editing={editingSection === "registration"}
                  popupType={
                    sectionPopup?.section === "registration"
                      ? sectionPopup.type
                      : null
                  }
                  onEdit={() => startSectionEdit("registration")}
                  onSave={() => saveSection("registration")}
                  onCancel={() => cancelSection("registration")}
                />

                <div className="governmentGrid">
                  {editingSection === "registration" ? (
                    <>
                      <EditField label="Coordinator ID" value={registrationDraft.coordinatorId} locked />
                      <EditField
                        label="Full Name"
                        value={registrationDraft.fullName}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, fullName: value }))
                        }
                      />
                      <DateField
                        label="Date of Birth"
                        value={registrationDraft.dateOfBirth}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, dateOfBirth: value }))
                        }
                      />

                      <SelectField
                        label="Gender"
                        value={registrationDraft.gender}
                        options={["Male", "Female", "Other"]}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, gender: value }))
                        }
                      />
                      <SelectField
                        label="Highest Qualification"
                        value={registrationDraft.highestQualification}
                        options={["Diploma", "Bachelor's", "Master's", "Doctorate"]}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({
                            ...current,
                            highestQualification: value,
                          }))
                        }
                      />
                      <EditField label="Employee Code" value={registrationDraft.employeeCode} locked />

                      <EditField
                        label="Official Email"
                        type="email"
                        value={registrationDraft.officialEmail}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, officialEmail: value }))
                        }
                      />
                      <EditField
                        label="Mobile Number"
                        type="tel"
                        value={registrationDraft.mobileNumber}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, mobileNumber: value }))
                        }
                      />
                      <EditField
                        label="Alternate Email"
                        type="email"
                        value={registrationDraft.alternateEmail}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, alternateEmail: value }))
                        }
                      />

                      <EditField
                        label="Alternate Phone"
                        type="tel"
                        value={registrationDraft.alternatePhone}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, alternatePhone: value }))
                        }
                      />
                      <EditField
                        label="Total Experience"
                        value={registrationDraft.totalExperience}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, totalExperience: value }))
                        }
                      />
                      <EditField label="Date of Joining" value={registrationDraft.dateOfJoining} locked />

                      <SelectField
                        label="Assigned Programs"
                        value={registrationDraft.assignedPrograms}
                        options={[
                          "Skill Development Scheme",
                          "Employment Program",
                          "Training Program",
                        ]}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({
                            ...current,
                            assignedPrograms: value,
                          }))
                        }
                      />
                      <EditField
                        label="Assigned Region"
                        value={registrationDraft.assignedRegion}
                        onChange={(value) =>
                          setRegistrationDraft((current) => ({ ...current, assignedRegion: value }))
                        }
                      />
                      <EditField label="Designation" value={registrationDraft.designation} locked />

                      <EditField label="Tenant ID" value={registrationDraft.tenantId} locked />
                      <EditField label="Reporting Authority" value={registrationDraft.reportingAuthority} locked />
                      <EditField
                        label="Onboarding Completed"
                        value={registrationDraft.onboardingCompleted}
                        locked
                      />

                      <EditField label="Status" value={registrationDraft.status} locked />
                    </>
                  ) : (
                    <>
                      <DisplayField label="Coordinator ID" value={registrationInfo.coordinatorId} />
                      <DisplayField label="Full Name" value={registrationInfo.fullName} />
                      <DisplayField label="Date of Birth" value={registrationInfo.dateOfBirth} />

                      <DisplayField label="Gender" value={registrationInfo.gender} />
                      <DisplayField
                        label="Highest Qualification"
                        value={registrationInfo.highestQualification}
                        placeholder="Select"
                      />
                      <DisplayField label="Employee Code" value={registrationInfo.employeeCode} />

                      <DisplayField label="Official Email" value={registrationInfo.officialEmail} />
                      <DisplayField label="Mobile Number" value={registrationInfo.mobileNumber} />
                      <DisplayField label="Alternate Email" value={registrationInfo.alternateEmail} />

                      <DisplayField label="Alternate Phone" value={registrationInfo.alternatePhone} />
                      <DisplayField label="Total Experience" value={registrationInfo.totalExperience} />
                      <DisplayField label="Date of Joining" value={registrationInfo.dateOfJoining} />

                      <DisplayField
                        label="Assigned Programs"
                        value={registrationInfo.assignedPrograms}
                        placeholder="Select"
                      />
                      <DisplayField label="Assigned Region" value={registrationInfo.assignedRegion} />
                      <DisplayField label="Designation" value={registrationInfo.designation} />

                      <DisplayField label="Tenant ID" value={registrationInfo.tenantId} />
                      <DisplayField label="Reporting Authority" value={registrationInfo.reportingAuthority} />
                      <DisplayField
                        label="Onboarding Completed"
                        value={registrationInfo.onboardingCompleted}
                      />

                      <DisplayField label="Status" value={registrationInfo.status} />
                    </>
                  )}
                </div>
              </section>

              <section className="governmentInformationCard">
                <SectionHeader
                  title="Professional Profile"
                  iconSrc={images.professional}
                  iconTone="purple"
                  editing={editingSection === "professional"}
                  popupType={
                    sectionPopup?.section === "professional"
                      ? sectionPopup.type
                      : null
                  }
                  onEdit={() => startSectionEdit("professional")}
                  onSave={() => saveSection("professional")}
                  onCancel={() => cancelSection("professional")}
                />

                <div className="governmentGrid">
                  {editingSection === "professional" ? (
                    <>
                      <EditField
                        label="Department"
                        value={professionalDraft.department}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, department: value }))
                        }
                      />
                      <EditField
                        label="Division"
                        value={professionalDraft.division}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, division: value }))
                        }
                      />
                      <EditField
                        label="Grade"
                        value={professionalDraft.grade}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, grade: value }))
                        }
                      />

                      <EditField
                        label="Domain"
                        value={professionalDraft.domain}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, domain: value }))
                        }
                      />
                      <EditField
                        label="Expertise"
                        value={professionalDraft.expertise}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, expertise: value }))
                        }
                      />
                      <EditField
                        label="Programs"
                        value={professionalDraft.programs}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, programs: value }))
                        }
                      />

                      <EditField
                        label="Responsibilities"
                        value={professionalDraft.responsibilities}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, responsibilities: value }))
                        }
                      />
                      <EditField
                        label="Coordination Experience"
                        value={professionalDraft.coordinationExperience}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({
                            ...current,
                            coordinationExperience: value,
                          }))
                        }
                      />
                      <EditField
                        label="Stakeholders"
                        value={professionalDraft.stakeholders}
                        onChange={(value) =>
                          setProfessionalDraft((current) => ({ ...current, stakeholders: value }))
                        }
                      />
                    </>
                  ) : (
                    <>
                      <DisplayField label="Department" value={professionalInfo.department} />
                      <DisplayField label="Division" value={professionalInfo.division} />
                      <DisplayField label="Grade" value={professionalInfo.grade} />

                      <DisplayField label="Domain" value={professionalInfo.domain} />
                      <DisplayField label="Expertise" value={professionalInfo.expertise} />
                      <DisplayField label="Programs" value={professionalInfo.programs} />

                      <DisplayField
                        label="Responsibilities"
                        value={professionalInfo.responsibilities}
                      />
                      <DisplayField
                        label="Coordination Experience"
                        value={professionalInfo.coordinationExperience}
                      />
                      <DisplayField label="Stakeholders" value={professionalInfo.stakeholders} />
                    </>
                  )}
                </div>
              </section>

              <section className="governmentInformationCard">
                <SectionHeader
                  title="Skills & Development"
                  iconSrc={images.basicInformation}
                  iconTone="purple"
                  editing={editingSection === "skills"}
                  popupType={
                    sectionPopup?.section === "skills"
                      ? sectionPopup.type
                      : null
                  }
                  onEdit={() => startSectionEdit("skills")}
                  onSave={() => saveSection("skills")}
                  onCancel={() => cancelSection("skills")}
                />

                <div className="governmentGrid">
                  {editingSection === "skills" ? (
                    <>
                      <EditField
                        label="Core Skills"
                        value={skillsDraft.coreSkills}
                        onChange={(value) =>
                          setSkillsDraft((current) => ({ ...current, coreSkills: value }))
                        }
                      />
                      <EditField
                        label="Digital Skills"
                        value={skillsDraft.digitalSkills}
                        onChange={(value) =>
                          setSkillsDraft((current) => ({ ...current, digitalSkills: value }))
                        }
                      />
                      <EditField
                        label="Leadership Skills"
                        value={skillsDraft.leadershipSkills}
                        onChange={(value) =>
                          setSkillsDraft((current) => ({ ...current, leadershipSkills: value }))
                        }
                      />

                      <EditField
                        label="Proficiency"
                        value={skillsDraft.proficiency}
                        onChange={(value) =>
                          setSkillsDraft((current) => ({ ...current, proficiency: value }))
                        }
                      />
                      <EditField
                        label="Training Attended"
                        value={skillsDraft.trainingAttended}
                        onChange={(value) =>
                          setSkillsDraft((current) => ({ ...current, trainingAttended: value }))
                        }
                      />
                      <EditField
                        label="Development Areas"
                        value={skillsDraft.developmentAreas}
                        onChange={(value) =>
                          setSkillsDraft((current) => ({ ...current, developmentAreas: value }))
                        }
                      />

                      <EditField
                        label="Career Goal"
                        value={skillsDraft.careerGoal}
                        onChange={(value) =>
                          setSkillsDraft((current) => ({ ...current, careerGoal: value }))
                        }
                      />
                    </>
                  ) : (
                    <>
                      <DisplayField label="Core Skills" value={skillsInfo.coreSkills} />
                      <DisplayField label="Digital Skills" value={skillsInfo.digitalSkills} />
                      <DisplayField label="Leadership Skills" value={skillsInfo.leadershipSkills} />

                      <DisplayField label="Proficiency" value={skillsInfo.proficiency} />
                      <DisplayField label="Training Attended" value={skillsInfo.trainingAttended} />
                      <DisplayField label="Development Areas" value={skillsInfo.developmentAreas} />

                      <DisplayField label="Career Goal" value={skillsInfo.careerGoal} />
                    </>
                  )}
                </div>
              </section>

              <section className="governmentInformationCard governmentDocumentsCard">
                <SectionHeader
                  title="Documents"
                  iconSrc={images.documents}
                  iconTone="pink"
                  editing={editingSection === "documents"}
                  popupType={
                    sectionPopup?.section === "documents"
                      ? sectionPopup.type
                      : null
                  }
                  onEdit={() => startSectionEdit("documents")}
                  onSave={() => saveSection("documents")}
                  onCancel={() => cancelSection("documents")}
                />

                <div className="governmentGrid">
                  <UploadField
                    label="Profile Photo"
                    editing={editingSection === "documents"}
                    onFileStatusChange={(hasFile) =>
                      setDocumentFileStatus((current) => ({
                        ...current,
                        profilePhoto: hasFile,
                      }))
                    }
                  />
                  <UploadField
                    label="Govt Id Proof"
                    editing={editingSection === "documents"}
                    onFileStatusChange={(hasFile) =>
                      setDocumentFileStatus((current) => ({
                        ...current,
                        govtIdProof: hasFile,
                      }))
                    }
                  />
                  <UploadField
                    label="Supporting Documents"
                    editing={editingSection === "documents"}
                    onFileStatusChange={(hasFile) =>
                      setDocumentFileStatus((current) => ({
                        ...current,
                        supportingDocuments: hasFile,
                      }))
                    }
                  />
                </div>
              </section>

              <section className="governmentInformationCard governmentConfirmationCard">
                <div className="governmentInformationTitle governmentConfirmationTitle">
                  <span className="governmentSectionIcon governmentPurpleIcon">
                    <IconImage
                      src={images.confirmation}
                      width={15}
                      height={15}
                      className="governmentWhiteIcon"
                    />
                  </span>
                  <h2>Confirmation</h2>
                </div>

                <div className="governmentConfirmationInner">
                  <div className="governmentFieldLabel">
                    Self Declaration Confirmation
                  </div>

                  <label
                    htmlFor="government-confirmation"
                    className="governmentCheckRow"
                  >
                    <input
                      id="government-confirmation"
                      type="checkbox"
                      checked={confirmation}
                      onChange={(event) => setConfirmation(event.target.checked)}
                    />
                    <span>I confirm That the Entered Data is Accurate</span>
                  </label>
                </div>
              </section>

              <div className="governmentBottomActions">
                <button
                  type="button"
                  className="governmentBottomButton governmentReviewButton"
                >
                  Review Profile
                </button>

                <button
                  type="button"
                  className="governmentBottomButton governmentFinalSaveButton"
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
