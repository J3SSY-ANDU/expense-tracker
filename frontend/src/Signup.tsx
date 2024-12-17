import React from "react";
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
import "./signup.css";

export default function Signup() {
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

  const handleCallApi = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const res = await fetch("/process-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstname, lastname, email, password }),
      });
      if (res.status === 200) {
        console.log("Signup successful!");
        setLoading(false);
        emptyFields();
        navigate("/");
      } else {
        console.error("Signup failed!");
        setLoading(false);
        emptyFields();
      }
    } catch (err) {
      console.error(`Error fetching the API: ${err}`);
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
        onSubmit={handleCallApi}
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
              setError({ ...error, firstname: "" });
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
              setError({ ...error, lastname: "" });
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
        <TextField
          type="password"
          name="password-confirmation"
          label="Confirm Password"
          value={confirmPassword}
          size="small"
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError({ ...error, confirmPassword: "" });
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
