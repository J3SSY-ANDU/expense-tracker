import "./App.css";
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BasicTable from "./Table";

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async (e) => {
    try {
      e.preventDefault();
      const res = await fetch("/logout", {
        method: "GET",
      });
      if (res.status === 200) {
        console.log('Logged out successfully!');
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
        }, 1000);
      } catch (err) {
        console.error(`Error fetching the API: ${err}`);
      }
    }
    fetchData();
  }, [navigate]);

  const handleGenerateFile = async (e) => {
    try {
      e.preventDefault();
      const res = await fetch("/generate-csv", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200) {
        console.log("File generated successfully!");
      }
    } catch (err) {
      console.error(`Error fetching the API: ${err}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="App" style={{margin: "2rem 0"}}>
      <h1>Welcome to my Data File Generator!</h1>
      <BasicTable />
      {/* <form onSubmit={handleGenerateFile}>
        <button type="submit">Generate File</button>
      </form>
      <form onSubmit={logout}>
        <button type="submit">Logout</button>
      </form> */}
    </div>
  );
}

export default App;
