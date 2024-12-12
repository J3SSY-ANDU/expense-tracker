import "./App.css";
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BasicTable from "./Table";
import { Button, Box, Typography, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async (): Promise<void> => {
    try {
      const res: Response = await fetch("/logout", {
        method: "GET",
      });
      if (res.status === 200) {
        console.log("Logged out successfully!");
        navigate("/login");
      }
    } catch (err) {
      console.error(`Error fetching the API: ${err}`);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/session-id-exists", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          navigate("/login");
          return;
        }
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error(`Error fetching the API: ${err}`);
      }
    }
    fetchData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box className="App" sx={{ margin: "2rem 0" }}>
      <Typography fontSize={32} fontWeight={"bold"} marginBottom={"2rem"}>
        Welcome to my Data File Generator!
      </Typography>
      <TextField label={"Search"} variant="filled" />
      <Button
        sx={{ marginBottom: "2rem" }}
        variant="contained"
        onClick={logout}
      >
        Logout
      </Button>
      <BasicTable />
    </Box>
  );
}
