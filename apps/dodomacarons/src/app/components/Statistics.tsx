import { ReactNode, SyntheticEvent, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Aggregate1Grid } from './Aggregate1';
import { Aggregate2Grid } from './Aggregate2';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

export function Statistics() {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="statistics tabs"
        >
          <Tab label="Statisztika 1" {...a11yProps(0)} />
          <Tab label="Statisztika 2" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Aggregate1Grid />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Aggregate2Grid />
      </CustomTabPanel>
    </Box>
  );
}
