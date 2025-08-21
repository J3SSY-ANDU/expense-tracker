import { useState } from "react";
import { colors, Dialog, DialogTitle, Grid, IconButton, Tooltip } from "@mui/material";
import { iconMap, icons } from "./icons";
import AddIcon from "@mui/icons-material/Add";

interface MuiIconPickerProps {
    value: string;
    onChange: (name: string) => void;
    selectedCategory: { icon: string } | null;
    size?: number;
}

/**
 * MuiIconPicker is a component that allows users to select an icon from a predefined set.
 * It displays the currently selected icon and opens a dialog for icon selection when clicked.
 *
 * @param {object} props - The component props.
 * @param {string} props.value - The currently selected icon name.
 * @param {(name: string) => void} props.onChange - Callback fired when an icon is selected or cleared.
 * @param {object} [props.selectedCategory] - The currently selected category, which may contain an icon property.
 * @param {number} [props.size] - Optional size for the displayed icon.
 *
 * @returns {JSX.Element} The rendered MuiIconPicker component.
 */
export function MuiIconPicker({ value, onChange, selectedCategory, size }: MuiIconPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (name: string) => {
        onChange(name);
        setOpen(false);
    };

    const SelectedIcon = selectedCategory?.icon ? iconMap[selectedCategory.icon] : AddIcon;

    return (
        <>
            {size ? (
                <SelectedIcon sx={{ fontSize: size, color: selectedCategory?.icon ? 'inherit' : 'transparent' }} />
            ) : 
            <Tooltip title="Pick an icon">
                <IconButton
                    onClick={() => setOpen(true)}
                    sx={{ color: 'var(--color-primary)' }}
                    aria-label="Pick an icon"
                >
                    <SelectedIcon sx={{ fontSize: size || 48 }} />
                </IconButton>
            </Tooltip>
            }
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