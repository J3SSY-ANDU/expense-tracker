// src/components/BasicTable.tsx

import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
  TableContainer,
} from "@mui/material";
import React from "react";
import { useState, useEffect } from "react";

// Define the structure of the data
interface Client {
  id: number;
  name: string;
  address: string;
  phone: number;
  email: string;
  accountNumber: string;
  balance: string;
}

export default function BasicTable() {
  const [data, setData] = useState<Client[] | null>(null); // State for fetched data
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const users: Client[] = await res.json(); // Ensure data matches the User interface
        if (users) {
          setData(users);
          setTimeout(() => {
            setLoading(false);
          }, 2000);
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
            <TableCell>NAME</TableCell>
            <TableCell>ACCOUNT-NUMBER</TableCell>
            <TableCell>EMAIL</TableCell>
            <TableCell>BALANCE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.accountNumber}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
