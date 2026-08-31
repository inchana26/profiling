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

    // Add navigation for Coordinator, Faculty and Student here.
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