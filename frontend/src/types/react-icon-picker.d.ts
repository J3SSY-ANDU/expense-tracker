declare module "react-icon-picker" {
  import * as React from "react";
  export interface IconPickerProps {
    icons: string[]; // Array of icon names or paths
    defaultValue?: string; // Default selected icon
    value?: string;
    onChange?: (icon: string) => void;
    // Add other props if needed, based on library docs or source
  }
  const IconPicker: React.FC<IconPickerProps>;
  export default IconPicker;
}