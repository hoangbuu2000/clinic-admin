import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import DashboardIcon from '@material-ui/icons/Dashboard';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import ContactsIcon from '@material-ui/icons/Contacts';
import ScheduleIcon from '@material-ui/icons/Schedule';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ReceiptIcon from '@material-ui/icons/Receipt';
import { Link } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { lightBlue } from '@material-ui/core/colors';
import Roles from './roles';
import FormRole from '../../components/FormRole';
import RoleDetails from './roles/details';
import Accounts from './accounts';
import Medicines from './medicines';
import { AccessibleForward, LocalPharmacy, Category } from '@material-ui/icons';
import FormMedicine from '../../components/FormMedicine';
import Shifts from './shifts';
import FormShift from '../../components/FormShift';
import AccountDetails from './accounts/details';
import { indexToSubStrCurrentEndpoint } from '../../currentEndpoint';
import Admins from './admins';
import Doctors from './doctors';
import Employees from './employees';
import FormSchedules from '../../components/FormSchedule';
import Schedules from './schedules';
import Bookings from './bookings';
import FormBooking from '../../components/FormBooking';
import Patients from './patients';
import FormPrescription from '../../components/FormPrescription';
import Prescriptions from './prescriptions';
import Invoices from './invoices';
import FormInvoice from '../../components/FormInvoice';
import { AuthContext } from '../../App';
import { Avatar, Badge, Menu, MenuItem } from '@material-ui/core';
import BarChartIcon from '@material-ui/icons/BarChart';
import NotificationsIcon from '@material-ui/icons/Notifications';
import functions from "firebase/functions";
import { initializeApp } from "firebase/app";
import { getDatabase, set, ref, push, onValue } from "firebase/database";
import firebase from "firebase/compat/app";

const drawerWidth = 240;
const primary = lightBlue['A400'];
export const SideBarContext = React.createContext();

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background: '#e1f5fe',
    color: '#000000'
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(10),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1)
    }
  },
}));

