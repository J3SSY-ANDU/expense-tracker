import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiService from "../api/apiService";

export function VerifyEmail() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function verifyEmail() {
      const tokenParam = window.location.pathname.split("/").pop();
      setToken(tokenParam ?? null);

      if (!tokenParam || tokenParam === "verify-email") {
        console.error("Token not found");
        return;
      } else if (tokenParam) {
        const result: { message?: string; token?: string; error?: string } = await apiService.verifyEmail(tokenParam);
        if (result.error) {
          console.error("Email verification failed:", result.error);
          // Handle error appropriately
          navigate("/signup");
        } else {
          console.log(result.message);
          if (result.message && !result.token) {
            navigate("/login");
          } else {
            if (result.token) {
              localStorage.setItem("authToken", result.token);
              window.location.replace("/");
            }
          }
        }
      }
    }

    verifyEmail();
  }, []);

  const handleResendVerificationEmail = async () => {
    const id = searchParams.get("uid");
    if (!id) {
      console.error("User ID not found in query parameters");
      return;
    }
    setResendingEmail(true);
    const result: { message: string } | { error: string } = await apiService.resendVerificationEmail(id);
    setResendingEmail(false);
    if ("error" in result) {
      console.error(result.error);
    } else {
      console.log(result.message);
    }
  }

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.8rem",
        width: "20%",
        minWidth: "360px",
        padding: "1.5rem 1rem",
        background: "#fff",
        border: "1px solid #d3d3d3",
        borderRadius: "4px",
        margin: "auto",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: "fit-content",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "600", fontSize: "1.5rem" }}>
        Verify your email
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontSize: "0.8rem", fontWeight: "400" }}
      >
        We have sent you an email with a verification link. Please click on the
        link to verify your email.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          handleResendVerificationEmail().then(() => {
            setShowSnackbar(true);
          });
        }}
        sx={{ fontSize: "0.8rem", width: "50%" }}
      >
        {resendingEmail ? (
          <CircularProgress size={20} sx={{ color: "#fff" }} />
        ) : (
          "Resend email"
        )}
      </Button>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={5000}
        onClose={(event, reason) => {
          if (reason === 'clickaway') return;
          setShowSnackbar(false);
        }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="standard"
          sx={{ width: "100%" }}
        >
          Email sent successfully
        </Alert>
      </Snackbar>
    </Paper>
  );
}
