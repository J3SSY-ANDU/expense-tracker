import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate, useLocation } from 'react-router-dom';

const tabConfig = [
  { label: 'Dashboard', path: '/' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Stats', path: '/stats' },
  { label: 'Settings', path: '/settings'}
];

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
      sx={{ width: '40%', minWidth: 600 }} // Add some space below tabs
    >
      {tabConfig.map(tab => (
        <Tab key={tab.path} label={tab.label} />
      ))}
    </Tabs>
  );
}