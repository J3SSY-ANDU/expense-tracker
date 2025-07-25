import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  SignupForm,
  Login,
  VerifyEmail,
  ForgotPasswordForm,
  ResetForgotPasswordForm,
} from "./components";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route
        path="/reset-forgot-password"
        element={<ResetForgotPasswordForm />}
      />
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  </Router>
);
