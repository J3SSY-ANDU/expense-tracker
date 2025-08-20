import {
  Box,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Typography,
  Button,
  Backdrop,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { User } from "../types";
import { useState } from "react";
import apiService from "../api/apiService";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

/**
 * Renders the Account component, which displays user account information,
 * provides options for logging out, changing the password, and deleting the account.
 *
 * @param user - The current authenticated user or null if not loaded.
 * @param setUser - Function to update the user state (e.g., after logout).
 *
 * @remarks
 * - Shows a dropdown menu with profile and sign out options.
 * - Allows the user to change their password via a modal dialog.
 * - Provides a confirmation dialog for account deletion.
 *
 * @component
 */
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
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const handleLogout = async () => {
    // Clear user data and token
    setUser(null);
    localStorage.removeItem("authToken");
    // Redirect to login page
    window.location.replace("/login");
  };

  const handleDeleteUser = async () => {
    await apiService.deleteUser();
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      setNewPassword("");
      setOldPassword("");
      setConfirmPassword("");
      return;
    }
    const success = await apiService.changePassword(oldPassword, newPassword);
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

  if (!user) {
    return <div>Loading...</div>; // or a loading state
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
      <h3 style={{ color: '#ffffff', fontSize: '1.6rem', margin: 0, padding: 0 }}>EXPENSE TRACKER</h3>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          position: "relative",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <Box
          sx={{
            padding: "6px 7px",
            borderRadius: "100%",
            background: "#50a8e38e",
          }}
        >
          <Typography variant="h6" fontSize={18} fontWeight={400} sx={{ color: "#ffffff", padding: "0 2px" }}>
            {user?.firstname[0] + user?.lastname[0]}
          </Typography>
        </Box>
        <Typography variant="h6" fontSize={18} fontWeight={400} sx={{ color: "#ffffff", padding: "0 2px" }}>
          {user.fullname}
        </Typography>
        {open ? (
          <ExpandLessIcon sx={{ color: "#ffffff", marginLeft: "-4px" }} />
        ) : (
          <ExpandMoreIcon sx={{ color: "#ffffff", marginLeft: "-4px" }} />
        )}
        <Paper
          sx={{
            background: "#f5f5f5",
            position: "absolute",
            top: "100%",
            width: "100%",
            display: open ? "block" : "none",
            zIndex: 100,
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuList>
            <MenuItem
            sx={{ padding: '0.8rem' }}
            >
              <PersonIcon sx={{ marginRight: '0.5rem' }} />
              <Typography>
                Profile
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleLogout();
              }}
              sx={{ padding: '0.8rem'}}
            >
              <LogoutIcon sx={{ marginRight: '0.5rem', color: "var(--color-error)" }} />
              Sign Out
            </MenuItem>
          </MenuList>
        </Paper>
      </Box>
      <Backdrop
        open={editPassword}
        onClick={() => setEditPassword(false)}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
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
      <Backdrop
        open={showDialog}
        onClick={() => setShowDialog(false)}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle id="alert-dialog-title">Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This action will delete all your data and cannot be recovered. Are
              you sure you want to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                handleDeleteUser();
              }}
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Backdrop>
    </Box>
  );
}
