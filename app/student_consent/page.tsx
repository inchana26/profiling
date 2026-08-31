"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./consent.css";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";


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

type ConsentKey =
  | "dataProcessing"
  | "employerSharing"
  | "placementProfileSharing"
  | "employerVisibility"
  | "alumniEngagement"
  | "researchAnalytics";

type ConsentData = Record<ConsentKey, boolean>;

const consentItems: Array<{ key: ConsentKey; label: string }> = [
  { key: "dataProcessing", label: "Data Processing Consent" },
  { key: "employerSharing", label: "Employer Sharing Consent" },
  { key: "placementProfileSharing", label: "Placement Profile Sharing Consent" },
  { key: "employerVisibility", label: "Employer Visibility Consent" },
  { key: "alumniEngagement", label: "Alumni Engagement Consent" },
  { key: "researchAnalytics", label: "Research & Analytics Usage" },
];

const initialConsents: ConsentData = {
  dataProcessing: false,
  employerSharing: false,
  placementProfileSharing: false,
  employerVisibility: false,
  alumniEngagement: false,
  researchAnalytics: false,
};

export default function StudentRegistrationPage() {
  const router = useRouter();
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState(
    "/assets/superadminimages/profile.png"
  );

  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState("");

  const [isConsentEditing, setIsConsentEditing] = useState(false);
  const [consents, setConsents] = useState<ConsentData>(initialConsents);
  const [consentDraft, setConsentDraft] = useState<ConsentData>(initialConsents);
  const [consentStatus, setConsentStatus] = useState<
    "saved" | "discarded" | null
  >(null);

  const showConsentStatus = (status: "saved" | "discarded") => {
    setConsentStatus(status);
    window.setTimeout(() => setConsentStatus(null), 2500);
  };

  const handleConsentEdit = () => {
    setConsentDraft(consents);
    setConsentStatus(null);
    setIsConsentEditing(true);
  };

  const handleConsentToggle = (key: ConsentKey) => {
    if (!isConsentEditing) return;

    setConsentDraft((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleConsentSave = () => {
    setConsents(consentDraft);
    setIsConsentEditing(false);
    showConsentStatus("saved");
  };

  const handleConsentCancel = () => {
    setConsentDraft(consents);
    setIsConsentEditing(false);
    showConsentStatus("discarded");
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
    document.title = "Student Profile - Consent | Neuro LXP";

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

  const visibleConsents = isConsentEditing ? consentDraft : consents;

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
                    aria-controls="profile-image-upload"
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
                    id="profile-image-upload"
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
                  <span>100% Completed</span>
                </div>

                <div
                  className="progressTrack"
                  role="progressbar"
                  aria-label="Profile completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={100}
                  aria-valuetext="100% completed"
                >
                  <div
                    className="progressBar"
                    style={{ width: "100%" }}
                    aria-hidden="true"
                  />
                </div>

                <div className="completionSteps studentCompletionSteps">
                  {["Profile Photo", "Student Profile", "Registration", "Consent"].map(
                    (step) => (
                      <div className="completionStep completed" key={step}>
                        <span className="completedCircle" aria-hidden="true">
                          ✓
                        </span>
                        <span>{step}</span>
                      </div>
                    )
                  )}
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
                className="profileTab"
                onClick={() => router.push("/student_profile")}
              >
                <IconImage
                  src="/assets/studenticons/user.svg"
                  width={20}
                  height={20}
                />
                <span>Student Profile</span>
              </button>

              <button
                type="button"
                className="profileTab profileTabActive"
                aria-current="page"
                onClick={() => router.push("/student_consent")}
              >
                <IconImage
                  src="/assets/studenticons/checklineblue.svg"
                  width={20}
                  height={20}
                />
                <span>Consent</span>
              </button>
            </div>

            <section
              className={`informationCard consentCard ${
                isConsentEditing ? "consentEditing" : ""
              }`}
            >
              <div className="informationHeader consentHeader">
                <div className="informationTitle">
                  <span className="sectionIcon consentSectionIcon">
                    <IconImage
                      src="/assets/studenticons/shield.svg"
                      width={20}
                      height={20}
                      className="whiteIcon"
                    />
                  </span>
                  <h2>Data and Privacy Consents</h2>
                </div>

                {isConsentEditing ? (
                  <div className="basicEditHeaderActions consentHeaderActions">
                    <button
                      type="button"
                      className="basicActionButton basicSaveButton"
                      onClick={handleConsentSave}
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
                      onClick={handleConsentCancel}
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
                    aria-label="Edit data and privacy consents"
                    onClick={handleConsentEdit}
                  >
                    <IconImage
                      src="/assets/studenticons/editbig.svg"
                      width={24}
                      height={24}
                    />
                  </button>
                )}

                {consentStatus === "saved" && (
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

                {consentStatus === "discarded" && (
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

              <div className="consentGrid">
                {consentItems.map((item) => {
                  const checked = visibleConsents[item.key];

                  return (
                    <div className="consentRow" key={item.key}>
                      <span className="consentLabel">{item.label}</span>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        aria-label={`${item.label}: ${checked ? "On" : "Off"}`}
                        className={`consentSwitch ${
                          checked ? "consentSwitchOn" : ""
                        }`}
                        onClick={() => handleConsentToggle(item.key)}
                        disabled={!isConsentEditing}
                      >
                        <span className="consentSwitchKnob" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="informationCard verificationCard">
              <div className="informationHeader verificationHeader">
                <div className="informationTitle">
                  <span className="sectionIcon verificationSectionIcon">
                    <IconImage
                      src="/assets/studenticons/checkmark-circle-01.svg"
                      width={20}
                      height={20}
                      className="whiteIcon"
                    />
                  </span>
                  <h2>Verification Status</h2>
                </div>
              </div>

              <div className="verificationGrid">
                <div className="verificationField">
                  <div className="verificationLabel">Profile Verification Status</div>
                  <div className="verificationValue">Pending</div>
                </div>

                <div className="verificationField">
                  <div className="verificationLabel">Document Verification Status</div>
                  <div className="verificationValue">Not Submitted</div>
                </div>

                <div className="verificationField">
                  <div className="verificationLabel">Verified By</div>
                  <div className="verificationValue">Pending</div>
                </div>

                <div className="verificationField">
                  <div className="verificationLabel">Compliance Status</div>
                  <div className="verificationValue">Pending</div>
                </div>
              </div>
            </section>

            <div className="consentPageFooterActions">
              <button type="button" className="footerActionButton reviewProfileButton">
                Review Profile
              </button>
              <button
                type="button"
                className="footerActionButton saveProfileButton"
                onClick={() => showConsentStatus("saved")}
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
