import DateFnsUtils from "@date-io/date-fns";
import { createTheme, DialogContentText, Grid, IconButton, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider } from "@material-ui/core";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import React from "react";
import { useEffect, useState, useRef, useContext } from "react"
import swal from "sweetalert";
import API, { endpoints } from "../../../API";
import ButtonCustom from "../../../components/Button";
import DataTable from "../../../components/DataTable";
import { Slide, DialogContent, DialogTitle, Dialog } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import ReactToPrint from 'react-to-print';
import { AuthContext } from '../../../App';

const useStyles = makeStyles({
    root: {
        height: 400,
        width: '100%',
        marginTop: 50,
        background: 'white'
    },
    loading: {
        opacity: 0.5,
        pointerEvents: 'none',
        backgroundImage: 'url("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/6d391369321565.5b7d0d570e829.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
})

const theme = createTheme({
    palette: {
        primary: {
            main: '#afc2cb'
        }
    }
})

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Bookings() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [doctors, setDoctors] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [services, setServices] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [open, setOpen] = useState(false);
    const [isDoctorShow, setDoctorShow] = useState(false);
    const [isShiftShow, setShiftShow] = useState(false);
    const classes = useStyles();
    const pdfRef = useRef();
    const [bookingToPDF, setBookingToPDF] = useState();
    const context = useContext(AuthContext);
    const [actionLoading, setActionLoading] = useState(false);

    const columns = [
        {
            field: 'id',
            headerName: 'ID'
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            width: 200,
            editable: true
        },
        {
            field: 'gender',
            headerName: 'Gender',
            width: 150,
            editable: true
        },
        {
            field: 'dateOfBirth',
            headerName: 'Date of Birth',
            width: 200,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker style={{ width: 200 }} color="primary"
                                InputProps={{ readOnly: true }}
                                format="dd-MM-yyyy"
                                onChange={(value) => handleDateChange('dateOfBirth', value, params)}
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
            editable: true
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200,
            editable: true
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 200,
            editable: true
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 200,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker style={{ width: 200 }} color="primary" readOnly
                                InputProps={{ readOnly: true }}
                                format="dd-MM-yyyy"
                                onDoubleClick={() => handleChooseDateDoctorShift()}
                                name="dateOfBirth" value={params.getValue(params.id, 'date')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        },
        {
            field: 'doctor',
            headerName: 'Doctor',
            width: 200,
            renderCell: (params) => {
                const doctor_id = params.getValue(params.id, 'doctor_id');
                const doctor = doctors.filter(d => d.id === doctor_id);
                return (
                    <p style={{ cursor: 'pointer' }}
                        onDoubleClick={() => handleChooseDateDoctorShift()}>
                        {doctor[0]?.lastName + ' ' + doctor[0]?.firstName}
                    </p>
                )
            }
        },
        {
            field: 'shift',
            headerName: 'Shift',
            width: 200,
            renderCell: (params) => {
                const shift_id = params.getValue(params.id, 'shift_id');
                const shift = shifts.filter(s => s.id === shift_id);
                return (
                    <p style={{ cursor: 'pointer' }}
                        onDoubleClick={() => handleChooseDateDoctorShift()}>
                        {shift[0]?.description}</p>
                )
            }
        },
        {
            field: 'service_id',
            headerName: 'Service',
            width: 200,
            renderCell: (params) => {
                const service_id = params.getValue(params.id, 'service_id');
                const service = services.filter(s => s.id === service_id);
                return (
                    <p>{service[0]?.name}</p>
                )
            }
        },
        {
            field: 'doctor_id',
            hide: true
        },
        {
            field: 'shift_id',
            hide: true
        },
        {
            field: 'patient_id',
            headerName: 'Loyal patient',
            renderCell: (params) => params.getValue(params.id, 'patient_id') ? 'Yes' : 'No',
            width: 200,
        },
        {
            field: 'confirmedAt',
            headerName: 'Confirmed At',
            width: 200,
            renderCell: (params) => {
                const booking_id = params.id;
                const token = tokens.filter(t => t.booking_id === booking_id);
                const time = new Date(token[0]?.confirmedAt);
                return token[0]?.confirmedAt ? `${time.getUTCDate()}-${time.getMonth() + 1}-${time.getFullYear()} 
                ${time.getUTCHours()}:${time.getUTCMinutes()}:${time.getUTCSeconds()}` : '';
            }
        },
        {
            field: 'canceledAt',
            headerName: 'Cancelled At',
            width: 200,
            renderCell: (params) => {
                const booking_id = params.id;
                const token = tokens.filter(t => t.booking_id === booking_id);
                const time = new Date(token[0]?.canceledAt);
                return token[0]?.canceledAt ? `${time.getUTCDate()}-${time.getMonth() + 1}-${time.getFullYear()} 
                ${time.getUTCHours()}:${time.getUTCMinutes()}:${time.getUTCSeconds()}` : '';
            }
        },
        context.currentAuth?.role === 'ROLE_EMPLOYEE' ?
        {
            field: 'action',
            headerName: ' ',
            width: 400,
            align: 'center',
            renderCell: (params) => {
                return (
                    <>
                        <ButtonCustom title="Confirm" color="primary" style={{
                            margin: '0px 10px 0px 0px', fontSize: 12
                        }} onClick={() => handleConfirm(params.id)} />
                        <ButtonCustom title="Cancel" color="darkPrimary" style={{
                            margin: '0px 10px 0px 0px', fontSize: 12
                        }} onClick={() => handleCancel(params.id)} />
                        <ButtonCustom title="Delete" color="darkSecondary" style={{
                            margin: '0px 10px 0px 0px', fontSize: 12
                        }} onClick={() => handleDelete(params.id)} />
                        <ButtonCustom title="Convert" color="" style={{
                            margin: '0px 10px 0px 0px', fontSize: 12
                        }} onClick={() => handleConvert(params)} />
                        <ReactToPrint
                            trigger={() => <ButtonCustom title="Print PDF" color="" variant="outlined" style={{
                                fontSize: 12
                            }} />}
                            onBeforeGetContent={async () => {
                                await API.get(`${endpoints['bookings']}/${params.id}`, {
                                    headers: {
                                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                                    }
                                }).then(res => setBookingToPDF(res.data))
                                    .catch(err => console.log(err.response))
                            }}
                            content={() => pdfRef.current}
                        />
                    </>
                )
            }
        } : ''
    ]

    const getBookings = async (page = "?p=1") => {
        setLoading(true);

        const data = await API.get(`${endpoints['bookings']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setBookings(res.data.content);
            setCurrentPage(res.data.number);
            setTotalElements(res.data.totalElements);

            const doctorIds = [...new Set(res.data.content.map(b => b.doctor_id))];
            const shiftIds = [...new Set(res.data.content.map(b => b.shift_id))];
            const serviceIds = [... new Set(res.data.content.map(b => b.service_id))];

            return {
                bookingIds: res.data.content.map(b => b.id),
                doctorIds: doctorIds,
                shiftIds: shiftIds,
                serviceIds: serviceIds
            }
        })
            .catch(err => console.log(err.response))

        let promises1 = [];
        let doctorArr = [];
        for (let i = 0; i < data.doctorIds.length; i++) {
            promises1.push(
                API.get(`${endpoints['doctors']}/${data.doctorIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => doctorArr.push(res.data))
                    .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises1).then(() => setDoctors(doctorArr));

        let promises2 = [];
        let shiftArr = [];
        for (let i = 0; i < data.shiftIds.length; i++) {
            promises2.push(
                API.get(`${endpoints['shifts']}/${data.shiftIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => shiftArr.push(res.data))
                    .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises2).then(() => setShifts(shiftArr));

        let promises3 = [];
        let tokenArr = [];
        for (let i = 0; i < data.bookingIds.length; i++) {
            promises3.push(
                API.get(`${endpoints['bookings']}/${data.bookingIds[i]}/tokens`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => tokenArr.push(res.data))
                    .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises3).then(() => {
            setTokens(tokenArr);
        })

        let promises4 = [];
        let serviceArr = [];
        for (let i = 0; i < data.serviceIds.length; i++) {
            promises4.push(
                API.get(`${endpoints['services']}/${data.serviceIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => serviceArr.push(res.data))
                .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises4).then(() => {
            setServices(serviceArr);
            setLoading(false);
        })
    }

    async function handleChooseDateDoctorShift(currentDate) {
        setOpen(true);

    }

    function handlePageChange(newPage) {
        getBookings(`?p=${newPage + 1}`);
        setCurrentPage(newPage);
    }

    async function handleConfirm(bookingId) {
        setActionLoading(true);
        let promises = [];

        promises.push(API.get(`${endpoints['bookings']}/${bookingId}/tokens`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => res.data.token)
            .catch(err => {
                if (err.response.status === 404) {
                    swal({
                        title: err.response.data.message,
                        icon: 'error',
                        buttons: {
                            cancel: 'Cancel',
                            refresh: {
                                text: 'Refresh',
                                value: 'refresh'
                            }
                        }
                    }).then((value) => {
                        switch (value) {
                            case 'refresh':
                                return API.get(`${endpoints['bookings']}/${bookingId}/tokens/refresh`, {
                                    headers: {
                                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                                    }
                                })
                            default:
                                return;
                        }
                    }).then(res => {
                        if (res?.status === 200) {
                            swal('Refresh successfully', '', 'success');
                        }
                    });
                }
            }));

        Promise.all(promises).then((value) => {
            if (typeof value[0] !== 'undefined') {
                API.get(`${endpoints['bookings']}/${bookingId}/tokens/confirm/${value}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => {
                    if (res.status === 200) {
                        swal('Confirm successfully', '', 'success');
                        getBookings(`?p=${currentPage + 1}`);
                        setActionLoading(false);
                    }
                }).catch(err => {
                        setActionLoading(false);
                        if (err.response.status === 400 && !err.response.data.message.includes('expired')) {
                            swal(err.response.data.message, '', 'error');
                        } else if (err.response.status === 400 && err.response.data.message.includes('expired')) {
                            swal({
                                title: err.response.data.message,
                                icon: 'error',
                                buttons: {
                                    cancel: 'Cancel',
                                    refresh: {
                                        text: 'Refresh',
                                        value: 'refresh'
                                    }
                                }
                            }).then(value => {
                                switch (value) {
                                    case 'refresh':
                                        return API.get(`${endpoints['bookings']}/${bookingId}/tokens/refresh`, {
                                            headers: {
                                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                                            }
                                        });
                                    default:
                                        return;
                                }
                            }).then(res => {
                                if (res?.status === 200) {
                                    swal('Refresh successfully', '', 'success');
                                }
                            })
                        }
                    });
            }
        })
    }

    const handleCancel = async (bookingId) => {
        setActionLoading(true);
        let promises = [];

        promises.push(API.get(`${endpoints['bookings']}/${bookingId}/tokens`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => res.data.token)
            .catch(err => {
                if (err.response.status === 404) {
                    swal({
                        title: err.response.data.message,
                        icon: 'error',
                        buttons: {
                            cancel: 'Cancel',
                            refresh: {
                                text: 'Refresh',
                                value: 'refresh'
                            }
                        }
                    }).then((value) => {
                        switch (value) {
                            case 'refresh':
                                return API.get(`${endpoints['bookings']}/${bookingId}/tokens/refresh`, {
                                    headers: {
                                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                                    }
                                })
                            default:
                                return;
                        }
                    }).then(res => {
                        if (res?.status === 200) {
                            swal('Refresh successfully', '', 'success');
                        }
                    });
                }
            }));

        Promise.all(promises).then((value) => {
            if (typeof value[0] !== 'undefined') {
                API.get(`${endpoints['bookings']}/${bookingId}/tokens/cancel/${value}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => {
                    if (res.status === 200) {
                        swal('Cancel successfully', '', 'success');
                        getBookings(`?p=${currentPage + 1}`);
                        setActionLoading(false);
                    }
                }).catch(err => {
                        if (err.response.status === 400 && !err.response.data.message.includes('expired')) {
                            swal(err.response.data.message, '', 'error');
                        } else if (err.response.status === 400 && err.response.data.message.includes('expired')) {
                            setActionLoading(false);
                            swal({
                                title: err.response.data.message,
                                icon: 'error',
                                buttons: {
                                    ok: 'Ok'
                                }
                            }).then(value => {
                                switch (value) {
                                    default:
                                        return;
                                }
                            })
                        }
                    });
            }
        })
    }

    const handleDelete = async (bookingId) => {
        await API(`${endpoints['bookings']}/${bookingId}`, {
            method: 'delete',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            if (res.status === 200) {
                swal('Delete successfully', '', 'success');
                getBookings(`?p=${currentPage + 1}`);
            }
        }).catch(err => console.log(err.response))
    }

    const handleDateChange = async (field, value, params) => {
        const data = await API.get(`${endpoints['bookings']}/${params.id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            delete res.data.doctor_id;
            delete res.data.shift_id;
            delete res.data.service_id;
            delete res.data.patient_id;
            return res.data;
        }).catch(err => console.log(err.response));

        await API(`${endpoints['doctors']}/${params.getValue(params.id, 'doctor_id')}
        /shifts/${params.getValue(params.id, 'shift_id')}
        /services/${params.getValue(params.id, 'service_id')}
        /bookings/${params.id}`, {
            method: 'put',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                ...data,
                [field]: value
            }
        }).then(res => {
            console.log(res);
            getBookings(`?p=${currentPage + 1}`);
        })
            .catch(err => {
                if (err.response.status === 400) {
                    swal(err.response?.data?.message, '', 'error')
                }
            })
    }

    const handleConvert = async (params) => {
        let promises = [];

        const data = await API.get(`${endpoints['bookings']}/${params.id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            promises.push(res.data);

            return res.data;
        })
            .catch(err => {
                swal(err.response?.data?.message, '', 'error');
                return;
            });

        Promise.all(promises).then(async (v) => {
            let promises = [];
            let account;

            let fullName = data.fullName;
            let lastName = fullName.split(' ').slice(0, -1).join(' ');
            let firstName = fullName.split(' ').slice(-1).join(' ');
            if (v[0].patient_id) {
                account = await API(`${endpoints['accounts']}/update/booking?patientId=${v[0].patient_id}`, {
                    method: 'put',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    data: {
                        id: data.id,
                        fullName: data.fullName,
                        gender: data.gender,
                        dateOfBirth: data.dateOfBirth,
                        phone: data.phone,
                        email: data.email,
                        address: data.address,
                    }
                }).then(res => {
                    if (res.status === 200) {
                        console.log(res)
                        swal("Updated information from booking to patient", '', 'success');
                        return;
                    }
                }).catch(err => {
                    swal(err.response.data.message, '', 'error');
                    return;
                })
            } else {
                account = await API(`${endpoints['accounts']}/create/booking`, {
                    method: 'post',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    data: {
                        id: data.id,
                        fullName: data.fullName,
                        gender: data.gender,
                        dateOfBirth: data.dateOfBirth,
                        phone: data.phone,
                        email: data.email,
                        address: data.address,
                    }
                }).then(res => {
                    if (res.status === 201) {
                        promises.push(res.data)
                    }
                }).catch(err => {
                    swal(err.response.data.message, '', 'error');
                    return;
                })
            }

            Promise.all(promises).then(async (value) => {
                if (typeof value[0] !== 'undefined') {
                    let promises = [];
                    await API(`${endpoints['accounts']}/${value[0]?.id}/patients`, {
                        method: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        data: {
                            firstName: firstName,
                            lastName: lastName,
                            gender: data.gender,
                            dateOfBirth: data.dateOfBirth,
                            phone: data.phone,
                            email: data.email,
                            address: data.address,
                        }
                    }).then(res => {
                        if (res.status === 201) {
                            promises.push(res.data);
                        }
                    }).catch(err => {
                        swal(err.response.data.message, '', 'error');
                        return;
                    })

                    Promise.all(promises).then((value) => {
                        if (typeof value[0] !== 'undefined') {
                            API(`${endpoints['doctors']}/${params.getValue(params.id, 'doctor_id')}
                        /shifts/${params.getValue(params.id, 'shift_id')}
                        /services/${params.getValue(params.id, 'service_id')}/bookings/${params.id}
                        ?patientId=${value[0].id}`, {
                                method: 'put',
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                                },
                                data: {
                                    fullName: data.fullName,
                                    gender: data.gender,
                                    dateOfBirth: data.dateOfBirth,
                                    phone: data.phone,
                                    email: data.email,
                                    address: data.address,
                                }
                            }).then(res => {
                                if (res.status === 200)
                                    swal('Success', '', 'success');
                                getBookings(`?p=${currentPage + 1}`);
                            }).catch(err => {
                                swal(err.response?.data?.message, '', 'error');
                            })
                        }
                    })
                }
            })
        })
    }

    const handleCellEditCommit = async (params) => {
        const data = await API.get(`${endpoints['bookings']}/${params.id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            delete res.data.doctor_id;
            delete res.data.shift_id;
            delete res.data.service_id;
            delete res.data.patient_id;
            return res.data;
        }).catch(err => console.log(err.response));

        await API(`${endpoints['doctors']}/${params.getValue(params.id, 'doctor_id')}
        /shifts/${params.getValue(params.id, 'shift_id')}
        /services/${params.getValue(params.id, 'service_id')}
        /bookings/${params.id}`, {
            method: 'put',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                ...data,
                [params.field]: params.value
            }
        }).then(res => console.log(res)).catch(err => {
                if (Array.isArray(err.response?.data)) {
                    for (let i = 0; i < err.response?.data?.length; i++) {
                        swal(err.response.data[i].message, '', 'error');
                    }
                }
                else {
                    swal(err.response?.data?.message, '', 'error');
                }
                getBookings(`?p=${currentPage + 1}`)
            })
    }

    function handleClose() {
        setOpen(false);

        if (isDoctorShow) {
            setDoctorShow(false);
        } else if (isShiftShow) {
            setShiftShow(false);
        }
    }

    function handleSave() {

    }

    useEffect(() => {
        getBookings();
    }, [])

    return (
        <div className={actionLoading === false ? classes.root : classes.loading}>
            {loading ? (
                <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
            ) : (
                <DataTable header="LIST BOOKING" rows={bookings} columns={columns} pageSize={7}
                    createURL="/bookings/create" server={true}
                    btnTitle="CREATE" rowCount={totalElements} handlePageChange={handlePageChange}
                    currentPage={currentPage} handleCellEditCommit={handleCellEditCommit} />
            )}
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
                    {'Choose information to update'}
                    <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleSave} aria-label="save">
                        <SaveAltIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <Grid container spacing={4}>
                            <Grid item xs={12} style={{ marginTop: 10 }}>
                                <ThemeProvider theme={theme}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker style={{ width: 200 }} color="primary" readOnly
                                            InputProps={{ readOnly: true }}
                                            format="dd-MM-yyyy"
                                            onDoubleClick={() => handleChooseDateDoctorShift()}
                                            name="dateOfBirth" value={new Date()} />
                                    </MuiPickersUtilsProvider>
                                </ThemeProvider>
                                <ButtonCustom style={{
                                    margin: '10px 20px 0px 20px', width: '175px'
                                }} title='Choose a doctor'
                                    color="primary" />
                                <ButtonCustom style={{
                                    margin: '10px 0px 0px 0px', width: '175px'
                                }} title='Choose a shift'
                                    color="primary" />
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: 10 }}>
                                <h4>Hiện tại chức năng này đang bảo trì. Bạn có thể hủy phiếu khám bệnh và tạo lại phiếu mới. Xin cảm ơn.</h4>
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <div style={{ display: 'none' }}>
                <TableContainer component={Paper}>
                    <Table ref={pdfRef}>
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={2} style={{textAlign: 'center', fontWeight: 'bold'}}>
                                    Booking Details
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell>{bookingToPDF?.id}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Patient name</TableCell>
                                <TableCell>{bookingToPDF?.fullName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Gender</TableCell>
                                <TableCell>{bookingToPDF?.gender}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Birthday</TableCell>
                                <TableCell>
                                {`${new Date(bookingToPDF?.dateOfBirth).getDate()}/${new Date(bookingToPDF?.dateOfBirth).getMonth() + 1}/${new Date(bookingToPDF?.dateOfBirth).getFullYear()}`}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Phone</TableCell>
                                <TableCell>{bookingToPDF?.phone}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Email</TableCell>
                                <TableCell>{bookingToPDF?.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Address</TableCell>
                                <TableCell>{bookingToPDF?.address}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>
                                {`${new Date(bookingToPDF?.date).getDate()}/${new Date(bookingToPDF?.date).getMonth() + 1}/${new Date(bookingToPDF?.date).getFullYear()}`}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Doctor</TableCell>
                                <TableCell>
                                {doctors && doctors.filter(d => d.id === bookingToPDF?.doctor_id).map(d => d.lastName + ' ' + d.firstName)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Shift</TableCell>
                                <TableCell>
                                {shifts && shifts.filter(s => s.id === bookingToPDF?.shift_id).map(s => `${s.name} (${s.description})`)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Service</TableCell>
                                <TableCell>
                                {services && services.filter(s => s.id === bookingToPDF?.service_id).map(s => s.name)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}