export default function MiniDrawer() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const authContext = useContext(AuthContext);
  const [anchorEl1, setAnchorEl1] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [countNoti, setCountNoti] = useState(0);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function handleClick1(event) {
    setAnchorEl1(event.currentTarget);
    setCountNoti(0);
  }

  function handleClose1() {
    setAnchorEl1(null);
  }

  function handleClick2(event) {
    setAnchorEl2(event.currentTarget);
  }

  function handleClose2() {
    setAnchorEl2(null);
  }

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyB4eNncvS4xXvEmLQCAfAXgmiJOJnekaQU",
      authDomain: "dhbhospital.firebaseapp.com",
      databaseURL: "https://dhbhospital-default-rtdb.firebaseio.com",
      projectId: "dhbhospital",
      storageBucket: "dhbhospital.appspot.com",
      messagingSenderId: "894178118006",
      appId: "1:894178118006:web:533448f7c6027028881257",
      measurementId: "G-SQ482RM39Q"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
      const app = initializeApp(firebaseConfig);
      console.log('Connected');
    }

    const database = getDatabase();
    const notiListRef = ref(database, 'notifications');


    onValue(notiListRef, (snapshot) => {
      let array = [];
      setCountNoti(snapshot.size);
      snapshot.forEach((childSnapshot) => {
        let childData = childSnapshot.val();
        array.push(childData);
      })
      Promise.all(array).then(() => setNotifications(array));
      // setNotifications(array);
    })

    // setTimeout(() => {
    //   console.log(notifications)
    // }, 2000)

  }, [])

  return (
    <SideBarContext.Provider>

      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <LocalHospitalIcon style={{ marginRight: 10 }} />
          <Typography variant="h6" noWrap>
            DHB HOSPITAL
          </Typography>

          <div style={{ position: 'absolute', right: 35, width: 100 }}>
            {authContext.isAuth ? (
              <div>
                {authContext.currentAuth?.role === 'ROLE_EMPLOYEE' ? (
                  <>
                    <Badge badgeContent={countNoti} color="secondary"
                    style={{marginTop: -20}}>
                      <NotificationsIcon style={{ cursor: 'pointer' }} onClick={handleClick1} />
                    </Badge>
                    <Menu
                      anchorEl={anchorEl1}
                      keepMounted
                      open={Boolean(anchorEl1)}
                      onClose={handleClose1}
                    >
                      {notifications && notifications.map(n => {
                        return (
                          <>
                            <MenuItem onClick={handleClose1}>
                              <Typography>{n.content}</Typography>
                              <Typography variant="caption">{`(${n.time})`}</Typography>
                            </MenuItem>
                            <Divider />
                          </>
                        );
                      })}
                      {notifications.length === 0 ?
                        <MenuItem onClick={handleClose1}>
                          <Typography>There isn't no notifications recently</Typography>
                        </MenuItem> : ''}
                    </Menu>
                  </>
                ) : ''}
                <Avatar
                  style={{ background: 'white', cursor: 'pointer', display: 'inline-block', marginLeft: 20 }}
                  variant="square" onClick={handleClick2} src={authContext.currentAuth?.image} width="100%" />
                <Menu
                  anchorEl={anchorEl2}
                  keepMounted
                  open={Boolean(anchorEl2)}
                  onClose={handleClose2}
                >
                  <MenuItem onClick={handleClose2}>Profile</MenuItem>
                  <MenuItem onClick={() => {
                    localStorage.clear();
                    authContext.setAuth(false);
                  }}>Log out</MenuItem>
                </Menu>
                {/* <a href="#" onClick={() => {
              localStorage.clear();
              authContext.setAuth(false);
            }}>Logout</a> */}
              </div>
            ) : ''}
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem button onClick={() => authContext.setPage('/')} selected={authContext.page === '/'}
            component={Link} to='/'>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary='Dashboard' />
          </ListItem>
          {authContext.currentAuth?.role === 'ROLE_ADMIN' ? (
            <>
              <ListItem button onClick={() => authContext.setPage('/roles')} selected={authContext.page.includes('/roles')}
                component={Link} to='/roles'>
                <ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
                <ListItemText primary='Role' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/accounts')} selected={authContext.page.includes('/accounts')}
                component={Link} to='/accounts'>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary='Account' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/admins')} selected={authContext.page.includes('/admins')}
                component={Link} to='/admins'>
                <ListItemIcon><ContactPhoneIcon /></ListItemIcon>
                <ListItemText primary='Admin' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/doctors')} selected={authContext.page.includes('/doctors')}
                component={Link} to='/doctors'>
                <ListItemIcon><ContactMailIcon /></ListItemIcon>
                <ListItemText primary='Doctor' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/employees')} selected={authContext.page.includes('/employees')}
                component={Link} to='/employees'>
                <ListItemIcon><ContactsIcon /></ListItemIcon>
                <ListItemText primary='Employee' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/patients')} selected={authContext.page.includes('/patients')}
                component={Link} to='/patients'>
                <ListItemIcon><AccessibleForward /></ListItemIcon>
                <ListItemText primary='Patient' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/medicines')} selected={authContext.page.includes('/medicines')}
                component={Link} to='/medicines'>
                <ListItemIcon><LocalPharmacy /></ListItemIcon>
                <ListItemText primary='Medicines' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/categories')} selected={authContext.page.includes('/categories')}
                component={Link} to='/categories'>
                <ListItemIcon><Category /></ListItemIcon>
                <ListItemText primary='Medicine Categories' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/shifts')} selected={authContext.page.includes('/shifts')}
                component={Link} to='/shifts'>
                <ListItemIcon><EventAvailableIcon /></ListItemIcon>
                <ListItemText primary='Shifts' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/schedules')} selected={authContext.page.includes('/schedules')}
                component={Link} to='/schedules'>
                <ListItemIcon><ScheduleIcon /></ListItemIcon>
                <ListItemText primary='Schedules' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/bookings')} selected={authContext.page.includes('/bookings')}
                component={Link} to='/bookings'>
                <ListItemIcon><LibraryBooksIcon /></ListItemIcon>
                <ListItemText primary='Bookings' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/chart')} selected={authContext.page.includes('/chart')}
                component={Link} to='/chart'>
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary='Chart' />
              </ListItem>
            </>
          ) : ''}
          {authContext.currentAuth?.role === 'ROLE_DOCTOR' ? (
            <>
              <ListItem button onClick={() => authContext.setPage('/patients')} selected={authContext.page.includes('/patients')}
                component={Link} to='/patients'>
                <ListItemIcon><AccessibleForward /></ListItemIcon>
                <ListItemText primary='Patient' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/prescriptions')} selected={authContext.page.includes('/prescriptions')}
                component={Link} to='/prescriptions'>
                <ListItemIcon><NoteAddIcon /></ListItemIcon>
                <ListItemText primary='Prescriptions' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/medicines')} selected={authContext.page.includes('/medicines')}
                component={Link} to='/medicines'>
                <ListItemIcon><LocalPharmacy /></ListItemIcon>
                <ListItemText primary='Medicines' />
              </ListItem>
            </>
          ) : ''}
          {authContext.currentAuth?.role === 'ROLE_EMPLOYEE' ? (
            <>
              <ListItem button onClick={() => authContext.setPage('/bookings')} selected={authContext.page.includes('/bookings')}
                component={Link} to='/bookings'>
                <ListItemIcon><LibraryBooksIcon /></ListItemIcon>
                <ListItemText primary='Bookings' />
              </ListItem>
              <ListItem button onClick={() => authContext.setPage('/invoices')} selected={authContext.page.includes('/invoices')}
                component={Link} to='/invoices'>
                <ListItemIcon><ReceiptIcon /></ListItemIcon>
                <ListItemText primary='Invoices' />
              </ListItem>
            </>
          ) : ''}
        </List>
        <Divider />
      </Drawer>
    </SideBarContext.Provider>
  );
}
