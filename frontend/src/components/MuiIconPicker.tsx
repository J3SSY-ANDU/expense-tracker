import { useState } from "react";
import { Dialog, DialogTitle, Grid, IconButton, Tooltip } from "@mui/material";
import { iconMap, icons } from "./icons";
import AddIcon from "@mui/icons-material/Add";

interface MuiIconPickerProps {
    value: string;
    onChange: (name: string) => void;
    selectedCategory: { icon: string } | null;
}

export function MuiIconPicker({ value, onChange, selectedCategory }: MuiIconPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (name: string) => {
        onChange(name);
        setOpen(false);
    };

    const SelectedIcon = selectedCategory?.icon ? iconMap[selectedCategory.icon] : AddIcon;

    return (
        <>
            <Tooltip title="Pick an icon">
                <IconButton
                    onClick={() => setOpen(true)}
                    sx={{ color: 'var(--color-primary)' }}
                    aria-label="Pick an icon"
                >
                    <SelectedIcon sx={{ fontSize: 48 }} />
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle
                    sx={{
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    Pick an Icon
                    <Tooltip title="Clear icon">
                        <IconButton
                            aria-label="Clear icon"
                            onClick={() => onChange("")}
                            size="small"
                        sx={{ ml: 2 }}
                    >
                        <span style={{ fontSize: 18 }}>✕</span>
                    </IconButton>
                    </Tooltip>
                </DialogTitle>
                <Grid container sx={{ padding: '1rem', paddingTop: 0, justifyContent: 'center' }} spacing={2}>
                    {icons.map((name) => {
                        const IconComponent = iconMap[name];
                        return (
                            <Grid item key={name}>
                                <IconButton
                                    color={value === name ? "primary" : "default"}
                                    onClick={() => handleSelect(name)}
                                >
                                    <IconComponent />
                                </IconButton>
                            </Grid>
                        );
                    })}
                </Grid>
            </Dialog>
        </>
    );
}