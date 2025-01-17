import { Box, Button, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { VerifyEmail as VerifyEmailApi, ResendVerificationEmail } from "../api";

export function VerifyEmail() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyEmail() {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get("token");
      setToken(tokenParam);

      if (!token) {
        console.error("Token not found");
        setLoading(false); // Stop loading
        return;
      }
      await VerifyEmailApi(token);
    }

    verifyEmail();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
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
        minWidth: "500px",
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
      <Typography variant="h4" sx={{ fontWeight: "600", fontSize: "2rem" }}>
        Verify your email
      </Typography>
      <Typography variant="body1" sx={{ fontSize: "1rem", fontWeight: "400" }}>
        We have sent you an email with a verification link. Please click on the
        link to verify your email.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => ResendVerificationEmail(token!)}
      >
        Resend email
      </Button>
    </Paper>
  );
}
