import './App.css';
import {
  BrowserRouter, Route, Switch
} from 'react-router-dom';
import MiniDrawer from './pages/management/Drawer';
import ProtectedRoute from './ProtectedAuth';
import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import axios from 'axios';
import Roles from './pages/management/roles';
import FormRole from './components/FormRole';
import RoleDetails from './pages/management/roles/details';
import Accounts from './pages/management/accounts';
import Medicines from './pages/management/medicines';
import FormMedicine from './components/FormMedicine';
import Shifts from './pages/management/shifts';
import FormShift from './components/FormShift';
import AccountDetails from './pages/management/accounts/details';
import Admins from './pages/management/admins';
import Doctors from './pages/management/doctors';
import Employees from './pages/management/employees';
import Schedules from './pages/management/schedules';
import FormSchedules from './components/FormSchedule';
import Bookings from './pages/management/bookings';
import FormBooking from './components/FormBooking';
import Patients from './pages/management/patients';
import Prescriptions from './pages/management/prescriptions';
import FormPrescription from './components/FormPrescription';
import Invoices from './pages/management/invoices';
import FormInvoice from './components/FormInvoice';
import { makeStyles } from '@material-ui/core';
import { indexToSubStrCurrentEndpoint } from './currentEndpoint';
import UserDetails from './components/UserDetails';
import { useHistory } from 'react-router';
import Categories from './pages/management/categories';
import FormCategory from './components/FormCategory';
import Dashboard from './pages/management/dashboard';
import Chart from './pages/management/charts/Chart';
import Chat from './components/Chat';

export const AuthContext = React.createContext();

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(10),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1)
    }
  }
}))

function App() {
  const [currentAuth, setCurrentAuth] = useState();
  const [isAuth, setAuth] = useState(localStorage.getItem('token') ? true : false);
  const [page, setPage] = useState(window.location.href.substring(indexToSubStrCurrentEndpoint));
  const classes = useStyles();

  useEffect(() => {
    if (localStorage.getItem('token'))
      getCurrentUser();
  }, [])

  function getCurrentUser() {
    axios.get('http://localhost:8080/auth/admin/user', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      setCurrentAuth(res.data);
    }).catch(err => {
      console.log(err);
      setAuth(false);
    });
  }

  return (
    <AuthContext.Provider value={{
      isAuth: isAuth,
      setAuth: setAuth,
      currentAuth: currentAuth,
      setCurrentAuth: setCurrentAuth,
      page: page,
      setPage: setPage
    }}>
      <div className={classes.root}>
        <BrowserRouter>
          <ProtectedRoute path="/" component={MiniDrawer} isAuth={isAuth} />
          <Switch>
            <Route path="/login" exact>
              <Login />
            </Route>
            <main className={classes.content}>
              <Route exact path="/">
                <Dashboard />
              </Route>
              <Route exact path="/roles">
                <Roles />
              </Route>
              <Route exact path="/roles/create">
                <FormRole type='create' />
              </Route>
              <Route exact path="/roles/:roleId">
                <RoleDetails />
              </Route>
              <Route exact path="/accounts">
                <Accounts />
              </Route>
              <Route exact path="/medicines">
                <Medicines />
              </Route>
              <Route exact path="/medicines/create">
                <FormMedicine type='create' />
              </Route>
              <Route exact path="/shifts">
                <Shifts />
              </Route>
              <Route exact path="/shifts/create">
                <FormShift type="Create" />
              </Route>
              <Route exact path="/accounts/:accountId">
                <AccountDetails />
              </Route>
              <Route exact path="/admins">
                <Admins />
              </Route>
              <Route exact path="/doctors">
                <Doctors />
              </Route>
              <Route exact path="/employees">
                <Employees />
              </Route>
              <Route exact path="/schedules">
                <Schedules />
              </Route>
              <Route exact path="/schedules/create">
                <FormSchedules />
              </Route>
              <Route exact path="/bookings">
                <Bookings />
              </Route>
              <Route exact path="/bookings/create">
                <FormBooking />
              </Route>
              <Route exact path="/patients">
                <Patients />
              </Route>
              <Route exact path="/prescriptions">
                <Prescriptions />
              </Route>
              <Route exact path="/prescriptions/create">
                <FormPrescription />
              </Route>
              <Route exact path="/invoices">
                <Invoices />
              </Route>
              <Route exact path="/invoices/create">
                <FormInvoice />
              </Route>
              <Route exact path="/patients/:userId">
                <UserDetails role="patients" /> 
              </Route>
              <Route exact path="/categories">
                <Categories />
              </Route>
              <Route exact path="/categories/create">
                <FormCategory type="create" />
              </Route>
              <Route exact path="/chart">
                <Chart />
              </Route>
              {currentAuth?.role === 'ROLE_EMPLOYEE' ? <Chat uid={currentAuth.userId} /> : ''}
            </main>
          </Switch>
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
