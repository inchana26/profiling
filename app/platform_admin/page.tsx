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

  const cancelLocation = () => {
    setIsOpen(false);
    setActiveList(null);
    setSearch("");
  };

  const applyLocation = () => {
    if (!countryName || !stateName || !cityName) return;

    onChange(`${cityName}, ${stateName}, ${countryName}`);
    setIsOpen(false);
    setActiveList(null);
    setSearch("");
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
                  <span className="officeLocationInnerChevron officeLocationInnerChevronOpen" />
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
                  <span className="officeLocationInnerChevron officeLocationInnerChevronOpen" />
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
                  <span className="officeLocationInnerChevron officeLocationInnerChevronOpen" />
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
                          setActiveList(null);
                          setSearch("");
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

          <div className="officeLocationActions">
            <button
              type="button"
              className="officeLocationCancelButton"
              onClick={cancelLocation}
            >
              Cancel
            </button>
            <button
              type="button"
              className="officeLocationApplyButton"
              disabled={!countryName || !stateName || !cityName}
              onClick={applyLocation}
            >
              Apply
            </button>
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

              const uploadLimit = getRecommendedUploadLimit(file);

              if (!uploadLimit) {
                onFileSizeError?.(
                  "Please choose only a recommended file type."
                );
                event.target.value = "";
                onChange(null);
                return;
              }

              if (file.size > uploadLimit.maxBytes) {
                onFileSizeError?.(
                  `${uploadLimit.label} recommended upload size is up to ${uploadLimit.sizeText}.`
                );
                event.target.value = "";
                onChange(null);
                return;
              }

              onChange(file);
            }}
          />
        )}
      </div>
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

