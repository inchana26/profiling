"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./corporate.css";
import Sidebar from "../components/sidebar/sidebar";
import Header from "../components/header/header";

const images = {
  profile: "/assets/institutionimages/profile.png",
  camera: "/assets/corporateicons/camera.svg",
  editBig: "/assets/corporateicons/editbig.svg",
  edit: "/assets/corporateicons/edit.svg",
  lock: "/assets/corporateicons/lock.svg",
  save: "/assets/corporateicons/tick.svg",
  cancel: "/assets/corporateicons/cancel.svg",
  savePopup: "/assets/corporateicons/clap.svg",
  cancelPopup: "/assets/corporateicons/sad.svg",
  arrowDown: "/assets/corporateicons/arrow-down.svg",
  completed: "/assets/corporateicons/checkmark.svg",
  calendar: "/assets/corporateicons/calendar.svg",
  upload: "/assets/corporateicons/upload.svg",

  // Replace these src values with your exact corporate icons if required.
  registration: "/assets/corporateicons/file-edit.svg",
  professional: "/assets/corporateicons/graduation-cap.svg",
  skills: "/assets/corporateicons/checkmark-circlewhite.svg",
  documents: "/assets/corporateicons/file.svg",
  confirmation: "/assets/corporateicons/checkmark-circlewhite.svg",
};

type SectionName = "registration" | "professional" | "skills" | "documents";
type PopupType = "saved" | "discarded";

