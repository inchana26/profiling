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
import "./superadmin.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";

type IconImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

const IconImage = ({
  src,
  alt = "",
  width = 20,
  height = 20,
  className = "",
}: IconImageProps) => (
  <Image src={src} alt={alt} width={width} height={height} className={className} />
);

type InfoFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
};

const InfoField = ({
  label,
  value,
  placeholder = "",
}: InfoFieldProps) => (
  <div className="infoField">
    <div className="infoLabel">{label}</div>
    <div className={`infoValue ${!value && placeholder ? "infoValuePlaceholder" : ""}`}>
      {value || placeholder}
    </div>
  </div>
);

type EditableFieldProps = {
  id: string;
  label: string;
  value: string;
  type?: string;
  maxLength?: number;
  inputMode?: "text" | "email" | "tel" | "numeric";
  placeholder?: string;
  onChange: (value: string) => void;
};

const EditableField = ({
  id,
  label,
  value,
  type = "text",
  maxLength,
  inputMode,
  placeholder = "",
  onChange,
}: EditableFieldProps) => (
  <div className="infoField editableField">
    <div className="editableFieldText">
      <label className="infoLabel" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="fieldInput"
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>

    <label className="roundFieldAction" htmlFor={id} aria-label={`Edit ${label}`}>
      <IconImage src="/assets/superadminicons/editbig.svg" width={24} height={24} />
    </label>
  </div>
);

type LockedFieldProps = {
  label: string;
  value: string;
};

