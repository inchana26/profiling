"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Country, State as CountryState, City } from "country-state-city";
import ReactCountryFlag from "react-country-flag";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (!activeList) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [activeList]);

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
    setActiveList(list);
  };

  const closeList = () => {
    setActiveList(null);
    setSearch("");
  };

  const SearchSelector = ({
    type,
    placeholder,
    disabled = false,
    selectedContent,
  }: {
    type: Exclude<OfficeLocationListType, null>;
    placeholder: string;
    disabled?: boolean;
    selectedContent?: React.ReactNode;
  }) => {
    const active = activeList === type;

    if (active) {
      return (
        <div className="officeLocationSelector officeLocationSelectorOpen officeLocationSingleSearch">
          <span className="officeLocationSearchIcon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            autoFocus
            type="text"
            value={search}
            placeholder={placeholder}
            onChange={(event) => setSearch(event.target.value)}
            aria-label={placeholder}
          />
          <button
            type="button"
            className="officeLocationSingleSearchClose"
            onClick={closeList}
            aria-label={`Close ${type} dropdown`}
          >
            <span
              className="officeLocationInnerChevron officeLocationInnerChevronOpen"
              aria-hidden="true"
            />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        className="officeLocationSelector"
        disabled={disabled}
        onClick={() => openList(type)}
      >
        <span className="officeLocationSearchIcon" aria-hidden="true" />
        <span className="officeLocationSelectorValue">
          {selectedContent || (
            <span className="officeLocationSelectorPlaceholder">{placeholder}</span>
          )}
        </span>
        <span className="officeLocationInnerChevron" aria-hidden="true" />
      </button>
    );
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
        <div className="officeLocationPanel" role="dialog" aria-label="Office Location">
          <div className="officeLocationSelectorGroup">
            <div className="officeLocationSelectorLabel">Country/ Region</div>

            <SearchSelector
              type="country"
              placeholder="Search Country"
              selectedContent={
                countryName ? (
                  <span className="officeLocationSelectedCountry">
                    <ReactCountryFlag
                      countryCode={countryCode}
                      svg
                      className="officeLocationSelectedFlag"
                      aria-label={`${countryName} flag`}
                    />
                    <span>{countryName}</span>
                  </span>
                ) : undefined
              }
            />

            {activeList === "country" && (
              <div className="officeLocationOptionsPanel officeLocationSingleOptionsPanel">
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
                          closeList();
                        }}
                      >
                        <ReactCountryFlag
                          countryCode={country.isoCode}
                          svg
                          className="officeLocationFlag"
                          aria-label={`${country.name} flag`}
                        />
                        <span className="officeLocationOptionName">{country.name}</span>
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

            <SearchSelector
              type="state"
              placeholder="Search State/Province"
              disabled={!countryCode}
              selectedContent={stateName || undefined}
            />

            {activeList === "state" && (
              <div className="officeLocationOptionsPanel officeLocationSingleOptionsPanel">
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
                          closeList();
                        }}
                      >
                        <span className="officeLocationOptionName">{state.name}</span>
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

            <SearchSelector
              type="city"
              placeholder="Search City.."
              disabled={!stateCode}
              selectedContent={cityName || undefined}
            />

            {activeList === "city" && (
              <div className="officeLocationOptionsPanel officeLocationSingleOptionsPanel">
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
                          closeList();
                          setIsOpen(false);
                        }}
                      >
                        <span className="officeLocationOptionName">{city.name}</span>
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

  useEffect(() => {
    if (!fileName && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [fileName]);

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
            className={`chooseFileButton ${fileName ? "chooseFileButtonUploaded" : ""}`}
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
                stroke="currentColor"
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
  const [basicStepMessage, setBasicStepMessage] = useState<string | null>(null);
  const [contactStepMessage, setContactStepMessage] = useState<string | null>(null);

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

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  const contactInformationComplete =
    contactDraft.officialEmail.trim() !== "" &&
    contactDraft.alternateEmail.trim() !== "" &&
    contactDraft.mobileNumber.trim() !== "" &&
    contactDraft.alternateNumber.trim() !== "" &&
    isValidEmail(contactDraft.officialEmail) &&
    isValidEmail(contactDraft.alternateEmail);

  const basicSectionCompleted = basicInformationComplete;
  const contactSectionCompleted = contactInformationComplete;

  const profilePhotoCompleted =
    Boolean(profileImage && profileImage.trim() !== "");

  const profileCompletionPercentage =
    (profilePhotoCompleted ? 34 : 0) +
    (basicSectionCompleted ? 33 : 0) +
    (contactSectionCompleted ? 33 : 0);

  const profileCompleted = profileCompletionPercentage === 100;

  useEffect(() => {
    const savedProfileImage = localStorage.getItem("superAdminProfileImage");

    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);
  

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


  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);

        localStorage.setItem(
          "superAdminProfileImage",
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

  const showBasicStepMessage = (message: string) => {
    setBasicStepMessage(message);
    window.setTimeout(() => setBasicStepMessage(null), 2500);
  };

  const showContactStepMessage = (message: string) => {
    setContactStepMessage(message);
    window.setTimeout(() => setContactStepMessage(null), 2500);
  };

  const openBasicEditMode = () => {
    if (isBasicEditing) return;

    if (!profilePhotoCompleted) {
      showBasicStepMessage("Please upload Profile Photo");
      return;
    }

    setBasicDraft(basicInfo);
    setIsBasicEditing(true);
  };

  const openContactEditMode = () => {
    if (isContactEditing) return;

    if (!profilePhotoCompleted) {
      showContactStepMessage("Please upload Profile Photo");
      return;
    }

    if (!basicSectionCompleted) {
      showContactStepMessage("Please complete Basic Information");
      return;
    }

    setContactDraft(contactInfo);
    setIsContactEditing(true);
  };

  const handleSaveProfile = () => {
    if (!profilePhotoCompleted) {
      showBasicStepMessage("Please upload Profile Photo");
      return;
    }

    if (!basicInformationComplete) {
      showBasicStepMessage("Please fill all Basic Information fields");
      return;
    }

    if (
      contactDraft.officialEmail.trim() === "" ||
      contactDraft.alternateEmail.trim() === "" ||
      contactDraft.mobileNumber.trim() === "" ||
      contactDraft.alternateNumber.trim() === ""
    ) {
      showContactStepMessage("Please fill all Contact Information fields");
      return;
    }

    if (!isValidEmail(contactDraft.officialEmail)) {
      showContactStepMessage("Enter a valid Official Email ID");
      return;
    }

    if (!isValidEmail(contactDraft.alternateEmail)) {
      showContactStepMessage("Enter a valid Alternate Email");
      return;
    }

    setBasicInfo(basicDraft);
    setContactInfo(contactDraft);
    setIsBasicEditing(false);
    setIsContactEditing(false);

    window.location.href = "/sign_in";
  };

  const handleCancelProfile = () => {
    const resetBasicInfo = {
      fullName: "Rajesh Mehta",
      displayName: "",
      designation: "CEO/Founder",
      dateOfBirth: "",
      gender: "",
      officeLocation: "",
    };

    const resetContactInfo = {
      officialEmail: "",
      mobileNumber: "",
      alternateNumber: "",
      alternateEmail: "",
    };

    setProfileImage("");
    localStorage.removeItem("superAdminProfileImage");
    window.dispatchEvent(new Event("profileImageUpdated"));

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }

    setBasicInfo(resetBasicInfo);
    setBasicDraft(resetBasicInfo);

    setContactInfo(resetContactInfo);
    setContactDraft(resetContactInfo);

    setGovernmentIdProof(null);
    setGovernmentIdDocumentType("");
    setGovernmentIdUploadError(null);

    setBasicStepMessage(null);
    setContactStepMessage(null);
    setShowDraftSaved(false);

    setIsBasicEditing(false);
    setIsContactEditing(false);
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
                      <span className="completedCircle" aria-hidden="true">
                        <svg
                          className="completedCheckIcon"
                          viewBox="0 0 8 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.75 3.05L2.85 5.15L7.25 0.75"
                            stroke="#2A7308"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : (
                      <span className="emptyCircle" />
                    )}
                    <span>Profile Photo</span>
                  </div>
                  <div className="completionStep">
                    {basicSectionCompleted ? (
                      <span className="completedCircle" aria-hidden="true">
                        <svg
                          className="completedCheckIcon"
                          viewBox="0 0 8 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.75 3.05L2.85 5.15L7.25 0.75"
                            stroke="#2A7308"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : (
                      <span className="emptyCircle" />
                    )}
                    <span>Basic Information</span>
                  </div>
                  <div className="completionStep">
                    {contactSectionCompleted ? (
                      <span className="completedCircle" aria-hidden="true">
                        <svg
                          className="completedCheckIcon"
                          viewBox="0 0 8 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.75 3.05L2.85 5.15L7.25 0.75"
                            stroke="#2A7308"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
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

                {contactStepMessage && (
                  <div className="statusPopup statusDiscarded contactValidationPopup" role="status" aria-live="polite">
                    <IconImage src="/assets/superadminicons/sad.svg" width={24} height={24} />
                    <span>{contactStepMessage}</span>
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
                  <EditableField
                    id="contact-mobile-number"
                    label="Mobile Number"
                    value={contactDraft.mobileNumber}
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="Enter Mobile Number"
                    onChange={(value) =>
                      setContactDraft((current) => ({
                        ...current,
                        mobileNumber: value.replace(/\D/g, "").slice(0, 15),
                      }))
                    }
                  />
                  <EditableField
                    id="contact-alternate-number"
                    label="Alternate Number"
                    value={contactDraft.alternateNumber}
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="Enter Alternate Number"
                    onChange={(value) =>
                      setContactDraft((current) => ({
                        ...current,
                        alternateNumber: value.replace(/\D/g, "").slice(0, 15),
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
                    value={contactInfo.mobileNumber}
                    placeholder="Enter Mobile Number"
                  />
                  <InfoField
                    label="Alternate Number"
                    value={contactInfo.alternateNumber}
                    placeholder="Enter Alternate Number"
                  />
                </div>
              )}
            </section>

            <div className="profileBottomActions">
              <button
                type="button"
                className="reviewProfileButton"
                onClick={handleCancelProfile}
              >
                <IconImage
                  src="/assets/superadminicons/cancel.svg"
                  width={14}
                  height={14}
                  className="cancelProfileIcon"
                />
                Cancel
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
