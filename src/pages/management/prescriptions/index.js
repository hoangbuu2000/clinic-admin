import { createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
    IconButton, makeStyles, Paper, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { blue } from "@material-ui/core/colors";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { useEffect, useState } from "react";
import API, { endpoints } from "../../../API";
import DataTable from "../../../components/DataTable";
import { ThemeProvider } from "@material-ui/styles";
import DateFnsUtils from "@date-io/date-fns";
import { Link } from 'react-router-dom';
import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import swal from "sweetalert";
import { url } from "../../../URL";
import { useHistory } from "react-router";

const theme = createTheme({
    palette: {
        primary: {
            main: blue['A400']
        }
    }
})

const useStyles = makeStyles({
    root: { 
        height: theme.spacing(50), 
        width: '100%', 
        marginTop: theme.spacing(6) + 2,
        [theme.breakpoints.down('xs')]: {
          marginTop: theme.spacing(6) + 2
        }, 
        background: 'white'
      },
})

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [prescriptionDetails, setPrescriptionDetails] = useState([]);
    const [openDetails, setOpenDetails] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const classes = useStyles();
    const history = useHistory();

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 350,
            renderCell: (params) => {
                return (
                    <Link onClick={() => getPrescriptionDetails(params.id)}
                    style={{textDecoration: 'none', color:'blue'}}>
                        {params.id}
                    </Link>
                )
            }
        },
        {
            field: 'doctor_id',
            hide: true
        },
        {
            field: 'patient_id',
            hide: true
        },
        {
            field: 'doctor',
            headerName: 'Doctor',
            width: 250,
            renderCell: (params) => {
                const doctor_id = params.getValue(params.id, 'doctor_id');
                const doctor = doctors.filter(d => d.id === doctor_id)[0];
                return (
                    <p>{doctor?.firstName}</p>
                )
            }
        },
        {
            field: 'patient',
            headerName: 'Patient',
            width: 250,
            renderCell: (params) => {
                const patient_id = params.getValue(params.id, 'patient_id');
                const patient = patients.filter(p => p.id === patient_id)[0];
                return (
                    <p>{patient?.lastName + ' ' + patient?.firstName}</p>
                )
            }
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 250,
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
            field: 'serviceFee',
            headerName: 'Service Fee',
            width: 200
        }
    ]

    function handlePageChange(newPage) {
        getPrescriptions(`?p=${newPage + 1}`);
        setCurrentPage(newPage);
    }

    async function getPrescriptions(page="?p=1") {
        setLoading(true);

        const data = await API.get(`${endpoints['prescriptions']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setPrescriptions(res.data.content);
            setCurrentPage(res.data.number);
            setTotalElements(res.data.totalElements);
            setLoading(false);
            return {
                doctorId: [...new Set(res.data.content.map(p => p.doctor_id))],
                patientId: [...new Set(res.data.content.map(p => p.patient_id))]
            }
        })
        .catch(err => {
            if (err.response.status === 403) {
                swal('Your role was forbidden', '', 'error');
                return;
            } else if (err.response.status === 401) {
                if (window.confirm('Login expired! Please login again')) {
                    localStorage.clear();
                    history.push(url['login']);
                }
            }
        });

        let promise1 = [];
        let doctorArr = [];
        for (let i = 0; i < data?.doctorId?.length; i++) {
            promise1.push(API.get(`${endpoints['doctors']}/${data.doctorId[i]}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => doctorArr.push(res.data))
            .catch(err => console.log(err.response)))
        }
        Promise.all(promise1).then(() => {
            setDoctors(doctorArr);
        })

        let promise2 = [];
        let patientArr = [];
        for (let i = 0; i < data?.patientId?.length; i++) {
            promise2.push(API.get(`${endpoints['patients']}/${data.patientId[i]}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => patientArr.push(res.data))
            .catch(err => console.log(err.response)))
        }
        Promise.all(promise2).then(() => {
            setPatients(patientArr);
        })
    }

    async function getPrescriptionDetails(presId) {
        const medicineIds = await API.get(`${endpoints['prescriptions']}/${presId}/prescriptionDetails`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res)
            setPrescriptionDetails(res.data.content);

            return res.data.content.map(p => p.medicine_id);
        })
        .catch(err => console.log(err.response))

        let promises = [];
        let medicineArr = [];
        for (let i = 0; i < medicineIds.length; i++) {
            promises.push(
                API.get(`${endpoints['medicines']}/${medicineIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => medicineArr.push(res.data))
                .catch(err => console.log(err))
            )
        }
        Promise.all(promises).then(() => {
            setMedicines(medicineArr);
            setOpenDetails(true);
        });
    }

    function handleClose() {
        setOpenDetails(false);
    }

    useEffect(() => {
        getPrescriptions();
    }, [])

    return (
        <div className={classes.root}>
            {loading ? (
                <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
            ) : (
                <DataTable header="LIST PRESCRIPTION" rows={prescriptions} columns={columns} pageSize={7}
                    createURL="/prescriptions/create" server={true}
                    btnTitle="CREATE" rowCount={totalElements} handlePageChange={handlePageChange}
                    currentPage={currentPage} />
            )}
            <Dialog
                fullScreen
                open={openDetails}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">
                    {"Prescription Details"}
                    <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {prescriptionDetails ? (
                            <TableContainer component={Paper}>
                                <Table arial-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Medicine</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Unit</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {prescriptionDetails.map(p => {
                                            const medicine = medicines.filter(m => m.id === p.medicine_id)[0];
                                            return (
                                            <TableRow key={p.id}>
                                                <TableCell>{medicine?.name}</TableCell>
                                                <TableCell>{medicine?.description}</TableCell>
                                                <TableCell>{p.quantity}</TableCell>
                                                <TableCell>{p.unitPrice}</TableCell>
                                                <TableCell>{medicine?.unit}</TableCell>
                                                <TableCell>{p.totalPrice}</TableCell>
                                            </TableRow>
                                        )})}
                                        <TableRow>
                                            <TableCell colSpan={5}>Total price of medicine</TableCell>
                                            <TableCell>
                                                {prescriptionDetails.map(p => p.totalPrice).reduce((a, b) => a + b, 0)} $
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : ''}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </div>
    )
}