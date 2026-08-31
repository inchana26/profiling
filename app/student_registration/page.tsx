"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./register.css";
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

type RegistrationData = {
  tenantId: string;
  tenantName: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  alternateEmail: string;
  alternateMobile: string;
  altEmailVerified: string;
  altPhoneVerified: string;
};

type RegistrationKey = keyof RegistrationData;

const fieldConfig: Array<{
  key: RegistrationKey;
  label: string;
  locked?: boolean;
}> = [
  { key: "tenantId", label: "Tenant ID" },
  { key: "tenantName", label: "Tenant Name" },
  { key: "userId", label: "User ID" },
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "alternateEmail", label: "Alternate Email" },
  { key: "alternateMobile", label: "Alternate Mobile" },
  { key: "altEmailVerified", label: "Alt Email Verified", locked: true },
  { key: "altPhoneVerified", label: "Alt Phone Verified", locked: true },
];

export default function StudentRegistrationPage() {
  const router = useRouter();

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState(
    "/assets/superadminimages/profile.png"
  );

  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("");

  const [isRegistrationEditing, setIsRegistrationEditing] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<
    "saved" | "discarded" | null
  >(null);

  const [registrationInfo, setRegistrationInfo] = useState<RegistrationData>({
    tenantId: "LXP-COL-001",
    tenantName: "Shree Rama Krishna Institute",
    userId: "PRGEEQSYX8L8WV7",
    fullName: "Student",
    email: "student@srki.com",
    phone: "9565216565",
    alternateEmail: "alter@srki.org",
    alternateMobile: "9822222123",
    altEmailVerified: "True",
    altPhoneVerified: "True",
  });

  const [registrationDraft, setRegistrationDraft] =
    useState<RegistrationData>(registrationInfo);

  const showRegistrationStatus = (status: "saved" | "discarded") => {
    setRegistrationStatus(status);
    window.setTimeout(() => setRegistrationStatus(null), 2500);
  };

  const handleRegistrationEdit = () => {
    setRegistrationDraft(registrationInfo);
    setRegistrationStatus(null);
    setIsRegistrationEditing(true);
  };

  const handleRegistrationSave = () => {
    setRegistrationInfo(registrationDraft);
    setIsRegistrationEditing(false);
    showRegistrationStatus("saved");
  };

  const handleRegistrationCancel = () => {
    setRegistrationDraft(registrationInfo);
    setIsRegistrationEditing(false);
    showRegistrationStatus("discarded");
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
                  <IconImage src={"/assets/studenticons/checkmark.svg"} width={24} height={24} />
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
                    <IconImage src={"/assets/studenticons/camera.svg"} width={24} height={24} />
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
                    <span className="activeDot" />
                    <span>Active</span>
                  </div>
                  <div className="adminId">Super admin ID : SA10001</div>
                </div>
              </div>

              <div className="verticalDivider" />

              <div className="completionSection studentCompletionSection">
                <div className="completionHeader">
                  <h3>Profile Completion</h3>
                  <span>50% Completed</span>
                </div>

                <div
                  className="progressTrack"
                  role="progressbar"
                  aria-label="Profile completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={50}
                  aria-valuetext="50% completed"
                >
                  <div className="progressBar" style={{ width: "50%" }} aria-hidden="true" />
                </div>

                <div className="completionSteps studentCompletionSteps">
                  <div className="completionStep completed">
                    <span className="completedCircle" aria-hidden="true">✓</span>
                    <span>Profile Photo</span>
                  </div>

                  <div className="completionStep">
                    <span className="emptyCircle" aria-hidden="true" />
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
                className="profileTab profileTabActive"
                aria-current="page"
                onClick={() => router.push("/student_registration")}
              >
                <IconImage src={"/assets/studenticons/clipboard.svg"} width={20} height={20} />
                <span>Registration</span>
              </button>

              <button
                type="button"
                className="profileTab"
                onClick={() => router.push("/student_profile")}
              >
                <IconImage src={"/assets/studenticons/user.svg"} width={20} height={20} />
                <span>Student Profile</span>
              </button>

              <button
                type="button"
                className="profileTab"
                onClick={() => router.push("/student_consent")}
              >
                <IconImage src={"/assets/studenticons/check-line.svg"} width={20} height={20} />
                <span>Consent</span>
              </button>
            </div>

            <section
              className={`informationCard registrationCard ${
                isRegistrationEditing ? "registrationEditing" : ""
              }`}
            >
              <div className="informationHeader registrationHeader">
                <div className="informationTitle">
                  <span className="sectionIcon registrationIcon">
                    <IconImage
                      src={"/assets/studenticons/clipboard.svg"}
                      width={15}
                      height={15}
                      className="whiteIcon"
                    />
                  </span>
                  <h2>Registration</h2>
                </div>

                {isRegistrationEditing ? (
                  <div className="basicEditHeaderActions">
                    <button
                      type="button"
                      className="basicActionButton basicSaveButton"
                      onClick={handleRegistrationSave}
                    >
                      <IconImage src={"/assets/studenticons/tick.svg"} width={14} height={14} />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      className="basicActionButton basicCancelButton"
                      onClick={handleRegistrationCancel}
                    >
                      <IconImage src={"/assets/studenticons/cancel.svg"} width={14} height={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="editButton"
                    aria-label="Edit registration"
                    onClick={handleRegistrationEdit}
                  >
                    <IconImage src={"/assets/studenticons/editbig.svg"} alt="" width={24} height={24} />
                  </button>
                )}

                {registrationStatus === "saved" && (
                  <div
                    className="basicStatusPopup basicStatusSaved"
                    role="status"
                    aria-live="polite"
                  >
                    <IconImage src={"/assets/studenticons/clap.svg"} width={24} height={24} />
                    <span>Changes Saved</span>
                  </div>
                )}

                {registrationStatus === "discarded" && (
                  <div
                    className="basicStatusPopup basicStatusDiscarded"
                    role="status"
                    aria-live="polite"
                  >
                    <IconImage src={"/assets/studenticons/sad.svg"} width={24} height={24} />
                    <span>Changes Discarded</span>
                  </div>
                )}
              </div>

              <div className="informationGrid registrationGrid">
                {fieldConfig.map((field) => {
                  const value = isRegistrationEditing
                    ? registrationDraft[field.key]
                    : registrationInfo[field.key];

                  if (!isRegistrationEditing) {
                    return (
                      <div className="infoField" key={field.key}>
                        <div className="infoLabel">{field.label}</div>
                        <div className="infoValue">{value}</div>
                      </div>
                    );
                  }

                  return (
                    <div
                      className={`infoField basicEditableField ${
                        field.locked ? "basicLockedField" : ""
                      }`}
                      key={field.key}
                    >
                      <div className="basicFieldText">
                        {field.locked ? (
                          <>
                            <div className="infoLabel">{field.label}</div>
                            <div className="infoValue">{registrationInfo[field.key]}</div>
                          </>
                        ) : (
                          <>
                            <label className="infoLabel" htmlFor={`registration-${field.key}`}>
                              {field.label}
                            </label>
                            <input
                              id={`registration-${field.key}`}
                              name={field.key}
                              type={
                                field.key === "email" || field.key === "alternateEmail"
                                  ? "email"
                                  : field.key === "phone" || field.key === "alternateMobile"
                                    ? "tel"
                                    : "text"
                              }
                              className="basicFieldInput"
                              value={registrationDraft[field.key]}
                              onChange={(event) =>
                                setRegistrationDraft((current) => ({
                                  ...current,
                                  [field.key]: event.target.value,
                                }))
                              }
                            />
                          </>
                        )}
                      </div>

                      {field.locked ? (
                        <span className="basicFieldIcon basicLockIcon">
                          <IconImage src={"/assets/studenticons/lock.svg"} alt="Locked" width={20} height={20} />
                        </span>
                      ) : (
                        <label
                          className="basicFieldIcon basicPencilIcon"
                          htmlFor={`registration-${field.key}`}
                        >
                          <IconImage
                            src={"/assets/studenticons/edit.svg"}
                            alt=""
                            width={20}
                            height={20}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
