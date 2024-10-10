import React from 'react';
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import InputBase from '@mui/material/InputBase';
import Pagination from '@mui/material/Pagination';
import Tooltip from '@mui/material/Tooltip';

const drawerWidth = 210;

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
}));

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
  },
}));

export default function DbList(props) {
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  return (
    <Root>
      <CssBaseline />
      <DrawerStyled variant="permanent" anchor="left">
        <InputBase
          placeholder="Search databases"
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Divider />
        <List>
          {props.databases
            .filter((database) =>
              database.name.toLowerCase().includes(search.toLowerCase())
            )
            .slice(page * pageSize, (page + 1) * pageSize)
            .map((database) => (
              <Tooltip title={`Contains ${database.images.length} images`} key={database.name}>
                <ListItem button onClick={props.changeDb}>
                  <ListItemText primary={database.name} />
                </ListItem>
              </Tooltip>
            ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={props.createDB}>
            <ListItemText primary="New Image" />
          </ListItem>
        </List>
        <Pagination
          count={Math.ceil(props.databases.length / pageSize)}
          page={page + 1}
          onChange={handlePageChange}
        />
      </DrawerStyled>
    </Root>
  );
}