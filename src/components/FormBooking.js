import DateFnsUtils from "@date-io/date-fns";
import {
    createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Divider, FormControl, FormControlLabel, FormLabel, Grid,
    IconButton, makeStyles, MenuItem, MuiThemeProvider, Radio, RadioGroup,
    Slide, ThemeProvider, Tooltip
} from "@material-ui/core";
import { blue } from "@material-ui/core/colors";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { useEffect, useState } from "react";
import { SelectValidator, TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { Link, useHistory } from "react-router-dom";
import ButtonCustom from "./Button";
import API, { endpoints } from "../API";
import React from "react";
import { Pagination } from "@material-ui/lab";
import DataTable from "./DataTable";
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import swal from "sweetalert";
import { url } from "../URL";
import InfoIcon from '@material-ui/icons/Info';

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
    },
})

const theme = createTheme({
    palette: {
        primary: {
            main: '#afc2cb'
        },
        secondary: {
            main: '#e1f5fe'
        }
    }
})

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function FormBooking(props) {
    const classes = useStyles();
    const history = useHistory();
    const [booking, setBooking] = useState({
        fullName: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        service: 0
    })
    const [selectedDOB, setSelectedDOB] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [doctors, setDoctors] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [open, setOpen] = useState(false);
    const [openChoosePhone, setOpenChoosePhone] = useState(false);
    const [openChoosePatient, setOpenChoosePatient] = useState(false);
    const [isDoctorShow, setDoctorShow] = useState(false);
    const [isShiftShow, setShiftShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [doctorSelected, setDoctorSelected] = useState();
    const [shiftSelected, setShiftSelected] = useState();
    const [infoD, setInfoD] = useState();
    const [infoS, setInfoS] = useState();
    const [patients, setPatients] = useState([]);
    const [patientSelected, setPatientSelected] = useState();
    const [services, setServices] = useState([]);

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
            field: 'image',
            headerName: ' ',
            renderCell: (params) => {
                const account_id = params.getValue(params.id, 'account_id');
                const account = accounts.filter(a => a.id === account_id);
                return (
                    <img src={account[0]?.image} width="100%" />
                )
            }
        },
        {
            field: 'firstName',
            hide: true
        },
        {
            field: 'lastName',
            hide: true
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            width: 200,
            valueGetter: (params) => {
                return `${params.getValue(params.id, 'lastName')} ${params.getValue(params.id, 'firstName')}`
            }
        },
        {
            field: 'phone',
            headerName: 'Phone',
            width: 200
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200
        }
    ]

    const columnsShift = [
        {
            field: 'id',
            headerName: 'ID',
            width: 200
        },
        {
            field: 'name',
            headerName: 'Shift name',
            width: 250
        },
        {
            field: 'description',
            headerName: 'Shift description',
            width: 500
        },
        {
            field: 'maxBookings',
            headerName: 'Max number of bookings',
            width: 300
        },
        {
            field: 'isMax',
            headerName: 'Are bookings max',
            width: 200
        }
    ]

    const columnsPatient = [
        {
            field: 'id',
            hide: true
        },
        {
            field: 'firstName',
            hide: true
        },
        {
            field: 'lastName',
            hide: true
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            width: 300,
            valueGetter: (params) => {
                return `${params.getValue(params.id, 'lastName')} ${params.getValue(params.id, 'firstName')}`
            }
        },
        {
            field: 'gender',
            headerName: 'Gender',
            width: 200
        },
        {
            field: 'dateOfBirth',
            headerName: 'Date of Birth',
            width: 300,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker readOnly style={{ width: 200 }} color="primary"
                                InputProps={{ readOnly: true }}
                                format="dd-MM-yyyy"
                                onChange={(date) => alert(date)}
                                name="dateOfBirth" value={params.getValue(params.id, 'joinDate')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        },
        {
            field: 'phone',
            headerName: 'Phone',
            width: 300
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 300
        }
    ]

    function getServices() {
        API.get(`${endpoints['services']}`)
            .then(res => {
                console.log(res);
                setServices(res.data.content)
            })
            .catch(err => console.log(err.response))
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!doctorSelected) {
            swal('Please choose a doctor', '', 'warning');
            return;
        }
        if (!shiftSelected) {
            swal('Please choose a shift', '', 'warning');
            return;
        }

        let param = "";
        if (patientSelected)
            param = `?patientId=${patientSelected.id}`

        API(`${endpoints['doctors']}/${doctorSelected.id}/shifts/${shiftSelected.id}
        /services/${booking.service}/bookings${param}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                fullName: booking.fullName,
                gender: booking.gender,
                dateOfBirth: selectedDOB,
                phone: booking.phone,
                email: booking.email,
                address: booking.address
            }
        }).then(res => {
            if (res.status === 201) {
                swal('Success', '', 'success');
                history.push("/bookings");
            }
        })
            .catch(err => {
                if (Array.isArray(err.response?.data)) {
                    for (let i = 0; i < err.response.data.length; i++) {
                        swal(err.response.data[i].message, '', 'error');
                    }
                } else if (err.response?.status === 401) {
                    if (window.confirm('Login expired! Please login again.')) {
                        localStorage.clear();
                        history.push(url['login']);
                    }
                }
            })
    }

    function handleGoBack() {
        history.goBack();
    }

    function handleChange(event) {
        let temp = { ...booking };
        temp[event.target.name] = event.target.value;
        setBooking(temp);
    }

    const handleChooseDoctor = async () => {
        if (!selectedDate) {
            swal('Please choose a date', '', 'warning');
            return;
        }

        setLoading(true);

        if (!shiftSelected) {
            const doctorIds = await API(`${endpoints['schedules']}`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal('There are not any doctors available on this date', '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.doctor_id))];
            })
                .catch(err => console.log(err.response));

            let promise = [];
            let doctorArr = [];
            let accountIds = [];
            for (let i = 0; i < doctorIds.length; i++) {
                promise.push(
                    API.get(`${endpoints['doctors']}/${doctorIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => doctorArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promise).then(() => {
                setDoctors(doctorArr);
                accountIds = doctorArr.map(d => d.account_id);

                let promises = [];
                let accountArr = [];
                for (let i = 0; i < accountIds.length; i++) {
                    promises.push(
                        API.get(`${endpoints['accounts']}/${accountIds[i]}`, {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        }).then(res => accountArr.push(res.data))
                            .catch(err => console.log(err.response))
                    )
                }
                Promise.all(promises).then(() => {
                    setAccounts(accountArr);
                    setLoading(false);
                    setOpen(true);
                    setDoctorShow(true);
                });
            });
        } else {
            const doctorIds = await API(`${endpoints['shifts']}/${shiftSelected.id}/schedules`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal('There are not any doctors available on this date and this shift', '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.doctor_id))];
            })
                .catch(err => console.log(err.response));

            let promise = [];
            let doctorArr = [];
            let accountIds = [];
            for (let i = 0; i < doctorIds.length; i++) {
                promise.push(
                    API.get(`${endpoints['doctors']}/${doctorIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => doctorArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promise).then(() => {
                setDoctors(doctorArr);
                accountIds = doctorArr.map(d => d.account_id);

                let promises = [];
                let accountArr = [];
                for (let i = 0; i < accountIds.length; i++) {
                    promises.push(
                        API.get(`${endpoints['accounts']}/${accountIds[i]}`, {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        }).then(res => accountArr.push(res.data))
                            .catch(err => console.log(err.response))
                    )
                }
                Promise.all(promises).then(() => {
                    setAccounts(accountArr);
                    setLoading(false);
                    setOpen(true);
                    setDoctorShow(true);
                });
            });
        }
    }

    const handleChooseShift = async () => {
        if (!selectedDate) {
            swal('Please choose a date', '', 'warning');
            return;
        }

        setLoading(true);

        if (!doctorSelected) {
            const shiftIds = await API(`${endpoints['schedules']}`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal('There are not any shifts available on this date', '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.shift_id))];
            })
                .catch(err => console.log(err.response));

            let promises = [];
            let shiftArr = [];
            let isMaxArr = [];
            for (let i = 0; i < shiftIds.length; i++) {
                promises.push(
                    API.get(`${endpoints['shifts']}/${shiftIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => shiftArr.push(res.data))
                        .catch(err => console.log(err.response)),

                    API(`${endpoints['shifts']}/${shiftIds[i]}/bookings/date`, {
                        method: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        data: selectedDate
                    }).then(res => isMaxArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promises).then(() => {
                for (let i = 0; i < shiftArr.length; i++) {
                    Object.assign(shiftArr[i], { isMax: isMaxArr[i] })
                }

                setShifts(shiftArr);
                setLoading(false);
                setOpen(true);
                setShiftShow(true);
            });
        } else {
            const shiftIds = await API(`${endpoints['doctors']}/${doctorSelected.id}/schedules`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal(`There are not any shifts available on this date and doctor: 
                    ${doctorSelected.lastName + ' ' + doctorSelected.firstName}`, '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.shift_id))];
            })
                .catch(err => console.log(err.response));

            let promises = [];
            let shiftArr = [];
            let isMaxArr = [];
            for (let i = 0; i < shiftIds?.length; i++) {
                promises.push(
                    API.get(`${endpoints['shifts']}/${shiftIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => shiftArr.push(res.data))
                        .catch(err => console.log(err.response)),

                    API(`${endpoints['shifts']}/${shiftIds[i]}/bookings/date`, {
                        method: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        data: selectedDate
                    }).then(res => isMaxArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promises).then(() => {
                for (let i = 0; i < shiftArr.length; i++) {
                    Object.assign(shiftArr[i], { isMax: isMaxArr[i] })
                }

                setShifts(shiftArr);
                setLoading(false);
                setOpen(true);
                setShiftShow(true);
            });
        }
    }

    function handleClose() {
        setOpen(false);

        if (isDoctorShow) {
            setDoctorSelected();
            setDoctorShow(false);
        } else if (isShiftShow) {
            setShiftSelected();
            setShiftShow(false);
        }
    }

    function handleSave() {
        if (isDoctorShow && !doctorSelected) {
            swal('Please choose a doctor', '', 'warning');
            return;
        } else if (isShiftShow && !shiftSelected) {
            swal('Please choose a shift', '', 'warning');
            return;
        } else if (openChoosePatient && !patientSelected) {
            swal('Please choose a patient', '', 'warning');
            return;
        }

        if (doctorSelected || shiftSelected) {
            if (doctorSelected) {
                setInfoD(`Doctor: ${doctorSelected.lastName} ${doctorSelected.firstName}`);
            }
            if (shiftSelected) {
                setInfoS(`Shift: ${shiftSelected.description}`);
            }

            setOpen(false);
            setDoctorShow(false);
            setShiftShow(false);
        }

        if (patientSelected) {
            setOpenChoosePatient(false);
            setBooking({
                fullName: patientSelected.lastName + ' ' + patientSelected.firstName,
                gender: patientSelected.gender,
                phone: patientSelected.phone,
                email: patientSelected.email,
                address: patientSelected.address,
                service: 0
            })
        }
    }

    function handleSelectionChange(newSelection) {
        if (isDoctorShow) {
            API.get(`${endpoints['doctors']}/${newSelection}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setDoctorSelected(res.data))
                .catch(err => console.log(err.response))
        }
        else if (isShiftShow) {
            API.get(`${endpoints['shifts']}/${newSelection}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setShiftSelected(res.data))
                .catch(err => console.log(err.response))
        }
        else if (openChoosePatient) {
            API.get(`${endpoints['patients']}/${newSelection}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setPatientSelected(res.data))
                .catch(err => console.log(err.response))
        }
    }

    function handleChoosePatient() {
        setOpenChoosePhone(true);
    }

    function handleCloseChoosePhone() {
        setOpenChoosePhone(false);
    }

    function handleCloseChoosePatient() {
        setOpenChoosePatient(false);
    }

    function handleGetPatientByPhone(event) {
        event.preventDefault();

        API.get(`${endpoints['patients']}/phone/${booking.phone}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setPatients(res.data);
            setOpenChoosePatient(true);
            setOpenChoosePhone(false);
        })
            .catch(err => console.log(err.response))
    }

    useEffect(() => {
        ValidatorForm.addValidationRule('isPhoneNumber', (value) => {
            const regex = new RegExp("(84|0[3|5|7|8|9])+([0-9]{8})\\b");
            return regex.test(value);
        })
        ValidatorForm.addValidationRule('isServiceChosen', (value) => {
            return value !== 0;
        })

        getServices();
    }, [])

    function isRowSelectable(params) {
        return params.row.isMax !== true;
    }

    return (
        <ThemeProvider theme={theme}>
            <Grid id="grid" className={classes.root} container spacing={4}>
                <Grid className={classes.background} item xs={6}>
                    <img src={process.env.PUBLIC_URL + '/images/gui7.svg'} width="100%" height="500" />
                </Grid>
                <Grid container className={classes.form} item xs={6}>
                    <ValidatorForm onSubmit={handleSubmit}>
                        <Grid container item xs={12} spacing={4}>
                            <Grid item xs={6}>
                                <TextValidator className={classes.input} name="fullName" label="Full name *"
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    value={booking.fullName}
                                    onChange={handleChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextValidator name="gender" label="Gender *"
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    value={booking.gender}
                                    onChange={handleChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <ThemeProvider theme={theme}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker style={{ width: 200 }}
                                            label="DOB *" format="dd-MM-yyyy"
                                            onChange={(date) => setSelectedDOB(date)}
                                            name="dateOfBirth" value={selectedDOB} />
                                    </MuiPickersUtilsProvider>
                                </ThemeProvider>
                            </Grid>
                            <Grid item xs={6}>
                                <TextValidator name="phone" label="Phone *"
                                    validators={['required', 'isPhoneNumber']}
                                    errorMessages={['this field is required', 'invalid phone number']}
                                    value={booking.phone}
                                    onChange={handleChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextValidator name="email" label="Email *"
                                    validators={['required', 'isEmail']}
                                    errorMessages={['this field is required', 'invalid email']}
                                    value={booking.email}
                                    onChange={handleChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextValidator name="address" label="Address *"
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    value={booking.address}
                                    onChange={handleChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <ThemeProvider theme={theme}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker style={{ width: 200 }}
                                            label="Date *" format="dd-MM-yyyy"
                                            minDate={new Date()}
                                            onChange={(date) => {
                                                setSelectedDate(date);
                                                setDoctorSelected();
                                                setShiftSelected();
                                            }}
                                            name="date" value={selectedDate} />
                                    </MuiPickersUtilsProvider>
                                </ThemeProvider>
                            </Grid>
                            <Grid item xs={6}>
                                <ButtonCustom style={{
                                    margin: '10px 0px 0px 0px', width: '175px'
                                }} title='Choose a doctor'
                                    color="primary" onClick={() => handleChooseDoctor("?p=1")} />
                                {
                                    doctorSelected ? (
                                        <Tooltip arrow title={infoD}>
                                            <InfoIcon />
                                        </Tooltip>
                                    ) : ''
                                }
                                <ButtonCustom style={{
                                    margin: '10px 0px 0px 0px', width: '175px'
                                }} title='Choose a shift'
                                    color="primary" onClick={() => handleChooseShift()} />
                                {
                                    shiftSelected ? (
                                        <Tooltip arrow title={infoS}>
                                            <InfoIcon />
                                        </Tooltip>
                                    ) : ''
                                }
                            </Grid>
                            <Grid item xs={6}>
                                <SelectValidator
                                    style={{ marginTop: -25, minWidth: 200 }}
                                    validators={['isServiceChosen']}
                                    errorMessages={['this field is required']} value={booking.service}
                                    onChange={(event) => setBooking({ ...booking, service: event.target.value })}>
                                    <MenuItem value={0}>Choose service</MenuItem>
                                    {services && services.map(s => <MenuItem value={s.id}>{s.name}</MenuItem>)}
                                </SelectValidator>
                            </Grid>
                        </Grid>

                        <ButtonCustom style={{
                            margin: '10px 0px 0px 0px', position: 'absolute',
                            top: 660, right: 75
                        }} title='Save'
                            color="darkSecondary" type="submit" />
                        <ButtonCustom style={{
                            margin: '10px 0px 0px 0px', position: 'absolute',
                            top: 660, right: 620
                        }} title='Go Back'
                            color="darkSecondary" onClick={handleGoBack} />
                    </ValidatorForm>
                </Grid>
            </Grid>
            {!loading ? (
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
                        {isDoctorShow ? 'Choose a doctor' : 'Choose a shift'}
                        <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleSave} aria-label="save">
                            <SaveAltIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            <Grid container spacing={4}>
                                <Grid item xs={12} style={{ marginTop: 10 }}>
                                    {isDoctorShow ? (
                                        <DataTable rows={doctors} columns={columnsDoctor}
                                            btnTitle="" createURL="" header="" handleSelectionChange={handleSelectionChange} />
                                    ) : (isShiftShow ? (
                                        <DataTable rows={shifts} columns={columnsShift}
                                            btnTitle="" createURL="" header="" 
                                            handleSelectionChange={handleSelectionChange}
                                            isRowSelectable={isRowSelectable} />
                                    ) : '')}
                                </Grid>
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            ) : ''}
            <ButtonCustom style={{
                margin: '10px 0px 0px 0px', position: 'absolute',
                top: 80, right: 0
            }} title='Loyal patient' variant="outlined"
                color="lightPrimary" onClick={handleChoosePatient} />
            <Dialog
                open={openChoosePhone}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseChoosePhone}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">
                    <IconButton edge="start" color="inherit" onClick={handleCloseChoosePhone} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    {'Enter a phone number'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <ValidatorForm onSubmit={handleGetPatientByPhone}>
                            <TextValidator style={{ marginLeft: 10 }} name="phone" label="Phone *"
                                validators={['required', 'isPhoneNumber']}
                                errorMessages={['this field is required', 'invalid phone number']}
                                value={booking.phone}
                                onChange={handleChange} />
                            <ButtonCustom style={{
                                margin: '20px 0px 0px 126px'
                            }} title='Submit'
                                type="submit"
                                color="primary" />
                        </ValidatorForm>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            <Dialog
                fullScreen
                open={openChoosePatient}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseChoosePatient}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">
                    <IconButton edge="start" color="inherit" onClick={handleCloseChoosePatient} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    {'Choose a patient'}
                    <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleSave} aria-label="save">
                        <SaveAltIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {patients ? (
                            <Grid container spacing={4}>
                                <Grid item xs={12} style={{ marginTop: 10 }}>
                                    <DataTable rows={patients} columns={columnsPatient}
                                        btnTitle="" createURL="" header=""
                                        handleSelectionChange={handleSelectionChange} />
                                </Grid>
                            </Grid>
                        ) : ''
                        }
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    )
}