import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
  TableContainer,
} from "@mui/material";
import { useState, useEffect } from "react";

export default function BasicTable() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const users = await res.json();
        if (users) {
          setData(users);
          setTimeout(() => {
            setLoading(false);
          }, 2000)
        }
      } catch (err) {
        console.error(`Error getting data: ${err}`);
      }
    })();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <TableContainer
      component={Box}
      sx={{
        margin: "auto",
        width: "60%",
        border: "1px solid #d3d3d3",
        borderRadius: "4px",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>USERNAME</TableCell>
            <TableCell>EMAIL</TableCell>
            <TableCell>PASSWORD</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => {
            return (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.password}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
