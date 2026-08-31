"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./profile.css";
import Sidebar from "../components/sidebar/sidebar";
import Header from "../components/header/header";


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
  width = 20,
  height = 20,
  className = "",
}: IconImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      aria-hidden={alt === "" ? true : undefined}
    />
  );
}

type SectionId =
  | "personal"
  | "contact"
  | "education"
  | "certification"
  | "career"
  | "learning"
  | "skill"
  | "portfolio";

type FieldKind = "text" | "select" | "date" | "file";

type ProfileField = {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  kind?: FieldKind;
  options?: string[];
  wide?: boolean;
  actionLabel?: string;
  actionIcon?: string;
};

type ProfileSection = {
  id: SectionId;
  title: string;
  icon: string;
  toneClass: string;
  addLabel?: string;
  fields: ProfileField[];
};

const initialSections: ProfileSection[] = [
  {
    id: "personal",
    title: "Personal Preferences",
    icon: "/assets/studenticons/personal-preferences.svg",
    toneClass: "sectionPink",
    fields: [
      { key: "preferredName", label: "Preferred Name", value: "eg. Goutham" },
      { key: "nationality", label: "Nationality", value: "eg. Indian" },
      {
        key: "identityDocumentType",
        label: "Identity Document Type",
        value: "Select",
        kind: "select",
        options: ["Select", "Aadhaar Card", "Passport", "Driving Licence"],
      },
      {
        key: "identityDocumentNumber",
        label: "Identity Document Number",
        value: "Enter Document Number",
      },
      { key: "issuingCountry", label: "Issuing Country", value: "eg. India" },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    icon: "/assets/studenticons/contact.svg",
    toneClass: "sectionBlue",
    fields: [
      { key: "alternateContact", label: "Alternate Contact", value: "eg. Goutham" },
      { key: "alternateEmail", label: "Alternate Email ID", value: "eg. ndia1" },
    ],
  },
  {
    id: "education",
    title: "Education and Background",
    icon: "/assets/studenticons/education.svg",
    toneClass: "sectionPurple",
    fields: [
      {
        key: "educationLevel",
        label: "Education Level",
        value: "Select",
        kind: "select",
        options: ["Select", "Undergraduate", "Postgraduate", "Doctorate"],
      },
      { key: "qualification", label: "Qualification", value: "eg. BSC. High school Diploma" },
      { key: "institutionName", label: "Institution Name", value: "Eg. University of Oxford" },
      { key: "fieldOfStudy", label: "Field Of Study", value: "eg. Computer Science" },
      {
        key: "gradingSystem",
        label: "Grading System",
        value: "Select",
        kind: "select",
        options: ["Select", "CGPA", "GPA", "Percentage"],
      },
      { key: "gradeScore", label: "Grade/ Score", value: "eg.3.8 GPA 85%,A" },
      { key: "startYear", label: "Start Year", value: "eg.2020" },
      { key: "endYear", label: "End Year", value: "eg.2024" },
    ],
  },
  {
    id: "certification",
    title: "Certification",
    icon: "/assets/studenticons/certification.svg",
    toneClass: "sectionGreen",
    addLabel: "Add Certification",
    fields: [
      { key: "certificationName", label: "Certification Name", value: "eg.AWS Certified Developer" },
      { key: "issuingOrganization", label: "Issuing Organization", value: "eg. Amazon Web Services" },
      { key: "issueDate", label: "Issue Date", value: "dd-mm-yyyy", kind: "date" },
      { key: "expiryDate", label: "Expiry Date", value: "dd-mm-yyyy", kind: "date" },
      { key: "credentialId", label: "Credential ID", value: "eg.ABC123XYZ" },
      { key: "credentialUrl", label: "Credential URL", value: "https://verify.example.com/cert/123" },
    ],
  },
  {
    id: "career",
    title: "Career Intent",
    icon: "/assets/studenticons/career.svg",
    toneClass: "sectionOrange",
    fields: [
      { key: "careerGoal", label: "Career Goal", value: "Describe your Career goal....", wide: true },
      {
        key: "preferredRole",
        label: "Preferred Role",
        value: "eg. Frontend Developer",
        actionLabel: "Add Role",
        actionIcon: "/assets/studenticons/add.svg",
      },
      {
        key: "preferredIndustry",
        label: "Preferred Industry",
        value: "eg.Technology",
        actionLabel: "Add Industry",
        actionIcon: "/assets/studenticons/add.svg",
      },
    ],
  },
  {
    id: "learning",
    title: "Learning Intent",
    icon: "/assets/studenticons/learning.svg",
    toneClass: "sectionYellow",
    fields: [
      { key: "learningGoal", label: "Learning Goal", value: "Describe your learning goal....", wide: true },
      {
        key: "preferredLearningMode",
        label: "Preferred Learning Mode",
        value: "Select",
        kind: "select",
        options: ["Select", "Online", "Classroom", "Blended"],
      },
    ],
  },
  {
    id: "skill",
    title: "Self Skill",
    icon: "/assets/studenticons/self-skill.svg",
    toneClass: "sectionRed",
    fields: [
      { key: "skillName", label: "Skill Name", value: "eg. React" },
      { key: "category", label: "Category", value: "eg. Frontend" },
      { key: "domain", label: "Domain", value: "Eg. Web Development" },
      {
        key: "selfRatedLevel",
        label: "Self-Rated Level",
        value: "Select",
        kind: "select",
        options: ["Select", "Beginner", "Intermediate", "Advanced"],
      },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio",
    icon: "/assets/studenticons/portfolio.svg",
    toneClass: "sectionViolet",
    addLabel: "Add Skill",
    fields: [
      {
        key: "resume",
        label: "Resume",
        value: "eg. Choose File",
        kind: "file",
        actionLabel: "Add Role",
        actionIcon: "/assets/studenticons/add.svg",
      },
      { key: "portfolioLink", label: "Portfolio Link", value: "http://yoursite.dev" },
      { key: "linkedinUrl", label: "Linkedin URL", value: "https://linkedin.com/in/username" },
      { key: "instagramId", label: "Instagram ID", value: "@username" },
      { key: "facebookUrl", label: "Facebook id/URL", value: "facebook.com/username" },
      { key: "githubUrl", label: "Github URL", value: "https://github.com/username" },
      { key: "twitter", label: "Twitter", value: "https://x.com/username" },
      { key: "personalWebsite", label: "Personal Website", value: "http://yourportfolio.com" },
      {
        key: "portfolioEvidence",
        label: "Portfolio Evidence",
        value: "Project/work sample name",
        wide: true,
        actionLabel: "Add",
        actionIcon: "/assets/studenticons/add.svg",
      },
    ],
  },
];

const cloneSections = (sections: ProfileSection[]) =>
  sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => ({
      ...field,
      options: field.options ? [...field.options] : undefined,
    })),
  }));

