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
import "./suniversity.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
const images = {
  profile: "/assets/studenticons/profile.png",
  camera: "/assets/studenticons/camera.svg",
  edit: "/assets/studenticons/edit.svg",
  editBig: "/assets/studenticons/editbig.svg",
  lock: "/assets/studenticons/lock.svg",
  save: "/assets/studenticons/tick.svg",
  cancel: "/assets/studenticons/cancel.svg",
  arrowDown: "/assets/studenticons/arrow-down.svg",
  completed: "/assets/studenticons/checkmark.svg",
  upload: "/assets/studenticons/upload.svg",
  clap: "/assets/studenticons/clap.svg",
  sad: "/assets/studenticons/sad.svg",
  registration: "/assets/studenticons/file-edit.svg",
  academicProfessional: "/assets/studenticons/bag.svg",
  skillsDevelopment: "/assets/studenticons/targets.svg",
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
  onSave: () => void;
  onCancel: () => void;
};

function SectionHeader({
  title,
  iconSrc,
  iconTone,
  editing,
  popupType = null,
  popupMessage,
  onEdit,
  onSave,
  onCancel,
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
        ) : !popupType ? (
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
    userId: "STU2026-00125",
    fullName: "Antony Thomas",
    email: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: "2004-05-17",
    academicYear: "",
    passOutYear: "",
    department: "",
    branch: "",
    specialization: "",
    yearOfStudy: "",
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    preferredName: "",
    nationality: "",
    identityDocumentType: "",
    identityDocumentNumber: "",
    issuingCountry: "",
    alternateContact: "",
    alternateEmail: "",
    educationLevel: "",
    qualification: "",
    institutionName: "",
    fieldOfStudy: "",
    gradingSystem: "",
    gradeScore: "",
    startYear: "",
    endYear: "",
  });

  const [skillsInfo, setSkillsInfo] = useState({
    certificationName: "",
    issuingOrganisation: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    careerGoal: "",
    preferredRole: [] as string[],
    preferredIndustry: [] as string[],
    learningGoal: [] as string[],
    preferredLearningMode: [] as string[],
    skillName: "",
    category: "",
    domain: "",
    selfRatedLevel: "",
    resume: "",
    portfolioLink: "",
    linkedinUrl: "",
    instagramId: "",
    facebookUrl: "",
    githubUrl: "",
    twitterX: "",
    portfolioEvidence: "",
    personalWebsite: "",
  });

  const [registrationDraft, setRegistrationDraft] = useState(registrationInfo);
  const [mobileCountry, setMobileCountry] = useState<Country | null>(null);
  const [alternatePhoneCountry, setAlternatePhoneCountry] =
    useState<Country | null>(null);
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

    if (editingSection && editingSection !== section) {
      showFlowPopup(
        "Please Save or Cancel the current section before continuing.",
        section
      );
      return;
    }

    if (section === "registration" && !profilePhotoCompleted) {
      showFlowPopup("Please Complete Profile Photo", "registration");
      return;
    }

    if (section === "professional" && !registrationCompleted) {
      showFlowPopup("Please Complete Registration Data", "professional");
      return;
    }

    if (section === "skills" && !professionalProfileCompleted) {
      showFlowPopup("Please Complete Personal & Academic Profile", "skills");
      return;
    }

    if (section === "documents" && !skillsDevelopmentCompleted) {
      showFlowPopup("Please Complete Credentials, Career & Digital Profile", "documents");
      return;
    }

    if (section === "registration") {
      setRegistrationDraft({ ...registrationInfo });
    }

    if (section === "professional") {
      setProfessionalDraft({ ...professionalInfo });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        preferredRole: [...skillsInfo.preferredRole],
        preferredIndustry: [...skillsInfo.preferredIndustry],
        learningGoal: [...skillsInfo.learningGoal],
        preferredLearningMode: [...skillsInfo.preferredLearningMode],
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
      showFlowPopup("Please complete Profile Photo", "registration");
      return;
    }

    if (section === "professional" && !registrationCompleted) {
      showFlowPopup("Please complete Registration Data", "professional");
      return;
    }

    if (section === "skills" && !professionalProfileCompleted) {
      showFlowPopup("Please complete Personal & Academic Profile", "skills");
      return;
    }

    if (section === "documents" && !skillsDevelopmentCompleted) {
      showFlowPopup("Please complete Credentials, Career & Digital Profile", "documents");
      return;
    }

    if (section === "registration") {
      const email = registrationDraft.email.trim();

      if (!isValidEmail(email)) {
        showSectionError("registration", "Enter a valid Email");
        return;
      }

      if (!isValidPhoneNumber(registrationDraft.mobileNumber, mobileCountry)) {
        showSectionError(
          "registration",
          mobileCountry
            ? `Mobile Number must be ${getCountryMaxDigits(mobileCountry)} digits`
            : "Please select country code for Mobile Number"
        );
        return;
      }

      const complete =
        registrationDraft.gender &&
        registrationDraft.academicYear &&
        registrationDraft.passOutYear &&
        registrationDraft.department &&
        registrationDraft.branch &&
        registrationDraft.specialization &&
        registrationDraft.yearOfStudy;

      if (!complete) {
        showSectionError("registration", "Please complete all required Registration Data fields.");
        return;
      }

      setRegistrationInfo({ ...registrationDraft, email });
      setRegistrationCompleted(true);
    }

    if (section === "professional") {
      const complete =
        professionalDraft.nationality &&
        professionalDraft.identityDocumentType &&
        professionalDraft.issuingCountry &&
        professionalDraft.educationLevel &&
        professionalDraft.qualification &&
        professionalDraft.institutionName &&
        professionalDraft.fieldOfStudy &&
        professionalDraft.gradingSystem &&
        professionalDraft.startYear &&
        professionalDraft.endYear;

      if (!complete) {
        showSectionError(
          "professional",
          "Please complete the required Personal & Academic Profile fields."
        );
        return;
      }

      setProfessionalInfo({ ...professionalDraft });
      setProfessionalProfileCompleted(true);
    }

    if (section === "skills") {
      const complete =
        skillsDraft.certificationName &&
        skillsDraft.issuingOrganisation &&
        skillsDraft.careerGoal &&
        skillsDraft.preferredRole.length > 0 &&
        skillsDraft.preferredIndustry.length > 0 &&
        skillsDraft.learningGoal.length > 0 &&
        skillsDraft.preferredLearningMode.length > 0 &&
        skillsDraft.skillName &&
        skillsDraft.category &&
        skillsDraft.domain &&
        skillsDraft.selfRatedLevel &&
        skillsDraft.portfolioEvidence;

      if (!complete) {
        showSectionError(
          "skills",
          "Please complete the required Credentials, Career & Digital Profile fields."
        );
        return;
      }

      setSkillsInfo({
        ...skillsDraft,
        preferredRole: [...skillsDraft.preferredRole],
        preferredIndustry: [...skillsDraft.preferredIndustry],
        learningGoal: [...skillsDraft.learningGoal],
        preferredLearningMode: [...skillsDraft.preferredLearningMode],
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
        current?.section === section && current.type === "saved" ? null : current
      );
    }, 2500);
  };

  const cancelSection = (section: SectionName) => {
    if (section === "registration") {
      setRegistrationDraft({ ...registrationInfo });
    }

    if (section === "professional") {
      setProfessionalDraft({ ...professionalInfo });
    }

    if (section === "skills") {
      setSkillsDraft({
        ...skillsInfo,
        preferredRole: [...skillsInfo.preferredRole],
        preferredIndustry: [...skillsInfo.preferredIndustry],
        learningGoal: [...skillsInfo.learningGoal],
        preferredLearningMode: [...skillsInfo.preferredLearningMode],
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
        current?.section === section && current.type === "discarded" ? null : current
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
            ? "Personal & Academic Profile"
            : !skillsDevelopmentCompleted
              ? "Credentials, Career & Digital Profile"
              : !documentsCompleted
                ? "Documents"
                : !confirmation
                  ? "Confirmation"
                  : null;

    if (nextIncompleteStep) {
      showFlowPopup(
        `Please complete ${nextIncompleteStep} before saving the profile.`,
        "confirmation"
      );
      return;
    }

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
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: `Unsupported file type. ${DOCUMENT_UPLOAD_LIMITS[label].label}`,
      }));
      return;
    }

    const recommendedSize = getDocumentRecommendedSize(file);

    if (recommendedSize === null) {
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: "Unsupported file type.",
      }));
      return;
    }

    if (
      file.size < recommendedSize.min ||
      file.size > recommendedSize.max
    ) {
      setDocumentUploadErrors((current) => ({
        ...current,
        [label]: `Recommended file size is ${recommendedSize.label}.`,
      }));
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
    document.title = "University Student Profile | Neuro LXP";
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
                <h1>University Student Profile</h1>
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
                  <div className="institutionRole">University Student</div>

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
                    <span>Personal & Academic Profile</span>
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
                    <span>Credentials, Career & Digital Profile</span>
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
                popupType={sectionPopup?.section === "registration" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "registration" ? sectionPopup.message : undefined}
                onEdit={() => startSectionEdit("registration")}
                onSave={() => saveSection("registration")}
                onCancel={() => cancelSection("registration")}
              />

              {flowPopup && flowPopupSection === "registration" && (
                <div className="institutionSectionFlowPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} className="institutionInlinePopupIcon" />
                  <span>{flowPopup}</span>
                </div>
              )}

              {editingSection === "registration" ? (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <EditField label="User ID" value={registrationDraft.userId} locked />
                  <EditField label="Full Name" value={registrationDraft.fullName} locked />
                  <EditField
                    label="Email"
                    type="email"
                    value={registrationDraft.email}
                    placeholder="Enter Email"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, email: value }))
                    }
                  />

                  <PhoneCountrySelect
                    label="Mobile Number"
                    country={mobileCountry}
                    value={registrationDraft.mobileNumber}
                    onCountryChange={setMobileCountry}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, mobileNumber: value }))
                    }
                  />

                  <SelectField
                    label="Gender"
                    value={registrationDraft.gender}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Male", "Female", "Other", "Prefer not to say"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, gender: value }))
                    }
                  />

                  <EditField
                    label="Date of Birth"
                    type="date"
                    value={registrationDraft.dateOfBirth}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, dateOfBirth: value }))
                    }
                  />

                  <SelectField
                    label="Academic Year"
                    value={registrationDraft.academicYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2024–25", "2025–26", "2026–27", "2027–28", "2028–29"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, academicYear: value }))
                    }
                  />

                  <SelectField
                    label="Pass-out Year"
                    value={registrationDraft.passOutYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2026", "2027", "2028", "2029", "2030"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, passOutYear: value }))
                    }
                  />

                  <SelectField
                    label="Department"
                    value={registrationDraft.department}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Other"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, department: value }))
                    }
                  />

                  <SelectField
                    label="Branch"
                    value={registrationDraft.branch}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Other"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, branch: value }))
                    }
                  />

                  <SelectField
                    label="Specialization"
                    value={registrationDraft.specialization}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Artificial Intelligence", "Data Science", "Cybersecurity", "Cloud Computing", "Software Engineering", "Other"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, specialization: value }))
                    }
                  />

                  <SelectField
                    label="Year of Study"
                    value={registrationDraft.yearOfStudy}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({ ...current, yearOfStudy: value }))
                    }
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyRegistrationGrid">
                  <DisplayField label="User ID" value={registrationInfo.userId} />
                  <DisplayField label="Full Name" value={registrationInfo.fullName} />
                  <DisplayField label="Email" value={registrationInfo.email} placeholder="Student@college.edu" />
                  <DisplayField
                    label="Mobile Number"
                    value={
                      registrationInfo.mobileNumber && mobileCountry
                        ? `+${getCountryCallingCode(mobileCountry)} ${registrationInfo.mobileNumber}`
                        : registrationInfo.mobileNumber
                    }
                    placeholder="9521221322"
                  />
                  <DisplayField label="Gender" value={registrationInfo.gender} placeholder="Male" />
                  <DisplayField label="Date of Birth" value={registrationInfo.dateOfBirth} />
                  <DisplayField label="Academic Year" value={registrationInfo.academicYear} placeholder="2026–27" />
                  <DisplayField label="Pass-out Year" value={registrationInfo.passOutYear} placeholder="2027" />
                  <DisplayField label="Department" value={registrationInfo.department} placeholder="Computer Science" />
                  <DisplayField label="Branch" value={registrationInfo.branch} placeholder="Computer Science" />
                  <DisplayField label="Specialization" value={registrationInfo.specialization} placeholder="Artificial Intelligence" />
                  <DisplayField label="Year of Study" value={registrationInfo.yearOfStudy} placeholder="3rd Year" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Personal & Academic Profile"
                iconSrc={images.academicProfessional}
                iconTone="green"
                editing={editingSection === "professional"}
                popupType={sectionPopup?.section === "professional" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "professional" ? sectionPopup.message : undefined}
                onEdit={() => startSectionEdit("professional")}
                onSave={() => saveSection("professional")}
                onCancel={() => cancelSection("professional")}
              />

              {flowPopup && flowPopupSection === "professional" && (
                <div className="institutionSectionFlowPopup" role="alert" aria-live="assertive">
                  <IconImage src={images.sad} width={18} height={18} className="institutionInlinePopupIcon" />
                  <span>{flowPopup}</span>
                </div>
              )}

              {editingSection === "professional" ? (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <EditField
                    label="Preferred Name"
                    value={professionalDraft.preferredName}
                    placeholder="Enter Preferred Name"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, preferredName: value }))}
                  />

                  <SelectField
                    label="Nationality"
                    value={professionalDraft.nationality}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Indian", "American", "British", "Australian", "Canadian", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, nationality: value }))}
                  />

                  <SelectField
                    label="Identity Document Type"
                    value={professionalDraft.identityDocumentType}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Aadhaar", "Passport", "PAN Card", "Driving Licence", "Voter ID", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, identityDocumentType: value }))}
                  />

                  <EditField
                    label="Identity Document Number"
                    value={professionalDraft.identityDocumentNumber}
                    placeholder="Enter Document Number"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, identityDocumentNumber: value }))}
                  />

                  <SelectField
                    label="Issuing Country"
                    value={professionalDraft.issuingCountry}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["India", "USA", "UK", "Canada", "Australia", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, issuingCountry: value }))}
                  />

                  <EditField
                    label="Alternate Contact"
                    value={professionalDraft.alternateContact}
                    placeholder="Enter Alternate Contact"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, alternateContact: value }))}
                  />

                  <EditField
                    label="Alternate Email"
                    type="email"
                    value={professionalDraft.alternateEmail}
                    placeholder="Enter Alternate Email"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, alternateEmail: value }))}
                  />

                  <SelectField
                    label="Education Level"
                    value={professionalDraft.educationLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Undergraduate", "Postgraduate", "Diploma", "Certificate", "Doctoral"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, educationLevel: value }))}
                  />

                  <SelectField
                    label="Qualification"
                    value={professionalDraft.qualification}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["B.Tech", "B.E.", "B.Sc.", "BCA", "BBA", "M.Tech", "M.E.", "MBA", "M.Sc.", "Other"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, qualification: value }))}
                  />

                  <SelectField
                    label="Institution Name"
                    value={professionalDraft.institutionName}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["ABC Institute of Technology"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, institutionName: value }))}
                  />

                  <SelectField
                    label="Field of Study"
                    value={professionalDraft.fieldOfStudy}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Computer Science", "Information Technology", "Data Science", "Electronics", "Mechanical"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, fieldOfStudy: value }))}
                  />

                  <SelectField
                    label="Grading System"
                    value={professionalDraft.gradingSystem}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["CGPA – 10 Point Scale", "CGPA – 4 Point Scale", "Percentage", "GPA", "Grade"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, gradingSystem: value }))}
                  />

                  <EditField
                    label="Grade / Score"
                    value={professionalDraft.gradeScore}
                    placeholder="Enter Grade / Score"
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, gradeScore: value }))}
                  />

                  <SelectField
                    label="Start Year"
                    value={professionalDraft.startYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2022", "2023", "2024", "2025", "2026"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, startYear: value }))}
                  />

                  <SelectField
                    label="End Year"
                    value={professionalDraft.endYear}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["2026", "2027", "2028", "2029", "2030"]}
                    onChange={(value) => setProfessionalDraft((c) => ({ ...c, endYear: value }))}
                  />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultyProfessionalGrid">
                  <DisplayField label="Preferred Name" value={professionalInfo.preferredName} placeholder="Antony" />
                  <DisplayField label="Nationality" value={professionalInfo.nationality} placeholder="eg.Indian" />
                  <DisplayField label="Identity Document Type" value={professionalInfo.identityDocumentType} placeholder="eg.Passport" />
                  <DisplayField label="Identity Document Number" value={professionalInfo.identityDocumentNumber} placeholder="Eg. P1234567" />
                  <DisplayField label="Issuing Country" value={professionalInfo.issuingCountry} placeholder="Eg.India" />
                  <DisplayField label="Alternate Contact" value={professionalInfo.alternateContact} placeholder="Eg. +91 91234 56789" />
                  <DisplayField label="Alternate Email" value={professionalInfo.alternateEmail} placeholder="Eg. Antony alt@example.com" />
                  <DisplayField label="Education Level" value={professionalInfo.educationLevel} placeholder="Eg.Undergraduate" />
                  <DisplayField label="Qualification" value={professionalInfo.qualification} placeholder="Eg. B.Tech- CS" />
                  <DisplayField label="Institution Name" value={professionalInfo.institutionName} placeholder="Eg. ABC IT" />
                  <DisplayField label="Field of Study" value={professionalInfo.fieldOfStudy} placeholder="Eg. CS" />
                  <DisplayField label="Grading System" value={professionalInfo.gradingSystem} placeholder="Eg. CGPA – 10 Point Scale" />
                  <DisplayField label="Grade / Score" value={professionalInfo.gradeScore} placeholder="Eg. 8.6 CGPA" />
                  <DisplayField label="Start Year" value={professionalInfo.startYear} placeholder="Eg. 2023" />
                  <DisplayField label="End Year" value={professionalInfo.endYear} placeholder="Eg. 2027" />
                </div>
              )}
            </section>

            <section className="institutionInformationCard">
              <SectionHeader
                title="Credentials, Career & Digital Profile"
                iconSrc={images.skillsDevelopment}
                iconTone="blue"
                editing={editingSection === "skills"}
                popupType={sectionPopup?.section === "skills" ? sectionPopup.type : null}
                popupMessage={sectionPopup?.section === "skills" ? sectionPopup.message : undefined}
                onEdit={() => startSectionEdit("skills")}
                onSave={() => saveSection("skills")}
                onCancel={() => cancelSection("skills")}
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
                    label="Certification Name"
                    value={skillsDraft.certificationName}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Python for Data Science", "AWS Cloud Practitioner", "Google Data Analytics"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, certificationName: value }))}
                  />

                  <SelectField
                    label="Issuing Organisation"
                    value={skillsDraft.issuingOrganisation}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["NPTEL", "AWS", "Microsoft", "Google", "IBM", "Coursera", "Udemy"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, issuingOrganisation: value }))}
                  />

                  <EditField label="Issue Date" type="date" value={skillsDraft.issueDate} onChange={(value) => setSkillsDraft((c) => ({ ...c, issueDate: value }))} />
                  <EditField label="Expiry Date" type="date" value={skillsDraft.expiryDate} onChange={(value) => setSkillsDraft((c) => ({ ...c, expiryDate: value }))} />
                  <EditField label="Credential ID" value={skillsDraft.credentialId} placeholder="Enter Credential ID" onChange={(value) => setSkillsDraft((c) => ({ ...c, credentialId: value }))} />
                  <EditField label="Credential URL" value={skillsDraft.credentialUrl} placeholder="Enter Verification Link" onChange={(value) => setSkillsDraft((c) => ({ ...c, credentialUrl: value }))} />

                  <SelectField
                    label="Career Goal"
                    value={skillsDraft.careerGoal}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Become a Data Scientist", "Software Engineer", "Entrepreneur", "Researcher", "Product Manager"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, careerGoal: value }))}
                  />

                  <MultiSelectField
                    label="Preferred Role"
                    value={skillsDraft.preferredRole}
                    placeholder="Select"
                    options={["Data Analyst", "Data Scientist", "Software Developer", "AI Engineer", "ML Engineer", "Product Manager"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, preferredRole: value }))}
                  />

                  <MultiSelectField
                    label="Preferred Industry"
                    value={skillsDraft.preferredIndustry}
                    placeholder="Select"
                    options={["Information Technology", "Finance", "Healthcare", "Education", "Manufacturing", "E-Commerce", "Consulting"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, preferredIndustry: value }))}
                  />

                  <MultiSelectField
                    label="Learning Goal"
                    value={skillsDraft.learningGoal}
                    placeholder="Select"
                    options={["Develop AI Skills", "Improve Programming", "Learn Data Analytics", "Build Leadership Skills", "Prepare for Placement"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, learningGoal: value }))}
                  />

                  <MultiSelectField
                    label="Preferred Learning Mode"
                    value={skillsDraft.preferredLearningMode}
                    placeholder="Select"
                    options={["Classroom", "Online", "Blended", "Self-paced", "Instructor-led", "Hands-on"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, preferredLearningMode: value }))}
                  />

                  <SelectField
                    label="Skill Name"
                    value={skillsDraft.skillName}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Python", "Java", "SQL", "Machine Learning", "Communication", "Excel", "Power BI"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, skillName: value }))}
                  />

                  <SelectField
                    label="Category"
                    value={skillsDraft.category}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Technical Skill", "Soft Skill", "Digital Skill", "Domain Skill", "Leadership Skill"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, category: value }))}
                  />

                  <SelectField
                    label="Domain"
                    value={skillsDraft.domain}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Data Science", "Artificial Intelligence", "Software Development", "Cloud Computing", "Cybersecurity", "Business"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, domain: value }))}
                  />

                  <SelectField
                    label="Self-Rated Level"
                    value={skillsDraft.selfRatedLevel}
                    placeholder="Select"
                    menuStyle="radio"
                    options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, selfRatedLevel: value }))}
                  />

                  <EditField label="Resume" value={skillsDraft.resume} placeholder="Enter Resume PDF" onChange={(value) => setSkillsDraft((c) => ({ ...c, resume: value }))} />
                  <EditField label="Portfolio Link" value={skillsDraft.portfolioLink} placeholder="Enter Portfolio Link" onChange={(value) => setSkillsDraft((c) => ({ ...c, portfolioLink: value }))} />
                  <EditField label="LinkedIn URL" value={skillsDraft.linkedinUrl} placeholder="Enter LinkedIn URL" onChange={(value) => setSkillsDraft((c) => ({ ...c, linkedinUrl: value }))} />
                  <EditField label="Instagram ID" value={skillsDraft.instagramId} placeholder="Enter Instagram ID" onChange={(value) => setSkillsDraft((c) => ({ ...c, instagramId: value }))} />
                  <EditField label="Facebook ID / URL" value={skillsDraft.facebookUrl} placeholder="Enter Facebook URL" onChange={(value) => setSkillsDraft((c) => ({ ...c, facebookUrl: value }))} />
                  <EditField label="GitHub URL" value={skillsDraft.githubUrl} placeholder="Enter GitHub URL" onChange={(value) => setSkillsDraft((c) => ({ ...c, githubUrl: value }))} />
                  <EditField label="Twitter / X" value={skillsDraft.twitterX} placeholder="Enter Twitter / X" onChange={(value) => setSkillsDraft((c) => ({ ...c, twitterX: value }))} />

                  <SelectField
                    label="Portfolio Evidence"
                    value={skillsDraft.portfolioEvidence}
                    placeholder="Select"
                    menuStyle="radio"
                    options={[
                      "Academic Project",
                      "Personal Project",
                      "Internship Project",
                      "Industry Project",
                      "Hackathon Project",
                      "Research Project",
                      "Open Source Contribution",
                      "Certification Project",
                      "Case Study",
                      "Other",
                    ]}
                    onChange={(value) => setSkillsDraft((c) => ({ ...c, portfolioEvidence: value }))}
                  />

                  <EditField label="Personal Website" value={skillsDraft.personalWebsite} placeholder="Enter Personal Website" onChange={(value) => setSkillsDraft((c) => ({ ...c, personalWebsite: value }))} />
                </div>
              ) : (
                <div className="institutionGrid institutionFacultySkillsGrid">
                  <DisplayField label="Certification Name" value={skillsInfo.certificationName} placeholder="Python for Data Science" />
                  <DisplayField label="Issuing Organisation" value={skillsInfo.issuingOrganisation} placeholder="NPTEL" />
                  <DisplayField label="Issue Date" value={skillsInfo.issueDate} placeholder="eg. 15 July 2026" />
                  <DisplayField label="Expiry Date" value={skillsInfo.expiryDate} placeholder="Eg. No Expiry" />
                  <DisplayField label="Credential ID" value={skillsInfo.credentialId} placeholder="Eg. NPTEL-PY-2026-45821" />
                  <DisplayField label="Credential URL" value={skillsInfo.credentialUrl} placeholder="Eg. Verification Link" />
                  <DisplayField label="Career Goal" value={skillsInfo.careerGoal} placeholder="Eg. Become a Data Scientist" />
                  <DisplayField label="Preferred Role" value={skillsInfo.preferredRole.join(", ")} placeholder="Eg. Data Analyst" />
                  <DisplayField label="Preferred Industry" value={skillsInfo.preferredIndustry.join(", ")} placeholder="Eg. Information Technology" />
                  <DisplayField label="Learning Goal" value={skillsInfo.learningGoal.join(", ")} placeholder="Eg. Develop AI" />
                  <DisplayField label="Preferred Learning Mode" value={skillsInfo.preferredLearningMode.join(", ")} placeholder="Eg. Blended" />
                  <DisplayField label="Skill Name" value={skillsInfo.skillName} placeholder="Eg.Python" />
                  <DisplayField label="Category" value={skillsInfo.category} placeholder="Eg. Technical Skill" />
                  <DisplayField label="Domain" value={skillsInfo.domain} placeholder="Eg.Data Science" />
                  <DisplayField label="Self-Rated Level" value={skillsInfo.selfRatedLevel} placeholder="Eg. Intermediate" />
                  <DisplayField label="Resume" value={skillsInfo.resume} placeholder="Eg. Antony-Resume PDF" />
                  <DisplayField label="Portfolio Link" value={skillsInfo.portfolioLink} placeholder="Eg. antony.thomas/portfolio" />
                  <DisplayField label="LinkedIn URL" value={skillsInfo.linkedinUrl} placeholder="Eg.linkedin.com/in/antony.thomas" />
                  <DisplayField label="Instagram ID" value={skillsInfo.instagramId} placeholder="Eg. @antony.thomas" />
                  <DisplayField label="Facebook ID / URL" value={skillsInfo.facebookUrl} placeholder="Eg.facebook.com/aanaya.thomas" />
                  <DisplayField label="GitHub URL" value={skillsInfo.githubUrl} placeholder="Eg. github.com/antony_thomas" />
                  <DisplayField label="Twitter / X" value={skillsInfo.twitterX} placeholder="Eg. @antony thomas" />
                  <DisplayField label="Portfolio Evidence" value={skillsInfo.portfolioEvidence} placeholder="Eg. Data Analytics Project" />
                  <DisplayField label="Personal Website" value={skillsInfo.personalWebsite} placeholder="Eg. www.antony thomas.dev" />
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
                onSave={() => saveSection("documents")}
                onCancel={() => cancelSection("documents")}
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
