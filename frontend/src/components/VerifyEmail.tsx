import { Box, Button, Typography } from "@mui/material";
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
    <Box>
      <Typography variant="h4">Verify your email</Typography>
      <Typography>
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
    </Box>
  );
}
