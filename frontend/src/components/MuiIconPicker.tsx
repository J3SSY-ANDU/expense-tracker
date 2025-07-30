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
                <DialogTitle>Pick an Icon</DialogTitle>
                <Grid container spacing={2} padding={2}>
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