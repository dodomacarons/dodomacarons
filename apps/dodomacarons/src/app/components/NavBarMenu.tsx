import { Avatar, Box, Menu, MenuItem } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export function NavBarMenu() {
  const { logout } = useAuth0();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Avatar
        sx={{ color: 'primary.main', background: 'white', cursor: 'pointer' }}
        onClick={handleClick}
      >
        <PersonIcon />
      </Avatar>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate('/');
            handleClose();
          }}
        >
          Selejt
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/statistics');
            handleClose();
          }}
        >
          Statisztikák
        </MenuItem>
        <MenuItem
          onClick={() => {
            logout({ logoutParams: { returnTo: window.location.origin } });
          }}
        >
          Kijelentkezés
        </MenuItem>
      </Menu>
    </Box>
  );
}
