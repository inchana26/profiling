"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./funiversity.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
const images = {
  profile: "/assets/funiversityimages/profile.png",

  camera: "/assets/funiversityicons/camera.svg",
  edit: "/assets/funiversityicons/edit.svg",
  editBig: "/assets/funiversityicons/editbig.svg",
  lock: "/assets/funiversityicons/lock.svg",
  save: "/assets/funiversityicons/tick.svg",
  cancel: "/assets/funiversityicons/cancel.svg",
  arrowDown: "/assets/funiversityicons/arrow-down.svg",
  completed: "/assets/funiversityicons/checkmark.svg",
  upload: "/assets/funiversityicons/upload.svg",
  clap: "/assets/funiversityicons/clap.svg",
  sad: "/assets/funiversityicons/sad.svg",

  registration: "/assets/funiversityicons/file-edit.svg",
  academicProfessional: "/assets/funiversityicons/briefcase.svg",
  skillsDevelopment: "/assets/funiversityicons/target.svg",
  documents: "/assets/funiversityicons/file.svg",
  confirmation: "/assets/funiversityicons/checkmark-circlewhite.svg",
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
            setOpen((current) => {
              const nextOpen = !current;
              if (nextOpen) {
                window.dispatchEvent(
                  new CustomEvent("faculty-profile-dropdown-open", {
                    detail: selectId,
                  })
                );
              }
              return nextOpen;
            });
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
            setOpen((current) => {
              const nextOpen = !current;
              if (nextOpen) {
                window.dispatchEvent(
                  new CustomEvent("faculty-profile-dropdown-open", {
                    detail: selectId,
                  })
                );
              }
              return nextOpen;
            });
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
  popupType?: "saved" | "discarded" | "error" | null;
  popupMessage?: string;
  onEdit: () => void;
};

