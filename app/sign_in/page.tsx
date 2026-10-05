"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./signin.css";

const ACTOR_OPTIONS = [
  "Super Admin",
  "Platform Admin",
  "Institute Admin",
  "Coordinator",
  "Faculty",
  "Student",
];

const TENANT_OPTIONS = [
  "University & College",
  "Skill Academy",
  "Bootcamp",
  "Corporate",
  "Government",
  "NGO",
];

export default function LoginPage() {
  const router = useRouter();

  const [actor, setActor] = useState("");
  const [tenant, setTenant] = useState("");

  const actorOnly =
    actor === "Super Admin" ||
    actor === "Platform Admin" ||
    actor === "Institute Admin";

  const handleActorChange = (value: string) => {
    setActor(value);

    if (
      value === "Super Admin" ||
      value === "Platform Admin" ||
      value === "Institute Admin"
    ) {
      setTenant("");
    }
  };

  const handleLogin = () => {
    if (!actor) return;
    if (!actorOnly && !tenant) return;

    if (actor === "Super Admin") {
      router.push("/super_admin");
      return;
    }

    if (actor === "Platform Admin") {
      router.push("/platform_admin");
      return;
    }

    if (actor === "Institute Admin") {
      router.push("/institution_admin");
      return;
    }

    if (actor === "Coordinator") {
      if (tenant === "University & College") {
        router.push("/coordinator_university");
        return;
      }

      if (tenant === "Bootcamp") {
        router.push("/coordinator_bootcamp");
        return;
      }

      if (tenant === "Corporate") {
        router.push("/coordinator_corporate");
        return;
      }

      if (tenant === "Government") {
        router.push("/coordinator_government");
        return;
      }

      if (tenant === "NGO") {
        router.push("/coordinator_ngo");
        return;
      }
    }

    /* Faculty navigation */
    if (actor === "Faculty") {
      if (tenant === "University & College") {
        router.push("/faculty_university");
        return;
      }

      if (tenant === "Skill Academy") {
        router.push("/faculty_skillacademy");
        return;
      }

      if (tenant === "Bootcamp") {
        router.push("/faculty_bootcamp");
        return;
      }

      if (tenant === "Corporate") {
        router.push("/faculty_corporate");
        return;
      }

      if (tenant === "Government") {
        router.push("/faculty_government");
        return;
      }

      if (tenant === "NGO") {
        router.push("/faculty_ngo");
        return;
      }
    }

    /* Student navigation */
    if (actor === "Student") {
      if (tenant === "University & College") {
        router.push("/student_university");
        return;
      }

      if (tenant === "Bootcamp") {
        router.push("/student_bootcamp");
        return;
      }

      if (tenant === "Corporate") {
        router.push("/student_corporate");
        return;
      }

      if (tenant === "Government") {
        router.push("/student_government");
        return;
      }

      if (tenant === "NGO") {
        router.push("/student_ngo");
        return;
      }
    }

    // Existing fallback for combinations without a configured route.
    console.log({ actor, tenant });
  };

  return (
    <main className="loginPage">
      <section className="loginCard" aria-labelledby="login-title">
        <div className="loginLogoWrap">
          <Image
            src="/assets/superadminicons/logo.png"
            alt="NeuroLXP"
            width={96}
            height={96}
            className="loginLogo"
            priority
          />
        </div>

        <h1 id="login-title" className="loginTitle">
          NeuroLXP
        </h1>

        <p className="loginSubtitle">
          Select your actor{actorOnly ? "" : " and tenant"}
        </p>

        <div className="loginForm">
          <div className="loginField">
            <label htmlFor="actor">Actor</label>

            <div className="loginSelectWrap">
              <select
                id="actor"
                value={actor}
                onChange={(event) => handleActorChange(event.target.value)}
              >
                <option value="">Select Actor</option>

                {ACTOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <span className="loginSelectArrow" aria-hidden="true" />
            </div>
          </div>

          {!actorOnly && (
            <div className="loginField">
              <label htmlFor="tenant">Tenant</label>

              <div className="loginSelectWrap">
                <select
                  id="tenant"
                  value={tenant}
                  onChange={(event) => setTenant(event.target.value)}
                >
                  <option value="">Select Tenant</option>

                  {TENANT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <span className="loginSelectArrow" aria-hidden="true" />
              </div>
            </div>
          )}

          <button
            type="button"
            className="loginButton"
            disabled={!actor || (!actorOnly && !tenant)}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </section>
    </main>
  );
}
