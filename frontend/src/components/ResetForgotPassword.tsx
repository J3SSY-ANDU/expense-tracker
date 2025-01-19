import { useState } from "react";
import { ResetForgotPassword } from "../api";
import {
  TextField,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

export function ResetForgotPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
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
      setLoading(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(`Error resetting password ${err}`);
    }
  };
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
      <Typography variant="h4" sx={{ fontSize: "1.5rem", fontWeight: "600" }}>
        Reset Forgot Password
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          width: "100%",
        }}
      >
        <TextField
          type="password"
          id="password"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            width: "100%",
            "& .MuiInputBase-input": {
              fontSize: "0.8rem", // Font size for the input text
              paddingY: "0.8rem",
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.8rem", // Font size for the label text
              lineHeight: "1em",
            },
          }}
        />
        <TextField
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{
            width: "100%",
            "& .MuiInputBase-input": {
              fontSize: "0.8rem", // Font size for the input text
              paddingY: "0.8rem",
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.8rem", // Font size for the label text
              lineHeight: "1em",
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ width: "30%", alignSelf: "center", fontSize: "0.8rem" }}
        >
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </form>
    </Paper>
  );
}