export default function StudentRegistrationPage() {
  const router = useRouter();
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState(
    "/assets/superadminimages/profile.png"
  );
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("");

  const [profileSections, setProfileSections] = useState<ProfileSection[]>(
    () => cloneSections(initialSections)
  );
  const [sectionDrafts, setSectionDrafts] = useState<ProfileSection[]>(
    () => cloneSections(initialSections)
  );
  const [editingSections, setEditingSections] = useState<Record<SectionId, boolean>>({
    personal: false,
    contact: false,
    education: false,
    certification: false,
    career: false,
    learning: false,
    skill: false,
    portfolio: false,
  });
  const [sectionStatus, setSectionStatus] = useState<{
    id: SectionId;
    status: "saved" | "discarded";
  } | null>(null);

  const [openSelectField, setOpenSelectField] = useState<string | null>(null);

  const [openCalendarField, setOpenCalendarField] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [calendarPickerMode, setCalendarPickerMode] = useState<
    "days" | "months" | "years"
  >("days");
  const [yearPageStart, setYearPageStart] = useState(() => new Date().getFullYear() - 1);

  const showSectionStatus = (id: SectionId, status: "saved" | "discarded") => {
    setSectionStatus({ id, status });
    window.setTimeout(() => setSectionStatus(null), 2500);
  };

  const handleSectionEdit = (id: SectionId) => {
    setOpenSelectField(null);
    setOpenCalendarField(null);
    setCalendarPickerMode("days");
    setSectionDrafts(cloneSections(profileSections));
    setSectionStatus(null);
    setEditingSections((current) => ({ ...current, [id]: true }));
  };

  const handleSectionSave = (id: SectionId) => {
    setOpenSelectField(null);
    setOpenCalendarField(null);
    setCalendarPickerMode("days");
    const draftSection = sectionDrafts.find((section) => section.id === id);
    if (draftSection) {
      setProfileSections((current) =>
        current.map((section) =>
          section.id === id
            ? {
                ...draftSection,
                fields: draftSection.fields.map((field) => ({
                  ...field,
                  options: field.options ? [...field.options] : undefined,
                })),
              }
            : section
        )
      );
    }
    setEditingSections((current) => ({ ...current, [id]: false }));
    showSectionStatus(id, "saved");
  };

  const handleSectionCancel = (id: SectionId) => {
    setOpenSelectField(null);
    setOpenCalendarField(null);
    setCalendarPickerMode("days");
    setSectionDrafts(cloneSections(profileSections));
    setEditingSections((current) => ({ ...current, [id]: false }));
    showSectionStatus(id, "discarded");
  };

  const updateDraftField = (id: SectionId, key: string, value: string) => {
    setSectionDrafts((current) =>
      current.map((section) =>
        section.id === id
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.key === key ? { ...field, value } : field
              ),
            }
          : section
      )
    );
  };

  const handleProfileImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  useEffect(() => {
    document.title = "Student Profile | Neuro LXP";

    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const saveDraft = () => {
      const formattedTime = new Date()
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      setDraftSavedTime(formattedTime);
      setShowDraftSaved(true);

      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setShowDraftSaved(false), 2000);
    };

    const saveInterval = setInterval(saveDraft, 10000);

    return () => {
      clearInterval(saveInterval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const pad2 = (value: number) => String(value).padStart(2, "0");

  const toIsoDate = (date: Date) =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

  const formatDisplayDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "dd-mm-yyyy";
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
  };

  const getCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ date: Date; currentMonth: boolean }> = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    while (days.length % 7 !== 0) {
      const nextDay = days.length - (startOffset + daysInMonth) + 1;
      days.push({
        date: new Date(year, month + 1, nextDay),
        currentMonth: false,
      });
    }

    return days;
  };

  const renderField = (
    section: ProfileSection,
    field: ProfileField,
    isEditing: boolean
  ) => {
    const id = `${section.id}-${field.key}`;

    if (!isEditing) {
      return (
        <div
          className={`studentInfoField ${field.wide ? "studentInfoFieldWide" : ""}`}
          key={field.key}
        >
          <div className="studentInfoLabel">{field.label}</div>
          <div className="studentInfoValue">{field.value}</div>

          {field.actionLabel && (
            <button type="button" className="studentInlineAction">
              {field.actionIcon && (
                <IconImage src={field.actionIcon} width={12} height={12} />
              )}
              <span>{field.actionLabel}</span>
            </button>
          )}
        </div>
      );
    }

    if (field.kind === "select") {
      const selectKey = `${section.id}-${field.key}`;
      const isOpen = openSelectField === selectKey;

      return (
        <div
          className={`studentInfoField studentEditableField studentCustomSelectField ${
            field.wide ? "studentInfoFieldWide" : ""
          }`}
          key={field.key}
        >
          <div className="studentFieldText">
            <div className="studentInfoLabel">{field.label}</div>
            <div className="studentSelectValue">{field.value}</div>
          </div>

          <button
            type="button"
            className="studentSelectIconButton"
            aria-label={`Choose ${field.label}`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => {
              setOpenCalendarField(null);
              setOpenSelectField((current) =>
                current === selectKey ? null : selectKey
              );
            }}
          >
            <IconImage
              src="/assets/studenticons/arrow-down.svg"
              width={30}
              height={30}
            />
          </button>

          {isOpen && (
            <div
              className="studentSelectMenu"
              role="listbox"
              aria-label={field.label}
            >
              {(field.options ?? ["Select"]).map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={field.value === option}
                  className={`studentSelectOption ${
                    field.value === option ? "studentSelectOptionActive" : ""
                  }`}
                  key={option}
                  onClick={() => {
                    updateDraftField(section.id, field.key, option);
                    setOpenSelectField(null);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (field.kind === "file") {
      return (
        <div
          className={`studentInfoField studentEditableField ${
            field.wide ? "studentInfoFieldWide" : ""
          }`}
          key={field.key}
        >
          <div className="studentFieldText">
            <label className="studentInfoLabel" htmlFor={id}>
              {field.label}
            </label>
            <div className="studentInfoValue">{field.value}</div>
          </div>

          <input
            id={id}
            name={field.key}
            type="file"
            className="studentFileControl"
            aria-label={field.label}
          />

          {field.actionLabel && (
            <label className="studentInlineAction" htmlFor={id}>
              {field.actionIcon && (
                <IconImage
                  src="/assets/studenticons/add.svg"
                  width={12}
                  height={12}
                />
              )}
              <span>{field.actionLabel}</span>
            </label>
          )}
        </div>
      );
    }

    if (field.kind === "date") {
      const calendarKey = `${section.id}-${field.key}`;
      const isCalendarOpen = openCalendarField === calendarKey;
      const selectedValue = /^\d{4}-\d{2}-\d{2}$/.test(field.value)
        ? field.value
        : "";

      const calendarDays = getCalendarDays(calendarMonth);
      const currentMonth = calendarMonth.getMonth();
      const currentYear = calendarMonth.getFullYear();

      const monthOptions = Array.from({ length: 12 }, (_, index) => index);
      const yearOptions = Array.from(
        { length: 31 },
        (_, index) => currentYear - 15 + index
      );

      const toggleCalendar = () => {
        const nextOpen = !isCalendarOpen;

        if (nextOpen && selectedValue) {
          const [year, month, day] = selectedValue.split("-").map(Number);
          setCalendarMonth(new Date(year, month - 1, day));
        }

        setOpenSelectField(null);
        setCalendarPickerMode("days");
        setOpenCalendarField(nextOpen ? calendarKey : null);
      };

      return (
        <div
          className={`studentInfoField studentEditableField studentDateField ${
            field.wide ? "studentInfoFieldWide" : ""
          }`}
          key={field.key}
        >
          <div className="studentFieldText">
            <div className="studentInfoLabel">{field.label}</div>

            <button
              type="button"
              className="studentDateDisplayButton"
              onClick={toggleCalendar}
            >
              {formatDisplayDate(field.value)}
            </button>
          </div>

          <button
            type="button"
            className="studentFieldIcon studentCalendarIcon"
            aria-label={`Choose ${field.label}`}
            aria-haspopup="dialog"
            aria-expanded={isCalendarOpen}
            onClick={toggleCalendar}
          >
            <IconImage
              src="/assets/studenticons/calendar.svg"
              width={20}
              height={20}
            />
          </button>

          {isCalendarOpen && (
            <div
              className="studentNeumorphicCalendar"
              role="dialog"
              aria-label={`${field.label} calendar`}
            >
              <div className="studentCalendarTopRow">
                <button
                  type="button"
                  className="studentCalendarArrowButton"
                  aria-label="Previous month"
                  onClick={() =>
                    setCalendarMonth(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth() - 1,
                          1
                        )
                    )
                  }
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="studentCalendarSelectButton"
                  aria-expanded={calendarPickerMode === "months"}
                  onClick={() => {
                    if (calendarPickerMode === "months") {
                      setCalendarPickerMode("days");
                    } else {
                      setCalendarPickerMode("months");
                    }
                  }}
                >
                  <span>
                    {calendarMonth.toLocaleDateString("en-US", {
                      month: "long",
                    })}
                  </span>
                  <span className="studentCalendarSelectChevron" aria-hidden="true">
                   ⌄
                  </span>
                </button>

                <button
                  type="button"
                  className="studentCalendarSelectButton studentCalendarYearButton"
                  aria-expanded={calendarPickerMode === "years"}
                  onClick={() => {
                    if (calendarPickerMode === "years") {
                      setCalendarPickerMode("days");
                    } else {
                      setYearPageStart(currentYear - 5);
                      setCalendarPickerMode("years");
                    }
                  }}
                >
                  <span>{currentYear}</span>
                  <span className="studentCalendarSelectChevron" aria-hidden="true">
                   ⌄
                  </span>
                </button>

                <button
                  type="button"
                  className="studentCalendarArrowButton"
                  aria-label="Next month"
                  onClick={() =>
                    setCalendarMonth(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth() + 1,
                          1
                        )
                    )
                  }
                >
                  ›
                </button>
              </div>

              {calendarPickerMode === "months" && (
                <div className="studentCalendarMonthsAll">
                  {monthOptions.map((monthIndex) => {
                    const active = currentMonth === monthIndex;
                    const monthName = new Date(
                      2000,
                      monthIndex,
                      1
                    ).toLocaleDateString("en-US", {
                      month: "short",
                    });

                    return (
                      <button
                        type="button"
                        className={`studentCalendarMonthAllItem ${
                          active ? "studentCalendarRailItemActive" : ""
                        }`}
                        key={monthIndex}
                        onClick={() => {
                          setCalendarMonth(
                            new Date(currentYear, monthIndex, 1)
                          );
                          setCalendarPickerMode("days");
                        }}
                      >
                        {monthName}
                      </button>
                    );
                  })}
                </div>
              )}

              {calendarPickerMode === "years" && (
                <div className="studentCalendarYearPagedPicker">
                  <div className="studentCalendarYearPagedHeader">
                    <button
                      type="button"
                      className="studentCalendarRailNav"
                      aria-label="Previous years"
                      onClick={() =>
                        setYearPageStart((current) => current - 12)
                      }
                    >
                      ‹
                    </button>

                    <div className="studentCalendarYearRange">
                      {yearPageStart} - {yearPageStart + 11}
                    </div>

                    <button
                      type="button"
                      className="studentCalendarRailNav"
                      aria-label="Next years"
                      onClick={() =>
                        setYearPageStart((current) => current + 12)
                      }
                    >
                      ›
                    </button>
                  </div>

                  <div className="studentCalendarYearsGrid">
                    {Array.from(
                      { length: 12 },
                      (_, index) => yearPageStart + index
                    ).map((year) => {
                      const active = currentYear === year;

                      return (
                        <button
                          type="button"
                          className={`studentCalendarYearGridItem ${
                            active ? "studentCalendarRailItemActive" : ""
                          }`}
                          key={year}
                          onClick={() => {
                            setCalendarMonth(
                              new Date(year, currentMonth, 1)
                            );
                            setCalendarPickerMode("days");
                          }}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarPickerMode === "days" && (
                <>
                  <div className="studentCalendarWeekdays" aria-hidden="true">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="studentCalendarGrid">
                    {calendarDays.map(({ date, currentMonth: isCurrentMonth }) => {
                      const iso = toIsoDate(date);
                      const selected = iso === selectedValue;

                      return (
                        <button
                          type="button"
                          className={`studentCalendarDay ${
                            isCurrentMonth ? "" : "studentCalendarDayMuted"
                          } ${selected ? "studentCalendarDaySelected" : ""}`}
                          aria-pressed={selected}
                          key={iso}
                          onClick={() => {
                            updateDraftField(section.id, field.key, iso);
                            setOpenCalendarField(null);
                            setCalendarPickerMode("days");
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

    return (
      <div
        className={`studentInfoField studentEditableField ${
          field.wide ? "studentInfoFieldWide" : ""
        }`}
        key={field.key}
      >
        <div className="studentFieldText">
          <label className="studentInfoLabel" htmlFor={id}>
            {field.label}
          </label>
          <input
            id={id}
            name={field.key}
            type="text"
            className="studentFieldControl"
            value={field.value}
            onChange={(event) =>
              updateDraftField(section.id, field.key, event.target.value)
            }
          />
        </div>

        {!field.actionLabel && (
          <label className="studentFieldIcon" htmlFor={id}>
            <IconImage
              src="/assets/studenticons/edit.svg"
              width={20}
              height={20}
            />
          </label>
        )}

        {field.actionLabel && (
          <button type="button" className="studentInlineAction">
            {field.actionIcon && (
              <IconImage src={field.actionIcon} width={12} height={12} />
            )}
            <span>{field.actionLabel}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <main className="superAdminPage studentProfilePage">
      <div className="dashboardLayout">
        <Sidebar />

        <section className="mainContent">
          <Header />

          <div className="pageContent">
            <div className="pageHeadingRow">
              <div className="pageHeading">
                <h1>Student Profile</h1>
                <p>Manage Your Identity, Access, Preferences, And Activity With Ease.</p>
              </div>

              {showDraftSaved && (
                <div className="savedBadge" role="status" aria-live="polite">
                  <IconImage
                    src="/assets/studenticons/checkmark.svg"
                    width={24}
                    height={24}
                  />
                  <span>Draft Saved at {draftSavedTime}</span>
                </div>
              )}
            </div>

            <section className="profileOverviewCard studentOverviewCard">
              <div className="profileIdentity studentIdentity">
                <div className="largeAvatarWrapper studentAvatarWrapper">
                  <div className="largeAvatar studentAvatar">
                    <Image
                      src={profileImage}
                      alt="Antony Thomas"
                      fill
                      sizes="88px"
                      className="avatarImage"
                      unoptimized={profileImage.startsWith("data:")}
                      priority
                    />
                  </div>

                  <button
                    type="button"
                    className="cameraButton"
                    aria-label="Change profile image"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    <IconImage
                      src="/assets/studenticons/camera.svg"
                      width={24}
                      height={24}
                    />
                  </button>

                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    name="profileImage"
                    className="profileImageInput"
                    aria-label="Choose profile image"
                    onChange={handleProfileImageSelect}
                  />
                </div>

                <div className="identityContent studentIdentityContent">
                  <h2>Antony Thomas</h2>
                  <div className="roleName">Student</div>
                  <div className="activeBadge">
                    <span className="activeDot" aria-hidden="true" />
                    <span>Active</span>
                  </div>
                  <div className="adminId">Super admin ID : SA10001</div>
                </div>
              </div>

              <div className="verticalDivider" aria-hidden="true" />

              <div className="completionSection studentCompletionSection">
                <div className="completionHeader">
                  <h3>Profile Completion</h3>
                  <span>75% Completed</span>
                </div>

                <div
                  className="progressTrack"
                  role="progressbar"
                  aria-label="Profile completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={75}
                  aria-valuetext="75% completed"
                >
                  <div
                    className="progressBar"
                    style={{ width: "75%" }}
                    aria-hidden="true"
                  />
                </div>

                <div className="completionSteps studentCompletionSteps">
                  <div className="completionStep completed">
                    <span className="completedCircle" aria-hidden="true">✓</span>
                    <span>Profile Photo</span>
                  </div>
                  <div className="completionStep completed">
                    <span className="completedCircle" aria-hidden="true">✓</span>
                    <span>Student Profile</span>
                  </div>
                  <div className="completionStep completed">
                    <span className="completedCircle" aria-hidden="true">✓</span>
                    <span>Registration</span>
                  </div>
                  <div className="completionStep">
                    <span className="emptyCircle" aria-hidden="true" />
                    <span>Consent</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="profileTabs studentProfileTabs">
              <button
                type="button"
                className="profileTab"
                onClick={() => router.push("/student_registration")}
              >
                <IconImage
                  src="/assets/studenticons/clipboard-list.svg"
                  width={20}
                  height={20}
                />
                <span>Registration</span>
              </button>

              <button
                type="button"
                className="profileTab profileTabActive"
                aria-current="page"
                onClick={() => router.push("/student_profile")}
              >
                <IconImage
                  src="/assets/studenticons/userblue.svg"
                  width={20}
                  height={20}
                />
                <span>Student Profile</span>
              </button>

              <button
                type="button"
                className="profileTab"
                onClick={() => router.push("/student_consent")}
              >
                <IconImage
                  src="/assets/studenticons/check-line.svg"
                  width={20}
                  height={20}
                />
                <span>Consent</span>
              </button>
            </div>

            <div className="studentProfileSections">
              {profileSections.map((savedSection) => {
                const isEditing = editingSections[savedSection.id];
                const section =
                  (isEditing
                    ? sectionDrafts.find((item) => item.id === savedSection.id)
                    : savedSection) ?? savedSection;

                return (
                  <section
                    className={`informationCard studentDetailsCard studentSection-${section.id}`}
                    key={section.id}
                  >
                    <div className="informationHeader studentSectionHeader">
                      <div className="informationTitle">
                        <span className={`sectionIcon ${section.toneClass}`}>
                          {section.id === "personal" && (
                            <IconImage
                              src="/assets/studenticons/settings.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}

                          {section.id === "contact" && (
                            <IconImage
                              src="/assets/studenticons/call.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}

                          {section.id === "education" && (
                            <IconImage
                              src="/assets/studenticons/graduation-cap.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}

                          {section.id === "certification" && (
                            <IconImage
                              src="/assets/studenticons/award.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}

                          {section.id === "career" && (
                            <IconImage
                              src="/assets/studenticons/goal.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}

                          {section.id === "learning" && (
                            <IconImage
                              src="/assets/studenticons/book-open.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}

                          {section.id === "skill" && (
                            <IconImage
                              src="/assets/studenticons/star.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}

                          {section.id === "portfolio" && (
                            <IconImage
                              src="/assets/studenticons/bag.svg"
                              width={20}
                              height={20}
                              className="whiteIcon"
                            />
                          )}
                        </span>
                        <h2>{section.title}</h2>
                      </div>

                      <div className="studentSectionHeaderRight">
                        

                        {section.addLabel && (
                          <button type="button" className="studentAddButton">
                            <IconImage
                              src="/assets/studenticons/add.svg"
                              width={14}
                              height={14}
                            />
                            <span>{section.addLabel}</span>
                          </button>
                        )}

                        {isEditing ? (
                          <div className="basicEditHeaderActions">
                            <button
                              type="button"
                              className="basicActionButton basicSaveButton"
                              onClick={() => handleSectionSave(section.id)}
                            >
                              <IconImage
                                src="/assets/studenticons/tick.svg"
                                width={14}
                                height={14}
                              />
                              <span>Save</span>
                            </button>

                            <button
                              type="button"
                              className="basicActionButton basicCancelButton"
                              onClick={() => handleSectionCancel(section.id)}
                            >
                              <IconImage
                                src="/assets/studenticons/cancel.svg"
                                width={14}
                                height={14}
                              />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="editButton"
                            aria-label={`Edit ${section.title}`}
                            onClick={() => handleSectionEdit(section.id)}
                          >
                            <IconImage
                              src="/assets/studenticons/editbig.svg"
                              width={24}
                              height={24}
                            />
                          </button>
                        )}
                      </div>

                      {sectionStatus?.id === section.id &&
                        sectionStatus.status === "saved" && (
                          <div
                            className="basicStatusPopup basicStatusSaved"
                            role="status"
                            aria-live="polite"
                          >
                            <IconImage
                              src="/assets/studenticons/clap.svg"
                              width={24}
                              height={24}
                            />
                            <span>Changes Saved</span>
                          </div>
                        )}

                      {sectionStatus?.id === section.id &&
                        sectionStatus.status === "discarded" && (
                          <div
                            className="basicStatusPopup basicStatusDiscarded"
                            role="status"
                            aria-live="polite"
                          >
                            <IconImage
                              src="/assets/studenticons/sad.svg"
                              width={24}
                              height={24}
                            />
                            <span>Changes Discarded</span>
                          </div>
                        )}
                    </div>

                    <div className={`studentDetailsGrid studentGrid-${section.id}`}>
                      {section.fields.map((field) =>
                        renderField(section, field, isEditing)
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
