import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate, useLocation } from 'react-router-dom';

const tabConfig = [
  { label: 'Dashboard', path: '/' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Settings', path: '/settings'}
];

/**
 * Renders a set of navigation tabs for the application.
 *
 * The active tab is determined by the current route pathname.
 * When a tab is selected, the navigation updates to the corresponding route.
 *
 * @returns {JSX.Element} The navigation tabs component.
 */
export default function NavTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  // Find the current tab index by matching location.pathname
  const currentTab = tabConfig.findIndex(tab => tab.path === location.pathname);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    navigate(tabConfig[newValue].path);
  };

  return (
    <Tabs
      value={currentTab === -1 ? 0 : currentTab}
      onChange={handleChange}
      variant="fullWidth"
      indicatorColor="primary"
      textColor="primary"
      sx={{ width: '40%', minWidth: 600,
        '& .MuiTabs-indicator': {
          backgroundColor: '#50A9E3', // Change indicator (bottom border) color
        }
      }}
    >
      {tabConfig.map((tab, idx) => (
        <Tab
          key={tab.path}
          label={tab.label}
          sx={{
            color: '#ffffff',
            '&.Mui-selected': {
              color: '#ffffff', // Change selected tab text color
            },
          }}
        />
      ))}
    </Tabs>
  );
}