function SectionHeader({
  title,
  iconSrc,
  iconTone,
  popupType = null,
  popupMessage,
  onEdit,
}: SectionHeaderProps) {
  return (
    <div
      className={`institutionInformationHeader ${
        popupType ? "institutionInformationHeaderHasPopup" : ""
      }`}
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

  const [sectionPopup, setSectionPopup] = useState<{
    section: SectionName;
    type: "saved" | "discarded" | "error";
    message?: string;
  } | null>(null);

  const [registrationInfo, setRegistrationInfo] = useState({
    facultyId: "FAC-00125",
    employeeCode: "EMP1234",
    fullName: "Antony Thomas",
    email: "",
    mobileNumber: "",
    alternateEmail: "",
    alternatePhone: "",
    gender: "",
    department: "",
    designation: "",
    facultyType: "",
    dateOfJoining: "17-05-2004",
    highestQualification: "",
    specialization: [] as string[],
    teachingExperience: "",
    industryExperience: "",
    coursesHandled: [] as string[],
    reportingAuthority: "",
    status: "Active",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    academicDivision: "",
    primaryDomain: "",
    areasOfExpertise: [] as string[],
    coursesTaught: [] as string[],
    teachingLevel: [] as string[],
    academicRole: [] as string[],
    researchArea: [] as string[],
    publications: "",
    researchProjects: [] as string[],
    studentGuidance: [] as string[],
  });

  const [skillsInfo, setSkillsInfo] = useState({
    coreSkills: [] as string[],
    digitalSkills: [] as string[],
    fdpsTraining: [] as string[],
    naacIqacInvolvement: [] as string[],
    nbaObeInvolvement: [] as string[],
    studentDevelopment: [] as string[],
    developmentAreas: [] as string[],
    careerGoals: "",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [professionalDraft, setProfessionalDraft] = useState(professionalInfo);
  const [skillsDraft, setSkillsDraft] = useState(skillsInfo);

  const editingSectionRef = useRef<SectionName | null>(editingSection);

  useEffect(() => {
    editingSectionRef.current = editingSection;
  }, [editingSection]);

  const startSectionEdit = (section: SectionName) => {
    if (section === "registration" && !profilePhotoCompleted) {
      showFlowPopup(
        "Please Complete Profile Photo",
        "registration"
      );
      return;
    }

    if (section === "professional" && !registrationFormComplete) {
      showFlowPopup(
        "Please Complete Registration Data",
        "professional"
      );
      return;
    }

    if (section === "skills" && !professionalFormComplete) {
      showFlowPopup(
        "Please Complete Academic & Professional Profile",
        "skills"
      );
      return;
    }

    if (section === "documents" && !skillsFormComplete) {
      showFlowPopup(
        "Please Complete Skills & Development",
        "documents"
      );
      return;
    }

    setSectionPopup(null);

    if (section === "registration") {
      setRegistrationDraft({ ...registrationInfo });
    }

    if (section === "professional") {
      setProfessionalDraft({
        ...professionalInfo,
        areasOfExpertise: [...professionalInfo.areasOfExpertise],
        coursesTaught: [...professionalInfo.coursesTaught],
        teachingLevel: [...professionalInfo.teachingLevel],
        academicRole: [...professionalInfo.academicRole],
        researchArea: [...professionalInfo.researchArea],
        researchProjects: [...professionalInfo.researchProjects],
        studentGuidance: [...professionalInfo.studentGuidance],
      });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        coreSkills: [...skillsInfo.coreSkills],
        digitalSkills: [...skillsInfo.digitalSkills],
        fdpsTraining: [...skillsInfo.fdpsTraining],
        naacIqacInvolvement: [...skillsInfo.naacIqacInvolvement],
        nbaObeInvolvement: [...skillsInfo.nbaObeInvolvement],
        studentDevelopment: [...skillsInfo.studentDevelopment],
        developmentAreas: [...skillsInfo.developmentAreas],
      });
    }

    setEditingSection(section);
  };

  const isValidPhoneNumber = (value: string) => /^\d{10}$/.test(value);

  const isValidEmail = (value: string) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const registrationFormComplete = Boolean(
    profilePhotoCompleted &&
      isValidEmail(registrationDraft.email.trim()) &&
      isValidPhoneNumber(registrationDraft.mobileNumber.trim()) &&
      (!registrationDraft.alternateEmail.trim() ||
        isValidEmail(registrationDraft.alternateEmail.trim())) &&
      (!registrationDraft.alternatePhone.trim() ||
        isValidPhoneNumber(registrationDraft.alternatePhone.trim())) &&
      registrationDraft.gender &&
      registrationDraft.department &&
      registrationDraft.designation &&
      registrationDraft.facultyType &&
      registrationDraft.highestQualification &&
      registrationDraft.specialization.length > 0 &&
      registrationDraft.teachingExperience &&
      registrationDraft.industryExperience &&
      registrationDraft.coursesHandled.length > 0 &&
      registrationDraft.reportingAuthority
  );

  const professionalFormComplete = Boolean(
    registrationFormComplete &&
      professionalDraft.academicDivision &&
      professionalDraft.primaryDomain &&
      professionalDraft.areasOfExpertise.length > 0 &&
      professionalDraft.coursesTaught.length > 0 &&
      professionalDraft.teachingLevel.length > 0 &&
      professionalDraft.academicRole.length > 0 &&
      professionalDraft.researchArea.length > 0 &&
      professionalDraft.researchProjects.length > 0 &&
      professionalDraft.studentGuidance.length > 0
  );

  const skillsFormComplete = Boolean(
    professionalFormComplete &&
      skillsDraft.coreSkills.length > 0 &&
      skillsDraft.digitalSkills.length > 0 &&
      skillsDraft.fdpsTraining.length > 0 &&
      skillsDraft.naacIqacInvolvement.length > 0 &&
      skillsDraft.nbaObeInvolvement.length > 0 &&
      skillsDraft.studentDevelopment.length > 0 &&
      skillsDraft.developmentAreas.length > 0 &&
      skillsDraft.careerGoals
  );

  const documentsFormComplete = Boolean(
    skillsFormComplete &&
      governmentIdDocumentType.trim() !== "" &&
      documentFiles["Government ID Proof"] !== null
  );

  const confirmationStepComplete = Boolean(
    documentsFormComplete && confirmation
  );

  useEffect(() => {
    if (!documentsFormComplete && confirmation) {
      setConfirmation(false);
    }
  }, [documentsFormComplete, confirmation]);

  /* Keep read-only values in sync automatically because section Save/Cancel
     buttons are intentionally removed. */
  useEffect(() => {
    if (editingSection === "registration") {
      setRegistrationInfo({
        ...registrationDraft,
        specialization: [...registrationDraft.specialization],
        coursesHandled: [...registrationDraft.coursesHandled],
      });
    }
  }, [editingSection, registrationDraft]);

  useEffect(() => {
    if (editingSection === "professional") {
      setProfessionalInfo({
        ...professionalDraft,
        areasOfExpertise: [...professionalDraft.areasOfExpertise],
        coursesTaught: [...professionalDraft.coursesTaught],
        teachingLevel: [...professionalDraft.teachingLevel],
        academicRole: [...professionalDraft.academicRole],
        researchArea: [...professionalDraft.researchArea],
        researchProjects: [...professionalDraft.researchProjects],
        studentGuidance: [...professionalDraft.studentGuidance],
      });
    }
  }, [editingSection, professionalDraft]);

  useEffect(() => {
    if (editingSection === "skills") {
      setSkillsInfo({
        ...skillsDraft,
        coreSkills: [...skillsDraft.coreSkills],
        digitalSkills: [...skillsDraft.digitalSkills],
        fdpsTraining: [...skillsDraft.fdpsTraining],
        naacIqacInvolvement: [...skillsDraft.naacIqacInvolvement],
        nbaObeInvolvement: [...skillsDraft.nbaObeInvolvement],
        studentDevelopment: [...skillsDraft.studentDevelopment],
        developmentAreas: [...skillsDraft.developmentAreas],
      });
    }
  }, [editingSection, skillsDraft]);

  /* Show registration errors in the existing section popup area while the
     user is filling the field. The popup clears automatically as soon as
     the value becomes valid. */
  useEffect(() => {
    if (editingSection !== "registration") {
      return;
    }

    const email = registrationDraft.email.trim();
    const alternateEmail = registrationDraft.alternateEmail.trim();
    const mobileNumber = registrationDraft.mobileNumber.trim();
    const alternatePhone = registrationDraft.alternatePhone.trim();

    let message = "";

    if (email && !isValidEmail(email)) {
      message = "Enter a valid Email";
    } else if (mobileNumber && !isValidPhoneNumber(mobileNumber)) {
      message = "Mobile Number must contain exactly 10 digits";
    } else if (alternateEmail && !isValidEmail(alternateEmail)) {
      message = "Enter a valid Alternate Email";
    } else if (alternatePhone && !isValidPhoneNumber(alternatePhone)) {
      message = "Alternate Phone must contain exactly 10 digits";
    }

    if (!message) {
      setSectionPopup((current) =>
        current?.section === "registration" && current.type === "error"
          ? null
          : current
      );
      return;
    }

    setSectionPopup({
      section: "registration",
      type: "error",
      message,
    });
  }, [
    editingSection,
    registrationDraft.email,
    registrationDraft.mobileNumber,
    registrationDraft.alternateEmail,
    registrationDraft.alternatePhone,
  ]);

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

  const cancelProfile = () => {
    const resetRegistration = {
      facultyId: "FAC-00125",
      employeeCode: "EMP1234",
      fullName: "Antony Thomas",
      email: "",
      mobileNumber: "",
      alternateEmail: "",
      alternatePhone: "",
      gender: "",
      department: "",
      designation: "",
      facultyType: "",
      dateOfJoining: "17-05-2004",
      highestQualification: "",
      specialization: [] as string[],
      teachingExperience: "",
      industryExperience: "",
      coursesHandled: [] as string[],
      reportingAuthority: "",
      status: "Active",
    };

    const resetProfessional = {
      academicDivision: "",
      primaryDomain: "",
      areasOfExpertise: [] as string[],
      coursesTaught: [] as string[],
      teachingLevel: [] as string[],
      academicRole: [] as string[],
      researchArea: [] as string[],
      publications: "",
      researchProjects: [] as string[],
      studentGuidance: [] as string[],
    };

    const resetSkills = {
      coreSkills: [] as string[],
      digitalSkills: [] as string[],
      fdpsTraining: [] as string[],
      naacIqacInvolvement: [] as string[],
      nbaObeInvolvement: [] as string[],
      studentDevelopment: [] as string[],
      developmentAreas: [] as string[],
      careerGoals: "",
    };

    setRegistrationInfo(resetRegistration);
    setRegistrationDraft(resetRegistration);
    setProfessionalInfo(resetProfessional);
    setProfessionalDraft(resetProfessional);
    setSkillsInfo(resetSkills);
    setSkillsDraft(resetSkills);

    setProfileImage(null);
    setProfilePhotoCompleted(false);
    setGovernmentIdDocumentType("");
    setDocumentFiles({
      "Profile Photo": null,
      "Government ID Proof": null,
      "Supporting Documents": null,
    });
    setConfirmation(false);
    setEditingSection(null);
    setSectionPopup(null);
    setFlowPopup(null);
    setFlowPopupSection(null);
    setShowDraftSaved(false);

    if (flowPopupTimerRef.current) {
      window.clearTimeout(flowPopupTimerRef.current);
      flowPopupTimerRef.current = null;
    }

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }
  };

  const saveProfile = () => {
    const nextIncompleteStep =
      !profilePhotoCompleted
        ? "Profile Photo"
        : !registrationFormComplete
          ? "Registration Data"
          : !professionalFormComplete
            ? "Academic & Professional Profile"
            : !skillsFormComplete
              ? "Skills & Development"
              : !documentsFormComplete
                ? "Documents"
                : !confirmation
                  ? "Confirmation"
                  : null;

    if (nextIncompleteStep) {
      const popupSection:
        | SectionName
        | "profile"
        | "confirmation" =
        nextIncompleteStep === "Profile Photo"
          ? "profile"
          : nextIncompleteStep === "Registration Data"
            ? "registration"
            : nextIncompleteStep === "Academic & Professional Profile"
              ? "professional"
              : nextIncompleteStep === "Skills & Development"
                ? "skills"
                : nextIncompleteStep === "Documents"
                  ? "documents"
                  : "confirmation";

      showFlowPopup(
        `Please complete ${nextIncompleteStep} before saving the profile.`,
        popupSection
      );
      return;
    }

    setRegistrationInfo({
      ...registrationDraft,
      email: registrationDraft.email.trim(),
      alternateEmail: registrationDraft.alternateEmail.trim(),
      specialization: [...registrationDraft.specialization],
      coursesHandled: [...registrationDraft.coursesHandled],
    });
    setProfessionalInfo({
      ...professionalDraft,
      areasOfExpertise: [...professionalDraft.areasOfExpertise],
      coursesTaught: [...professionalDraft.coursesTaught],
      teachingLevel: [...professionalDraft.teachingLevel],
      academicRole: [...professionalDraft.academicRole],
      researchArea: [...professionalDraft.researchArea],
      researchProjects: [...professionalDraft.researchProjects],
      studentGuidance: [...professionalDraft.studentGuidance],
    });
    setSkillsInfo({
      ...skillsDraft,
      coreSkills: [...skillsDraft.coreSkills],
      digitalSkills: [...skillsDraft.digitalSkills],
      fdpsTraining: [...skillsDraft.fdpsTraining],
      naacIqacInvolvement: [...skillsDraft.naacIqacInvolvement],
      nbaObeInvolvement: [...skillsDraft.nbaObeInvolvement],
      studentDevelopment: [...skillsDraft.studentDevelopment],
      developmentAreas: [...skillsDraft.developmentAreas],
    });

    setEditingSection(null);
    window.location.assign("/sign_in");
  };

  const handleProfileImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      showFlowPopup("Please select a valid image file.", "profile");
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
    registrationFormComplete,
    professionalFormComplete,
    skillsFormComplete,
    documentsFormComplete,
    confirmationStepComplete,
  ];

  const completedItemCount = completionItems.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedItemCount / completionItems.length) * 100
  );

  useEffect(() => {
    document.title = "University Faculty Profile | Neuro LXP";
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
                <h1>University Faculty Profile</h1>
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
                  <div className="institutionRole">College Faculty</div>

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
                    {professionalFormComplete ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Academic &amp; Professional Profile</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {documentsFormComplete ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Documents</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {registrationFormComplete ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Registration</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {skillsFormComplete ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Skills &amp; Development</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {confirmationStepComplete ? (
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

            {flowPopup && flowPopupSection === "profile" && (
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

            <section className="institutionInformationCard">
              <SectionHeader
                title="Registration Data"
                iconSrc={images.registration}
                iconTone="pink"
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
                    label="Faculty ID"
                    value={registrationDraft.facultyId}
                    locked
                  />
                  <EditField
                    label="Employee Code"
                    value={registrationDraft.employeeCode}
                    locked
                  />
                  <EditField
                    label="Full Name"
                    value={registrationDraft.fullName}
                    locked
                  />

                  <EditField
                    label="Email"
                    type="email"
                    value={registrationDraft.email}
                    placeholder="Enter Email"
                    visualIcon="edit"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        email: value,
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
                    label="Department"
                    value={registrationDraft.department}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Computer Science & Engineering",
                      "ECE",
                      "EEE",
                      "Mechanical",
                      "Civil",
                      "MBA",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        department: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Designation"
                    value={registrationDraft.designation}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Professor",
                      "Associate Professor",
                      "Assistant Professor",
                      "Lecturer",
                      "Senior Lecturer",
                      "Visiting Faculty",
                      "Adjunct Faculty",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        designation: value,
                      }))
                    }
                  />
                  <SelectField
                    label="Faculty Type"
                    value={registrationDraft.facultyType}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Full-Time Faculty",
                      "Part-Time Faculty",
                      "Visiting Faculty",
                      "Adjunct Faculty",
                      "Guest Faculty",
                      "Contract Faculty",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        facultyType: value,
                      }))
                    }
                  />
                  <EditField
                    label="Date of Joining"
                    value={registrationDraft.dateOfJoining}
                    locked
                  />

                  <SelectField
                    label="Highest Qualification"
                    value={registrationDraft.highestQualification}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Ph.D.",
                      "M.Phil.",
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
                  <MultiSelectField
                    label="Specialization"
                    value={registrationDraft.specialization}
                    options={[
                      "AI & ML",
                      "Data Science",
                      "Cybersecurity",
                      "Cloud Computing",
                      "Software Engineering",
                      "IoT",
                      "Computer Networks",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        specialization: value,
                      }))
                    }
                  />
                  <SelectField
                    label="Teaching Experience"
                    value={registrationDraft.teachingExperience}
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
                        teachingExperience: value,
                      }))
                    }
                  />

                  <SelectField
                    label="Industry Experience"
                    value={registrationDraft.industryExperience}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "No Experience",
                      "1–2 years",
                      "3–5 years",
                      "6–10 years",
                      "10+ years",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        industryExperience: value,
                      }))
                    }
                  />
                  <MultiSelectField
                    label="Courses Handled"
                    value={registrationDraft.coursesHandled}
                    options={[
                      "Python",
                      "Machine Learning",
                      "DBMS",
                      "Data Structures",
                      "Web Development",
                      "AI",
                    ]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        coursesHandled: value,
                      }))
                    }
                  />
                  <SelectField
                    label="Reporting Authority"
                    value={registrationDraft.reportingAuthority}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "HOD",
                      "Dean",
                      "Principal",
                      "Academic Director",
                      "Program Head",
                      "Department Coordinator",
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
                  <DisplayField label="Faculty ID" value={registrationInfo.facultyId} />
                  <DisplayField label="Employee Code" value={registrationInfo.employeeCode} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />

                  <DisplayField label="Email" value={registrationInfo.email} placeholder="Enter Email" />
                  <DisplayField label="Alternate Email" value={registrationInfo.alternateEmail} placeholder="Enter Alternate Email" />
                  <DisplayField label="Mobile Number" value={registrationInfo.mobileNumber} placeholder="Enter Mobile Number" />

                  <DisplayField label="Alternate Phone" value={registrationInfo.alternatePhone} placeholder="Enter Alternate Phone" />
                  <DisplayField label="Gender" value={registrationInfo.gender} placeholder="Select" />
                  <DisplayField label="Department" value={registrationInfo.department} placeholder="Select" />

                  <DisplayField label="Designation" value={registrationInfo.designation} placeholder="Select" />
                  <DisplayField label="Faculty Type" value={registrationInfo.facultyType} placeholder="Select" />
                  <DisplayField label="Date of Joining" value={registrationInfo.dateOfJoining} />

                  <DisplayField label="Highest Qualification" value={registrationInfo.highestQualification} placeholder="Select" />
                  <DisplayField label="Specialization" value={registrationInfo.specialization.join(", ")} placeholder="Select" />
                  <DisplayField label="Teaching Experience" value={registrationInfo.teachingExperience} placeholder="Select" />

                  <DisplayField label="Industry Experience" value={registrationInfo.industryExperience} placeholder="Select" />
                  <DisplayField label="Courses Handled" value={registrationInfo.coursesHandled.join(", ")} placeholder="Select" />
                  <DisplayField label="Reporting Authority" value={registrationInfo.reportingAuthority} placeholder="Select" />

                  <DisplayField label="Status" value={registrationInfo.status} />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Academic Profile"
                iconSrc={images.academicProfessional}
                iconTone="green"
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
                <div className="institutionSectionFlowPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} className="institutionInlinePopupIcon" />
                  <span>{flowPopup}</span>
                </div>
              )}

              {editingSection === "professional" ? (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <SelectField
                    label="Academic Division"
                    value={professionalDraft.academicDivision}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Faculty of Engineering",
                      "Faculty of Science",
                      "Faculty of Management",
                      "Faculty of Commerce",
                      "Faculty of Arts",
                      "Faculty of Education",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, academicDivision: value }))
                    }
                  />
                  <SelectField
                    label="Primary Domain"
                    value={professionalDraft.primaryDomain}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Computer Science",
                      "Information Technology",
                      "Data Science & AI",
                      "Electronics",
                      "Mechanical Engineering",
                      "Civil Engineering",
                      "Management",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, primaryDomain: value }))
                    }
                  />
                  <MultiSelectField
                    label="Areas of Expertise"
                    value={professionalDraft.areasOfExpertise}
                    options={[
                      "AI & ML",
                      "Data Science",
                      "Programming",
                      "Cloud Computing",
                      "Cybersecurity",
                      "IoT",
                      "Software Engineering",
                      "Research",
                      "Curriculum Development",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, areasOfExpertise: value }))
                    }
                  />

                  <MultiSelectField
                    label="Courses Taught"
                    value={professionalDraft.coursesTaught}
                    options={[
                      "Python",
                      "Machine Learning",
                      "DBMS",
                      "Operating Systems",
                      "Computer Networks",
                      "Data Structures",
                      "AI",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, coursesTaught: value }))
                    }
                  />
                  <MultiSelectField
                    label="Teaching Level"
                    value={professionalDraft.teachingLevel}
                    options={["Foundation", "Certificate", "Diploma", "UG", "PG", "Doctoral"]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, teachingLevel: value }))
                    }
                  />
                  <MultiSelectField
                    label="Academic Role"
                    value={professionalDraft.academicRole}
                    options={[
                      "Course Coordinator",
                      "Program Coordinator",
                      "Class Coordinator",
                      "Lab Coordinator",
                      "Project Guide",
                      "Mentor",
                      "Academic Advisor",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, academicRole: value }))
                    }
                  />

                  <MultiSelectField
                    label="Research Area"
                    value={professionalDraft.researchArea}
                    options={[
                      "AI & ML",
                      "Data Science",
                      "NLP",
                      "Computer Vision",
                      "Cybersecurity",
                      "IoT",
                      "Cloud Computing",
                      "Educational Technology",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, researchArea: value }))
                    }
                  />
                  <EditField
                    label="Publications"
                    value={professionalDraft.publications}
                    placeholder="Enter Publications"
                    visualIcon="edit"
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, publications: value }))
                    }
                  />
                  <MultiSelectField
                    label="Research Projects"
                    value={professionalDraft.researchProjects}
                    options={[
                      "AI-Based Learning Project",
                      "Smart Campus Project",
                      "NLP Research Project",
                      "Industry Research Project",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, researchProjects: value }))
                    }
                  />

                  <MultiSelectField
                    label="Student Guidance"
                    value={professionalDraft.studentGuidance}
                    options={[
                      "UG Projects",
                      "PG Projects",
                      "Ph.D. Scholars",
                      "Internships",
                      "Research Projects",
                      "Career Guidance",
                    ]}
                    onChange={(value) =>
                      setProfessionalDraft((current) => ({ ...current, studentGuidance: value }))
                    }
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <DisplayField label="Academic Division" value={professionalInfo.academicDivision} placeholder="Select" />
                  <DisplayField label="Primary Domain" value={professionalInfo.primaryDomain} placeholder="Select" />
                  <DisplayField label="Areas of Expertise" value={professionalInfo.areasOfExpertise.join(", ")} placeholder="Select" />

                  <DisplayField label="Courses Taught" value={professionalInfo.coursesTaught.join(", ")} placeholder="Select" />
                  <DisplayField label="Teaching Level" value={professionalInfo.teachingLevel.join(", ")} placeholder="Select" />
                  <DisplayField label="Academic Role" value={professionalInfo.academicRole.join(", ")} placeholder="Select" />

                  <DisplayField label="Research Area" value={professionalInfo.researchArea.join(", ")} placeholder="Select" />
                  <DisplayField label="Publications" value={professionalInfo.publications} placeholder="Enter Publications" />
                  <DisplayField label="Research Projects" value={professionalInfo.researchProjects.join(", ")} placeholder="Select" />

                  <DisplayField label="Student Guidance" value={professionalInfo.studentGuidance.join(", ")} placeholder="Select" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Skills & Growth"
                iconSrc={images.skillsDevelopment}
                iconTone="blue"
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
                    options={[
                      "Communication",
                      "Teaching",
                      "Research",
                      "Mentoring",
                      "Leadership",
                      "Problem Solving",
                      "Curriculum Development",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, coreSkills: value }))
                    }
                  />
                  <MultiSelectField
                    label="Digital Skills"
                    value={skillsDraft.digitalSkills}
                    options={[
                      "Python",
                      "SQL",
                      "MATLAB",
                      "LMS",
                      "Power BI",
                      "Tableau",
                      "Git",
                      "Cloud Platforms",
                      "AI Tools",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, digitalSkills: value }))
                    }
                  />
                  <MultiSelectField
                    label="FDPs / Training"
                    value={skillsDraft.fdpsTraining}
                    options={[
                      "AI & ML",
                      "Outcome-Based Education",
                      "Teaching Methodology",
                      "Assessment & Evaluation",
                      "Research Methodology",
                      "Digital Pedagogy",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, fdpsTraining: value }))
                    }
                  />

                  <MultiSelectField
                    label="NAAC / IQAC Involvement"
                    value={skillsDraft.naacIqacInvolvement}
                    options={[
                      "IQAC Member",
                      "NAAC Coordinator",
                      "SSR Preparation",
                      "Documentation",
                      "Criterion Coordinator",
                      "Audit Support",
                      "Not Involved",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, naacIqacInvolvement: value }))
                    }
                  />
                  <MultiSelectField
                    label="NBA / OBE Involvement"
                    value={skillsDraft.nbaObeInvolvement}
                    options={[
                      "NBA Coordinator",
                      "OBE Implementation",
                      "CO-PO Mapping",
                      "Attainment Analysis",
                      "Documentation",
                      "Audit Support",
                      "Not Involved",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, nbaObeInvolvement: value }))
                    }
                  />
                  <MultiSelectField
                    label="Student Development"
                    value={skillsDraft.studentDevelopment}
                    options={[
                      "Mentoring",
                      "Career Guidance",
                      "Skill Development",
                      "Clubs & Activities",
                      "Entrepreneurship",
                      "Placement Support",
                      "Student Projects",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, studentDevelopment: value }))
                    }
                  />

                  <MultiSelectField
                    label="Development Areas"
                    value={skillsDraft.developmentAreas}
                    options={[
                      "Leadership",
                      "AI & ML",
                      "Data Analytics",
                      "Research Methodology",
                      "Academic Administration",
                      "Industry Collaboration",
                      "Digital Teaching",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, developmentAreas: value }))
                    }
                  />
                  <SelectField
                    label="Career Goals"
                    value={skillsDraft.careerGoals}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Senior Faculty",
                      "Professor",
                      "HOD",
                      "Dean",
                      "Academic Coordinator",
                      "Research Lead",
                      "Program Head",
                      "Academic Director",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setSkillsDraft((current) => ({ ...current, careerGoals: value }))
                    }
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <DisplayField label="Core Skills" value={skillsInfo.coreSkills.join(", ")} placeholder="Select" />
                  <DisplayField label="Digital Skills" value={skillsInfo.digitalSkills.join(", ")} placeholder="Select" />
                  <DisplayField label="FDPs / Training" value={skillsInfo.fdpsTraining.join(", ")} placeholder="Select" />

                  <DisplayField label="NAAC / IQAC Involvement" value={skillsInfo.naacIqacInvolvement.join(", ")} placeholder="Select" />
                  <DisplayField label="NBA / OBE Involvement" value={skillsInfo.nbaObeInvolvement.join(", ")} placeholder="Select" />
                  <DisplayField label="Student Development" value={skillsInfo.studentDevelopment.join(", ")} placeholder="Select" />

                  <DisplayField label="Development Areas" value={skillsInfo.developmentAreas.join(", ")} placeholder="Select" />
                  <DisplayField label="Career Goals" value={skillsInfo.careerGoals} placeholder="Select" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard institutionDocumentsCard">
              <SectionHeader
                title="Documents"
                iconSrc={images.documents}
                iconTone="orange"
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
                                  ? ""
                                  : "institutionChooseFileButtonEmpty"
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
                                ? ""
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

              {flowPopup && flowPopupSection === "confirmation" && (
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
                          "Please complete Profile Photo first.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !registrationFormComplete) {
                        showFlowPopup(
                          "Please complete Registration Data first.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !professionalFormComplete) {
                        showFlowPopup(
                          "Please complete Academic & Professional Profile first.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !skillsFormComplete) {
                        showFlowPopup(
                          "Please complete Skills & Development first.",
                          "confirmation"
                        );
                        return;
                      }

                      if (event.target.checked && !documentsFormComplete) {
                        showFlowPopup(
                          "Please complete Documents first.",
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
