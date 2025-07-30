import { useState } from "react";
import { Button, Dialog, DialogTitle, Grid, IconButton } from "@mui/material";
import { iconMap, icons } from "./icons";
import CategoryIcon from '@mui/icons-material/Category';

interface MuiIconPickerProps {
    value: string;
    onChange: (name: string) => void;
}

export function MuiIconPicker({ value, onChange }: MuiIconPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (name: string) => {
        onChange(name);
        setOpen(false);
    };

    const SelectedIcon = iconMap[value];

    return (
        <>
            <IconButton
                onClick={() => setOpen(true)}
                sx={{ color: 'var(--color-text-primary)' }}
            >
                <CategoryIcon fontSize={"large"}/>
            </IconButton>
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