function Icon({
  src,
  width = 18,
  height = 18,
  className = "",
}: {
  src: string;
  width?: number;
  height?: number;
  className?: string;
}) {
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="institutionField">
      <div className="institutionFieldLabel">{label}</div>
      <div className={`institutionFieldValue ${!value ? "institutionPlaceholder" : ""}`}>
        {value || "Select"}
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
  actionIcon,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  locked?: boolean;
  type?: string;
  actionIcon?: string;
}) {
  const id = useId();
  return (
    <div className="institutionField institutionEditableField">
      <div className="institutionFieldText">
        <label className="institutionFieldLabel" htmlFor={id}>{label}</label>
        {locked ? (
          <div id={id} className="institutionFieldValue">{value}</div>
        ) : (
          <input
            id={id}
            name={id}
            className="institutionFieldInput"
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )}
      </div>
      <span className="institutionFieldAction" aria-hidden="true">
        <Icon src={locked ? images.lock : actionIcon ?? images.edit} />
      </span>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);

  return (
    <div className="institutionField institutionEditableField institutionSelectField">
      <div className="institutionFieldText">
        <div className="institutionFieldLabel" id={`${id}-label`}>
          {label}
        </div>

        <div className="institutionSelectWrap">
          <button
            type="button"
            className="institutionCustomSelectTrigger"
            aria-labelledby={`${id}-label`}
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((current) => !current)}
          >
            <span>{value || "Select"}</span>
            <Icon
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
              id={listId}
              className="institutionCustomSelectList"
              role="listbox"
              aria-labelledby={`${id}-label`}
            >
              {["", ...options].map((option) => {
                const optionValue = option;
                const optionLabel = option || "Select";
                const active = value === optionValue;

                return (
                  <button
                    type="button"
                    key={optionLabel}
                    className={`institutionCustomSelectOption ${
                      active ? "institutionCustomSelectOptionActive" : ""
                    }`}
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(optionValue);
                      setOpen(false);
                    }}
                  >
                    {optionLabel}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
  const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!result) return new Date();
  return new Date(Number(result[1]), Number(result[2]) - 1, Number(result[3]));
}

function formatDob(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
          className="dobNeumorphicValue"
          onClick={showCalendar}
        >
          {value}
        </button>
      </div>

      <button
        type="button"
        className="institutionFieldAction dobNeumorphicIconButton"
        aria-label="Open Date of Birth calendar"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : showCalendar())}
      >
        <Icon src={images.calendar} width={18} height={18} />
      </button>

      {open && (
        <div className="dobNeumorphicCalendar" role="dialog" aria-label="Select Date of Birth">
          <div className="dobCalendarToolbar">
            <button type="button" className="dobCalendarArrow" onClick={() => moveMonth(-1)} aria-label="Previous month">‹</button>

            <button type="button" className="dobCalendarPicker" onClick={() => setView("months")}>
              <span>{DOB_MONTH_NAMES[month]}</span><span>⌄</span>
            </button>

            <button type="button" className="dobCalendarPicker" onClick={() => { setYearStart(year - 5); setView("years"); }}>
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
                  onClick={() => { setMonth(index); setView("days"); }}
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
                    onClick={() => { setYear(item); setView("days"); }}
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

function SectionHeader({
  title,
  icon,
  tone = "purple",
  editing,
  popup,
  onEdit,
  onSave,
  onCancel,
}: {
  title: string;
  icon: string;
  tone?: "purple" | "pink";
  editing: boolean;
  popup?: PopupType | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="institutionInformationHeader">
      <div className="institutionInformationTitle">
        <span className={`institutionSectionIcon ${tone === "pink" ? "institutionPinkIcon" : "institutionPurpleIcon"}`}>
          <Icon src={icon} width={15} height={15} className="institutionWhiteIcon" />
        </span>
        <h2>{title}</h2>
      </div>

      {popup && (
        <div
          className={`institutionInlinePopup ${
            popup === "saved"
              ? "institutionInlinePopupSaved"
              : "institutionInlinePopupDiscarded"
          }`}
          role="status"
          aria-live="polite"
        >
          <Icon
            src={popup === "saved" ? images.savePopup : images.cancelPopup}
            width={24}
            height={24}
            className="institutionInlinePopupIcon"
          />
          <span>{popup === "saved" ? "Changes Saved" : "Changes Discarded"}</span>
        </div>
      )}

      {editing ? (
        <div className="institutionEditActions">
          <button type="button" className="institutionActionButton institutionSaveButton" onClick={onSave}>
            <Icon src={images.save} width={12} height={12} /><span>Save</span>
          </button>
          <button type="button" className="institutionActionButton institutionCancelButton" onClick={onCancel}>
            <Icon src={images.cancel} width={12} height={12} /><span>Cancel</span>
          </button>
        </div>
      ) : (
        <button type="button" className="institutionEditButton" aria-label={`Edit ${title}`} onClick={onEdit}>
          <Icon src={images.editBig} width={22} height={22} />
        </button>
      )}
    </div>
  );
}

function UploadField({
  label,
  onFileChange,
}: {
  label: string;
  onFileChange?: (hasFile: boolean) => void;
}) {
  const id = useId();
  const [name, setName] = useState("No File Chosen");
  return (
    <div className="institutionField institutionUploadField">
      <div className="institutionFieldLabel">{label}</div>
      <label className="institutionFilePicker" htmlFor={id}>
        <input
          id={id}
          name={id}
          className="institutionNativeFileInput"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setName(file?.name || "No File Chosen");
            onFileChange?.(Boolean(file));
          }}
        />
        <span className="institutionChooseFileButton">
          <Icon src={images.upload} width={13} height={13} />
          <span>Choose File</span>
        </span>
        <span className="institutionFileName">{name}</span>
      </label>
    </div>
  );
}

