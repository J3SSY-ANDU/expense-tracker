import {
  Box,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Typography,
  Menu,
  Button,
  Backdrop,
  TextField,
} from "@mui/material";
import { User } from "../types";
import { Logout, DeleteUser, ChangePassword } from "../api";
import { useState } from "react";

export function Account({
  user,
  setUser,
}: {
  user: User | null;
  setUser: (user: User | null) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [editPassword, setEditPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const handleLogout = async () => {
    await Logout();
  };

  const handleDeleteUser = async () => {
    await DeleteUser();
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      setNewPassword("");
      setOldPassword("");
      setConfirmPassword("");
      return;
    }
    const success = await ChangePassword(oldPassword, newPassword);
    if (success) {
      alert("Password changed successfully");
      setEditPassword(false);
      setNewPassword("");
      setOldPassword("");
      setConfirmPassword("");
    } else {
      alert("Error changing password");
      setNewPassword("");
      setOldPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "right", gap: "1rem" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          position: "relative",
        }}
        onClick={() => setOpen(!open)}
      >
        <Box
          sx={{
            padding: "2px 10px",
            borderRadius: "4px",
            background: "black",
          }}
        >
          <Typography variant="h6" fontSize={20} sx={{ color: "#ffffff" }}>
            {user?.firstname[0]}
          </Typography>
        </Box>
        <Typography variant="h6" fontSize={20}>
          {user?.fullname}
        </Typography>
        <Paper
          sx={{
            background: "#f5f5f5",
            position: "absolute",
            top: "100%",
            right: "-50%",
            width: "200%",
            display: open ? "block" : "none",
            zIndex: 100,
            textAlign: "center",
            paddingTop: "1rem",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: "4px",
              background: "black",
              marginBottom: "0.5rem",
            }}
          >
            <Typography variant="h6" fontSize={20} sx={{ color: "#ffffff" }}>
              {user?.firstname[0]}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontSize={18}>
              {user?.fullname}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontSize={14}>
              {user?.email}
            </Typography>
          </Box>
          <Divider sx={{ marginTop: "1rem" }} />
          <MenuList>
            <MenuItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onClick={() => {
                setOpen(false);
                setEditPassword(true);
              }}
            >
              Edit password
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeleteUser();
              }}
            >
              Delete Account
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleLogout();
              }}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Paper>
      </Box>
      <Backdrop open={editPassword} onClick={() => setEditPassword(false)}>
        <Paper
          onClick={(e) => e.stopPropagation()}
          sx={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "300px",
          }}
        >
          <TextField
            type="password"
            name="old password"
            label="Old Password"
            value={oldPassword}
            size="small"
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            type="password"
            name="new password"
            label="New Password"
            value={newPassword}
            size="small"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            type="password"
            name="confirm password"
            label="Confirm Password"
            value={confirmPassword}
            size="small"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button variant="contained" onClick={handleChangePassword}>
            Send
          </Button>
        </Paper>
      </Backdrop>
    </Box>
  );
}
