"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./signin.css";

const TENANT_OPTIONS = [
  "Super Admin",
  "Platform Admin",
  "Institute Admin",
  "Coordinator",
  "Faculty",
  "Student",
];

const ACTOR_OPTIONS = [
  "University & College",
  "Skill Academy",
  "Bootcamp",
  "Corporate",
  "Government",
  "NGO",
];

export default function LoginPage() {
  const router = useRouter();

  const [tenant, setTenant] = useState("");
  const [actor, setActor] = useState("");

  const tenantOnly =
    tenant === "Super Admin" ||
    tenant === "Platform Admin" ||
    tenant === "Institute Admin";

  const handleTenantChange = (value: string) => {
    setTenant(value);

    if (
      value === "Super Admin" ||
      value === "Platform Admin" ||
      value === "Institute Admin"
    ) {
      setActor("");
    }
  };

  const handleLogin = () => {
    if (!tenant) return;
    if (!tenantOnly && !actor) return;

    if (tenant === "Super Admin") {
      router.push("/super_admin");
      return;
    }

    if (tenant === "Platform Admin") {
      router.push("/platform_admin");
      return;
    }

    if (tenant === "Institute Admin") {
      router.push("/institution_admin");
      return;
    }

    if (tenant === "Coordinator") {
      if (actor === "University & College") {
        router.push("/coordinator_university");
        return;
      }

      if (actor === "Bootcamp") {
        router.push("/coordinator_bootcamp");
        return;
      }

      if (actor === "Corporate") {
        router.push("/coordinator_corporate");
        return;
      }

      if (actor === "Government") {
        router.push("/coordinator_government");
        return;
      }

      if (actor === "NGO") {
        router.push("/coordinator_ngo");
        return;
      }
    }

    /* Faculty navigation */
    if (tenant === "Faculty") {
      if (actor === "University & College") {
        router.push("/faculty_university");
        return;
      }

      if (actor === "Skill Academy") {
        router.push("/faculty_skillacademy");
        return;
      }

      if (actor === "Bootcamp") {
        router.push("/faculty_bootcamp");
        return;
      }

      if (actor === "Corporate") {
        router.push("/faculty_corporate");
        return;
      }

      if (actor === "Government") {
        router.push("/faculty_government");
        return;
      }

      if (actor === "NGO") {
        router.push("/faculty_ngo");
        return;
      }
    }

    /* Student navigation */
    if (tenant === "Student") {
      if (actor === "University & College") {
        router.push("/student_university");
        return;
      }

      if (actor === "Bootcamp") {
        router.push("/student_bootcamp");
        return;
      }

      if (actor === "Corporate") {
        router.push("/student_corporate");
        return;
      }

      if (actor === "Government") {
        router.push("/student_government");
        return;
      }

      if (actor === "NGO") {
        router.push("/student_ngo");
        return;
      }
    }

    // Add navigation for remaining Coordinator actors,
    // Faculty and Student here.
    console.log({
      tenant,
      actor,
    });
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
          Select your tenant{tenantOnly ? "" : " and actor"}
        </p>

        <div className="loginForm">
          <div className="loginField">
            <label htmlFor="tenant">Tenant</label>

            <div className="loginSelectWrap">
              <select
                id="tenant"
                value={tenant}
                onChange={(event) =>
                  handleTenantChange(event.target.value)
                }
              >
                <option value="">Select Tenant</option>

                {TENANT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <span
                className="loginSelectArrow"
                aria-hidden="true"
              />
            </div>
          </div>

          {!tenantOnly && (
            <div className="loginField">
              <label htmlFor="actor">Actor</label>

              <div className="loginSelectWrap">
                <select
                  id="actor"
                  value={actor}
                  onChange={(event) =>
                    setActor(event.target.value)
                  }
                >
                  <option value="">Select Actor</option>

                  {ACTOR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <span
                  className="loginSelectArrow"
                  aria-hidden="true"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            className="loginButton"
            disabled={!tenant || (!tenantOnly && !actor)}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </section>
    </main>
  );
}