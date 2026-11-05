"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Country, State as CountryState, City } from "country-state-city";
import ReactCountryFlag from "react-country-flag";
import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
} from "libphonenumber-js/max";

type PhoneCountry = ReturnType<typeof getCountries>[number];
import phoneExamples from "libphonenumber-js/examples.mobile.json";
import flags from "react-phone-number-input/flags";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import "./platformadmin.css";

type IconImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

const IconImage = ({
  src,
  alt,
  width = 20,
  height = 20,
  className = "",
}: IconImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
};

type InfoFieldProps = {
  label: string;
  value: string;
};

const InfoField = ({ label, value }: InfoFieldProps) => {
  return (
    <div className="infoField">
      <div className="infoLabel">{label}</div>
      <div className="infoValue">{value}</div>
    </div>
  );
};

type EditableFieldProps = {
  id: string;
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

const EditableField = ({
  id,
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: EditableFieldProps) => {
  return (
    <div className="infoField editableField">
      <div className="fieldText">
        <label className="infoLabel" htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          type={type}
          className="fieldInput"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <button
        type="button"
        className="roundFieldAction pencilFieldAction"
        aria-label={`Focus ${label}`}
        onClick={() => document.getElementById(id)?.focus()}
      >
        <IconImage
          src="/assets/platformadmin.imagesandicons/editbig.svg"
          alt=""
          width={24}
          height={24}
        />
      </button>
    </div>
  );
};

type LockedFieldProps = {
  label: string;
  value: string;
};

const LockedField = ({ label, value }: LockedFieldProps) => {
  return (
    <div className="infoField editableField">
      <div className="fieldText">
        <div className="infoLabel">{label}</div>
        <div className="infoValue">{value}</div>
      </div>

      <span className="roundFieldAction lockFieldAction" aria-hidden="true">
        <IconImage
          src="/assets/platformadmin.imagesandicons/lock.svg"
          alt=""
          width={24}
          height={24}
        />
      </span>
    </div>
  );
};

const PHONE_COUNTRIES = getCountries();
const phoneCountryNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const getPhoneCountryName = (country: PhoneCountry) =>
  phoneCountryNames?.of(country) || country;

const getPhoneCountryDigits = (country: PhoneCountry) => {
  const example = getExampleNumber(country, phoneExamples);
  return example?.nationalNumber?.length ??
    15 - getCountryCallingCode(country).length;
};

// Date of Birth must be a real calendar date that is not in the future.
const getLocalTodayForDOB = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const isValidPlatformDOB = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const parsed = new Date(0);
  parsed.setFullYear(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  return parsed.getFullYear() === year &&
    parsed.getMonth() + 1 === month &&
    parsed.getDate() === day &&
    value <= getLocalTodayForDOB();
};

// Indian contact numbers: exactly 10 digits, beginning with 6, 7, 8 or 9.
const isValidIndianContactNumber = (value: string): boolean =>
  /^[6-9]\d{9}$/.test(value);


type PhoneNumberFieldProps = {
  label: string;
  country: PhoneCountry | null;
  value: string;
  onCountryChange: (country: PhoneCountry) => void;
  onChange: (value: string) => void;
};

const PhoneNumberField = ({
  label, country, value, onCountryChange, onChange,
}: PhoneNumberFieldProps) => {
  const [open, setOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const callingCode = country ? `+${getCountryCallingCode(country)}` : "";
  const maxDigits = country ? getPhoneCountryDigits(country) : 15;

  const filteredCountries = PHONE_COUNTRIES.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      getPhoneCountryName(item).toLowerCase().includes(q) ||
      item.toLowerCase().includes(q) ||
      `+${getCountryCallingCode(item)}`.includes(q)
    );
  });

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setCountryOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  useEffect(() => {
    if (countryOpen) window.setTimeout(() => searchRef.current?.focus(), 0);
  }, [countryOpen]);

  const chooseCountry = (next: PhoneCountry) => {
    onCountryChange(next);
    onChange(value.replace(/\D/g, "").slice(0, getPhoneCountryDigits(next)));
    setCountryOpen(false);
    setSearch("");
  };

  return (
    <div ref={rootRef} className={`infoField phoneNumberField ${open ? "phoneNumberFieldOpen" : ""}`}>
      <button
        type="button"
        className="phoneNumberMainButton"
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (!next) {
            setCountryOpen(false);
            setSearch("");
          }
        }}
      >
        <span className="phoneNumberMainText">
          <span className="infoLabel">{label}</span>
          <span className={country && value ? "phoneNumberSavedValue" : "raisedDropdownPlaceholder"}>
            {country && value ? `${callingCode} ${value}` : "Select"}
          </span>
        </span>
        <span className={`genderChevron ${open ? "genderChevronOpen" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="phoneNumberPanel">
          <div className="phoneNumberPanelLabel">Country Code</div>
          <div className="phoneCountryBox">
            <div className={`phoneCountrySearch ${countryOpen ? "phoneCountrySearchOpen" : ""}`}>
              <span className="phoneCountrySearchIcon" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                value={countryOpen ? search : country ? getPhoneCountryName(country) : ""}
                placeholder="Search Country"
                onFocus={() => setCountryOpen(true)}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCountryOpen(true);
                }}
              />
              {country && !countryOpen && (
                <span className="phoneCountrySelectedCode">{country} ({callingCode})</span>
              )}
              <span
                className={`genderChevron phoneCountryChevron ${countryOpen ? "genderChevronOpen" : ""}`}
                aria-hidden="true"
                onClick={() => setCountryOpen((current) => !current)}
              />
            </div>

            {countryOpen && (
              <div className="phoneCountryMenu">
                <div className="phoneCountryList" role="listbox">
                  {filteredCountries.map((item) => {
                    const selected = country === item;
                    const Flag = flags[item];
                    return (
                      <button
                        key={item}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`phoneCountryOption ${selected ? "phoneCountryOptionSelected" : ""}`}
                        onClick={() => chooseCountry(item)}
                      >
                        <span className="phoneCountryOptionContent">
                          <span className="phoneCountryFlag">
                            {Flag ? <Flag title={getPhoneCountryName(item)} /> : null}
                          </span>
                          <span className="phoneCountryOptionText">
                            {item} (+{getCountryCallingCode(item)}) - {getPhoneCountryName(item)}
                          </span>
                        </span>
                        <span
                          className={`raisedDropdownRadio ${selected ? "raisedDropdownRadioSelected" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="phoneNumberPanelLabel phoneNumberInputLabel">{label}</div>
          <div className="phoneNumberInputFrame">
            <input
              type="tel"
              inputMode="numeric"
              disabled={!country}
              maxLength={maxDigits}
              value={value}
              placeholder={country ? `Enter ${maxDigits} Digit Mobile number` : "Select Country First"}
              onChange={(event) =>
                onChange(event.target.value.replace(/\D/g, "").slice(0, maxDigits))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

type OfficeLocationFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

type OfficeLocationListType = "country" | "state" | "city" | null;

const OfficeLocationField = ({
  value,
  onChange,
}: OfficeLocationFieldProps) => {
  const locationRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeList, setActiveList] = useState<OfficeLocationListType>(null);
  const [search, setSearch] = useState("");

  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveList(null);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const countries = Country.getAllCountries();
  const states = countryCode ? CountryState.getStatesOfCountry(countryCode) : [];
  const cities =
    countryCode && stateCode
      ? City.getCitiesOfState(countryCode, stateCode)
      : [];

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCountries = normalizedSearch
    ? countries.filter((country) =>
        country.name.toLowerCase().includes(normalizedSearch)
      )
    : countries;

  const filteredStates = normalizedSearch
    ? states.filter((state) =>
        state.name.toLowerCase().includes(normalizedSearch)
      )
    : states;

  const filteredCities = normalizedSearch
    ? cities.filter((city) =>
        city.name.toLowerCase().includes(normalizedSearch)
      )
    : cities;

  const openList = (list: Exclude<OfficeLocationListType, null>) => {
    setSearch("");
    setActiveList((current) => (current === list ? null : list));
  };

  return (
    <div
      ref={locationRef}
      className={`infoField officeLocationField ${
        isOpen ? "officeLocationFieldOpen" : ""
      }`}
    >
      <div className="infoLabel">Office Location</div>

      <button
        type="button"
        className="officeLocationMainButton"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((current) => !current);
          setActiveList(null);
          setSearch("");
        }}
      >
        <span className={!value ? "raisedDropdownPlaceholder" : ""}>
          {value || "Select"}
        </span>
        <span
          className={`officeLocationChevron ${
            isOpen ? "officeLocationChevronOpen" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="officeLocationPanel"
          role="dialog"
          aria-label="Office Location"
        >
          <div className={`officeLocationSelectorGroup ${activeList === "country" ? "officeLocationSelectorGroupOpen" : ""}`}>
            <div className="officeLocationSelectorLabel">Country/ Region</div>
            <button
              type="button"
              className={`officeLocationSelector ${
                activeList === "country" ? "officeLocationSelectorOpen" : ""
              }`}
              onClick={() => openList("country")}
            >
              <span className="officeLocationSearchIcon" aria-hidden="true" />
              <span
                className={
                  countryName
                    ? "officeLocationSelectorValue officeLocationSelectedCountry"
                    : "officeLocationSelectorPlaceholder"
                }
              >
                {countryName ? (
                  <>
                    <ReactCountryFlag
                      countryCode={countryCode}
                      svg
                      className="officeLocationSelectedFlag"
                      aria-label={`${countryName} flag`}
                    />
                    <span>{countryName}</span>
                  </>
                ) : (
                  "Search Country...."
                )}
              </span>
              <span
                className={`officeLocationInnerChevron ${
                  activeList === "country" ? "officeLocationInnerChevronOpen" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {activeList === "country" && (
              <div className="officeLocationOptionsPanel">
                <div className="officeLocationSearchRow">
                  <span className="officeLocationSearchIcon" aria-hidden="true" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    placeholder="Search Country...."
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="Close Country dropdown"
                    title="Close Country dropdown"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveList(null);
                      setSearch("");
                    }}
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, background: "transparent", cursor: "pointer", zIndex: 5 }}
                  >
                    <span className="officeLocationInnerChevron officeLocationInnerChevronOpen" aria-hidden="true" />
                  </button>
                </div>

                <div className="officeLocationOptionsList" role="listbox">
                  {filteredCountries.map((country) => {
                    const selected = country.isoCode === countryCode;

                    return (
                      <button
                        key={country.isoCode}
                        type="button"
                        className={`officeLocationOption ${
                          selected ? "officeLocationOptionSelected" : ""
                        }`}
                        aria-selected={selected}
                        role="option"
                        onClick={() => {
                          setCountryCode(country.isoCode);
                          setCountryName(country.name);
                          setStateCode("");
                          setStateName("");
                          setCityName("");
                          setActiveList(null);
                          setSearch("");
                        }}
                      >
                        <ReactCountryFlag
                          countryCode={country.isoCode}
                          svg
                          className="officeLocationFlag"
                          aria-label={`${country.name} flag`}
                        />
                        <span className="officeLocationOptionName">
                          {country.name}
                        </span>
                        <span
                          className={`officeLocationRadio ${
                            selected ? "officeLocationRadioSelected" : ""
                          }`}
                          aria-hidden="true"
                        >
                          {selected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={`officeLocationSelectorGroup ${activeList === "state" ? "officeLocationSelectorGroupOpen" : ""}`}>
            <div className="officeLocationSelectorLabel">State/Province</div>
            <button
              type="button"
              className={`officeLocationSelector ${
                activeList === "state" ? "officeLocationSelectorOpen" : ""
              }`}
              disabled={!countryCode}
              onClick={() => openList("state")}
            >
              <span className="officeLocationSearchIcon" aria-hidden="true" />
              <span
                className={
                  stateName
                    ? "officeLocationSelectorValue"
                    : "officeLocationSelectorPlaceholder"
                }
              >
                {stateName || "Select State/province"}
              </span>
              <span
                className={`officeLocationInnerChevron ${
                  activeList === "state" ? "officeLocationInnerChevronOpen" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {activeList === "state" && (
              <div className="officeLocationOptionsPanel">
                <div className="officeLocationSearchRow">
                  <span className="officeLocationSearchIcon" aria-hidden="true" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    placeholder="Search State/Province"
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="Close State dropdown"
                    title="Close State dropdown"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveList(null);
                      setSearch("");
                    }}
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, background: "transparent", cursor: "pointer", zIndex: 5 }}
                  >
                    <span className="officeLocationInnerChevron officeLocationInnerChevronOpen" aria-hidden="true" />
                  </button>
                </div>

                <div className="officeLocationOptionsList" role="listbox">
                  {filteredStates.map((state) => {
                    const selected = state.isoCode === stateCode;

                    return (
                      <button
                        key={`${state.countryCode}-${state.isoCode}`}
                        type="button"
                        className={`officeLocationOption officeLocationOptionWithoutFlag ${
                          selected ? "officeLocationOptionSelected" : ""
                        }`}
                        aria-selected={selected}
                        role="option"
                        onClick={() => {
                          setStateCode(state.isoCode);
                          setStateName(state.name);
                          setCityName("");
                          setActiveList(null);
                          setSearch("");
                        }}
                      >
                        <span className="officeLocationOptionName">
                          {state.name}
                        </span>
                        <span
                          className={`officeLocationRadio ${
                            selected ? "officeLocationRadioSelected" : ""
                          }`}
                          aria-hidden="true"
                        >
                          {selected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={`officeLocationSelectorGroup ${activeList === "city" ? "officeLocationSelectorGroupOpen" : ""}`}>
            <div className="officeLocationSelectorLabel">City</div>
            <button
              type="button"
              className={`officeLocationSelector ${
                activeList === "city" ? "officeLocationSelectorOpen" : ""
              }`}
              disabled={!stateCode}
              onClick={() => openList("city")}
            >
              <span className="officeLocationSearchIcon" aria-hidden="true" />
              <span
                className={
                  cityName
                    ? "officeLocationSelectorValue"
                    : "officeLocationSelectorPlaceholder"
                }
              >
                {cityName || "Search City.."}
              </span>
              <span
                className={`officeLocationInnerChevron ${
                  activeList === "city" ? "officeLocationInnerChevronOpen" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {activeList === "city" && (
              <div className="officeLocationOptionsPanel">
                <div className="officeLocationSearchRow">
                  <span className="officeLocationSearchIcon" aria-hidden="true" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    placeholder="Search City.."
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="Close City dropdown"
                    title="Close City dropdown"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveList(null);
                      setSearch("");
                    }}
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, background: "transparent", cursor: "pointer", zIndex: 5 }}
                  >
                    <span className="officeLocationInnerChevron officeLocationInnerChevronOpen" aria-hidden="true" />
                  </button>
                </div>

                <div className="officeLocationOptionsList" role="listbox">
                  {filteredCities.map((city, index) => {
                    const selected = city.name === cityName;

                    return (
                      <button
                        key={`${city.name}-${city.latitude}-${city.longitude}-${index}`}
                        type="button"
                        className={`officeLocationOption officeLocationOptionWithoutFlag ${
                          selected ? "officeLocationOptionSelected" : ""
                        }`}
                        aria-selected={selected}
                        role="option"
                        onClick={() => {
                          setCityName(city.name);
                          onChange(`${city.name}, ${stateName}, ${countryName}`);
                          setActiveList(null);
                          setSearch("");
                          setIsOpen(false);
                        }}
                      >
                        <span className="officeLocationOptionName">
                          {city.name}
                        </span>
                        <span
                          className={`officeLocationRadio ${
                            selected ? "officeLocationRadioSelected" : ""
                          }`}
                          aria-hidden="true"
                        >
                          {selected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

const RECOMMENDED_UPLOAD_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.ppt,.pptx,.mp3,.aac,.mp4,.zip,.xlsx,.vtt,.srt";

const getRecommendedUploadLimit = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return { maxBytes: 2 * 1024 * 1024, label: "Image", sizeText: "2 MB" };
  }

  if (extension === "pdf") {
    return { maxBytes: 25 * 1024 * 1024, label: "PDF", sizeText: "25 MB" };
  }

  if (["doc", "docx"].includes(extension)) {
    return { maxBytes: 10 * 1024 * 1024, label: "DOC/DOCX", sizeText: "10 MB" };
  }

  if (["ppt", "pptx"].includes(extension)) {
    return { maxBytes: 30 * 1024 * 1024, label: "PPT/PPTX", sizeText: "30 MB" };
  }

  if (["mp3", "aac"].includes(extension)) {
    return { maxBytes: 20 * 1024 * 1024, label: "Audio", sizeText: "20 MB" };
  }

  if (extension === "mp4") {
    return { maxBytes: 500 * 1024 * 1024, label: "Video", sizeText: "500 MB" };
  }

  if (extension === "zip") {
    return { maxBytes: 300 * 1024 * 1024, label: "ZIP", sizeText: "300 MB" };
  }

  if (extension === "xlsx") {
    return { maxBytes: 5 * 1024 * 1024, label: "XLSX", sizeText: "5 MB" };
  }

  if (["vtt", "srt"].includes(extension)) {
    return { maxBytes: 500 * 1024, label: "VTT/SRT", sizeText: "500 KB" };
  }

  return null;
};

const getFileUploadErrorMessage = (file: File): string => {
  const limit = getRecommendedUploadLimit(file);
  if (!limit) return "Unsupported file type. Select JPG, JPEG, PNG, WEBP, PDF, DOC, DOCX, PPT, PPTX, MP3, AAC, MP4, ZIP, XLSX, VTT or SRT.";
  if (file.size > limit.maxBytes) return `${limit.label} file exceeds the ${limit.sizeText} limit. Select a smaller file.`;
  return "";
};

const RECOMMENDED_UPLOAD_HINT =
  "Image: 2 MB; PDF: 25 MB; DOC/DOCX: 10 MB; PPT/PPTX: 30 MB; " +
  "MP3/AAC: 20 MB; MP4: 500 MB; ZIP: 300 MB; XLSX: 5 MB; VTT/SRT: 500 KB.";

type FileFieldProps = {
  id: string;
  label: string;
  fileName: string;
  onChange: (file: File | null) => void;
  enabled?: boolean;
  onFileSizeError?: (message: string) => void;
  className?: string;
};

const FileField = ({
  id,
  label,
  fileName,
  onChange,
  enabled = true,
  onFileSizeError,
  className = "",
}: FileFieldProps) => {
  const [fileUploadError, setFileUploadError] = useState("");
  return (
    <div className={`infoField fileInfoField ${className}`}>
      {enabled ? (
        <label className="infoLabel" htmlFor={id}>
          {label}
        </label>
      ) : (
        <div className="infoLabel">{label}</div>
      )}

      <div className="fileFieldRow">
        {enabled ? (
          <button
            type="button"
            className={`chooseFileButton ${fileName ? "chooseFileButtonUploaded" : ""}`}
            title={RECOMMENDED_UPLOAD_HINT}
            onClick={() =>
              (document.getElementById(id) as HTMLInputElement | null)?.click()
            }
          >
            <IconImage
              src="/assets/platformadmin.imagesandicons/upload.svg"
              alt=""
              width={14}
              height={14}
            />
            <span>Choose File</span>
          </button>
        ) : (
          <span
            className={`chooseFileButton chooseFileButtonDisabled ${fileName ? "chooseFileButtonUploaded" : ""}`}
            aria-hidden="true"
          >
            <IconImage
              src="/assets/platformadmin.imagesandicons/upload.svg"
              alt=""
              width={14}
              height={14}
            />
            <span>Choose File</span>
          </span>
        )}

        <span className="fileNameText">
          {fileName || "No File Chosen"}
        </span>

        {enabled && (
          <input
            id={id}
            className="nativeFileInput"
            type="file"
            accept={RECOMMENDED_UPLOAD_ACCEPT}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;

              if (!file) {
                onChange(null);
                return;
              }

              const fileError = getFileUploadErrorMessage(file);
              if (fileError) {
                setFileUploadError(fileError);
                onFileSizeError?.(fileError);
                event.target.value = "";
                onChange(null);
                return;
              }

              setFileUploadError("");
              onChange(file);
            }}
          />
        )}
      </div>
      {enabled && fileUploadError && (
        <div role="alert" aria-live="assertive" style={{ color: "#B42318", fontSize: "12px", lineHeight: "17px", marginTop: "8px", overflowWrap: "anywhere" }}>
          {fileUploadError}
        </div>
      )}
    </div>
  );
};


type RaisedDropdownProps = {
  id: string;
  label?: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  compact?: boolean;
  disabled?: boolean;
};

const RaisedDropdown = ({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
  compact = false,
  disabled = false,
}: RaisedDropdownProps) => {
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

// Persist the completed profile and selected document files locally before leaving
// this page. The browser's IndexedDB stores Files without converting them to strings.
type PlatformAdminSavedProfile = {
  registration: {
    platformAdminId: string;
    fullName: string;
    dateOfBirth: string;
    officialEmail: string;
    mobileNumber: string;
    alternateEmail: string;
    alternatePhone: string;
  };
  basic: {
    employeeCode: string;
    gender: string;
    designation: string;
    department: string;
    officeLocation: string;
    dateOfJoining: string;
    reportingSuperAdmin: string;
  };
  mobileCountry: PhoneCountry | null;
  alternateCountry: PhoneCountry | null;
  employeeIdCard: File | null;
  governmentIdProof: File | null;
  governmentIdDocumentType: string;
  supportingDocuments: File | null;
};

const PLATFORM_PROFILE_DB = 'calendar-management-platform-profile';
const PLATFORM_PROFILE_STORE = 'saved-profile';
const PLATFORM_PROFILE_RECORD = 'platform-admin';

function openPlatformProfileDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PLATFORM_PROFILE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PLATFORM_PROFILE_STORE)) {
        db.createObjectStore(PLATFORM_PROFILE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Profile storage is blocked by another browser tab.'));
  });
}

async function readPlatformAdminProfile(): Promise<PlatformAdminSavedProfile | null> {
  const db = await openPlatformProfileDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(PLATFORM_PROFILE_STORE, 'readonly');
      const request = tx.objectStore(PLATFORM_PROFILE_STORE).get(PLATFORM_PROFILE_RECORD);
      request.onsuccess = () => resolve((request.result as PlatformAdminSavedProfile | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function persistPlatformAdminProfile(profile: PlatformAdminSavedProfile): Promise<void> {
  const db = await openPlatformProfileDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PLATFORM_PROFILE_STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      tx.objectStore(PLATFORM_PROFILE_STORE).put(profile, PLATFORM_PROFILE_RECORD);
    });
  } finally {
    db.close();
  }
}

async function clearPlatformAdminProfile(): Promise<void> {
  const db = await openPlatformProfileDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PLATFORM_PROFILE_STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      tx.objectStore(PLATFORM_PROFILE_STORE).delete(PLATFORM_PROFILE_RECORD);
    });
  } finally {
    db.close();
  }
}

export default function PlatformAdminProfilePage() {
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const registrationCardRef = useRef<HTMLElement>(null);
  const basicInformationCardRef = useRef<HTMLElement>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const savedProfileImage = localStorage.getItem(
      "platformAdminProfileImage"
    );

    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  const [registrationInfo, setRegistrationInfo] = useState({
    platformAdminId: "PRGEEQPR7U4U7KW",
    fullName: "Suresh Kumar",
    dateOfBirth: "",
    officialEmail: "",
    mobileNumber: "",
    alternateEmail: "",
    alternatePhone: "",
  });

  const [registrationDraft, setRegistrationDraft] =
    useState(registrationInfo);
  const [mobileCountry, setMobileCountry] = useState<PhoneCountry | null>(null);
  const [alternateCountry, setAlternateCountry] = useState<PhoneCountry | null>(null);
  const [savedMobileCountry, setSavedMobileCountry] = useState<PhoneCountry | null>(null);
  const [savedAlternateCountry, setSavedAlternateCountry] = useState<PhoneCountry | null>(null);

  const [basicInfo, setBasicInfo] = useState({
    employeeCode: "Eg:PA-00124",
    gender: "",
    designation: "",
    department: "",
    officeLocation: "",
    dateOfJoining: "2008-06-19",
    reportingSuperAdmin: "",
  });

  const [basicDraft, setBasicDraft] = useState(basicInfo);

  const [employeeIdCard, setEmployeeIdCard] = useState<File | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [governmentIdProof, setGovernmentIdProof] = useState<File | null>(null);
  const [governmentIdDocumentType, setGovernmentIdDocumentType] = useState("");
  const [supportingDocuments, setSupportingDocuments] = useState<File | null>(null);

  const [isRegistrationEditing, setIsRegistrationEditing] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<
    "saved" | "discarded" | null
  >(null);
  const [registrationValidationError, setRegistrationValidationError] =
    useState<string | null>(null);
  const [registrationStepMessage, setRegistrationStepMessage] =
    useState<string | null>(null);

  const [isBasicEditing, setIsBasicEditing] = useState(false);
  const [basicStatus, setBasicStatus] = useState<
    "saved" | "discarded" | null
  >(null);
  const [basicUploadError, setBasicUploadError] = useState("");
  const [governmentIdUploadError, setGovernmentIdUploadError] = useState("");
  const [basicStepMessage, setBasicStepMessage] =
    useState<string | null>(null);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isJoiningCalendarOpen, setIsJoiningCalendarOpen] = useState(false);
  const [joiningCalendarMonth, setJoiningCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [joiningCalendarMode, setJoiningCalendarMode] = useState<
    "days" | "months" | "years"
  >("days");
  const [joiningYearPageStart, setJoiningYearPageStart] = useState(() => {
    const year = new Date().getFullYear();
    return Math.floor(year / 12) * 12;
  });
  const [birthCalendarOpen, setBirthCalendarOpen] = useState(false);
  const [birthCalendarMonth, setBirthCalendarMonth] = useState(() => {
    const initial = registrationInfo.dateOfBirth
      ? new Date(`${registrationInfo.dateOfBirth}T00:00:00`)
      : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const [birthCalendarMode, setBirthCalendarMode] = useState<
    "days" | "months" | "years"
  >("days");
  const [birthYearPageStart, setBirthYearPageStart] = useState(() => {
    const initialYear = registrationInfo.dateOfBirth
      ? Number(registrationInfo.dateOfBirth.slice(0, 4))
      : new Date().getFullYear();
    return Math.floor(initialYear / 12) * 12;
  });

  const [registrationSectionSaved, setRegistrationSectionSaved] =
    useState(false);
  const [basicSectionSaved, setBasicSectionSaved] = useState(false);

  // Restore the completed profile and document files when this page is revisited.
  useEffect(() => {
    let mounted = true;
    readPlatformAdminProfile()
      .then((saved) => {
        if (!mounted || !saved) return;
        setRegistrationInfo(saved.registration);
        setRegistrationDraft(saved.registration);
        setBasicInfo(saved.basic);
        setBasicDraft(saved.basic);
        setMobileCountry(saved.mobileCountry);
        setAlternateCountry(saved.alternateCountry);
        setSavedMobileCountry(saved.mobileCountry);
        setSavedAlternateCountry(saved.alternateCountry);
        setEmployeeIdCard(saved.employeeIdCard ?? null);
        setGovernmentIdProof(saved.governmentIdProof ?? null);
        setGovernmentIdDocumentType(saved.governmentIdDocumentType);
        setSupportingDocuments(saved.supportingDocuments ?? null);
        setRegistrationSectionSaved(true);
        setBasicSectionSaved(true);
      })
      .catch(() => {
        // Keep the normal form available if browser storage cannot be read.
      });
    return () => { mounted = false; };
  }, []);

  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const activeRegistrationInfo = isRegistrationEditing
    ? registrationDraft
    : registrationInfo;

  const activeBasicInfo = isBasicEditing
    ? basicDraft
    : basicInfo;

  const registrationEmailError =
    (activeRegistrationInfo.officialEmail.trim() !== "" &&
      !emailPattern.test(activeRegistrationInfo.officialEmail.trim())) ||
    (activeRegistrationInfo.alternateEmail.trim() !== "" &&
      !emailPattern.test(activeRegistrationInfo.alternateEmail.trim()))
      ? "Please enter a valid email address."
      : null;

  const registrationDOBError =
    activeRegistrationInfo.dateOfBirth.trim() !== "" &&
    !isValidPlatformDOB(activeRegistrationInfo.dateOfBirth)
      ? "Enter a valid Date of Birth. Future dates are not allowed."
      : null;

  const registrationPhoneError =
    activeRegistrationInfo.mobileNumber.trim() !== "" &&
    !isValidIndianContactNumber(activeRegistrationInfo.mobileNumber)
      ? "Enter correct Mobile Number"
      : activeRegistrationInfo.alternatePhone.trim() !== "" &&
          !isValidIndianContactNumber(activeRegistrationInfo.alternatePhone)
        ? "Enter correct Alternate Phone Number"
        : null;

  const registrationInformationCompleted =
    activeRegistrationInfo.platformAdminId.trim() !== "" &&
    activeRegistrationInfo.fullName.trim() !== "" &&
    isValidPlatformDOB(activeRegistrationInfo.dateOfBirth) &&
    activeRegistrationInfo.officialEmail.trim() !== "" &&
    emailPattern.test(activeRegistrationInfo.officialEmail.trim()) &&
    isValidIndianContactNumber(activeRegistrationInfo.mobileNumber) &&
    activeRegistrationInfo.alternateEmail.trim() !== "" &&
    emailPattern.test(activeRegistrationInfo.alternateEmail.trim()) &&
    isValidIndianContactNumber(activeRegistrationInfo.alternatePhone);

  const basicInformationCompleted =
    activeBasicInfo.employeeCode.trim() !== "" &&
    activeBasicInfo.gender !== "" &&
    activeBasicInfo.designation.trim() !== "" &&
    activeBasicInfo.department.trim() !== "" &&
    activeBasicInfo.officeLocation.trim() !== "" &&
    activeBasicInfo.dateOfJoining.trim() !== "" &&
    employeeIdCard !== null &&
    governmentIdProof !== null;

  const profilePhotoCompleted =
    profileImage !== null && profileImage !== "";

  const registrationCompleted = registrationInformationCompleted;

  const basicCompleted = basicInformationCompleted;

  const profileCompletionPercentage =
    (profilePhotoCompleted ? 20 : 0) +
    (registrationCompleted ? 40 : 0) +
    (basicCompleted ? 40 : 0);

  const showSectionStatus = (
    setter: React.Dispatch<
      React.SetStateAction<"saved" | "discarded" | null>
    >,
    status: "saved" | "discarded"
  ) => {
    setter(status);
    window.setTimeout(() => setter(null), 2500);
  };

  const showBasicUploadError = (message: string) => {
    setBasicUploadError(message);
    window.setTimeout(() => setBasicUploadError(""), 2500);
  };

  const showRegistrationStepMessage = (message: string) => {
    setRegistrationStepMessage(message);
    window.setTimeout(() => setRegistrationStepMessage(null), 2500);
  };

  const showBasicStepMessage = (message: string) => {
    setBasicStepMessage(message);
    window.setTimeout(() => setBasicStepMessage(null), 2500);
  };

  const openProfileImagePicker = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_IMAGE_SIZE) {
      showBasicUploadError("Profile Photo recommended image size is up to 2 MB.");
      event.target.value = "";
      return;
    }

    setProfilePhotoFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);

        localStorage.setItem(
          "platformAdminProfileImage",
          reader.result
        );

        window.dispatchEvent(
          new Event("profileImageUpdated")
        );
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRegistrationEdit = () => {
    if (!profilePhotoCompleted) {
      showRegistrationStepMessage("Please upload Profile Photo first");
      return;
    }

    setRegistrationStepMessage(null);
    setRegistrationDraft(registrationInfo);
    setMobileCountry(savedMobileCountry);
    setAlternateCountry(savedAlternateCountry);
    setRegistrationValidationError(null);
    setBirthCalendarOpen(false);
    setBirthCalendarMode("days");
    setIsRegistrationEditing(true);
  };



  const joiningCalendarYear = joiningCalendarMonth.getFullYear();
  const joiningCalendarMonthIndex = joiningCalendarMonth.getMonth();

  const joiningCalendarMonths = [
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

  const joiningCalendarFirstDay = new Date(
    joiningCalendarYear,
    joiningCalendarMonthIndex,
    1
  ).getDay();

  const joiningCalendarDaysInMonth = new Date(
    joiningCalendarYear,
    joiningCalendarMonthIndex + 1,
    0
  ).getDate();

  const joiningCalendarCellCount =
    Math.ceil(
      (joiningCalendarFirstDay + joiningCalendarDaysInMonth) / 7
    ) * 7;

  const joiningCalendarCells = Array.from(
    { length: joiningCalendarCellCount },
    (_, index) =>
      new Date(
        joiningCalendarYear,
        joiningCalendarMonthIndex,
        1 - joiningCalendarFirstDay + index
      )
  );

  const joiningYearPageYears = Array.from(
    { length: 12 },
    (_, index) => joiningYearPageStart + index
  );

  const formatJoiningDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const joiningDateDisplay = basicDraft.dateOfJoining
    ? basicDraft.dateOfJoining.split("-").reverse().join("/")
    : "dd/mm/yyyy";

  const birthCalendarYear = birthCalendarMonth.getFullYear();
  const birthCalendarMonthIndex = birthCalendarMonth.getMonth();
  const birthCalendarFirstDay = new Date(
    birthCalendarYear,
    birthCalendarMonthIndex,
    1
  ).getDay();

  const birthCalendarDaysInMonth = new Date(
    birthCalendarYear,
    birthCalendarMonthIndex + 1,
    0
  ).getDate();

  const birthCalendarCellCount =
    Math.ceil((birthCalendarFirstDay + birthCalendarDaysInMonth) / 7) * 7;

  const birthCalendarCells = Array.from(
    { length: birthCalendarCellCount },
    (_, index) =>
      new Date(
        birthCalendarYear,
        birthCalendarMonthIndex,
        1 - birthCalendarFirstDay + index
      )
  );

  const birthYearPageYears = Array.from(
    { length: 12 },
    (_, index) => birthYearPageStart + index
  );

  const formatBirthDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const birthDateDisplay = registrationDraft.dateOfBirth
    ? registrationDraft.dateOfBirth.split("-").reverse().join("/")
    : "dd/mm/yyyy";

  const handleBasicEdit = () => {
    if (!profilePhotoCompleted) {
      showBasicStepMessage("Please upload Profile Photo first");
      return;
    }

    if (!registrationCompleted) {
      showBasicStepMessage(
        registrationDOBError || registrationEmailError || registrationPhoneError ||
        "Please complete and save Registration Data first"
      );
      return;
    }

    setBasicStepMessage(null);
    setBasicDraft(basicInfo);
    setIsGenderDropdownOpen(false);
    setIsJoiningCalendarOpen(false);
    setJoiningCalendarMode("days");
    setIsBasicEditing(true);
  };



  const handleReviewProfile = () => {
    void clearPlatformAdminProfile().catch(() => {
      showBasicStepMessage('Unable to clear saved profile data in this browser.');
    });
    const resetRegistrationInfo = {
      platformAdminId: "PRGEEQPR7U4U7KW",
      fullName: "Suresh Kumar",
      dateOfBirth: "",
      officialEmail: "",
      mobileNumber: "",
      alternateEmail: "",
      alternatePhone: "",
    };

    const resetBasicInfo = {
      employeeCode: "Eg:PA-00124",
      gender: "",
      designation: "",
      department: "",
      officeLocation: "",
      dateOfJoining: "2008-06-19",
      reportingSuperAdmin: "",
    };

    setProfileImage(null);
    setProfilePhotoFile(null);
    localStorage.removeItem("platformAdminProfileImage");
    window.dispatchEvent(new Event("profileImageUpdated"));

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }

    document
      .querySelectorAll<HTMLInputElement>('input[type="file"]')
      .forEach((input) => {
        input.value = "";
      });

    setRegistrationInfo(resetRegistrationInfo);
    setRegistrationDraft(resetRegistrationInfo);
    setMobileCountry(null);
    setAlternateCountry(null);
    setSavedMobileCountry(null);
    setSavedAlternateCountry(null);

    setBasicInfo(resetBasicInfo);
    setBasicDraft(resetBasicInfo);

    setEmployeeIdCard(null);
    setGovernmentIdProof(null);
    setGovernmentIdUploadError("");
    setGovernmentIdDocumentType("");
    setSupportingDocuments(null);

    setRegistrationSectionSaved(false);
    setBasicSectionSaved(false);

    setRegistrationStatus(null);
    setBasicStatus(null);
    setRegistrationValidationError(null);
    setRegistrationStepMessage(null);
    setBasicUploadError("");
    setBasicStepMessage(null);

    setShowDraftSaved(false);
    setDraftSavedTime("");

    setIsRegistrationEditing(false);
    setIsBasicEditing(false);
    setIsGenderDropdownOpen(false);
    setIsJoiningCalendarOpen(false);
    setBirthCalendarOpen(false);
    setJoiningCalendarMode("days");
    setBirthCalendarMode("days");

    const today = new Date();
    setJoiningCalendarMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setJoiningYearPageStart(
      Math.floor(today.getFullYear() / 12) * 12
    );
    setBirthCalendarMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setBirthYearPageStart(
      Math.floor(today.getFullYear() / 12) * 12
    );

    document
      .getElementById("platform-admin-main-content")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile) return;
    if (profileCompletionPercentage !== 100) {
      if (!profilePhotoCompleted) {
        showRegistrationStepMessage("Please upload Profile Photo first");
        return;
      }

      if (!registrationCompleted) {
        const registrationError = registrationDOBError || registrationEmailError || registrationPhoneError;
        if (registrationError) {
          setRegistrationValidationError(registrationError);
          window.setTimeout(() => setRegistrationValidationError(null), 2500);
        } else {
          showRegistrationStepMessage(
            "Please complete Registration Data before saving the profile"
          );
        }
        return;
      }

      if (!basicCompleted) {
        showBasicStepMessage(
          "Please complete Basic Information before saving the profile"
        );
        return;
      }

      return;
    }

    // Store the completed profile *before* navigation. React state alone is
    // cleared when /sign_in loads, which previously lost every entered field.
    setIsSavingProfile(true);
    try {
      const completedRegistration = isRegistrationEditing ? registrationDraft : registrationInfo;
      const completedBasic = isBasicEditing ? basicDraft : basicInfo;
      const completedMobileCountry = isRegistrationEditing ? mobileCountry : savedMobileCountry;
      const completedAlternateCountry = isRegistrationEditing ? alternateCountry : savedAlternateCountry;

      await persistPlatformAdminProfile({
        registration: completedRegistration,
        basic: completedBasic,
        mobileCountry: completedMobileCountry,
        alternateCountry: completedAlternateCountry,
        employeeIdCard,
        governmentIdProof,
        governmentIdDocumentType,
        supportingDocuments,
      });

      setRegistrationInfo(completedRegistration);
      setBasicInfo(completedBasic);
      setSavedMobileCountry(completedMobileCountry);
      setSavedAlternateCountry(completedAlternateCountry);
      setRegistrationSectionSaved(true);
      setBasicSectionSaved(true);
      setRegistrationValidationError(null);
      setRegistrationStepMessage(null);
      setBasicStepMessage(null);
      setBasicUploadError("");
      setIsRegistrationEditing(false);
      setIsBasicEditing(false);
      setIsGenderDropdownOpen(false);
      setIsJoiningCalendarOpen(false);
      setBirthCalendarOpen(false);

      window.location.assign("/sign_in");
    } catch {
      showBasicStepMessage('Profile could not be saved. Check available browser storage and try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const saveDraft = () => {
      const now = new Date();

      const formattedTime = now
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      setDraftSavedTime(formattedTime);
      setShowDraftSaved(true);

      if (hideTimer !== null) {
        clearTimeout(hideTimer);
      }

      hideTimer = setTimeout(() => {
        setShowDraftSaved(false);
      }, 2000);
    };

    const saveInterval = setInterval(saveDraft, 10000);

    return () => {
      clearInterval(saveInterval);

      if (hideTimer !== null) {
        clearTimeout(hideTimer);
      }
    };
  }, []);

  return (
    <main className="platformAdminPage">
      <a className="skipLink" href="#platform-admin-main-content">
        Skip to main content
      </a>

      <div className="dashboardLayout">
        <Sidebar />

        <section className="mainContent">
          <Header />

          <div
            className="pageContent"
            id="platform-admin-main-content"
            tabIndex={-1}
          >
            <div className="pageHeadingRow">
              <div className="pageHeading">
                <h1>Platform admin Profile</h1>
                <p>
                  Manage Your Essential Information And Registration Details.
                </p>
              </div>

              {showDraftSaved && (
                <div className="savedBadge" role="status" aria-live="polite">
                  <IconImage
                    src="/assets/platformadmin.imagesandicons/check.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                  <span>Draft Saved at {draftSavedTime}</span>
                </div>
              )}
            </div>

            <section className="profileOverviewCard">
              <div className="profileIdentity">
                <div className="largeAvatarWrapper">
                  <div className="largeAvatar">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt=""
                        fill
                        sizes="88px"
                        className="avatarImage"
                        unoptimized
                      />
                    ) : (
                      <div className="profileImageEmpty" aria-hidden="true" />
                    )}
                  </div>

                  <button
                    type="button"
                    className="cameraButton"
                    aria-label="Change profile image"
                    onClick={openProfileImagePicker}
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/camera.svg"
                      alt=""
                      width={22}
                      height={22}
                    />
                  </button>

                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="profileImageInput"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={handleProfileImageSelect}
                  />
                </div>

                <div className="identityContent">
                  <h2>Suresh Kumar</h2>
                  <div className="roleName">Platform Admin</div>

                  <div className="activeBadge">
                    <span className="activeDot" aria-hidden="true" />
                    <span>Active</span>
                  </div>

                  {basicInfo.reportingSuperAdmin.trim() !== "" && (
                    <div className="adminId">
                      <span>Super admin ID :</span>
                      <span>{basicInfo.reportingSuperAdmin}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="verticalDivider" />

              <div className="completionSection">
                <div className="completionHeader">
                  <h3>Profile Completion</h3>
                  <span>{profileCompletionPercentage}% Completed</span>
                </div>

                <div className="progressTrack">
                  <div
                    className={`progressBar ${
                      profileCompletionPercentage === 100
                        ? "progressBarCompleted"
                        : ""
                    }`}
                    style={{ width: `${profileCompletionPercentage}%` }}
                  />
                </div>

                <div className="completionSteps platformCompletionSteps">
                  <div className="completionStep">
                    {profilePhotoCompleted ? (
                      <span
                        className="completedCircle"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    ) : (
                      <span className="emptyCircle" aria-hidden="true" />
                    )}
                    <span>Profile Photo</span>
                  </div>

                  <div className="completionStep">
                    {basicCompleted ? (
                      <span
                        className="completedCircle"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    ) : (
                      <span className="emptyCircle" aria-hidden="true" />
                    )}
                    <span>Basic Information</span>
                  </div>

                  <div className="completionStep">
                    {registrationCompleted ? (
                      <span
                        className="completedCircle"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    ) : (
                      <span className="emptyCircle" aria-hidden="true" />
                    )}
                    <span>Registration Data</span>
                  </div>
                </div>
              </div>
            </section>

            <section
              ref={registrationCardRef}
              className={`informationCard registrationCard ${
                isRegistrationEditing ? "sectionEditing" : ""
              }`}
            >
              <div className="informationHeader">
                <div className="informationTitle">
                  <span
                    className="sectionIcon registrationIcon"
                    aria-hidden="true"
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/file-edit.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="whiteIcon"
                    />
                  </span>
                  <h2>Registration Data</h2>
                </div>

                {!isRegistrationEditing && (
                  <button
                    type="button"
                    className="editButton"
                    aria-label="Edit registration data"
                    onClick={handleRegistrationEdit}
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/edit-03.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </button>
                )}

                {(registrationValidationError || registrationDOBError || registrationEmailError || registrationPhoneError) && (
                  <div
                    className="statusPopup statusDiscarded"
                    role="alert"
                    aria-live="polite"
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/sad.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>
                      {registrationValidationError || registrationDOBError || registrationEmailError || registrationPhoneError}
                    </span>
                  </div>
                )}

                {registrationStepMessage && (
                  <div
                    className="statusPopup statusDiscarded"
                    role="status"
                    aria-live="polite"
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/sad.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>{registrationStepMessage}</span>
                  </div>
                )}
              </div>

              {isRegistrationEditing ? (
                <div className="informationGrid">
                  <LockedField
                    label="Platform admin ID"
                    value={registrationInfo.platformAdminId}
                  />

                  <LockedField
                    label="Full Name"
                    value={registrationInfo.fullName}
                  />

                  <div className="infoField joiningDateField">
                    <div className="infoLabel">Date of Birth</div>

                    <div className="joiningDatePicker">
                      <button
                        id="registration-date-of-birth"
                        type="button"
                        className="joiningDateButton"
                        aria-haspopup="dialog"
                        aria-expanded={birthCalendarOpen}
                        onClick={() => {
                          setIsGenderDropdownOpen(false);
                          setIsJoiningCalendarOpen(false);
                          setBirthCalendarMode("days");
                          setBirthYearPageStart(
                            Math.floor(birthCalendarYear / 12) * 12
                          );
                          setBirthCalendarOpen((current) => !current);
                        }}
                      >
                        <span
                          className={
                            registrationDraft.dateOfBirth
                              ? "joiningDateValue"
                              : "joiningDatePlaceholder"
                          }
                        >
                          {birthDateDisplay}
                        </span>

                        <span
                          className="joiningDateCalendarCircle"
                          aria-hidden="true"
                        >
                          <IconImage
                            src="/assets/platformadmin.imagesandicons/calendar.svg"
                            alt=""
                            width={18}
                            height={18}
                            className="joiningDateCalendarImage"
                          />
                        </span>
                      </button>

                      {birthCalendarOpen && (
                        <div
                          className="joiningCalendarPopup"
                          role="dialog"
                          aria-label="Choose Date of Birth"
                        >
                          <div className="joiningCalendarTopRow">
                            <button
                              type="button"
                              className="joiningCalendarMainArrow"
                              aria-label="Previous month"
                              onClick={() => {
                                setBirthCalendarMonth(
                                  new Date(
                                    birthCalendarYear,
                                    birthCalendarMonthIndex - 1,
                                    1
                                  )
                                );
                                setBirthCalendarMode("days");
                              }}
                            >
                              ‹
                            </button>

                            <button
                              type="button"
                              className="joiningCalendarHeaderSelect joiningCalendarMonthButton"
                              aria-label="Choose month"
                              aria-expanded={birthCalendarMode === "months"}
                              onClick={() =>
                                setBirthCalendarMode((current) =>
                                  current === "months" ? "days" : "months"
                                )
                              }
                            >
                              <span>
                                {joiningCalendarMonths[birthCalendarMonthIndex]}
                              </span>
                              <span className="joiningCalendarChevron" aria-hidden="true">
                                ⌄
                              </span>
                            </button>

                            <button
                              type="button"
                              className="joiningCalendarHeaderSelect joiningCalendarYearButton"
                              aria-label="Choose year"
                              aria-expanded={birthCalendarMode === "years"}
                              onClick={() => {
                                setBirthYearPageStart(
                                  Math.floor(birthCalendarYear / 12) * 12
                                );
                                setBirthCalendarMode((current) =>
                                  current === "years" ? "days" : "years"
                                );
                              }}
                            >
                              <span>{birthCalendarYear}</span>
                              <span className="joiningCalendarChevron" aria-hidden="true">
                                ⌄
                              </span>
                            </button>

                            <button
                              type="button"
                              className="joiningCalendarMainArrow"
                              aria-label="Next month"
                              disabled={new Date(birthCalendarYear, birthCalendarMonthIndex + 1, 1) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                              onClick={() => {
                                setBirthCalendarMonth(
                                  new Date(
                                    birthCalendarYear,
                                    birthCalendarMonthIndex + 1,
                                    1
                                  )
                                );
                                setBirthCalendarMode("days");
                              }}
                            >
                              ›
                            </button>
                          </div>

                          {birthCalendarMode === "years" ? (
                            <div className="joiningCalendarYearPanel">
                              <div className="joiningCalendarRangeRow">
                                <button
                                  type="button"
                                  className="joiningCalendarRangeArrow"
                                  aria-label="Previous years"
                                  onClick={() =>
                                    setBirthYearPageStart((current) => current - 12)
                                  }
                                >
                                  ‹
                                </button>

                                <strong>
                                  {birthYearPageStart} - {birthYearPageStart + 11}
                                </strong>

                                <button
                                  type="button"
                                  className="joiningCalendarRangeArrow"
                                  aria-label="Next years"
                                  disabled={birthYearPageStart + 12 > new Date().getFullYear()}
                                  onClick={() =>
                                    setBirthYearPageStart((current) => current + 12)
                                  }
                                >
                                  ›
                                </button>
                              </div>

                              <div className="joiningCalendarYearGrid">
                                {birthYearPageYears.map((year) => (
                                  <button
                                    key={year}
                                    type="button"
                                    disabled={year > new Date().getFullYear()}
                                    className={`joiningCalendarYearOption ${
                                      year === birthCalendarYear
                                        ? "joiningCalendarOptionSelected"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      setBirthCalendarMonth(
                                        new Date(
                                          year,
                                          year === new Date().getFullYear()
                                            ? Math.min(birthCalendarMonthIndex, new Date().getMonth())
                                            : birthCalendarMonthIndex,
                                          1
                                        )
                                      );
                                      setBirthCalendarMode("days");
                                    }}
                                  >
                                    {year}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : birthCalendarMode === "months" ? (
                            <div className="joiningCalendarMonthGrid">
                              {joiningCalendarMonths.map((month, index) => (
                                <button
                                  key={month}
                                  type="button"
                                  disabled={birthCalendarYear > new Date().getFullYear() ||
                                    (birthCalendarYear === new Date().getFullYear() && index > new Date().getMonth())}
                                  className={`joiningCalendarMonthOption ${
                                    index === birthCalendarMonthIndex
                                      ? "joiningCalendarOptionSelected"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setBirthCalendarMonth(
                                      new Date(
                                        birthCalendarYear,
                                        index,
                                        1
                                      )
                                    );
                                    setBirthCalendarMode("days");
                                  }}
                                >
                                  {month}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div
                                className="joiningCalendarWeekdays"
                                aria-hidden="true"
                              >
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                  (weekday) => (
                                    <span key={weekday}>{weekday}</span>
                                  )
                                )}
                              </div>

                              <div className="joiningCalendarGrid">
                                {birthCalendarCells.map((date) => {
                                  const value = formatBirthDate(date);
                                  const isFutureDOB = value > getLocalTodayForDOB();
                                  const isCurrentMonth =
                                    date.getMonth() === birthCalendarMonthIndex;
                                  const isSelected =
                                    registrationDraft.dateOfBirth === value;

                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      disabled={isFutureDOB}
                                      aria-label={isFutureDOB ? `${value} - future date unavailable` : value}
                                      className={`joiningCalendarDay ${
                                        !isCurrentMonth
                                          ? "joiningCalendarDayOutside"
                                          : ""
                                      } ${
                                        isSelected
                                          ? "joiningCalendarDaySelected"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        if (isFutureDOB) return;
                                        setRegistrationDraft((current) => ({
                                          ...current,
                                          dateOfBirth: value,
                                        }));

                                        if (!isCurrentMonth) {
                                          setBirthCalendarMonth(
                                            new Date(
                                              date.getFullYear(),
                                              date.getMonth(),
                                              1
                                            )
                                          );
                                        }

                                        setBirthCalendarOpen(false);
                                        setBirthCalendarMode("days");
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
                  </div>

                  <EditableField
                    id="registration-official-email"
                    label="Official Email"
                    type="email"
                    value={registrationDraft.officialEmail}
                    placeholder="Enter official email"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        officialEmail: value,
                      }))
                    }
                  />

                  <EditableField
                    id="registration-alternate-email"
                    label="Alternate Email"
                    type="email"
                    value={registrationDraft.alternateEmail}
                    placeholder="Enter alternate email"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternateEmail: value,
                      }))
                    }
                  />

                  <EditableField
                    id="registration-mobile-number"
                    label="Mobile Number"
                    type="tel"
                    value={registrationDraft.mobileNumber}
                    placeholder="Enter Mobile Number"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        mobileNumber: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                  />

                  <EditableField
                    id="registration-alternate-phone"
                    label="Alternate Phone"
                    type="tel"
                    value={registrationDraft.alternatePhone}
                    placeholder="Enter Alternate Phone"
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternatePhone: value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                  />

                </div>
              ) : (
                <div className="informationGrid">
                  <InfoField
                    label="Platform admin ID"
                    value={registrationInfo.platformAdminId}
                  />
                  <InfoField
                    label="Full Name"
                    value={registrationInfo.fullName}
                  />
                  <InfoField
                    label="Date of Birth"
                    value={registrationInfo.dateOfBirth || "dd-mm-yyyy"}
                  />
                  <InfoField
                    label="Official Email"
                    value={registrationInfo.officialEmail || "Enter official email"}
                  />
                  <InfoField
                    label="Alternate Email"
                    value={registrationInfo.alternateEmail || "Enter alternate email"}
                  />
                  <InfoField
                    label="Mobile Number"
                    value={registrationInfo.mobileNumber || "Enter mobile number"}
                  />
                  <InfoField
                    label="Alternate Phone"
                    value={registrationInfo.alternatePhone || "Enter alternate phone number"}
                  />
                </div>
              )}
            </section>

            <section
              ref={basicInformationCardRef}
              className={`informationCard basicInformationCard ${
                isBasicEditing ? "sectionEditing" : ""
              }`}
            >
              <div className="informationHeader">
                <div className="informationTitle">
                  <span
                    className="sectionIcon basicInformationIcon"
                    aria-hidden="true"
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/user-02.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="whiteIcon"
                    />
                  </span>
                  <h2>Basic Information</h2>
                </div>

                {!isBasicEditing && (
                  <button
                    type="button"
                    className="editButton"
                    aria-label="Edit basic information"
                    onClick={handleBasicEdit}
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/edit-03.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </button>
                )}

                {basicUploadError && (
                  <div className="statusPopup statusDiscarded">
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/sad.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>{basicUploadError}</span>
                  </div>
                )}

                {basicStepMessage && (
                  <div
                    className="statusPopup statusDiscarded"
                    role="status"
                    aria-live="polite"
                  >
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/sad.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>{basicStepMessage}</span>
                  </div>
                )}
              </div>

              {isBasicEditing ? (
                <div className="informationGrid basicEditGrid">
                  <LockedField
                    label="Employee Code"
                    value={basicInfo.employeeCode}
                  />

                  <RaisedDropdown
                    id="basic-gender"
                    label="Gender"
                    value={basicDraft.gender}
                    placeholder="Select"
                    options={[
                      "Male",
                      "Female",
                      "Other",
                      "Prefer not to say",
                    ]}
                    onChange={(value) =>
                      setBasicDraft((current) => ({
                        ...current,
                        gender: value,
                      }))
                    }
                  />

                  <RaisedDropdown
                    id="basic-designation"
                    label="Designation"
                    value={basicDraft.designation}
                    placeholder="Select Designation"
                    options={[
                      "Platform Admin",
                      "Senior Platform Admin",
                      "System Administrator",
                      "Operations Manager",
                      "Program Manager",
                      "Coordinator",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setBasicDraft((current) => ({
                        ...current,
                        designation: value,
                      }))
                    }
                  />

                  <RaisedDropdown
                    id="basic-department"
                    label="Department"
                    value={basicDraft.department}
                    placeholder="Select Department"
                    options={[
                      "Administration",
                      "IT",
                      "Operations",
                      "HR",
                      "Finance",
                      "Training",
                      "Academic",
                      "Research & Development",
                      "Quality",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setBasicDraft((current) => ({
                        ...current,
                        department: value,
                      }))
                    }
                  />

                  <OfficeLocationField
                    value={basicDraft.officeLocation}
                    onChange={(value) =>
                      setBasicDraft((current) => ({
                        ...current,
                        officeLocation: value,
                      }))
                    }
                  />

                  <LockedField
                    label="Date of Joining"
                    value={
                      basicInfo.dateOfJoining
                        ? basicInfo.dateOfJoining.split("-").reverse().join("-")
                        : ""
                    }
                  />

                  <div className="governmentIdSideField">
                    <FileField
                    id="basic-employee-id-card"
                    label="Employee ID Card"
                    className="documentSideCard sideDocumentFileSpacing"
                    fileName={employeeIdCard?.name ?? ""}
                    onChange={setEmployeeIdCard}
                    onFileSizeError={showBasicUploadError}
                  />
                  </div>


                  <div className="infoField fileInfoField governmentIdProofField">
                    <div className="infoLabel">Government ID Proof</div>
                    <div className="fileFieldRow">
                      <RaisedDropdown
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

                      <button
                        type="button"
                        className={`chooseFileButton ${governmentIdProof ? "chooseFileButtonUploaded" : ""}`}
                        title={RECOMMENDED_UPLOAD_HINT}
                        onClick={() =>
                          (
                            document.getElementById(
                              "basic-government-id-proof"
                            ) as HTMLInputElement | null
                          )?.click()
                        }
                      >
                        <IconImage
                          src="/assets/platformadmin.imagesandicons/upload.svg"
                          alt=""
                          width={14}
                          height={14}
                        />
                        <span>Choose File</span>
                      </button>

                      <input
                        id="basic-government-id-proof"
                        className="nativeFileInput"
                        type="file"
                        accept={RECOMMENDED_UPLOAD_ACCEPT}
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;

                          if (!file) {
                            setGovernmentIdProof(null);
                            return;
                          }

                          const fileError = getFileUploadErrorMessage(file);
                          if (fileError) {
                            setGovernmentIdUploadError(fileError);
                            showBasicUploadError(fileError);
                            event.target.value = "";
                            setGovernmentIdProof(null);
                            return;
                          }

                          setGovernmentIdUploadError("");
                          setGovernmentIdProof(file);
                        }}
                      />
                    </div>
                    <span className="fileNameText">
                      {governmentIdProof?.name ?? "No File Chosen"}
                    </span>
                    {governmentIdUploadError && (
                      <div role="alert" aria-live="assertive" style={{ color: "#B42318", fontSize: "12px", lineHeight: "17px", marginTop: "8px", overflowWrap: "anywhere" }}>
                        {governmentIdUploadError}
                      </div>
                    )}
                  </div>

                  <div className="governmentIdSideField">
                    <FileField
                    id="basic-supporting-documents"
                    label="Supporting Documents"
                    className="documentSideCard sideDocumentFileSpacing"
                    fileName={supportingDocuments?.name ?? ""}
                    onChange={setSupportingDocuments}
                    onFileSizeError={showBasicUploadError}
                  />
                  </div>
                </div>
              ) : (
                <div className="informationGrid basicViewGrid">
                  <InfoField
                    label="Employee Code"
                    value={basicInfo.employeeCode}
                  />
                  <InfoField
                    label="Gender"
                    value={basicInfo.gender || "Select"}
                  />
                  <InfoField
                    label="Designation"
                    value={basicInfo.designation || "Select Designation"}
                  />
                  <InfoField
                    label="Department"
                    value={basicInfo.department || "Select Department"}
                  />
                  <InfoField
                    label="Office Location"
                    value={basicInfo.officeLocation || "Select Office Location"}
                  />
                  <InfoField
                    label="Date of Joining"
                    value={
                      basicInfo.dateOfJoining
                        ? basicInfo.dateOfJoining.split("-").reverse().join("-")
                        : ""
                    }
                  />

                  <FileField
                    id="view-employee-id-card"
                    label="Employee ID Card"
                    className="documentSideCard"
                    fileName={employeeIdCard?.name ?? ""}
                    onChange={setEmployeeIdCard}
                    enabled={false}
                  />


                  <div className="infoField fileInfoField governmentIdProofField">
                    <div className="infoLabel">Government ID Proof</div>

                    <div className="fileFieldRow">
                      <RaisedDropdown
                        id="view-government-id-document-type"
                        value={governmentIdDocumentType}
                        placeholder="Document Type"
                        compact
                        disabled
                        options={[
                          "Aadhaar Card",
                          "PAN Card",
                          "Passport",
                          "Driving Licence",
                          "Voter ID",
                          "Other",
                        ]}
                        onChange={setGovernmentIdDocumentType}
                      />

                      <span
                        className={`chooseFileButton chooseFileButtonDisabled ${governmentIdProof ? "chooseFileButtonUploaded" : ""}`}
                        aria-hidden="true"
                      >
                        <IconImage
                          src="/assets/platformadmin.imagesandicons/upload.svg"
                          alt=""
                          width={14}
                          height={14}
                        />
                        <span>Choose File</span>
                      </span>
                    </div>

                    <span className="fileNameText">
                      {governmentIdProof?.name ?? "No File Chosen"}
                    </span>
                  </div>

                  <FileField
                    id="view-supporting-documents"
                    label="Supporting Documents"
                    className="documentSideCard"
                    fileName={supportingDocuments?.name ?? ""}
                    onChange={setSupportingDocuments}
                    enabled={false}
                  />
                </div>
              )}
            </section>

            <div className="saveProfileRow">
              <button
                type="button"
                className="reviewProfileButton"
                onClick={handleReviewProfile}
              >
                <IconImage
                  src="/assets/platformadmin.imagesandicons/cancel.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="cancelProfileIcon"
                />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                className="saveProfileButton"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
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