const LockedField = ({ label, value }: LockedFieldProps) => (
  <div className="infoField editableField">
    <div className="editableFieldText">
      <div className="infoLabel">{label}</div>
      <div className="infoValue">{value}</div>
    </div>

    <span className="roundFieldAction roundFieldActionStatic" aria-hidden="true">
      <IconImage src="/assets/superadminicons/lock.svg" width={24} height={24} />
    </span>
  </div>
);

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const DateField = ({ id, label, value, onChange }: DateFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"days" | "months" | "years">("days");
  const calendarRef = useRef<HTMLDivElement>(null);

  const initialDate = value
    ? new Date(`${value}T00:00:00`)
    : new Date();

  const [calendarMonth, setCalendarMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [yearPageStart, setYearPageStart] = useState(() => {
    const initialYear = initialDate.getFullYear();
    return Math.floor(initialYear / 12) * 12;
  });

  useEffect(() => {
    if (!value) return;

    const selectedDate = new Date(`${value}T00:00:00`);
    setCalendarMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    setYearPageStart(Math.floor(selectedDate.getFullYear() / 12) * 12);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setCalendarMode("days");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();

  const calendarMonths = [
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

  const firstDay = new Date(
    calendarYear,
    calendarMonthIndex,
    1
  ).getDay();

  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    return new Date(
      calendarYear,
      calendarMonthIndex,
      1 - firstDay + index
    );
  });

  const yearPageYears = Array.from(
    { length: 12 },
    (_, index) => yearPageStart + index
  );

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const displayValue = value
    ? value.split("-").reverse().join("/")
    : "dd/mm/yyyy";

  return (
    <div className="infoField editableField dateField" ref={calendarRef}>
      <div className="editableFieldText">
        <div className="infoLabel">{label}</div>

        <button
          id={id}
          type="button"
          className="dateFieldButton"
          onClick={() => {
            setCalendarMode("days");
            setYearPageStart(Math.floor(calendarYear / 12) * 12);
            setIsOpen((current) => !current);
          }}
        >
          <span className={value ? "dateFieldValue" : "dateFieldPlaceholder"}>
            {displayValue}
          </span>
        </button>
      </div>

      <button
        type="button"
        className="roundFieldAction dateCalendarButton"
        onClick={() => {
          setCalendarMode("days");
          setYearPageStart(Math.floor(calendarYear / 12) * 12);
          setIsOpen((current) => !current);
        }}
      >
        <IconImage
          src="/assets/superadminicons/calendar.svg"
          width={24}
          height={24}
        />
      </button>

      {isOpen && (
        <div className="joiningCalendarPopup">
          <div className="joiningCalendarTopRow">
            <button
              type="button"
              className="joiningCalendarMainArrow"
              onClick={() => {
                setCalendarMonth(
                  new Date(
                    calendarYear,
                    calendarMonthIndex - 1,
                    1
                  )
                );
                setCalendarMode("days");
              }}
            >
              ‹
            </button>

            <button
              type="button"
              className="joiningCalendarHeaderSelect joiningCalendarMonthButton"
              onClick={() =>
                setCalendarMode((current) =>
                  current === "months" ? "days" : "months"
                )
              }
            >
              <span>{calendarMonths[calendarMonthIndex]}</span>
              <span className="joiningCalendarChevron">⌄</span>
            </button>

            <button
              type="button"
              className="joiningCalendarHeaderSelect joiningCalendarYearButton"
              onClick={() => {
                setYearPageStart(Math.floor(calendarYear / 12) * 12);
                setCalendarMode((current) =>
                  current === "years" ? "days" : "years"
                );
              }}
            >
              <span>{calendarYear}</span>
              <span className="joiningCalendarChevron">⌄</span>
            </button>

            <button
              type="button"
              className="joiningCalendarMainArrow"
              onClick={() => {
                setCalendarMonth(
                  new Date(
                    calendarYear,
                    calendarMonthIndex + 1,
                    1
                  )
                );
                setCalendarMode("days");
              }}
            >
              ›
            </button>
          </div>

          {calendarMode === "years" ? (
            <div className="joiningCalendarYearPanel">
              <div className="joiningCalendarRangeRow">
                <button
                  type="button"
                  className="joiningCalendarRangeArrow"
                  onClick={() =>
                    setYearPageStart((current) => current - 12)
                  }
                >
                  ‹
                </button>

                <strong>
                  {yearPageStart} - {yearPageStart + 11}
                </strong>

                <button
                  type="button"
                  className="joiningCalendarRangeArrow"
                  onClick={() =>
                    setYearPageStart((current) => current + 12)
                  }
                >
                  ›
                </button>
              </div>

              <div className="joiningCalendarYearGrid">
                {yearPageYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`joiningCalendarYearOption ${
                      year === calendarYear
                        ? "joiningCalendarOptionSelected"
                        : ""
                    }`}
                    onClick={() => {
                      setCalendarMonth(
                        new Date(
                          year,
                          calendarMonthIndex,
                          1
                        )
                      );
                      setCalendarMode("days");
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          ) : calendarMode === "months" ? (
            <div className="joiningCalendarMonthGrid">
              {calendarMonths.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  className={`joiningCalendarMonthOption ${
                    index === calendarMonthIndex
                      ? "joiningCalendarOptionSelected"
                      : ""
                  }`}
                  onClick={() => {
                    setCalendarMonth(
                      new Date(
                        calendarYear,
                        index,
                        1
                      )
                    );
                    setCalendarMode("days");
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="joiningCalendarWeekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                  (weekday) => (
                    <span key={weekday}>{weekday}</span>
                  )
                )}
              </div>

              <div className="joiningCalendarGrid">
                {calendarCells.map((date) => {
                  const dateValue = formatDate(date);
                  const isCurrentMonth =
                    date.getMonth() === calendarMonthIndex;
                  const isSelected = value === dateValue;

                  return (
                    <button
                      key={dateValue}
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
                        onChange(dateValue);

                        if (!isCurrentMonth) {
                          setCalendarMonth(
                            new Date(
                              date.getFullYear(),
                              date.getMonth(),
                              1
                            )
                          );
                        }

                        setIsOpen(false);
                        setCalendarMode("days");
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <button
            type="button"
            className="joiningCalendarClear"
            onClick={() => {
              onChange("");
              setIsOpen(false);
              setCalendarMode("days");
            }}
          >
            Clear
          </button>
        </div>
      )}
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

type RaisedDropdownProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const RaisedDropdownField = ({
  label,
  value,
  options,
  onChange,
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
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className={`infoField genderField ${isOpen ? "raisedDropdownFieldOpen" : ""}`}>
      <div className="infoLabel">{label}</div>

      <div className="genderDropdown" ref={dropdownRef}>
        <button
          type="button"
          className="genderDropdownButton"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className={!value ? "raisedDropdownPlaceholder" : ""}>
            {value || "Select"}
          </span>
          <span
            className={`genderChevron ${isOpen ? "genderChevronOpen" : ""}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            className={`genderDropdownMenu ${
              label === "Office Location" ? "officeLocationDropdownMenu" : ""
            }`}
            role="listbox"
            aria-label={label}
          >
            {options.map((option) => {
              const selected = value === option;

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`genderDropdownOption ${
                    selected ? "genderDropdownOptionSelected" : ""
                  }`}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                >
                  <span
                    className={`raisedDropdownRadio ${
                      selected ? "raisedDropdownRadioSelected" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

type GenderFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

const GenderField = ({ value, onChange }: GenderFieldProps) => (
  <RaisedDropdownField
    label="Gender"
    value={value}
    onChange={onChange}
    options={["Male", "Female", "Other", "Prefer not to say"]}
  />
);

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
          <div className="officeLocationSelectorGroup">
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

          <div className="officeLocationSelectorGroup">
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

          <div className="officeLocationSelectorGroup">
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

type GovernmentIdFieldProps = {
  fileName: string;
  documentType: string;
  editing: boolean;
  onDocumentTypeChange: (value: string) => void;
  onChange: (file: File | null) => void;
  onFileSizeError?: (message: string) => void;
};

const GovernmentIdField = ({
  fileName,
  documentType,
  editing,
  onDocumentTypeChange,
  onChange,
  onFileSizeError,
}: GovernmentIdFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!editing) {
      setIsTypeOpen(false);
    }
  }, [editing]);

  return (
    <div className={`infoField governmentIdField ${isTypeOpen ? "governmentIdFieldOpen" : ""}`}>
      <div className="infoLabel">Government ID Proof</div>

      <div className="governmentIdControls">
        <div className="documentTypeDropdown" ref={typeDropdownRef}>
          <button
            type="button"
            className="documentTypeButton"
            aria-haspopup="listbox"
            aria-expanded={editing && isTypeOpen}
            disabled={!editing}
            onClick={() => {
              if (!editing) return;
              setIsTypeOpen((current) => !current);
            }}
          >
            <span className={!documentType ? "raisedDropdownPlaceholder" : ""}>
              {documentType || "Document Type"}
            </span>
            <span
              className={`genderChevron ${isTypeOpen ? "genderChevronOpen" : ""}`}
              aria-hidden="true"
            />
          </button>

        </div>

        <div className="governmentIdFileColumn">
          <button
            type="button"
            className="chooseFileButton"
            disabled={!editing}
            onClick={() => {
              if (!editing) return;
              inputRef.current?.click();
            }}
          >
            <svg
              className="uploadFileIcon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 16V4M12 4L7.5 8.5M12 4L16.5 8.5M5 14.5V19H19V14.5"
                stroke="#235F07"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Choose File</span>
          </button>

          {fileName && (
            <span
              className="fileNameText governmentIdFileAccepted"
              title={fileName}
            >
              {fileName}
            </span>
          )}
        </div>

        <label
          htmlFor="government-id-proof-upload"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Government ID Proof
        </label>

        <input
          id="government-id-proof-upload"
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="nativeFileInput"
          disabled={!editing}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;

            if (!file) {
              onChange(null);
              return;
            }

            const MIN_FILE_SIZE = 1 * 1024;
            const MAX_FILE_SIZE = 5 * 1024 * 1024;

            if (file.size < MIN_FILE_SIZE || file.size > MAX_FILE_SIZE) {
              onFileSizeError?.(
                "Government ID Proof image must be between 1 KB and 5 MB."
              );
              event.target.value = "";
              onChange(null);
              return;
            }

            onChange(file);
          }}
        />
      </div>

      {editing && isTypeOpen && (
        <div
          className="genderDropdownMenu documentTypeMenu governmentIdFullMenu"
          role="listbox"
          aria-label="Document Type"
        >
          {[
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
          ].map((type) => {
            const selected = documentType === type;

            return (
              <button
                key={type}
                type="button"
                role="option"
                aria-selected={selected}
                className={`genderDropdownOption ${
                  selected ? "genderDropdownOptionSelected" : ""
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDocumentTypeChange(type);
                  setIsTypeOpen(false);
                }}
              >
                <span
                  className={`raisedDropdownRadio ${
                    selected ? "raisedDropdownRadioSelected" : ""
                  }`}
                  aria-hidden="true"
                />
                <span className="documentTypeOptionText">{type}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function SuperAdminPage() {
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState("");
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("02:26PM");

  const [isBasicEditing, setIsBasicEditing] = useState(false);
  const [isContactEditing, setIsContactEditing] = useState(false);
  const [basicStatus, setBasicStatus] = useState<"saved" | "discarded" | null>(null);
  const [contactStatus, setContactStatus] = useState<"saved" | "discarded" | null>(null);
  const [contactValidationError, setContactValidationError] = useState<string | null>(null);
  const [basicStepMessage, setBasicStepMessage] = useState<string | null>(null);
  const [contactStepMessage, setContactStepMessage] = useState<string | null>(null);
  const [basicSectionCompleted, setBasicSectionCompleted] = useState(false);
  const [contactSectionCompleted, setContactSectionCompleted] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    fullName: "Rajesh Mehta",
    displayName: "",
    designation: "CEO/Founder",
    dateOfBirth: "",
    gender: "",
    officeLocation: "",
  });
  const [basicDraft, setBasicDraft] = useState(basicInfo);

  const [contactInfo, setContactInfo] = useState({
    officialEmail: "",
    mobileNumber: "",
    alternateNumber: "",
    alternateEmail: "",
  });
  const [contactDraft, setContactDraft] = useState(contactInfo);
  const [mobileCountry, setMobileCountry] = useState<PhoneCountry | null>(null);
  const [alternateCountry, setAlternateCountry] = useState<PhoneCountry | null>(null);
  const [savedMobileCountry, setSavedMobileCountry] = useState<PhoneCountry | null>(null);
  const [savedAlternateCountry, setSavedAlternateCountry] = useState<PhoneCountry | null>(null);

  const [governmentIdProof, setGovernmentIdProof] = useState<File | null>(null);
  const [governmentIdDocumentType, setGovernmentIdDocumentType] = useState("");
  const [governmentIdUploadError, setGovernmentIdUploadError] = useState<string | null>(null);

  const showGovernmentIdUploadError = (message: string) => {
    setGovernmentIdUploadError(message);
    window.setTimeout(() => setGovernmentIdUploadError(null), 2500);
  };
  const basicInformationComplete =
    basicDraft.displayName.trim() !== "" &&
    basicDraft.dateOfBirth.trim() !== "" &&
    basicDraft.gender.trim() !== "" &&
    basicDraft.officeLocation.trim() !== "" &&
    governmentIdDocumentType.trim() !== "" &&
    Boolean(governmentIdProof);

  const contactInformationComplete =
    contactDraft.officialEmail.trim() !== "" &&
    contactDraft.mobileNumber.trim() !== "";

  const profilePhotoCompleted =
    Boolean(profileImage && profileImage.trim() !== "");

  const profileCompletionPercentage =
    (profilePhotoCompleted ? 34 : 0) +
    (basicSectionCompleted ? 33 : 0) +
    (contactSectionCompleted ? 33 : 0);

  const profileCompleted = profileCompletionPercentage === 100;
  

  useEffect(() => {
    let popupTimer: number | undefined;

    const showDraftSavedPopup = () => {
      const value = new Date()
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      setDraftSavedTime(value);

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

    const interval = window.setInterval(showDraftSavedPopup, 10000);

    return () => {
      window.clearInterval(interval);

      if (popupTimer) {
        window.clearTimeout(popupTimer);
      }
    };
  }, []);

  const showStatus = (
    setter: React.Dispatch<React.SetStateAction<"saved" | "discarded" | null>>,
    status: "saved" | "discarded"
  ) => {
    setter(status);
    window.setTimeout(() => setter(null), 2500);
  };

  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const showBasicStepMessage = (message: string) => {
    setBasicStepMessage(message);
    window.setTimeout(() => setBasicStepMessage(null), 2500);
  };

  const showContactStepMessage = (message: string) => {
    setContactStepMessage(message);
    window.setTimeout(() => setContactStepMessage(null), 2500);
  };

  const openBasicEditMode = () => {
    if (!profilePhotoCompleted) {
      showBasicStepMessage("Please upload Profile Photo");
      return;
    }

    setBasicDraft(basicInfo);
    setBasicStatus(null);
    setIsBasicEditing(true);
  };

  const openContactEditMode = () => {
    if (!profilePhotoCompleted) {
      showContactStepMessage("Please upload Profile Photo");
      return;
    }

    if (!basicSectionCompleted) {
      showContactStepMessage("Please complete Basic Information");
      return;
    }

    setContactDraft(contactInfo);
    setMobileCountry(savedMobileCountry);
    setAlternateCountry(savedAlternateCountry);
    setContactStatus(null);
    setContactValidationError(null);
    setIsContactEditing(true);
  };

  const handleBasicSave = () => {
    if (!profilePhotoCompleted) {
      showBasicStepMessage("Please upload Profile Photo");
      return;
    }

    if (!basicInformationComplete) {
      showBasicStepMessage("Please fill all Basic Information fields");
      return;
    }

    setBasicInfo(basicDraft);
    setBasicSectionCompleted(true);
    setIsBasicEditing(false);
    showStatus(setBasicStatus, "saved");
  };

  const handleBasicCancel = () => {
    setBasicDraft(basicInfo);
    setIsBasicEditing(false);
    showStatus(setBasicStatus, "discarded");
  };

  const showContactValidationError = (message: string) => {
    setContactValidationError(message);

    window.setTimeout(() => {
      setContactValidationError(null);
    }, 2500);
  };

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  const isValidPhone = (value: string, country: PhoneCountry | null) => {
    if (!value || !country) return false;
    return value.replace(/\D/g, "").length === getPhoneCountryDigits(country);
  };

  const handleContactSave = () => {
    if (!profilePhotoCompleted) {
      showContactStepMessage("Please upload Profile Photo");
      return;
    }

    if (!basicSectionCompleted) {
      showContactStepMessage("Please complete Basic Information");
      return;
    }

    if (!contactInformationComplete) {
      showContactStepMessage("Please fill required Contact Information");
      return;
    }

    if (!isValidEmail(contactDraft.officialEmail)) {
      showContactValidationError("Enter a valid Official Email ID");
      return;
    }

    if (!isValidPhone(contactDraft.mobileNumber, mobileCountry)) {
      showContactValidationError(
        "Enter a valid mobile number"
      );
      return;
    }

    if (
      contactDraft.alternateNumber &&
      !isValidPhone(contactDraft.alternateNumber, alternateCountry)
    ) {
      showContactValidationError(
        "Enter a valid alternate number"
      );
      return;
    }

    if (
      contactDraft.alternateEmail &&
      !isValidEmail(contactDraft.alternateEmail)
    ) {
      showContactValidationError("Enter a valid Alternate Email");
      return;
    }

    setContactValidationError(null);
    setContactInfo(contactDraft);
    setSavedMobileCountry(mobileCountry);
    setSavedAlternateCountry(alternateCountry);
    setContactSectionCompleted(true);
    setIsContactEditing(false);
    showStatus(setContactStatus, "saved");
  };

  const handleContactCancel = () => {
    setContactDraft(contactInfo);
    setMobileCountry(savedMobileCountry);
    setAlternateCountry(savedAlternateCountry);
    setContactValidationError(null);
    setIsContactEditing(false);
    showStatus(setContactStatus, "discarded");
  };

  const handleSaveProfile = () => {
    if (isBasicEditing) {
      setBasicInfo(basicDraft);
      setIsBasicEditing(false);
    }

    if (isContactEditing) {
      setContactInfo(contactDraft);
      setIsContactEditing(false);
    }
  };

  return (
    <main className="superAdminPage">
      <a className="skipLink" href="#profile-main-content">Skip to main content</a>

      <div className="dashboardLayout">
        <Sidebar />

        <section className="mainContent">
          <Header />

          <div className="pageContent" id="profile-main-content" tabIndex={-1}>
            <div className="pageHeadingRow">
              <div className="pageHeading">
                <h1>Super admin Profile</h1>
                <p>Manage Your Identity, Access, Preferences, And Activity With Ease.</p>
              </div>

              {showDraftSaved && (
                <div className="savedBadge" role="status" aria-live="polite">
                  <IconImage src="/assets/superadminicons/check.svg" width={20} height={20} />
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
                        alt="Rajesh Mehta"
                        fill
                        sizes="88px"
                        className="avatarImage"
                        unoptimized={profileImage.startsWith("data:")}
                        priority
                      />
                    ) : (
                      <div className="profileImageEmpty" aria-hidden="true" />
                    )}
                  </div>

                  <button
                    type="button"
                    className="cameraButton"
                    aria-label="Change profile image"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    <IconImage src="/assets/superadminicons/camera.svg" width={22} height={22} />
                  </button>

                  <label
                    htmlFor="profile-image-upload"
                    style={{
                      position: "absolute",
                      width: "1px",
                      height: "1px",
                      padding: 0,
                      margin: "-1px",
                      overflow: "hidden",
                      clip: "rect(0, 0, 0, 0)",
                      whiteSpace: "nowrap",
                      border: 0,
                    }}
                  >
                    Upload profile image
                  </label>
                  <input
                    id="profile-image-upload"
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    className="profileImageInput"
                    onChange={handleProfileImageSelect}
                  />
                </div>

                <div className="identityContent">
                  <h2>Rajesh Mehta</h2>
                  <div className="roleName">Super Admin</div>
                  <div className="activeBadge">
                    <span className="activeDot" />
                    <span>Active</span>
                  </div>
                  <div className="adminId">Super admin ID : SA10001</div>
                </div>
              </div>

              <div className="verticalDivider" />

              <div className="completionSection">
                <div className="completionHeader">
                  <h3>Profile Completion</h3>
                  <span className={profileCompleted ? "completionPercentageComplete" : ""}>
                    {profileCompletionPercentage}% Completed
                  </span>
                </div>

                <div className="progressTrack">
                  <div
                    className={`progressBar ${profileCompleted ? "progressBarComplete" : ""}`}
                    style={{ width: `${profileCompletionPercentage}%` }}
                  />
                </div>

                <div className="completionSteps targetCompletionSteps">
                  <div className="completionStep">
                    {profilePhotoCompleted ? (
                      <span className="completedCircle">✓</span>
                    ) : (
                      <span className="emptyCircle" />
                    )}
                    <span>Profile Photo</span>
                  </div>
                  <div className="completionStep">
                    {basicSectionCompleted ? (
                      <span className="completedCircle">✓</span>
                    ) : (
                      <span className="emptyCircle" />
                    )}
                    <span>Basic Information</span>
                  </div>
                  <div className="completionStep">
                    {contactSectionCompleted ? (
                      <span className="completedCircle">✓</span>
                    ) : (
                      <span className="emptyCircle" />
                    )}
                    <span>Contact Information</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="informationCard basicInformationCard">
              <div className="informationHeader basicInformationHeader">
                <div className="informationTitle">
                  <span className="sectionIcon blueIcon">
                    <IconImage src="/assets/superadminicons/user.svg" alt="" width={16} height={16} className="whiteIcon sectionIconImage" />
                  </span>
                  <h2>Basic Information</h2>
                </div>

                {isBasicEditing ? (
                  <div className="editHeaderActions">
                    <button
                      type="button"
                      className="actionButton saveActionButton"
                      aria-disabled={!basicInformationComplete}
                      title={!basicInformationComplete ? "Fill all Basic Information fields first" : "Save Basic Information"}
                      onClick={handleBasicSave}
                    >
                      <IconImage src="/assets/superadminicons/tick.svg" width={14} height={14} />
                      <span>Save</span>
                    </button>
                    <button type="button" className="actionButton cancelActionButton" onClick={handleBasicCancel}>
                      <IconImage src="/assets/superadminicons/cancel.svg" width={14} height={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="editButton"
                    aria-label="Edit profile"
                    aria-disabled={!profilePhotoCompleted}
                    title={!profilePhotoCompleted ? "Complete Profile Photo first" : "Edit Basic Information"}
                    onClick={openBasicEditMode}
                  >
                    <IconImage src="/assets/superadminicons/edits.svg" width={24} height={24} />
                  </button>
                )}

                {basicStatus === "saved" && (
                  <div className="statusPopup statusSaved">
                    <IconImage src="/assets/superadminicons/clapping.svg" width={24} height={24} />
                    <span>Changes Saved</span>
                  </div>
                )}
                {basicStatus === "discarded" && (
                  <div className="statusPopup statusDiscarded">
                    <IconImage src="/assets/superadminicons/sad.svg" width={24} height={24} />
                    <span>Changes Discarded</span>
                  </div>
                )}

                {basicStepMessage && (
                  <div className="statusPopup statusDiscarded" role="status" aria-live="polite">
                    <IconImage src="/assets/superadminicons/sad.svg" width={24} height={24} />
                    <span>{basicStepMessage}</span>
                  </div>
                )}

                {governmentIdUploadError && (
                  <div className="statusPopup statusDiscarded">
                    <IconImage src="/assets/superadminicons/sad.svg" width={24} height={24} />
                    <span>{governmentIdUploadError}</span>
                  </div>
                )}
              </div>

              {isBasicEditing ? (
                <div className="informationGrid basicTargetGrid">
                  <LockedField label="Full Name" value={basicInfo.fullName} />
                  <EditableField
                    id="basic-display-name"
                    label="Display Name"
                    value={basicDraft.displayName}
                    placeholder="Enter a name"
                    onChange={(value) => setBasicDraft((current) => ({ ...current, displayName: value }))}
                  />
                  <LockedField label="Designation" value={basicInfo.designation} />
                  <DateField
                    id="basic-date-of-birth"
                    label="Date of Birth"
                    value={basicDraft.dateOfBirth}
                    onChange={(value) => setBasicDraft((current) => ({ ...current, dateOfBirth: value }))}
                  />
                  <GenderField
                    value={basicDraft.gender}
                    onChange={(value) => setBasicDraft((current) => ({ ...current, gender: value }))}
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
                  <GovernmentIdField
                    fileName={governmentIdProof?.name ?? ""}
                    documentType={governmentIdDocumentType}
                    editing={true}
                    onDocumentTypeChange={setGovernmentIdDocumentType}
                    onChange={setGovernmentIdProof}
                    onFileSizeError={showGovernmentIdUploadError}
                  />
                </div>
              ) : (
                <div className="informationGrid basicTargetGrid">
                  <InfoField label="Full Name" value={basicInfo.fullName} />
                  <InfoField label="Display Name" value={basicInfo.displayName} placeholder="Enter a name" />
                  <InfoField label="Designation" value={basicInfo.designation} />
                  <InfoField label="Date of Birth" value={basicInfo.dateOfBirth} placeholder="dd/mm/yyyy" />
                  <InfoField label="Gender" value={basicInfo.gender} placeholder="Select" />
                  <InfoField label="Office Location" value={basicInfo.officeLocation} placeholder="Select" />
                  <GovernmentIdField
                    fileName={governmentIdProof?.name ?? ""}
                    documentType={governmentIdDocumentType}
                    editing={false}
                    onDocumentTypeChange={setGovernmentIdDocumentType}
                    onChange={setGovernmentIdProof}
                    onFileSizeError={showGovernmentIdUploadError}
                  />
                </div>
              )}
            </section>

            <section className="informationCard contactInformationCard">
              <div className="informationHeader contactInformationHeader">
                <div className="informationTitle">
                  <span className="sectionIcon pinkIcon">
                    <IconImage src="/assets/superadminicons/call.svg" alt="" width={16} height={16} className="whiteIcon sectionIconImage" />
                  </span>
                  <h2>Contact Information</h2>
                </div>

                {isContactEditing ? (
                  <div className="editHeaderActions">
                    <button
                      type="button"
                      className="actionButton saveActionButton"
                      aria-disabled={!contactInformationComplete}
                      title={!contactInformationComplete ? "Fill required Contact Information first" : "Save Contact Information"}
                      onClick={handleContactSave}
                    >
                      <IconImage src="/assets/superadminicons/tick.svg" width={14} height={14} />
                      <span>Save</span>
                    </button>
                    <button type="button" className="actionButton cancelActionButton" onClick={handleContactCancel}>
                      <IconImage src="/assets/superadminicons/cancel.svg" width={14} height={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="editButton"
                    aria-label="Edit profile"
                    aria-disabled={!profilePhotoCompleted || !basicSectionCompleted}
                    title={
                      !profilePhotoCompleted
                        ? "Complete Profile Photo first"
                        : !basicSectionCompleted
                          ? "Complete Basic Information first"
                          : "Edit Contact Information"
                    }
                    onClick={openContactEditMode}
                  >
                    <IconImage src="/assets/superadminicons/edits.svg" width={24} height={24} />
                  </button>
                )}

                {contactStatus === "saved" && (
                  <div className="statusPopup statusSaved">
                    <IconImage src="/assets/superadminicons/clapping.svg" width={24} height={24} />
                    <span>Changes Saved</span>
                  </div>
                )}
                {contactStatus === "discarded" && (
                  <div className="statusPopup statusDiscarded">
                    <IconImage src="/assets/superadminicons/sad.svg" width={24} height={24} />
                    <span>Changes Discarded</span>
                  </div>
                )}

                {contactStepMessage && (
                  <div className="statusPopup statusDiscarded contactValidationPopup" role="status" aria-live="polite">
                    <IconImage src="/assets/superadminicons/sad.svg" width={24} height={24} />
                    <span>{contactStepMessage}</span>
                  </div>
                )}

                {contactValidationError && (
                  <div className="statusPopup statusDiscarded contactValidationPopup">
                    <IconImage src="/assets/superadminicons/sad.svg" width={24} height={24} />
                    <span>{contactValidationError}</span>
                  </div>
                )}
              </div>

              {isContactEditing ? (
                <div className="informationGrid contactTargetGrid">
                  <EditableField
                    id="contact-official-email"
                    label="Official Email ID"
                    value={contactDraft.officialEmail}
                    type="email"
                    inputMode="email"
                    placeholder="Enter an email"
                    onChange={(value) =>
                      setContactDraft((current) => ({
                        ...current,
                        officialEmail: value,
                      }))
                    }
                  />
                  <EditableField
                    id="contact-alternate-email"
                    label="Alternate Email"
                    value={contactDraft.alternateEmail}
                    type="email"
                    inputMode="email"
                    placeholder="Enter an email"
                    onChange={(value) =>
                      setContactDraft((current) => ({
                        ...current,
                        alternateEmail: value,
                      }))
                    }
                  />
                  <PhoneNumberField
                    label="Mobile Number"
                    country={mobileCountry}
                    value={contactDraft.mobileNumber}
                    onCountryChange={setMobileCountry}
                    onChange={(value) =>
                      setContactDraft((current) => ({
                        ...current,
                        mobileNumber: value,
                      }))
                    }
                  />
                  <PhoneNumberField
                    label="Alternate Number"
                    country={alternateCountry}
                    value={contactDraft.alternateNumber}
                    onCountryChange={setAlternateCountry}
                    onChange={(value) =>
                      setContactDraft((current) => ({
                        ...current,
                        alternateNumber: value,
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="informationGrid contactTargetGrid">
                  <InfoField label="Official Email ID" value={contactInfo.officialEmail} placeholder="Enter an email" />
                  <InfoField label="Alternate Email" value={contactInfo.alternateEmail} placeholder="Enter an email" />
                  <InfoField
                    label="Mobile Number"
                    value={contactInfo.mobileNumber && savedMobileCountry
                      ? `+${getCountryCallingCode(savedMobileCountry)} ${contactInfo.mobileNumber}`
                      : ""}
                    placeholder="Select"
                  />
                  <InfoField
                    label="Alternate Number"
                    value={contactInfo.alternateNumber && savedAlternateCountry
                      ? `+${getCountryCallingCode(savedAlternateCountry)} ${contactInfo.alternateNumber}`
                      : ""}
                    placeholder="Select"
                  />
                </div>
              )}
            </section>

            <div className="profileBottomActions">
              <button
                type="button"
                className="reviewProfileButton"
              >
                Review Profile
              </button>

              <button
                type="button"
                className="saveProfileButton"
                onClick={handleSaveProfile}
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
