"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./fcorporate.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
const images = {
  profile: "/assets/funiversityimages/profile.png",

  camera: "/assets/fcorporateicons/camera.svg",
  edit: "/assets/fcorporateicons/edit.svg",
  editBig: "/assets/fcorporateicons/editbig.svg",
  lock: "/assets/fcorporateicons/lock.svg",
  save: "/assets/fcorporateicons/tick.svg",
  cancel: "/assets/fcorporateicons/cancel.svg",
  arrowDown: "/assets/fcorporateicons/arrow-down.svg",
  completed: "/assets/fcorporateicons/checkmark.svg",
  upload: "/assets/fcorporateicons/upload.svg",
  clap: "/assets/fcorporateicons/clap.svg",
  sad: "/assets/fcorporateicons/sad.svg",

  registration: "/assets/fcorporateicons/file-edit.svg",
  academicProfessional: "/assets/fcorporateicons/briefcase.svg",
  skillsDevelopment: "/assets/fcorporateicons/target.svg",
  documents: "/assets/fcorporateicons/file.svg",
  confirmation: "/assets/fcorporateicons/checkmark-circlewhite.svg",
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
  onBlur?: (value: string) => void;
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
  onBlur,
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
            onBlur={(event) => onBlur?.(event.target.value)}
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

        {!editing && !popupType ? (
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
    trainerId: "TRN-00125",
    employeeCode: "EMP1234",
    fullName: "Antony Thomas",
    email: "",
    alternateEmail: "",
    mobileNumber: "",
    alternatePhone: "",
    gender: "",
    businessUnit: "",
    department: "",
    designation: "",
    dateOfJoining: "17-05-2004",
    trainingDomain: "",
    certificationName: [] as string[],
    totalExperience: "",
    trainingExperience: "",
    status: "Active",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    trainerType: "",
    experience: "",
    specialization: [] as string[],
    primaryDomain: "",
    keyExpertise: [] as string[],
    trainingTopics: [] as string[],
    skillLevel: "",
    toolsTechnologies: [] as string[],
    trainingMethod: [] as string[],
    trainingLanguages: [] as string[],
    contentDevelopment: "",
    assessmentCreation: "",
    mentoringCoaching: "",
  });

  const [skillsInfo, setSkillsInfo] = useState({
    coreSkills: [] as string[],
    skillsToDevelop: [] as string[],
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

  const startSectionEdit = (section: SectionName) => {
    setSectionPopup(null);

    if (section === "registration" && !profilePhotoCompleted) {
      showFlowPopup(
        "Please Complete Profile Photo",
        "registration"
      );
      return;
    }

    if (section === "professional" && !registrationCompleted) {
      showFlowPopup(
        "Please Complete Registration Data",
        "professional"
      );
      return;
    }

    if (section === "skills" && !professionalProfileCompleted) {
      showFlowPopup(
        "Please Complete Trainer Profile",
        "skills"
      );
      return;
    }

    if (section === "documents" && !skillsDevelopmentCompleted) {
      showFlowPopup(
        "Please Complete Skills & Growth",
        "documents"
      );
      return;
    }

    if (section === "registration") {
      setRegistrationDraft({ ...registrationInfo, certificationName: [...registrationInfo.certificationName] });
    }

    if (section === "professional") {
      setProfessionalDraft({
        ...professionalInfo,
        specialization: [...professionalInfo.specialization],
        keyExpertise: [...professionalInfo.keyExpertise],
        trainingTopics: [...professionalInfo.trainingTopics],
        toolsTechnologies: [...professionalInfo.toolsTechnologies],
        trainingMethod: [...professionalInfo.trainingMethod],
        trainingLanguages: [...professionalInfo.trainingLanguages],
      });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        coreSkills: [...skillsInfo.coreSkills],
        skillsToDevelop: [...skillsInfo.skillsToDevelop],
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

  const isValidPhoneNumber = (value: string) =>
    /^\d{10}$/.test(value.replace(/\D/g, ""));

  const isValidEmail = (value: string) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const clearSectionError = (section: SectionName, message?: string) => {
    setSectionPopup((current) => {
      if (
        current?.section !== section ||
        current.type !== "error" ||
        (message && current.message !== message)
      ) {
        return current;
      }

      return null;
    });
  };

  /* Live field validation popup:
     appears immediately while the value is invalid and disappears
     as soon as the user corrects it. */
  const showLiveSectionError = (section: SectionName, message: string) => {
    setSectionPopup({
      section,
      type: "error",
      message,
    });
  };

  /* Automatic completion:
     each top checkmark appears only when the current step is fully
     completed and the previous step is already complete. */
  useEffect(() => {
    setRegistrationInfo({
      ...registrationDraft,
      email: registrationDraft.email.trim(),
      alternateEmail: registrationDraft.alternateEmail.trim(),
      certificationName: [...registrationDraft.certificationName],
    });

    const email = registrationDraft.email.trim();
    const alternateEmail = registrationDraft.alternateEmail.trim();

    const registrationFormComplete = Boolean(
      isValidEmail(email) &&
      isValidPhoneNumber(registrationDraft.mobileNumber) &&
      (!alternateEmail || isValidEmail(alternateEmail)) &&
      (!registrationDraft.alternatePhone ||
        isValidPhoneNumber(registrationDraft.alternatePhone)) &&
      registrationDraft.gender &&
      registrationDraft.businessUnit &&
      registrationDraft.department &&
      registrationDraft.designation &&
      registrationDraft.trainingDomain &&
      registrationDraft.certificationName.length > 0 &&
      registrationDraft.totalExperience &&
      registrationDraft.trainingExperience
    );

    setRegistrationCompleted(
      Boolean(profilePhotoCompleted && registrationFormComplete)
    );
  }, [registrationDraft, profilePhotoCompleted]);

  useEffect(() => {
    setProfessionalInfo({
      ...professionalDraft,
      specialization: [...professionalDraft.specialization],
      keyExpertise: [...professionalDraft.keyExpertise],
      trainingTopics: [...professionalDraft.trainingTopics],
      toolsTechnologies: [...professionalDraft.toolsTechnologies],
      trainingMethod: [...professionalDraft.trainingMethod],
      trainingLanguages: [...professionalDraft.trainingLanguages],
    });

    const professionalFormComplete = Boolean(
      professionalDraft.trainerType &&
      professionalDraft.experience &&
      professionalDraft.specialization.length > 0 &&
      professionalDraft.primaryDomain &&
      professionalDraft.keyExpertise.length > 0 &&
      professionalDraft.trainingTopics.length > 0 &&
      professionalDraft.skillLevel &&
      professionalDraft.toolsTechnologies.length > 0 &&
      professionalDraft.trainingMethod.length > 0 &&
      professionalDraft.trainingLanguages.length > 0 &&
      professionalDraft.contentDevelopment &&
      professionalDraft.assessmentCreation &&
      professionalDraft.mentoringCoaching
    );

    setProfessionalProfileCompleted(
      Boolean(registrationCompleted && professionalFormComplete)
    );
  }, [professionalDraft, registrationCompleted]);

  useEffect(() => {
    setSkillsInfo({
      ...skillsDraft,
      coreSkills: [...skillsDraft.coreSkills],
      skillsToDevelop: [...skillsDraft.skillsToDevelop],
      learningInterests: [...skillsDraft.learningInterests],
    });

    const skillsFormComplete = Boolean(
      skillsDraft.coreSkills.length > 0 &&
      skillsDraft.skillsToDevelop.length > 0 &&
      skillsDraft.learningInterests.length > 0 &&
      skillsDraft.careerGoals
    );

    setSkillsDevelopmentCompleted(
      Boolean(professionalProfileCompleted && skillsFormComplete)
    );
  }, [skillsDraft, professionalProfileCompleted]);

  useEffect(() => {
    const documentsFormComplete = Boolean(
      governmentIdDocumentType.trim() &&
      documentFiles["Government ID Proof"] &&
      !Object.values(documentUploadErrors).some((message) => Boolean(message))
    );

    setDocumentsCompleted(
      Boolean(skillsDevelopmentCompleted && documentsFormComplete)
    );
  }, [
    governmentIdDocumentType,
    documentFiles,
    documentUploadErrors,
    skillsDevelopmentCompleted,
  ]);

  useEffect(() => {
    if (!documentsCompleted && confirmation) {
      setConfirmation(false);
    }
  }, [documentsCompleted, confirmation]);

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

  const saveSection = (section: SectionName) => {
    if (section === "registration" && !profilePhotoCompleted) {
      showFlowPopup(
        "Please complete Profile Photo",
        "registration"
      );
      return;
    }

    if (section === "professional" && !registrationCompleted) {
      showFlowPopup(
        "Please complete Registration Data",
        "professional"
      );
      return;
    }

    if (section === "skills" && !professionalProfileCompleted) {
      showFlowPopup(
        "Please complete Trainer Profile",
        "skills"
      );
      return;
    }

    if (section === "documents" && !skillsDevelopmentCompleted) {
      showFlowPopup(
        "Please complete Skills & Growth",
        "documents"
      );
      return;
    }

    if (section === "registration") {
      const email = registrationDraft.email.trim();
      const alternateEmail = registrationDraft.alternateEmail.trim();

      if (!isValidEmail(email)) {
        showSectionError("registration", "Enter a valid Email");
        return;
      }

      if (!isValidPhoneNumber(registrationDraft.mobileNumber)) {
        showSectionError(
          "registration",
          "Mobile Number must be 10 digits"
        );
        return;
      }

      if (alternateEmail && !isValidEmail(alternateEmail)) {
        showSectionError("registration", "Enter a valid Alternate Email");
        return;
      }

      if (
        registrationDraft.alternatePhone &&
        !isValidPhoneNumber(registrationDraft.alternatePhone)
      ) {
        showSectionError(
          "registration",
          "Alternate Phone must be 10 digits"
        );
        return;
      }

      const requiredRegistration =
        registrationDraft.gender &&
        registrationDraft.businessUnit &&
        registrationDraft.department &&
        registrationDraft.designation &&
        registrationDraft.trainingDomain &&
        registrationDraft.certificationName.length > 0 &&
        registrationDraft.totalExperience &&
        registrationDraft.trainingExperience;

      if (!requiredRegistration) {
        showSectionError(
          "registration",
          "Please complete all required Registration Data fields."
        );
        return;
      }

      setRegistrationInfo({
        ...registrationDraft,
        email,
        alternateEmail,
        certificationName: [...registrationDraft.certificationName],
      });
      setRegistrationCompleted(true);
    }

    if (section === "professional") {
      const professionalComplete =
        professionalDraft.trainerType &&
        professionalDraft.experience &&
        professionalDraft.specialization.length > 0 &&
        professionalDraft.primaryDomain &&
        professionalDraft.keyExpertise.length > 0 &&
        professionalDraft.trainingTopics.length > 0 &&
        professionalDraft.skillLevel &&
        professionalDraft.toolsTechnologies.length > 0 &&
        professionalDraft.trainingMethod.length > 0 &&
        professionalDraft.trainingLanguages.length > 0 &&
        professionalDraft.contentDevelopment &&
        professionalDraft.assessmentCreation &&
        professionalDraft.mentoringCoaching;

      if (!professionalComplete) {
        showSectionError(
          "professional",
          "Please complete the required Trainer Profile fields."
        );
        return;
      }

      setProfessionalInfo({
        ...professionalDraft,
        specialization: [...professionalDraft.specialization],
        keyExpertise: [...professionalDraft.keyExpertise],
        trainingTopics: [...professionalDraft.trainingTopics],
        toolsTechnologies: [...professionalDraft.toolsTechnologies],
        trainingMethod: [...professionalDraft.trainingMethod],
        trainingLanguages: [...professionalDraft.trainingLanguages],
      });
      setProfessionalProfileCompleted(true);
    }

    if (section === "skills") {
      const skillsComplete =
        skillsDraft.coreSkills.length > 0 &&
        skillsDraft.skillsToDevelop.length > 0 &&
        skillsDraft.learningInterests.length > 0 &&
        skillsDraft.careerGoals;

      if (!skillsComplete) {
        showSectionError(
          "skills",
          "Please complete the required Skills & Growth fields."
        );
        return;
      }

      setSkillsInfo({
        ...skillsDraft,
        coreSkills: [...skillsDraft.coreSkills],
        skillsToDevelop: [...skillsDraft.skillsToDevelop],
        learningInterests: [...skillsDraft.learningInterests],
      });
      setSkillsDevelopmentCompleted(true);
    }

    if (section === "documents") {
      const hasGovernmentId =
        governmentIdDocumentType.trim() !== "" &&
        documentFiles["Government ID Proof"] !== null;

      if (!hasGovernmentId) {
        showSectionError(
          "documents",
          "Please select Document Type and upload Government ID Proof before saving."
        );
        return;
      }

      setDocumentsCompleted(true);
      documentFilesBeforeEditRef.current = null;
      governmentIdDocumentTypeBeforeEditRef.current = null;
      setDocumentUploadErrors({});
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
    if (section === "registration") {
      setRegistrationDraft({ ...registrationInfo, certificationName: [...registrationInfo.certificationName] });
    }

    if (section === "professional") {
      setProfessionalDraft({
        ...professionalInfo,
        specialization: [...professionalInfo.specialization],
        keyExpertise: [...professionalInfo.keyExpertise],
        trainingTopics: [...professionalInfo.trainingTopics],
        toolsTechnologies: [...professionalInfo.toolsTechnologies],
        trainingMethod: [...professionalInfo.trainingMethod],
        trainingLanguages: [...professionalInfo.trainingLanguages],
      });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        coreSkills: [...skillsInfo.coreSkills],
        skillsToDevelop: [...skillsInfo.skillsToDevelop],
        learningInterests: [...skillsInfo.learningInterests],
      });
    }

    if (section === "documents") {
      if (documentFilesBeforeEditRef.current) {
        setDocumentFiles({ ...documentFilesBeforeEditRef.current });
      }

      if (governmentIdDocumentTypeBeforeEditRef.current !== null) {
        setGovernmentIdDocumentType(
          governmentIdDocumentTypeBeforeEditRef.current
        );
      }

      documentFilesBeforeEditRef.current = null;
      governmentIdDocumentTypeBeforeEditRef.current = null;
      setDocumentUploadErrors({});
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
    const nextIncompleteStep =
      !profilePhotoCompleted
        ? "Profile Photo"
        : !registrationCompleted
          ? "Registration Data"
          : !professionalProfileCompleted
            ? "Trainer Profile"
            : !skillsDevelopmentCompleted
              ? "Skills & Growth"
              : !documentsCompleted
                ? "Documents"
                : !confirmation
                  ? "Confirmation"
                  : null;

    if (nextIncompleteStep) {
      const targetSection =
        nextIncompleteStep === "Profile Photo"
          ? "profile"
          : nextIncompleteStep === "Registration Data"
            ? "registration"
            : nextIncompleteStep === "Trainer Profile"
              ? "professional"
              : nextIncompleteStep === "Skills & Growth"
                ? "skills"
                : nextIncompleteStep === "Documents"
                  ? "documents"
                  : "confirmation";

      showFlowPopup(
        `Please complete ${nextIncompleteStep} before saving the profile.`,
        targetSection
      );
      return;
    }

    setRegistrationInfo({
      ...registrationDraft,
      email: registrationDraft.email.trim(),
      alternateEmail: registrationDraft.alternateEmail.trim(),
      certificationName: [...registrationDraft.certificationName],
    });

    setProfessionalInfo({
      ...professionalDraft,
      specialization: [...professionalDraft.specialization],
      keyExpertise: [...professionalDraft.keyExpertise],
      trainingTopics: [...professionalDraft.trainingTopics],
      toolsTechnologies: [...professionalDraft.toolsTechnologies],
      trainingMethod: [...professionalDraft.trainingMethod],
      trainingLanguages: [...professionalDraft.trainingLanguages],
    });

    setSkillsInfo({
      ...skillsDraft,
      coreSkills: [...skillsDraft.coreSkills],
      skillsToDevelop: [...skillsDraft.skillsToDevelop],
      learningInterests: [...skillsDraft.learningInterests],
    });

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
    const initialRegistration = {
      trainerId: "TRN-00125",
      employeeCode: "EMP1234",
      fullName: "Antony Thomas",
      email: "",
      alternateEmail: "",
      mobileNumber: "",
      alternatePhone: "",
      gender: "",
      businessUnit: "",
      department: "",
      designation: "",
      dateOfJoining: "17-05-2004",
      trainingDomain: "",
      certificationName: [] as string[],
      totalExperience: "",
      trainingExperience: "",
      status: "Active",
    };

    const initialProfessional = {
      trainerType: "",
      experience: "",
      specialization: [] as string[],
      primaryDomain: "",
      keyExpertise: [] as string[],
      trainingTopics: [] as string[],
      skillLevel: "",
      toolsTechnologies: [] as string[],
      trainingMethod: [] as string[],
      trainingLanguages: [] as string[],
      contentDevelopment: "",
      assessmentCreation: "",
      mentoringCoaching: "",
    };

    const initialSkills = {
      coreSkills: [] as string[],
      skillsToDevelop: [] as string[],
      learningInterests: [] as string[],
      careerGoals: "",
    };

    setProfileImage(null);
    setProfilePhotoCompleted(false);

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

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }

    document
      .querySelectorAll<HTMLInputElement>(".institutionNativeFileInput")
      .forEach((input) => {
        input.value = "";
      });

    try {
      localStorage.removeItem("facultyCorporateProfileImage");
      window.dispatchEvent(new Event("profileImageUpdated"));
    } catch {
      // Keep the form reset even if browser storage is unavailable.
    }
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
    document.title = "Corporate Faculty Profile | Neuro LXP";
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
                <h1>Corporate Faculty Profile</h1>
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
                  <div className="institutionRole">Corporate Faculty</div>

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
                    <span>Registration</span>
                  </div>

                  <div className="institutionCompletionStep">
                    {skillsDevelopmentCompleted ? (
                      <span className="institutionCompletedCircle institutionProfileStepCheck">
                        <span className="institutionProfileStepCheckMark" />
                      </span>
                    ) : (
                      <span className="institutionEmptyCircle" />
                    )}
                    <span>Skills and Growth</span>
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
                <div className="institutionSectionFlowPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} className="institutionInlinePopupIcon" />
                  <span>{flowPopup}</span>
                </div>
              )}

              {editingSection === "registration" ? (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <EditField label="Trainer ID" value={registrationDraft.trainerId} locked />
                  <EditField label="Employee Code" value={registrationDraft.employeeCode} locked />
                  <EditField label="Full Name" value={registrationDraft.fullName} locked />

                  <EditField
                    label="Email"
                    type="email"
                    value={registrationDraft.email}
                    placeholder="Enter Email"
                    visualIcon="edit"
                    onChange={(value) => {
                      setRegistrationDraft((current) => ({
                        ...current,
                        email: value,
                      }));

                      const trimmedValue = value.trim();

                      if (!trimmedValue) {
                        clearSectionError("registration", "Enter a valid Email");
                      } else if (!isValidEmail(trimmedValue)) {
                        showLiveSectionError(
                          "registration",
                          "Enter a valid Email"
                        );
                      } else {
                        clearSectionError("registration", "Enter a valid Email");
                      }
                    }}
                    onBlur={(value) => {
                      if (!isValidEmail(value.trim())) {
                        showLiveSectionError(
                          "registration",
                          "Enter a valid Email"
                        );
                      }
                    }}
                  />

                  <EditField
                    label="Alternate Email"
                    type="email"
                    value={registrationDraft.alternateEmail}
                    placeholder="Enter Alternate Email"
                    visualIcon="edit"
                    onChange={(value) => {
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternateEmail: value,
                      }));

                      const trimmedValue = value.trim();

                      if (!trimmedValue) {
                        clearSectionError(
                          "registration",
                          "Enter a valid Alternate Email"
                        );
                      } else if (!isValidEmail(trimmedValue)) {
                        showLiveSectionError(
                          "registration",
                          "Enter a valid Alternate Email"
                        );
                      } else {
                        clearSectionError(
                          "registration",
                          "Enter a valid Alternate Email"
                        );
                      }
                    }}
                    onBlur={(value) => {
                      if (value.trim() && !isValidEmail(value.trim())) {
                        showLiveSectionError(
                          "registration",
                          "Enter a valid Alternate Email"
                        );
                      }
                    }}
                  />

                  <EditField
                    label="Mobile Number"
                    type="tel"
                    value={registrationDraft.mobileNumber}
                    placeholder="Enter Mobile Number"
                    visualIcon="edit"
                    onChange={(value) => {
                      const digits = value.replace(/\D/g, "").slice(0, 10);

                      setRegistrationDraft((current) => ({
                        ...current,
                        mobileNumber: digits,
                      }));

                      if (!digits) {
                        clearSectionError(
                          "registration",
                          "Mobile Number must be 10 digits"
                        );
                      } else if (!isValidPhoneNumber(digits)) {
                        showLiveSectionError(
                          "registration",
                          "Mobile Number must be 10 digits"
                        );
                      } else {
                        clearSectionError(
                          "registration",
                          "Mobile Number must be 10 digits"
                        );
                      }
                    }}
                    onBlur={(value) => {
                      if (!isValidPhoneNumber(value)) {
                        showLiveSectionError(
                          "registration",
                          "Mobile Number must be 10 digits"
                        );
                      }
                    }}
                  />

                  <EditField
                    label="Alternate Phone"
                    type="tel"
                    value={registrationDraft.alternatePhone}
                    placeholder="Enter Alternate Phone"
                    visualIcon="edit"
                    onChange={(value) => {
                      const digits = value.replace(/\D/g, "").slice(0, 10);

                      setRegistrationDraft((current) => ({
                        ...current,
                        alternatePhone: digits,
                      }));

                      if (!digits) {
                        clearSectionError(
                          "registration",
                          "Alternate Phone must be 10 digits"
                        );
                      } else if (!isValidPhoneNumber(digits)) {
                        showLiveSectionError(
                          "registration",
                          "Alternate Phone must be 10 digits"
                        );
                      } else {
                        clearSectionError(
                          "registration",
                          "Alternate Phone must be 10 digits"
                        );
                      }
                    }}
                    onBlur={(value) => {
                      if (value && !isValidPhoneNumber(value)) {
                        showLiveSectionError(
                          "registration",
                          "Alternate Phone must be 10 digits"
                        );
                      }
                    }}
                  />
                  <SelectField label="Gender" value={registrationDraft.gender} placeholder="Select" menuStyle="radio"
                    options={["Male", "Female", "Other", "Prefer not to say"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, gender: value }))} />
                  <SelectField label="Business Unit" value={registrationDraft.businessUnit} placeholder="Select" menuStyle="radio"
                    options={["Learning & Development", "Corporate Training", "Operations", "Human Resources", "Technology", "Sales & Marketing", "Other"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, businessUnit: value }))} />

                  <SelectField label="Department" value={registrationDraft.department} placeholder="Select" menuStyle="radio"
                    options={["Corporate Training", "L&D", "Training Operations", "HR", "Technical Training", "Soft Skills Training", "Other"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, department: value }))} />
                  <SelectField label="Designation" value={registrationDraft.designation} placeholder="Select" menuStyle="radio"
                    options={["Trainer", "Senior Trainer", "Lead Trainer", "Master Trainer", "Training Manager", "L&D Manager", "Training Consultant"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, designation: value }))} />
                  <EditField label="Date of Joining" value={registrationDraft.dateOfJoining} locked />

                  <SelectField label="Training Domain" value={registrationDraft.trainingDomain} placeholder="Select" menuStyle="radio"
                    options={["Artificial Intelligence", "Data Science", "Software Development", "Cloud Computing", "Cybersecurity", "Business Skills", "Leadership", "Soft Skills", "Digital Skills"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, trainingDomain: value }))} />
                  <MultiSelectField label="Certification Name" value={registrationDraft.certificationName} placeholder="Select"
                    options={["Google ML Certificate", "AWS Certified", "Microsoft Certified", "PMP", "Scrum Master", "Other"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, certificationName: value }))} />
                  <SelectField label="Total Experience" value={registrationDraft.totalExperience} placeholder="Select" menuStyle="radio"
                    options={["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16–20 years", "20+ years"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, totalExperience: value }))} />

                  <SelectField label="Training Experience" value={registrationDraft.trainingExperience} placeholder="Select" menuStyle="radio"
                    options={["0–1 year", "2–3 years", "4–5 years", "6–10 years", "10+ years"]}
                    onChange={(value) => setRegistrationDraft((current) => ({ ...current, trainingExperience: value }))} />
                  <EditField label="Status" value={registrationDraft.status} locked />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <DisplayField label="Trainer ID" value={registrationInfo.trainerId} />
                  <DisplayField label="Employee Code" value={registrationInfo.employeeCode} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />

                  <DisplayField label="Email" value={registrationInfo.email} placeholder="Enter Email" />
                  <DisplayField label="Alternate Email" value={registrationInfo.alternateEmail} placeholder="Enter Alternate Email" />
                  <DisplayField label="Mobile Number" value={registrationInfo.mobileNumber} placeholder="Enter Mobile Number" />

                  <DisplayField label="Alternate Phone" value={registrationInfo.alternatePhone} placeholder="Enter Alternate Phone" />
                  <DisplayField label="Gender" value={registrationInfo.gender} placeholder="Select" />
                  <DisplayField label="Business Unit" value={registrationInfo.businessUnit} placeholder="Select" />

                  <DisplayField label="Department" value={registrationInfo.department} placeholder="Select" />
                  <DisplayField label="Designation" value={registrationInfo.designation} placeholder="Select" />
                  <DisplayField label="Date of Joining" value={registrationInfo.dateOfJoining} />

                  <DisplayField label="Training Domain" value={registrationInfo.trainingDomain} placeholder="Select" />
                  <DisplayField label="Certification Name" value={registrationInfo.certificationName.join(", ")} placeholder="Select" />
                  <DisplayField label="Total Experience" value={registrationInfo.totalExperience} placeholder="Select" />

                  <DisplayField label="Training Experience" value={registrationInfo.trainingExperience} placeholder="Select" />
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
                  <SelectField label="Trainer Type" value={professionalDraft.trainerType} placeholder="Select" menuStyle="radio"
                    options={["Internal", "External", "Contract", "Visiting", "Freelance", "Industry Trainer"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, trainerType: value }))} />
                  <SelectField label="Experience" value={professionalDraft.experience} placeholder="Select" menuStyle="radio"
                    options={["0–2 years", "3–5 years", "6–10 years", "11–15 years", "15+ years"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, experience: value }))} />
                  <MultiSelectField label="Specialization" value={professionalDraft.specialization} placeholder="Select"
                    options={["AI & ML", "Data Science", "Leadership", "Communication", "Project Management", "Digital Transformation"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, specialization: value }))} />

                  <SelectField label="Primary Domain" value={professionalDraft.primaryDomain} placeholder="Select" menuStyle="radio"
                    options={["AI & Data Science", "Technology", "Leadership & Management", "Business Skills", "Digital Learning", "HR & L&D"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, primaryDomain: value }))} />
                  <MultiSelectField label="Key Expertise" value={professionalDraft.keyExpertise} placeholder="Select"
                    options={["AI", "Machine Learning", "Python", "Data Analytics", "Leadership", "Communication", "Training Delivery", "Coaching"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, keyExpertise: value }))} />
                  <MultiSelectField label="Training Topics" value={professionalDraft.trainingTopics} placeholder="Select"
                    options={["Python", "Machine Learning", "Generative AI", "Data Analytics", "Leadership", "Communication", "Project Management"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, trainingTopics: value }))} />

                  <SelectField label="Skill Level" value={professionalDraft.skillLevel} placeholder="Select" menuStyle="radio"
                    options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, skillLevel: value }))} />
                  <MultiSelectField label="Tools & Technologies" value={professionalDraft.toolsTechnologies} placeholder="Select"
                    options={["Python", "Power BI", "Excel", "LMS", "Tableau", "SQL", "Git", "AWS", "Azure", "AI Tools"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, toolsTechnologies: value }))} />
                  <MultiSelectField label="Training Method" value={professionalDraft.trainingMethod} placeholder="Select"
                    options={["Classroom", "Online", "Hybrid", "Blended", "Workshop", "Bootcamp", "Self-paced", "Hands-on"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, trainingMethod: value }))} />

                  <MultiSelectField label="Training Languages" value={professionalDraft.trainingLanguages} placeholder="Select"
                    options={["English", "Hindi", "Kannada", "Tamil", "Telugu", "Malayalam", "Marathi", "Other"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, trainingLanguages: value }))} />
                  <SelectField label="Content Development" value={professionalDraft.contentDevelopment} placeholder="Select" menuStyle="radio"
                    options={["Yes", "No", "Occasionally"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, contentDevelopment: value }))} />
                  <SelectField label="Assessment Creation" value={professionalDraft.assessmentCreation} placeholder="Select" menuStyle="radio"
                    options={["Yes", "No", "Occasionally"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, assessmentCreation: value }))} />

                  <SelectField label="Mentoring / Coaching" value={professionalDraft.mentoringCoaching} placeholder="Select" menuStyle="radio"
                    options={["Yes", "No", "Occasionally"]}
                    onChange={(value) => setProfessionalDraft((current) => ({ ...current, mentoringCoaching: value }))} />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <DisplayField label="Trainer Type" value={professionalInfo.trainerType} placeholder="Select" />
                  <DisplayField label="Experience" value={professionalInfo.experience} placeholder="Select" />
                  <DisplayField label="Specialization" value={professionalInfo.specialization.join(", ")} placeholder="Select" />
                  <DisplayField label="Primary Domain" value={professionalInfo.primaryDomain} placeholder="Select" />
                  <DisplayField label="Key Expertise" value={professionalInfo.keyExpertise.join(", ")} placeholder="Select" />
                  <DisplayField label="Training Topics" value={professionalInfo.trainingTopics.join(", ")} placeholder="Select" />
                  <DisplayField label="Skill Level" value={professionalInfo.skillLevel} placeholder="Select" />
                  <DisplayField label="Tools & Technologies" value={professionalInfo.toolsTechnologies.join(", ")} placeholder="Select" />
                  <DisplayField label="Training Method" value={professionalInfo.trainingMethod.join(", ")} placeholder="Select" />
                  <DisplayField label="Training Languages" value={professionalInfo.trainingLanguages.join(", ")} placeholder="Select" />
                  <DisplayField label="Content Development" value={professionalInfo.contentDevelopment} placeholder="Select" />
                  <DisplayField label="Assessment Creation" value={professionalInfo.assessmentCreation} placeholder="Select" />
                  <DisplayField label="Mentoring / Coaching" value={professionalInfo.mentoringCoaching} placeholder="Select" />
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
                  <MultiSelectField label="Core Skills" value={skillsDraft.coreSkills} placeholder="Select"
                    options={["Teaching", "Communication", "Presentation", "Facilitation", "Mentoring", "Leadership", "Problem Solving", "Team Management"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, coreSkills: value }))} />
                  <MultiSelectField label="Skills to Develop" value={skillsDraft.skillsToDevelop} placeholder="Select"
                    options={["Generative AI", "Data Analytics", "Leadership", "Instructional Design", "Coaching", "Digital Transformation"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, skillsToDevelop: value }))} />
                  <MultiSelectField label="Learning Interests" value={skillsDraft.learningInterests} placeholder="Select"
                    options={["AI", "EdTech", "Generative AI", "Data Science", "Leadership", "Learning Analytics", "Digital Learning"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, learningInterests: value }))} />
                  <SelectField label="Career Goals" value={skillsDraft.careerGoals} placeholder="Select" menuStyle="radio"
                    options={["Senior Trainer", "Lead Trainer", "Master Trainer", "Training Manager", "L&D Manager", "Program Manager", "L&D Head", "Consultant"]}
                    onChange={(value) => setSkillsDraft((current) => ({ ...current, careerGoals: value }))} />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <DisplayField label="Core Skills" value={skillsInfo.coreSkills.join(", ")} placeholder="Select" />
                  <DisplayField label="Skills to Develop" value={skillsInfo.skillsToDevelop.join(", ")} placeholder="Select" />
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