export default function CorporateCoordinatorProfile() {
  const profileInput = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState(images.profile);
  const [editing, setEditing] = useState<SectionName | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [savedSections, setSavedSections] = useState<Record<SectionName, boolean>>({
    registration: false,
    professional: false,
    skills: false,
    documents: false,
  });
  const [sectionPopup, setSectionPopup] = useState<{
    section: SectionName;
    type: PopupType;
  } | null>(null);

  const [autoSavePopup, setAutoSavePopup] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState("02:26PM");

  const [documentFiles, setDocumentFiles] = useState({
    profilePhoto: false,
    govtIdProof: false,
    supportingDocuments: false,
  });

  const [registration, setRegistration] = useState({
    coordinatorId: "PRGEEQJQCBU006B",
    fullName: "Antony Thomas",
    dob: "1982-02-17",
    gender: "Male",
    qualification: "",
    employeeCode: "eg.EMP-0042",
    officialEmail: "coordinator@collge.edu",
    mobile: "9521221322",
    alternateEmail: "alter@srki.com",
    alternatePhone: "7418236574",
    experience: "Enter Leadership Experience",
    joining: "17-05-2004",
    department: "eg.enter name",
    programmes: "",
    designation: "Coordinator",
    batch: "",
    academicYear: "17-05-2004",
    tenantId: "LXP-COL-001",
    reporting: "eg. Institute Admin",
    onboarding: "Yes",
    status: "eg. Active",
  });

  const [professional, setProfessional] = useState({
    jobLevel: "eg.Training / Operations",
    workLocation: "Bengaluru / Hybrid",
    primaryDomain: "Technology",
    expertise: "Training, Operations",
    responsibilities: "Program planning",
    programmes: "eg, Leadership Bootcamp",
    coordination: "5 Years",
    training: "4 Years",
  });

  const [skills, setSkills] = useState({
    core: "Communication",
    digital: "LMS, Excel",
    level: "Advanced",
    development: "AI",
    interests: "Leadership",
    goals: "eg, L&D Manager",
  });

  const [draftRegistration, setDraftRegistration] = useState(registration);
  const [draftProfessional, setDraftProfessional] = useState(professional);
  const [draftSkills, setDraftSkills] = useState(skills);

  const editingRef = useRef<SectionName | null>(editing);
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

    const runAutoSave = () => {
      const currentEditing = editingRef.current;

      if (currentEditing === "registration") {
        setRegistration(draftRegistrationRef.current);
        setSavedSections((current) => ({
          ...current,
          registration: true,
        }));
      }

      if (currentEditing === "professional") {
        setProfessional(draftProfessionalRef.current);
        setSavedSections((current) => ({
          ...current,
          professional: true,
        }));
      }

      if (currentEditing === "skills") {
        setSkills(draftSkillsRef.current);
        setSavedSections((current) => ({
          ...current,
          skills: true,
        }));
      }

      if (currentEditing === "documents") {
        setSavedSections((current) => ({
          ...current,
          documents: true,
        }));
      }

      const now = new Date();
      const formattedTime = now
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      setLastSavedTime(formattedTime);
      setAutoSavePopup(true);

      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }

      hideTimer = window.setTimeout(() => {
        setAutoSavePopup(false);
      }, 2000);
    };

    const interval = window.setInterval(runAutoSave, 10000);

    return () => {
      window.clearInterval(interval);

      if (hideTimer) {
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

  const showSectionPopup = (section: SectionName, type: PopupType) => {
    setSectionPopup({ section, type });

    window.setTimeout(() => {
      setSectionPopup(null);
      setEditing(null);
    }, 2500);
  };

  const save = (section: SectionName) => {
    if (section === "registration") setRegistration(draftRegistration);
    if (section === "professional") setProfessional(draftProfessional);
    if (section === "skills") setSkills(draftSkills);

    setSavedSections((current) => ({ ...current, [section]: true }));
    showSectionPopup(section, "saved");
  };

  const cancel = (section: SectionName) => {
    showSectionPopup(section, "discarded");
  };

  const hasValue = (value: string) => value.trim().length > 0;
  const allValuesFilled = (values: Record<string, string>) =>
    Object.values(values).every((value) => hasValue(String(value)));

  const registrationCurrent =
    editing === "registration" ? draftRegistration : registration;
  const professionalCurrent =
    editing === "professional" ? draftProfessional : professional;
  const skillsCurrent =
    editing === "skills" ? draftSkills : skills;

  const profilePhotoCompleted = Boolean(profileImage);
  const registrationCompleted =
    savedSections.registration || allValuesFilled(registrationCurrent);
  const professionalCompleted =
    savedSections.professional || allValuesFilled(professionalCurrent);
  const skillsCompleted =
    savedSections.skills || allValuesFilled(skillsCurrent);
  const documentsCompleted =
    documentFiles.profilePhoto &&
    documentFiles.govtIdProof &&
    documentFiles.supportingDocuments;
  const confirmationCompleted = confirmation;

  const steps = [
    { label: "Profile Photo", done: profilePhotoCompleted },
    { label: "Professional Profile", done: professionalCompleted },
    { label: "Documents", done: documentsCompleted },
    { label: "Registration Data", done: registrationCompleted },
    { label: "Skill and Development", done: skillsCompleted },
    { label: "Confirmation", done: confirmationCompleted },
  ];

  const completedCount = steps.filter((step) => step.done).length;
  const completion = Math.round((completedCount / steps.length) * 100);

  const registrationFields = [
    ["Coordinator ID", "coordinatorId"], ["Full Name", "fullName"], ["Date of Birth", "dob"],
    ["Gender", "gender"], ["Highest Qualification", "qualification"], ["Employee Code", "employeeCode"],
    ["Official Email", "officialEmail"], ["Mobile Number", "mobile"], ["Alternate Email", "alternateEmail"],
    ["Alternate Phone", "alternatePhone"], ["Total Experience", "experience"], ["Date of Joining", "joining"],
    ["Assigned Department", "department"], ["Assigned Programmes", "programmes"], ["Designation", "designation"],
    ["Assigned Batch", "batch"], ["Academic Year", "academicYear"], ["Tenant ID", "tenantId"],
    ["Reporting Authority", "reporting"], ["Onboarding Completed", "onboarding"], ["Status", "status"],
  ] as const;

  const lockedRegistration = new Set(["coordinatorId", "fullName", "joining", "designation", "tenantId", "reporting", "onboarding", "status"]);

  return (
    <main className="superAdminPage institutionAdminPage corporateCoordinatorPage">
      <title>Corporate Coordinator Profile | Neuro LXP</title>
      <div className="dashboardLayout">
        <Sidebar />
        <section className="mainContent">
          <Header />

          <div className="pageContent institutionPageContent">
            <div className="institutionHeadingRow">
              <div>
                <h1>Corporate Coordinator Profile</h1>
                <p>Manage Your Identity, Access, Preferences, And Activity With Ease.</p>
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
                      <Image src={profileImage} alt="Antony Thomas" fill sizes="88px" className="institutionAvatarImage" unoptimized={profileImage.startsWith("data:")} />
                    </div>
                  </div>
                  <button type="button" className="institutionCameraButton" aria-label="Change profile photo" onClick={() => profileInput.current?.click()}>
                    <Icon src={images.camera} width={21} height={21} />
                  </button>
                  <input
                    id="corporate-profile-photo"
                    name="corporateProfilePhoto"
                    ref={profileInput}
                    type="file"
                    accept="image/*"
                    aria-label="Choose profile photo"
                    className="institutionProfileImageInput"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProfileImage(URL.createObjectURL(file));
                    }}
                  />
                </div>
                <div className="institutionIdentityText">
                  <h2>Antony Thomas</h2>
                  <div className="institutionRole">Corporate Coordinator</div>
                  <div className="institutionActiveBadge"><span className="institutionActiveDot" /><span>Active</span></div>
                </div>
              </div>

              <div className="institutionDivider" />

              <div className="institutionCompletion">
                <div className="institutionCompletionHeader"><h3>Profile Completion</h3><span>{completion}% Completed</span></div>
                <div className="institutionProgressTrack"><div className="institutionProgressBar" style={{ width: `${completion}%` }} /></div>
                <div className="institutionCompletionSteps institutionCoordinatorSteps">
                  {steps.map((step) => (
                    <div className="institutionCompletionStep" key={step.label}>
                      <span
                        className={
                          step.done
                            ? "institutionCompletedCircle corporateStepDone"
                            : "institutionEmptyCircle"
                        }
                        aria-hidden="true"
                      >
                        {step.done && <span className="corporateCompletionCheckMark" />}
                      </span>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader title="Registration Data" icon={images.registration} editing={editing === "registration"} popup={sectionPopup?.section === "registration" ? sectionPopup.type : null} onEdit={() => startEdit("registration")} onSave={() => save("registration")} onCancel={() => cancel("registration")} />
              <div className="institutionGrid corporateRegistrationGrid">
                {registrationFields.map(([label, key]) => {
                  if (editing !== "registration") return <DisplayField key={key} label={label} value={registration[key]} />;
                  if (key === "gender") return <SelectField key={key} label={label} value={draftRegistration[key]} options={["Male", "Female", "Other"]} onChange={(v) => setDraftRegistration(s => ({...s, [key]: v}))} />;
                  if (key === "qualification") return <EditField key={key} label={label} value={draftRegistration[key]} onChange={(v) => setDraftRegistration(s => ({...s, [key]: v}))} />;
                  if (key === "batch") return <EditField key={key} label={label} value={draftRegistration[key]} onChange={(v) => setDraftRegistration(s => ({...s, [key]: v}))} />;
                  if (key === "dob") return (
                    <DateOfBirthCalendar
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
                  return <EditField key={key} label={label} value={draftRegistration[key]} locked={lockedRegistration.has(key)} onChange={(v) => setDraftRegistration(s => ({...s, [key]: v}))} />;
                })}
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader title="Professional Profile" icon={images.professional} editing={editing === "professional"} popup={sectionPopup?.section === "professional" ? sectionPopup.type : null} onEdit={() => startEdit("professional")} onSave={() => save("professional")} onCancel={() => cancel("professional")} />
              <div className="institutionGrid corporateProfessionalGrid">
                {(Object.entries({
                  jobLevel: "Job Level", workLocation: "Work Location", primaryDomain: "Primary Domain",
                  expertise: "Expertise", responsibilities: "Key Responsibilities", programmes: "Programs / Initiatives",
                  coordination: "Coordination Experience", training: "Training / L&D Experience",
                }) as [keyof typeof professional, string][]).map(([key, label]) =>
                  editing === "professional"
                    ? <EditField key={key} label={label} value={draftProfessional[key]} onChange={(v) => setDraftProfessional(s => ({...s, [key]: v}))} />
                    : <DisplayField key={key} label={label} value={professional[key]} />
                )}
              </div>
            </section>

            <section className="institutionInformationCard">
              <SectionHeader title="Skills & Development" icon={images.skills} editing={editing === "skills"} popup={sectionPopup?.section === "skills" ? sectionPopup.type : null} onEdit={() => startEdit("skills")} onSave={() => save("skills")} onCancel={() => cancel("skills")} />
              <div className="institutionGrid corporateSkillsGrid">
                {(Object.entries({
                  core: "Core Skills", digital: "Digital Skills", level: "Skill Level",
                  development: "Development Areas", interests: "Learning Interests", goals: "Career Goals",
                }) as [keyof typeof skills, string][]).map(([key, label]) => {
                  if (editing === "skills" && key === "level") {
                    return <SelectField key={key} label={label} value={draftSkills[key]} options={["Beginner", "Intermediate", "Advanced", "Expert"]} onChange={(v) => setDraftSkills(s => ({...s, [key]: v}))} />;
                  }
                  return editing === "skills"
                    ? <EditField key={key} label={label} value={draftSkills[key]} onChange={(v) => setDraftSkills(s => ({...s, [key]: v}))} />
                    : <DisplayField key={key} label={label} value={skills[key]} />;
                })}
              </div>
            </section>

            <section className="institutionInformationCard institutionDocumentsCard">
              <SectionHeader
                title="Documents"
                icon={images.documents}
                tone="pink"
                editing={editing === "documents"}
                popup={sectionPopup?.section === "documents" ? sectionPopup.type : null}
                onEdit={() => startEdit("documents")}
                onSave={() => save("documents")}
                onCancel={() => cancel("documents")}
              />
              <div className="institutionGrid institutionDocumentsGrid">
                <UploadField
                  label="Profile Photo"
                  onFileChange={(hasFile) =>
                    setDocumentFiles((current) => ({
                      ...current,
                      profilePhoto: hasFile,
                    }))
                  }
                />
                <UploadField
                  label="Govt Id Proof"
                  onFileChange={(hasFile) =>
                    setDocumentFiles((current) => ({
                      ...current,
                      govtIdProof: hasFile,
                    }))
                  }
                />
                <UploadField
                  label="Supporting Documents"
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
                <span className="institutionSectionIcon institutionPurpleIcon"><Icon src={images.confirmation} width={15} height={15} className="institutionWhiteIcon" /></span>
                <h2>Confirmation</h2>
              </div>
              <div className="institutionConfirmationInner">
                <div className="institutionFieldLabel">Self Declaration Confirmation</div>
                <label className="institutionCheckRow" htmlFor="profile-confirmation">
                  <input
                    id="profile-confirmation"
                    name="profileConfirmation"
                    className="institutionConfirmationCheckbox"
                    type="checkbox"
                    checked={confirmation}
                    onChange={(e) => setConfirmation(e.target.checked)}
                  />
                  <span
                    className={`institutionConfirmationCheckBox ${
                      confirmation ? "institutionConfirmationCheckBoxActive" : ""
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
              <button type="button" className="institutionBottomButton institutionReviewButton">Review Profile</button>
              <button type="button" className="institutionBottomButton institutionFinalSaveButton">Save Profile</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
