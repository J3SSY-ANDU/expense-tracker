import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  CircularProgress,
  TextField,
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const verifyInputs = () => {
    let error = {
      email: "",
      password: "",
    };
    let isValid = true;

    if (!email) {
      error.email = "Email is required.";
      isValid = false;
    } else if (/\S+@\S+\.\S+/.test(email) === false) {
      error.email = "Email address is invalid.";
      isValid = false;
    } else if (!password) {
      error.password = "Password is required.";
      isValid = false;
    }

    setError(error);
    return isValid;
  };

  const handleLogin = async (e) => {
    function emptyFields() {
      setEmail("");
      setPassword("");
    }
    try {
      e.preventDefault();
      setLoading(true);
      if (!verifyInputs()) {
        setLoading(false);
        return;
      }
      const res = await fetch("/process-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 200) {
        console.log("Login successful!");
        setLoading(false);
        emptyFields();
        navigate("/");
      } else {
        console.error("Login failed!");
        setLoading(false);
        emptyFields();
      }
    } catch (err) {
      console.error(`Error fetching the API: ${err}`);
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <Box
      sx={{
        // Apply styles similar to Signup page
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography
        sx={{
          fontSize: "2rem",
          marginBottom: "1rem",
        }}
      >
        Log in
      </Typography>
      <Paper
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.8rem",
          width: "20%",
          minWidth: "250px",
          padding: "1.5rem 1rem",
          background: "#fff",
          border: "1px solid #d3d3d3",
          borderRadius: "4px",
        }}
      >
        <TextField
          type="email"
          name="email"
          label="Email"
          value={email}
          size="small"
          onChange={(e) => {
            setEmail(e.target.value);
            setError({ ...error, email: "" });
          }}
          sx={{
            width: "100%",
            "& .MuiInputBase-input": {
              fontSize: "0.8rem", // Font size for the input text
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.8rem", // Font size for the label text
            },
          }}
        />
        {error.email && (
          <Alert
            severity="error"
            variant="standard"
            sx={{
              width: "100%",
              boxSizing: "border-box",
              paddingY: "0",
              marginTop: "-0.4rem",
            }}
          >
            <AlertTitle
              fontSize={"0.8rem"}
              sx={{
                margin: 0, // Set the margin to 0
              }}
            >
              {error.email}
            </AlertTitle>
          </Alert>
        )}
        <TextField
          type="password"
          name="password"
          label="Password"
          value={password}
          size="small"
          onChange={(e) => {
            setPassword(e.target.value);
            setError({ ...error, password: "" });
          }}
          sx={{
            width: "100%",
            "& .MuiInputBase-input": {
              fontSize: "0.8rem", // Font size for the input text
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.8rem", // Font size for the label text
            },
          }}
        />
        {error.password && (
          <Alert
            severity="error"
            variant="standard"
            sx={{
              width: "100%",
              boxSizing: "border-box",
              paddingY: "0",
              marginTop: "-0.4rem",
            }}
          >
            <AlertTitle
              fontSize={"0.8rem"}
              sx={{
                margin: 0, // Set the margin to 0
              }}
            >
              {error.password}
            </AlertTitle>
          </Alert>
        )}
        <Link to={'/signup'} className={"login__link login__link--forgot-password"}>
          Forgot password?
        </Link>
        <Button
          type="submit"
          variant="contained"
          sx={{
            fontSize: "0.8rem",
          }}
        >
          {loading ? <CircularProgress color="#fff" size={14} /> : "Log in"}
        </Button>
        <Box sx={{display: "flex", alignItems: "center", gap: '0.2rem'}}>
          <Typography sx={{fontSize: '0.8rem'}} className="login__p">Don't have an account?</Typography>
          <Link to="/signup" className="login__link">
            Sign up
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
