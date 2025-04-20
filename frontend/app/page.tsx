'use client';

import React, { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "./utils/api";
import { jwtDecode } from "jwt-decode";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';                
import 'primeicons/primeicons.css';   
import { JSX } from "react";

interface JwtPayload {
  id: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

export default function Login(): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const toast = useRef<Toast>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { token } = await login(username, password);
      localStorage.setItem("token", token);

      const user = jwtDecode<JwtPayload>(token);
      localStorage.setItem("role", user.role);

      router.push("/dashboard");
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Benutzername und Passwort stimmen nicht überein',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = username.trim() !== "" && password.trim() !== "";

  return (
    <div
      className="flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Toast ref={toast} />
      <form
        onSubmit={handleLogin}
        className="card p-fluid"
        style={{ maxWidth: "400px", padding: "2rem" }}
      >
        <div className="field">
          <label htmlFor="username">Benutzername</label>
          <InputText
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Passwort</label>
          <InputText
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="field">
          <Button
            label={loading ? "Anmelden..." : "Anmelden"}
            type="submit"
            disabled={!isFormValid || loading}
            loading={loading}
            className="w-full"
          />
        </div>
      </form>
    </div>
  );
}