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
import "../styles/signup.css";
import apiService from "../api/apiService";
import { User } from "../types";

export function SignupForm() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    failed: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const verifyInputs = () => {
    let error = {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      failed: "",
    };
    let isValid = true;
    if (!firstname) {
      error.firstname = "Firstname is required.";
      isValid = false;
    } else if (!lastname) {
      error.lastname = "Lastname is required.";
      isValid = false;
    } else if (!email) {
      error.email = "Email is required.";
      isValid = false;
    } else if (/\S+@\S+\.\S+/.test(email) === false) {
      error.email = "Email address is invalid.";
      isValid = false;
    } else if (!password) {
      error.password = "Password is required.";
      isValid = false;
    } else if (password.length < 4) {
      error.password = "Password must be at least 4 characters.";
      isValid = false;
    } else if (password.length > 20) {
      error.password = "Password must be at most 20 characters.";
      isValid = false;
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]{8,20}$/.test(
        password
      )
    ) {
      error.password =
        "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.";
      isValid = false;
    } else if (!confirmPassword) {
      error.confirmPassword = "Confirm password is required.";
      isValid = false;
    } else if (password !== confirmPassword) {
      error.confirmPassword = "Passwords do not match.";
      isValid = false;
    }
    setError(error);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    function emptyFields() {
      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }

    try {
      e.preventDefault();
      setLoading(true);
      if (!verifyInputs()) {
        setLoading(false);
        return;
      }

      const data: { user_id: string } | { error: string } | {} = await apiService.signUp(firstname, lastname, email, password);

      if ("user_id" in data) {
        setLoading(false);
        emptyFields();
        navigate("/verify-email?id=" + data.user_id);
      } else if ("error" in data) {
        setError({ ...error, failed: data.error });
        setLoading(false);
        emptyFields();
      }
    } catch (err) {
      console.error(`Error fetching the API: ${err}`);
      setError({ ...error, failed: "Failed to connect to the server. Please try again later." });
      setLoading(false);
      emptyFields();
    }
  };

  return (
    <Box
      sx={{
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
        Sign-up
      </Typography>
      <Paper
        component="form"
        onSubmit={handleSignup}
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
          type="text"
          name="firstname"
          label="Firstname"
          value={firstname}
          size="small"
          onChange={(e) =>
            setFirstname(() => {
              const value = e.target.value;
              setError({ ...error, firstname: "", failed: "" });
              return value.charAt(0).toUpperCase() + value.slice(1);
            })
          }
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
        {error.firstname && (
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
              {error.firstname}
            </AlertTitle>
          </Alert>
        )}
        <TextField
          type="text"
          name="lastname"
          label="Lastname"
          value={lastname}
          size="small"
          onChange={(e) =>
            setLastname(() => {
              const value = e.target.value;
              setError({ ...error, lastname: "", failed: "" });
              return value.charAt(0).toUpperCase() + value.slice(1);
            })
          }
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
        {error.lastname && (
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
              {error.lastname}
            </AlertTitle>
          </Alert>
        )}
        <TextField
          type="email"
          name="email"
          label="Email"
          value={email}
          size="small"
          onChange={(e) => {
            setEmail(e.target.value);
            setError({ ...error, email: "", failed: "" });
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
            setError({ ...error, password: "", failed: "" });
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
        <TextField
          type="password"
          name="password-confirmation"
          label="Confirm Password"
          value={confirmPassword}
          size="small"
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError({ ...error, confirmPassword: "", failed: "" });
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
        {error.confirmPassword && (
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
              {error.confirmPassword}
            </AlertTitle>
          </Alert>
        )}
        {error.failed && (
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
              {error.failed}
            </AlertTitle>
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          sx={{
            fontSize: "0.8rem",
          }}
        >
          {loading ? (
            <CircularProgress sx={{ color: "#fff" }} size={14} />
          ) : (
            "Sign up"
          )}
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.2rem",
          }}
        >
          <Typography sx={{ fontSize: "0.8rem" }}>
            Already have an account?
          </Typography>
          <Link to="/login" className="signup__link">
            Log in
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
