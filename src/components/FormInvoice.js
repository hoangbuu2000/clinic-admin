import { Button, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Paper, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import React, { useContext, useRef, useState } from "react";
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import API, { endpoints } from "../API";
import DataTable from "./DataTable";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { ThemeProvider } from "@material-ui/styles";
import { Link } from "react-router-dom";
import { url } from "../URL";
import swal from "sweetalert";
import { useHistory } from "react-router";
import { AuthContext } from "../App";
import ButtonCustom from "./Button";
import QRCode from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import ReactToPrint from 'react-to-print';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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

export default function FormInvoice() {
    const [open, setOpen] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [prescriptionDetails, setPrescriptionDetails] = useState([]);
    const [prescriptionSelected, setPrescriptionSelected] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [uuid, setUUID] = useState();
    const history = useHistory();
    const authContext = useContext(AuthContext);
    const pdfRef = useRef();

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 350
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
            width: 300,
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
            width: 300,
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
            width: 200,
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
        }
    ]

    async function getPrescriptions(page = "?p=1") {
        const data = await API.get(`${endpoints['prescriptions']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setPrescriptions(res.data.content);
            setCurrentPage(res.data.number);
            setTotalElements(res.data.totalElements);
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
        for (let i = 0; i < medicineIds?.length; i++) {
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
        });

        setUUID(uuidv4());
    }


    function handleOpenPrescription() {
        getPrescriptions();
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        setPrescriptionSelected();
        setPrescriptionDetails();
        setUUID();
    }

    function handleSave() {
        setOpen(false);
    }

    function handleSelectionChange(id) {
        getPrescriptionDetails(id);
        const p = prescriptions.filter(p => p.id == id)[0];
        setPrescriptionSelected(p);
    }

    function handleSubmit() {
        if (!prescriptionSelected) {
            swal('Please choose a prescription', '', 'warning');
            return;
        }

        const totalPrice = prescriptionDetails.map(p => p.totalPrice).reduce((a, b) => a + b, 0);
        const medicineIds = prescriptionDetails.map(p => p.medicine_id);

        let promises = [];
        let medicineArr = [];
        for (let i = 0; i < medicineIds?.length; i++) {
            promises.push(
                API.get(`${endpoints['medicines']}/${medicineIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => medicineArr.push(res.data))
                    .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises).then(() => {
            API(`${endpoints['prescriptions']}/${prescriptionSelected.id}
            /employees/${authContext.currentAuth.userId}/invoices`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: {
                    id: uuid,
                    totalPrice: totalPrice
                }
            }).then(res => {
                console.log(res);
                if (res.status === 201) {
                    swal('Success', '', 'success');
                    history.goBack();

                    for (let i = 0; i < medicineArr?.length; i++) {
                        const quantity = prescriptionDetails.filter(p => p.medicine_id === medicineArr[i].id)[0]?.quantity;
                        let formData1 = new FormData();
                        formData1.append('name', medicineArr[i].name);
                        formData1.append('description', medicineArr[i].description);
                        formData1.append('unit', medicineArr[i].unit);
                        formData1.append('price', medicineArr[i].price);
                        formData1.append('unitInStock', medicineArr[i].unitInStock - (quantity || 0));
                        API(`${endpoints['medicines']}/${medicineArr[i].id}`, {
                            method: 'put',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                                'Content-type': 'Multipart/form-data'
                            },
                            data: formData1
                        }).then(res => console.log(res))
                            .catch(err => console.log(err.response))
                    }
                }
            }).catch(err => console.log(err.response));
        })
    }

    return (
        <Grid container spacing={4}>
            <Grid item xs={5}>
                <div>
                    <Button id="patient" variant="outlined" onClick={handleOpenPrescription}>
                        Choose prescription
                    </Button>

                    <Dialog
                        disableEnforceFocus
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
                            {"Choose a prescription"}
                            <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleSave} aria-label="save">
                                <SaveAltIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                                <DataTable rows={prescriptions} columns={columns}
                                    btnTitle="" createURL="" header="" server={true}
                                    rowCount={totalElements} currentPage={currentPage}
                                    pageSize={7}
                                    handleSelectionChange={handleSelectionChange} />

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
                                                    )
                                                })}
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
            </Grid>
            <Grid item xs={7}>
                <TableContainer style={{ textAlign: 'center' }} component={Paper}>
                    <Table ref={pdfRef} arial-label="simple table">
                        <TableBody>
                            <TableRow>
                                <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={4}>DHB HOSPITAL</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ textAlign: 'center' }} colSpan={4}>www.dhbhospital.com</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ textAlign: 'center' }} colSpan={4}>97 Vo Van Tan, Ward 6, District 3, Ho Chi Minh city</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={4}>
                                    INVOICE
                                </TableCell>
                            </TableRow>
                            {prescriptionSelected ? (
                                <TableRow>
                                    <TableCell colSpan={4} style={{ textAlign: 'center' }}>
                                        <QRCode
                                            id="qrcode"
                                            value={`${endpoints['invoices']}/${uuid}`}
                                            size={100}
                                            level={'H'}
                                            includeMargin
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : ''}
                            <TableRow>
                                <TableCell colSpan={1}>Invoice ID:</TableCell>
                                <TableCell colSpan={3}>{uuid}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={1}>Released date:</TableCell>
                                <TableCell colSpan={3}>
                                    {`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={1}>Employee:</TableCell>
                                <TableCell colSpan={3}>
                                    {
                                        `${authContext?.currentAuth?.lastName} ${authContext?.currentAuth?.firstName}`
                                    }
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={1}>Service:</TableCell>
                                <TableCell colSpan={3}>
                                    {prescriptionSelected?.serviceName}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={1}>Service fee:</TableCell>
                                <TableCell colSpan={3}>
                                    {`${prescriptionSelected?.serviceFee || 0} $`}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={4}>MEDICINE</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Price</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Total</TableCell>
                            </TableRow>
                            {prescriptionDetails && prescriptionDetails.map(p => {
                                const medicine = medicines.filter(m => m.id === p.medicine_id)[0];
                                return (
                                    <TableRow>
                                        <TableCell>{medicine?.name}</TableCell>
                                        <TableCell>{p.quantity}</TableCell>
                                        <TableCell>{p.unitPrice}</TableCell>
                                        <TableCell>{p.totalPrice}</TableCell>
                                    </TableRow>
                                )
                            })}
                            <TableRow>
                                <TableCell colSpan={1}>Total price of medicines:</TableCell>
                                <TableCell colSpan={3}>
                                    {prescriptionDetails && prescriptionDetails.map(p => p.totalPrice).reduce((a, b) => a + b, 0)} $
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={4}>
                                    TOTAL PRICE: {prescriptionDetails && prescriptionDetails.map(p => p.totalPrice).reduce((a, b) => a + b, 0) + prescriptionSelected?.serviceFee} $
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            <ButtonCustom style={{
                margin: '10px 0px 0px 0px', position: 'absolute',
                top: 120, right: 0
            }} title='Create'
                color="primary" onClick={handleSubmit} />
            <ReactToPrint
                trigger={() => <ButtonCustom style={{
                    margin: '10px 0px 0px 0px', position: 'absolute',
                    top: 160, right: 0
                }} title='Print PDF'
                    color="primary" />}
                content={() => pdfRef.current}
            />
        </Grid>
    )
}