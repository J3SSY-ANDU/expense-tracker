import { useState } from "react";
import {
    Box, List, ListItemButton, ListItemIcon, ListItemText, Paper,
    Collapse, Typography, Divider, Switch, Avatar, TextField, Button
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoIcon from "@mui/icons-material/Info";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import apiService from "./api/apiService";

function ProfileContent() {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700}>Profile</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 44, height: 44 }}>U</Avatar>
                <Box>
                    <Typography fontWeight={600}>Username</Typography>
                    <Typography variant="caption" color="text.secondary">user@email.com</Typography>
                </Box>
            </Box>
            <TextField label="Email" value="user@email.com" size="small" fullWidth sx={{ mb: 2 }} disabled />
        </Box>
    );
}

function ChangePasswordContent() {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700}>Change Password</Typography>
            <Divider sx={{ my: 2 }} />
            <TextField label="Current Password" type="password" fullWidth sx={{ mb: 2 }} />
            <TextField label="New Password" type="password" fullWidth sx={{ mb: 2 }} />
            <TextField label="Confirm Password" type="password" fullWidth sx={{ mb: 2 }} />
            <Button variant="contained" color="primary">Update Password</Button>
        </Box>
    );
}

function DeleteAccountContent() {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700}>Delete Account</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography color="error" sx={{ mb: 2 }}>
                Warning: This action is irreversible. All your data will be permanently deleted.
            </Typography>
            <Button variant="outlined" color="error" onClick={() => apiService.deleteUser()}>Delete Account</Button>
        </Box>
    );
}

function AboutContent() {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700}>About</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2">Budget App v1.0.0</Typography>
            <Typography variant="body2">© {new Date().getFullYear()} Budget App</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
                Support: <a href="mailto:support@example.com">support@example.com</a>
            </Typography>
        </Box>
    );
}

type AccountFeature = "profile" | "password" | "delete";
const ACCOUNT_MENU = [
    { label: "Profile", value: "profile" as AccountFeature, icon: <AccountCircleIcon fontSize="small" /> },
    { label: "Change Password", value: "password" as AccountFeature, icon: <LockIcon fontSize="small" /> },
    { label: "Delete Account", value: "delete" as AccountFeature, icon: <AccountCircleIcon fontSize="small" /> },
];

export default function SettingsScreen() {
    // Sidebar state
    const [accountOpen, setAccountOpen] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Which account feature is selected
    const [selectedAccountFeature, setSelectedAccountFeature] = useState<AccountFeature>("profile");
    const [selectedSection, setSelectedSection] = useState<"account" | "about">("account");

    // Notification toggles
    const [emailNotif, setEmailNotif] = useState(true);
    const [budgetNotif, setBudgetNotif] = useState(false);

    // Content component selection
    let content: React.ReactNode;
    if (selectedSection === "about") {
        content = <AboutContent />;
    } else {
        switch (selectedAccountFeature) {
            case "profile": content = <ProfileContent />; break;
            case "password": content = <ChangePasswordContent />; break;
            case "delete": content = <DeleteAccountContent />; break;
            default: content = null;
        }
    }

    return (
        <Box sx={{ display: "flex", minHeight: "60vh", maxWidth: 900, mx: "auto", mt: 4 }}>
            {/* Side Nav */}
            <Paper sx={{ minWidth: 250, maxWidth: 300, mr: 4, py: 2 }}>
                <List component="nav" disablePadding>
                    {/* Account Dropdown */}
                    <ListItemButton
                        onClick={() => setAccountOpen((open) => !open)}
                        selected={selectedSection === "account"}
                    >
                        <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                        <ListItemText primary="Account" />
                        {accountOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={accountOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {ACCOUNT_MENU.map((item) => (
                                <ListItemButton
                                    key={item.value}
                                    sx={{ pl: 4 }}
                                    selected={selectedSection === "account" && selectedAccountFeature === item.value}
                                    onClick={() => {
                                        setSelectedSection("account");
                                        setSelectedAccountFeature(item.value);
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 30 }}>{item.icon}</ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography fontSize={12}>
                                                {item.label}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>

                    {/* Notifications Dropdown */}
                    <ListItemButton
                        onClick={() => setNotificationsOpen((open) => !open)}
                        sx={{ mt: 1 }}
                    >
                        <ListItemIcon><NotificationsIcon /></ListItemIcon>
                        <ListItemText primary="Notifications" />
                        {notificationsOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={notificationsOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4, display: "flex", justifyContent: "left" }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}><EmailIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography fontSize={12}>
                                            Email notifications
                                        </Typography>
                                    }
                                />
                                <Switch
                                    checked={emailNotif}
                                    onChange={e => setEmailNotif(e.target.checked)}
                                    inputProps={{ "aria-label": "Enable email notifications" }}
                                    size={"small"}
                                />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}><MonetizationOnIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography fontSize={12}>
                                            Budget notifications
                                        </Typography>
                                    }
                                />
                                <Switch
                                    checked={budgetNotif}
                                    onChange={e => setBudgetNotif(e.target.checked)}
                                    inputProps={{ "aria-label": "Enable budget notifications" }}
                                    size={"small"}
                                />
                            </ListItemButton>
                        </List>
                    </Collapse>

                    {/* About */}
                    <ListItemButton
                        sx={{ mt: 1 }}
                        selected={selectedSection === "about"}
                        onClick={() => setSelectedSection("about")}
                    >
                        <ListItemIcon><InfoIcon /></ListItemIcon>
                        <ListItemText primary="About" />
                    </ListItemButton>
                </List>
            </Paper>
            {/* Main Content */}
            <Box sx={{ flex: 1, p: 3, bgcolor: "#fafbfc", borderRadius: 2, boxShadow: 1 }}>
                {content}
            </Box>
        </Box>
    );
}