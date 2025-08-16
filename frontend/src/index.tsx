import ReactDOM from "react-dom/client";
import "./index.css";
import Expenses from "./Expenses";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  SignupForm,
  Login,
  VerifyEmail,
  ForgotPasswordForm,
  ResetForgotPasswordForm,
} from "./components";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Settings from "./Settings";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Router>
    <Routes>
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route
        path="/reset-forgot-password"
        element={<ResetForgotPasswordForm />}
      />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  </Router>
);
