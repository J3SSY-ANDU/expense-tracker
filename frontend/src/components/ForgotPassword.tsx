import { useState } from "react";
import { ForgotPassword } from "../api";
import {
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    try {
      await ForgotPassword(email);
      setLoading(false);
      setEmail("");
    } catch (err) {
      console.error(`Error sending email ${err}`);
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
      <Typography variant="h4" sx={{ fontWeight: "600", fontSize: "1.5rem" }}>
        Forgot Password
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
          type="email"
          id="email"
          name="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          sx={{ width: "30%", fontSize: "0.8rem", alignSelf: "center" }}
        >
          {loading ? <CircularProgress size={24} /> : "Send Email"}
        </Button>
      </form>
    </Paper>
  );
}