export default function PlatformAdminProfilePage() {
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const registrationCardRef = useRef<HTMLElement>(null);
  const basicInformationCardRef = useRef<HTMLElement>(null);

  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const registrationInformationCompleted =
    registrationInfo.platformAdminId.trim() !== "" &&
    registrationInfo.fullName.trim() !== "" &&
    registrationInfo.dateOfBirth.trim() !== "" &&
    registrationInfo.officialEmail.trim() !== "" &&
    registrationInfo.mobileNumber.trim() !== "" &&
    registrationInfo.alternateEmail.trim() !== "" &&
    registrationInfo.alternatePhone.trim() !== "";

  const basicInformationCompleted =
    basicInfo.employeeCode.trim() !== "" &&
    basicInfo.gender !== "" &&
    basicInfo.designation.trim() !== "" &&
    basicInfo.department.trim() !== "" &&
    basicInfo.officeLocation.trim() !== "" &&
    basicInfo.dateOfJoining.trim() !== "" &&
    employeeIdCard !== null &&
    governmentIdProof !== null &&
    basicInfo.reportingSuperAdmin.trim() !== "";

  const profilePhotoCompleted =
    profileImage !== null && profileImage !== "";

  const registrationCompleted =
    registrationSectionSaved && registrationInformationCompleted;

  const basicCompleted =
    basicSectionSaved && basicInformationCompleted;

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
    setRegistrationStatus(null);
    setRegistrationValidationError(null);
    setBirthCalendarOpen(false);
    setBirthCalendarMode("days");
    setIsRegistrationEditing(true);
  };

  const handleRegistrationSave = () => {
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (
      !emailPattern.test(registrationDraft.officialEmail.trim()) ||
      !emailPattern.test(registrationDraft.alternateEmail.trim())
    ) {
      setRegistrationValidationError(
        "Please enter a valid email address."
      );
      window.setTimeout(() => setRegistrationValidationError(null), 2500);
      return;
    }

    const isValidPhone = (value: string, country: PhoneCountry | null) => {
      if (!value || !country) return false;
      return value.replace(/\D/g, "").length === getPhoneCountryDigits(country);
    };

    if (!isValidPhone(registrationDraft.mobileNumber, mobileCountry)) {
      setRegistrationValidationError("Please enter a valid mobile number.");
      window.setTimeout(() => setRegistrationValidationError(null), 2500);
      return;
    }

    if (!isValidPhone(registrationDraft.alternatePhone, alternateCountry)) {
      setRegistrationValidationError("Please enter a valid alternate phone number.");
      window.setTimeout(() => setRegistrationValidationError(null), 2500);
      return;
    }

    setRegistrationValidationError(null);

    const registrationDraftCompleted =
      registrationDraft.platformAdminId.trim() !== "" &&
      registrationDraft.fullName.trim() !== "" &&
      registrationDraft.dateOfBirth.trim() !== "" &&
      registrationDraft.officialEmail.trim() !== "" &&
      registrationDraft.mobileNumber.trim() !== "" &&
      registrationDraft.alternateEmail.trim() !== "" &&
      registrationDraft.alternatePhone.trim() !== "";

    setRegistrationInfo(registrationDraft);
    setSavedMobileCountry(mobileCountry);
    setSavedAlternateCountry(alternateCountry);
    setRegistrationSectionSaved(registrationDraftCompleted);
    setBirthCalendarOpen(false);
    setBirthCalendarMode("days");
    setIsRegistrationEditing(false);
    showSectionStatus(setRegistrationStatus, "saved");

    if (registrationDraftCompleted) {
      window.setTimeout(() => {
        basicInformationCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleRegistrationCancel = () => {
    setRegistrationDraft(registrationInfo);
    setMobileCountry(savedMobileCountry);
    setAlternateCountry(savedAlternateCountry);
    setBirthCalendarOpen(false);
    setBirthCalendarMode("days");
    setIsRegistrationEditing(false);
    showSectionStatus(setRegistrationStatus, "discarded");
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
      showBasicStepMessage("Please complete and save Registration Data first");
      return;
    }

    setBasicStepMessage(null);
    setBasicDraft(basicInfo);
    setBasicStatus(null);
    setIsGenderDropdownOpen(false);
    setIsJoiningCalendarOpen(false);
    setJoiningCalendarMode("days");
    setIsBasicEditing(true);
  };

  const handleBasicSave = () => {
    const basicDraftCompleted =
      basicDraft.employeeCode.trim() !== "" &&
      basicDraft.gender !== "" &&
      basicDraft.designation.trim() !== "" &&
      basicDraft.department.trim() !== "" &&
      basicDraft.officeLocation.trim() !== "" &&
      basicDraft.dateOfJoining.trim() !== "" &&
      employeeIdCard !== null &&
      governmentIdProof !== null &&
      basicDraft.reportingSuperAdmin.trim() !== "";

    setBasicInfo(basicDraft);
    setBasicSectionSaved(basicDraftCompleted);
    setIsGenderDropdownOpen(false);
    setIsJoiningCalendarOpen(false);
    setJoiningCalendarMode("days");
    setIsBasicEditing(false);
    showSectionStatus(setBasicStatus, "saved");
  };

  const handleBasicCancel = () => {
    setBasicDraft(basicInfo);
    setIsGenderDropdownOpen(false);
    setIsJoiningCalendarOpen(false);
    setJoiningCalendarMode("days");
    setIsBasicEditing(false);
    showSectionStatus(setBasicStatus, "discarded");
  };

  const handleReviewProfile = () => {
    setIsRegistrationEditing(false);
    setIsBasicEditing(false);
    setIsGenderDropdownOpen(false);
    setIsJoiningCalendarOpen(false);
    setBirthCalendarOpen(false);

    document
      .getElementById("platform-admin-main-content")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveProfile = () => {
    if (profileCompletionPercentage !== 100) {
      return;
    }

    if (isRegistrationEditing) {
      const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      const indianMobilePattern = /^[6-9]\d{9}$/;

      if (
        !emailPattern.test(registrationDraft.officialEmail.trim()) ||
        !emailPattern.test(registrationDraft.alternateEmail.trim())
      ) {
        setRegistrationValidationError(
          "Please enter a valid email address."
        );
        window.setTimeout(() => setRegistrationValidationError(null), 2500);
        return;
      }

      if (
        !indianMobilePattern.test(registrationDraft.mobileNumber.trim()) ||
        !indianMobilePattern.test(registrationDraft.alternatePhone.trim())
      ) {
        setRegistrationValidationError(
          "Please enter a valid Indian mobile number."
        );
        window.setTimeout(() => setRegistrationValidationError(null), 2500);
        return;
      }

      setRegistrationValidationError(null);

      const registrationDraftCompleted =
        registrationDraft.platformAdminId.trim() !== "" &&
        registrationDraft.fullName.trim() !== "" &&
        registrationDraft.dateOfBirth.trim() !== "" &&
        registrationDraft.officialEmail.trim() !== "" &&
        registrationDraft.mobileNumber.trim() !== "" &&
        registrationDraft.alternateEmail.trim() !== "" &&
        registrationDraft.alternatePhone.trim() !== "";

      setRegistrationInfo(registrationDraft);
      setRegistrationSectionSaved(registrationDraftCompleted);
      setIsRegistrationEditing(false);
    }

    if (isBasicEditing) {
      const basicDraftCompleted =
        basicDraft.employeeCode.trim() !== "" &&
        basicDraft.gender !== "" &&
        basicDraft.designation.trim() !== "" &&
        basicDraft.department.trim() !== "" &&
        basicDraft.officeLocation.trim() !== "" &&
        basicDraft.dateOfJoining.trim() !== "" &&
        employeeIdCard !== null &&
        governmentIdProof !== null &&
        basicDraft.reportingSuperAdmin.trim() !== "";

      setBasicInfo(basicDraft);
      setBasicSectionSaved(basicDraftCompleted);
      setIsBasicEditing(false);
    }

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
    window.setTimeout(() => setShowDraftSaved(false), 2000);
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

                {isRegistrationEditing ? (
                  <div className="editHeaderActions">
                    <button
                      type="button"
                      className="actionButton saveActionButton"
                      onClick={handleRegistrationSave}
                    >
                      <IconImage
                        src="/assets/platformadmin.imagesandicons/tick.svg"
                        alt=""
                        width={14}
                        height={14}
                      />
                      <span>Save</span>
                    </button>

                    <button
                      type="button"
                      className="actionButton cancelActionButton"
                      onClick={handleRegistrationCancel}
                    >
                      <IconImage
                        src="/assets/platformadmin.imagesandicons/cancel.svg"
                        alt=""
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

                {registrationStatus === "saved" && (
                  <div className="statusPopup statusSaved">
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/clapping.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>Changes Saved</span>
                  </div>
                )}

                {registrationStatus === "discarded" && (
                  <div className="statusPopup statusDiscarded">
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/sad.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>Changes Discarded</span>
                  </div>
                )}

                {registrationValidationError && (
                  <div className="statusPopup statusDiscarded">
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/sad.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>{registrationValidationError}</span>
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
                                    className={`joiningCalendarYearOption ${
                                      year === birthCalendarYear
                                        ? "joiningCalendarOptionSelected"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      setBirthCalendarMonth(
                                        new Date(
                                          year,
                                          birthCalendarMonthIndex,
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
                                  const isCurrentMonth =
                                    date.getMonth() === birthCalendarMonthIndex;
                                  const isSelected =
                                    registrationDraft.dateOfBirth === value;

                                  return (
                                    <button
                                      key={value}
                                      type="button"
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

                  <PhoneNumberField
                    label="Mobile Number"
                    country={mobileCountry}
                    value={registrationDraft.mobileNumber}
                    onCountryChange={setMobileCountry}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        mobileNumber: value,
                      }))
                    }
                  />

                  <PhoneNumberField
                    label="Alternate Phone"
                    country={alternateCountry}
                    value={registrationDraft.alternatePhone}
                    onCountryChange={setAlternateCountry}
                    onChange={(value) =>
                      setRegistrationDraft((current) => ({
                        ...current,
                        alternatePhone: value,
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
                    value={
                      registrationInfo.mobileNumber && savedMobileCountry
                        ? `+${getCountryCallingCode(savedMobileCountry)} ${registrationInfo.mobileNumber}`
                        : registrationInfo.mobileNumber || "Enter mobile number"
                    }
                  />
                  <InfoField
                    label="Alternate Phone"
                    value={
                      registrationInfo.alternatePhone && savedAlternateCountry
                        ? `+${getCountryCallingCode(savedAlternateCountry)} ${registrationInfo.alternatePhone}`
                        : registrationInfo.alternatePhone || "Enter alternate phone number"
                    }
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

                {isBasicEditing ? (
                  <div className="editHeaderActions">
                    <button
                      type="button"
                      className="actionButton saveActionButton"
                      onClick={handleBasicSave}
                    >
                      <IconImage
                        src="/assets/platformadmin.imagesandicons/tick.svg"
                        alt=""
                        width={14}
                        height={14}
                      />
                      <span>Save</span>
                    </button>

                    <button
                      type="button"
                      className="actionButton cancelActionButton"
                      onClick={handleBasicCancel}
                    >
                      <IconImage
                        src="/assets/platformadmin.imagesandicons/cancel.svg"
                        alt=""
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

                {basicStatus === "saved" && (
                  <div className="statusPopup statusSaved">
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/clapping.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>Changes Saved</span>
                  </div>
                )}

                {basicStatus === "discarded" && (
                  <div className="statusPopup statusDiscarded">
                    <IconImage
                      src="/assets/platformadmin.imagesandicons/sad.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>Changes Discarded</span>
                  </div>
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

                          const uploadLimit = getRecommendedUploadLimit(file);

                          if (!uploadLimit) {
                            showBasicUploadError(
                              "Please choose only a recommended file type."
                            );
                            event.target.value = "";
                            setGovernmentIdProof(null);
                            return;
                          }

                          if (file.size > uploadLimit.maxBytes) {
                            showBasicUploadError(
                              `${uploadLimit.label} recommended upload size is up to ${uploadLimit.sizeText}.`
                            );
                            event.target.value = "";
                            setGovernmentIdProof(null);
                            return;
                          }

                          setGovernmentIdProof(file);
                        }}
                      />
                    </div>
                    <span className="fileNameText">
                      {governmentIdProof?.name ?? "No File Chosen"}
                    </span>
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
                Review Profile
              </button>

              <button
                type="button"
                className="saveProfileButton"
                onClick={handleSaveProfile}
                disabled={profileCompletionPercentage !== 100}
                aria-disabled={profileCompletionPercentage !== 100}
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
