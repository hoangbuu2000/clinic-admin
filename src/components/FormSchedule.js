import { DialogContentText, FormControl, Grid, IconButton, Link, 
    DialogTitle, Dialog, DialogContent, MenuItem, ThemeProvider } from "@material-ui/core";
import { blue, lightBlue } from "@material-ui/core/colors";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { useEffect, useState } from "react";
import { SelectValidator, ValidatorForm } from "react-material-ui-form-validator";
import API, { endpoints } from "../API";
import ButtonCustom from "./Button";
import { createTheme } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { Select, TextField } from "@material-ui/core";
import DataTableSchedule from "./DataTableSchedule";
import { makeStyles } from "@material-ui/styles";
import swal from "sweetalert";
import { useHistory } from "react-router-dom";
import React from "react";
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { Slide } from "@material-ui/core";
import DataTable from "./DataTable";

const theme = createTheme({
    palette: {
        primary: {
            main: '#afc2cb'
        }
    }
})

const useStyles = makeStyles({
    root: {
        marginTop: 60
    },
    background: {
        backgroundColor: '#f5f5f5'
    },
    form: {
        background: 'white'
    },
    info: {
        fontFamily: 'monospace'
    }
})

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function FormSchedules(props) {
    const [doctors, setDoctors] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [currentPageDoctor, setCurrentPageDoctor] = useState(0);
    const [totalElementsDoctor, setTotalElementsDoctor] = useState(0);
    const [isDoctorOpen, setDoctorOpen] = useState(false);
    const [isShiftOpen, setShiftOpen] = useState(false);
    const [isDateOpen, setDateOpen] = useState(false);
    const [doctorId, setDoctorId] = useState();
    const [shiftId, setShiftId] = useState();
    const [doctor, setDoctor] = useState();
    const [shift, setShift] = useState();
    const [account, setAccount] = useState();
    const [selectedDate, setSelectedDate] = useState();
    const [open, setOpen] = useState(false);
    const classes = useStyles();
    const history = useHistory();

    const columnsDoctor = [
        {
            field: 'id',
            hide: true
        },
        {
            field: 'account_id',
            hide: true
        },
        {   
            field: 'firstName',
            headerName: 'First Name',
            width: 200,
        }, 
        {
            field: 'lastName',
            headerName: 'Last Name',
            width: 200,
        },
        {
            field: 'gender',
            headerName: 'Gender',
            width: 150,
        },
        {
            field: 'dateOfBirth',
            headerName: 'DOB',
            width: 200,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker readOnly style={{ width: 200 }} color="primary"
                                format="dd-MM-yyyy"
                                onChange={(date) => alert(date)}
                                name="dateOfBirth" value={params.getValue(params.id, 'dateOfBirth')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        },
        {
            field: 'phone',
            headerName: 'Phone',
            width: 200,
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200,
        },
        {
            field: 'joinDate',
            headerName: 'Join Date',
            width: 200,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker readOnly style={{ width: 200 }} color="primary"
                            InputProps={{readOnly: true}}
                                format="dd-MM-yyyy"
                                onChange={(date) => alert(date)}
                                name="dateOfBirth" value={params.getValue(params.id, 'joinDate')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        },
        {
            field: 'idCardNumber',
            headerName: 'Card Number',
            width: 200,
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 200,
        },
        {
            field: 'hometown',
            headerName: 'Hometown',
            width: 200,
        }
    ]

    const columnsShift = [
        {
            field: 'id',
            headerName: 'ID',
            width: 150
        }, 
        {
            field: 'name',
            headerName: 'Name',
            width: 300,
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 500,
        },
        {
            field: 'active',
            headerName: 'Active',
            width: 150,
            type: 'boolean',
        },
    ]

    const styles = {
        position: 'absolute',
        width: '80%',
        background: 'white',
        top: 200
    }

    function getDoctors(page="?p=1") {
        API.get(`${endpoints['doctors']}/active${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res);
            setCurrentPageDoctor(res.data.number);
            setTotalElementsDoctor(res.data.totalElements);
            setDoctors(res.data.content)
        })
        .catch(err => console.log(err.response));
    }

    function getShifts() {
        API.get(`${endpoints['shifts']}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setShifts(res.data.content)
        })
        .catch(err => console.log(err.response));
    }

    function handleSubmit(event) {
        event.preventDefault();
    }

    function handlePageChange(newPage) {
        getDoctors(`?p=${newPage + 1}`);
        setCurrentPageDoctor(newPage);
    }

    function handleClose(event) {
        let e = document.querySelector("#grid");
        e.style.opacity = "1";
        setDoctorOpen(false);
        setShiftOpen(false);
        setOpen(false);
        setDoctorId(doctor ? doctor.id : '');
        setShiftId(shift ? shift.id : '');
    }

    async function handleSave() {
        if (isDoctorOpen) {
            if (!doctorId) {
                swal('Please choose a doctor', '', 'warning');
                return;
            }

            const accountId = await API.get(`${endpoints['doctors']}/${doctorId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => {
                setDoctor(res.data);
                return res.data.account_id;
            })
            .catch(err => console.log(err.response));

            await API.get(`${endpoints['accounts']}/${accountId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setAccount(res.data))
            .catch(err => console.log(err.response));

            setDoctorOpen(false);
        } else if (isShiftOpen) {
            if (!shiftId) {
                swal('Please choose a shift', '', 'warning');
                return;
            }
            
            API.get(`${endpoints['shifts']}/${shiftId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setShift(res.data))
            .catch(err => console.log(err.response));

            setShiftOpen(false);
        }

        let grid = document.querySelector("#grid");
        grid.style.opacity = "1";
        setOpen(false);
    }

    function handleSelectionChange(newSelection) {
        if (isDoctorOpen) {
            setDoctorId(newSelection);
        } else if (isShiftOpen) {
            setShiftId(newSelection);
        }
    }

    function handleClick(event) {
        const id = event.target.parentElement.id;
        if (id === 'doctor') {
            setDoctorOpen(true);
            setShiftOpen(false);
            setDateOpen(false);
            setOpen(true);
        } else if (id === 'shift') {
            setDoctorOpen(false);
            setDateOpen(false);
            setShiftOpen(true);
            setOpen(true);
        } else if (id === "date") {
            setDoctorOpen(false);
            setShiftOpen(false);
            setDateOpen(true);
        }
        let e = document.querySelector("#grid");
        e.style.opacity = "0.5";
    }

    function handleCloseCalendar() {
        let e = document.querySelector("#grid");
        e.style.opacity = "1";
        setDateOpen(false);
    }

    function handleDateChange(date) {
        setSelectedDate(date);
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!doctor) {
            swal('Please choose a doctor', '', 'warning');
            return;
        }
        if (!shift) {
            swal('Please choose a shift', '', 'warning');
            return;
        }
        if (!selectedDate) {
            swal('Please choose a date', '', 'warning');
            return;
        }

        let date = new Date(selectedDate);
        
        API(`${endpoints['doctors']}/${doctorId}/shifts/${shiftId}/schedules`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }, 
            data: {
                date: date
            }
        }).then(res => {
            if (res.status === 201) {
                swal('Success', '', 'success');
            }
        })
        .catch(err => {
            if (err.response.status === 500) {
                swal('Schedule is duplicated in database', '', 'error');
            } else if (err.response.status === 404) {
                swal(err.response.data.message, '', 'error');
            }
        });
    }

    function handleGoBack() {
        history.goBack();
    }

    useEffect(() => {
        getDoctors();
        getShifts();
    }, [])

    return (
        <>
        <Grid id="grid" className={classes.root} container spacing={4}>
            <Grid className={classes.background} item xs={6}>
                <img src={process.env.PUBLIC_URL + '/images/gui6.svg'} width="100%" height="500" />
            </Grid>
            <Grid className={classes.form} item xs={6}>
                <form onSubmit={handleSubmit}>
                {doctor && account ? (
                    <Grid container spacing={4}>
                        <Grid item xs={4}>
                            <img width="100%" height={150} src={account.image} />
                        </Grid>
                        <Grid item xs={8} className={classes.info}>
                            <p>Full name: {doctor.lastName + ' ' + doctor.firstName}</p>
                            <p>Phone: {doctor.phone}</p>
                            <p>Email: {doctor.email}</p>
                        </Grid>
                    </Grid>
                ) : ''}
                {shift || selectedDate ? (
                    <Grid container spacing={4}>
                        <Grid item xs={4}>
                            <img width="100%" height={150} src={process.env.PUBLIC_URL + '/images/gui5.svg'} />
                        </Grid>
                        <Grid item xs={8} className={classes.info}>
                            {shift ? (
                                <>
                                <p>Shift name: {shift.name}</p>
                                <p>Shift description: {shift.description}</p>
                                </>
                            ) : ''}
                            {selectedDate ? (
                            <p>
                                Date: {`${selectedDate.getDate()} - ${selectedDate.getMonth() + 1} -
                                ${selectedDate.getYear() + 1900}`}
                            </p>
                            ) : ''}
                        </Grid>
                    </Grid>
                ) : ''}
                <ButtonCustom id="doctor" style={{ margin: '10px 10px 0px 70px'}} title='Choose a doctor'
                color="primary" onClick={handleClick} />
                <ButtonCustom id="shift" style={{ margin: '10px 10px 0px 0px' }} title='Choose a shift'
                color="primary" onClick={handleClick} />
                <ButtonCustom id="date" style={{ margin: '10px 10px 0px 0px' }} title='Choose a date'
                color="primary" onClick={handleClick} />
                <ButtonCustom style={{ margin: '10px 0px 0px 0px', position: 'absolute', 
                top: 610, right: 75 }} title='Save'
                color="darkSecondary" type="submit"/>
                <ButtonCustom style={{ margin: '10px 0px 0px 0px', position: 'absolute',
                top: 610, right: 620 }} title='Go Back'
                color="darkSecondary" onClick={handleGoBack} />
                </form>
            </Grid>
        </Grid>
            <Dialog
                fullScreen
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    {isDoctorOpen ? 'Choose a doctor' : 'Choose a shift'}
                    <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleSave} aria-label="save">
                        <SaveAltIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <Grid container spacing={4}>
                            <Grid item xs={12} style={{ marginTop: 10 }}>
                                {isDoctorOpen ? (
                                    <DataTable rows={doctors} columns={columnsDoctor}
                                        btnTitle="" createURL="" header="" 
                                        handleSelectionChange={handleSelectionChange}
                                        rowCount={totalElementsDoctor} currentPage={currentPageDoctor}
                                        pageSize={7} handlePageChange={handlePageChange} server={true} />
                                ) : (isShiftOpen ? (
                                    <DataTable rows={shifts} columns={columnsShift}
                                        btnTitle="" createURL="" header="" handleSelectionChange={handleSelectionChange} />
                                ) : '')}
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            <ThemeProvider theme={theme}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker style={{ width: 200, display: 'none' }} color="primary"
                        label="DOB *" format="dd-MM-yyyy" open={isDateOpen} 
                        onClose={handleCloseCalendar}
                        onChange={handleDateChange}
                        value={selectedDate}
                        minDate={new Date()}
                        name="dateOfBirth" />
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        </>
    )
}