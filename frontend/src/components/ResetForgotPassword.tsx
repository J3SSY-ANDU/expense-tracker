import { useState } from "react";
import { ResetForgotPassword } from "../api";

export function ResetForgotPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (!tokenParam) {
      console.error("Token not found");
      return;
    }
    setToken(tokenParam);
    try {
      if (!token || !password) {
        console.error("Token or password not found");
        return;
      }
      await ResetForgotPassword(token, password);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(`Error resetting password ${err}`);
    }
  };
  return (
    <div>
      <h1>Reset Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
