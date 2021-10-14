import DateFnsUtils from "@date-io/date-fns";
import { Button, Chip, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Paper, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextareaAutosize, TextField, ThemeProvider, Typography } from "@material-ui/core";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import React, { useContext, useState } from "react";
import DataTable from "./DataTable";
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import API, { endpoints } from "../API";
import ButtonCustom from "./Button";
import swal from "sweetalert";
import { useHistory } from "react-router";
import { AuthContext } from "../App";

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

export default function FormPrescription() {
    const [open, setOpen] = useState(false);
    const [patientShow, setPatientShow] = useState(false);
    const [medicineShow, setMedicineShow] = useState(false);
    const [patients, setPatients] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [currentPagePatient, setCurrentPagePatient] = useState(0);
    const [currentPageMedicine, setCurrentPageMedicine] = useState(0);
    const [totalElementsPatient, setTotalElementsPatient] = useState(0);
    const [totalElementsMedicine, setTotalElementsMedicine] = useState(0);
    const [patientSelected, setPatientSelected] = useState();
    const [bookings, setBookings] = useState();
    const [bookingSelected, setBookingSelected] = useState();
    const [service, setService] = useState();
    const [account, setAccount] = useState();
    const [medicineSelected, setMedicineSelected] = useState();
    const [selectionModel, setSelectionModel] = useState();
    const history = useHistory();
    const authContext = useContext(AuthContext);
    const [reRender, setReRender] = useState(false);
    const [description, setDescription] = useState('');

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

    const columnsMedicine = [
        {
            field: 'id',
            headerName: 'ID',
            width: 150
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 300
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 300
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 200
        },
        {
            field: 'unit',
            headerName: 'Unit',
            width: 150
        },
        {
            field: 'image',
            headerName: 'Image',
            width: 120,
            renderCell: (params) => {
                const img = params.getValue(params.id, 'image');
                let id = params.getValue(params.id, 'id');
                return (
                    <>
                        <img id={'image' + id} style={{
                            width: '70%',
                            height: '100%',
                            padding: '5px'
                        }} src={img} alt='No image' />

                    </>
                )
            }
        },
    ]

    const columnsBooking = [
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
                                name="dateOfBirth" value={params.getValue(params.id, 'date')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        },
        {
            field: 'service_id',
            headerName: 'Service',
            width: 200,
        }
    ]

    async function handleSelectionChange(newSelection) {
        if (patientShow) {
            const patientId = await API.get(`${endpoints['patients']}/${newSelection}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => {
                setPatientSelected(res.data);

                return res.data.id;
            })
                .catch(err => console.log(err.response))


            await API.get(`${endpoints['patients']}/${patientId}/bookings/date`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setBookings(res.data.content))
                .catch(err => console.log(err.response))

        } else if (medicineShow) {
            setSelectionModel(newSelection);
            let promises = [];
            let medicineArr = [];
            for (let i = 0; i < newSelection.length; i++) {
                promises.push(
                    API.get(`${endpoints['medicines']}/${newSelection[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => medicineArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promises).then(() => setMedicineSelected(medicineArr));
        }
    }

    function handleSelectionChangeBooking(newSelection) {
        API.get(`${endpoints['bookings']}/${newSelection}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setBookingSelected(res.data))
            .catch(err => console.log(err.response))
    }


    function getPatients(page = "?p=1") {
        API.get(`${endpoints['patients']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setPatients(res.data.content);
            setCurrentPagePatient(res.data.number);
            setTotalElementsPatient(res.data.totalElements);
        })
            .catch(err => console.log(err.response))
    }

    function getMedicines(page = "?p=1") {
        API.get(`${endpoints['medicines']}${page}&active=true`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setMedicines(res.data.content);
            setCurrentPageMedicine(res.data.number);
            setTotalElementsMedicine(res.data.totalElements);
        })
            .catch(err => console.log(err.response))
    }

    function getAccount() {
        API.get(`${endpoints['accounts']}/${patientSelected?.account_id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setAccount(res.data))
            .catch(err => console.log(err.response))
    }

    function handleOpenPatient(event) {
        getPatients(`?p=${currentPagePatient + 1}`);

        setOpen(true);
        setPatientShow(true);
        setMedicineShow(false);
    }

    function handleOpenMedicine(event) {
        getMedicines(`?p=${currentPageMedicine + 1}`);

        setOpen(true);
        setPatientShow(false);
        setMedicineShow(true);
    }

    function handleClose() {
        if (patientShow) {
            setPatientSelected();
            setAccount();
            setBookings();
            setBookingSelected();
            setService();
            setPatientShow(false);
        } else if (medicineShow) {
            setMedicineSelected();
            setMedicineShow(false);
        }
        setSelectionModel();
        setOpen(false);
    }

    function handleSave() {
        if (patientShow) {
            if (!patientSelected) {
                swal('Please choose a patient', '', 'warning');
                return;
            }
            if (!bookingSelected) {
                swal('Please choose a booking', '', 'warning');
                return;
            }

            API.get(`${endpoints['services']}/${bookingSelected.service_id}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setService(res.data))
                .catch(err => console.log(err));

            getAccount();
            setPatientShow(false);
        } else if (medicineShow) {
            if (!medicineSelected) {
                swal('Please choose a medicine', '', 'warning');
                return;
            }
            setMedicineShow(false);
        }
        setOpen(false);
    }

    function handlePageChange(newPage) {
        if (patientShow) {
            getPatients(`?p=${newPage + 1}`);
            setCurrentPagePatient(newPage);
        } else if (medicineShow) {
            getMedicines(`?p=${newPage + 1}`);
            setCurrentPageMedicine(newPage);
        }
    }

    async function handleSubmit() {
        if (!patientSelected) {
            swal('Please choose a patient', '', 'warning');
            return;
        }
        // if (!medicineSelected) {
        //     swal('Please choose medicines', '', 'warning');
        //     return;
        // }
        for (let i = 0; i < medicineSelected?.length; i++) {
            if (!medicineSelected[i].quantity) {
                swal('Please enter a value of quantity', '', 'warning');
                return;
            }
        }

        const service = await API.get(`${endpoints['services']}/${bookingSelected.service_id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            return {
                fee: res.data.price,
                name: res.data.name
            }
        })
            .catch(err => console.log(err.response));

        let promises = [];
        const prescription = await API(`${endpoints['doctors']}/${authContext.currentAuth.userId}
        /patients/${patientSelected.id}/prescriptions`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                date: new Date(),
                serviceFee: service.fee,
                serviceName: service.name,
                description: description || ''
            }
        }).then(res => {
            promises.push(res.data);
            swal('Success', '', 'success');
            return res.data;
        })
            .catch(err => console.log(err.response))

        Promise.all(promises).then(() => {
            for (let i = 0; i < medicineSelected?.length; i++) {
                let formData = new FormData();
                formData.append('quantity', medicineSelected[i].quantity);
                formData.append('unitPrice', medicineSelected[i].price);
                formData.append('totalPrice', parseInt(medicineSelected[i].quantity) * parseInt(medicineSelected[i].price));
                API(`${endpoints['prescriptions']}/${prescription.id}/medicines/${medicineSelected[i].id}/prescriptionDetails`, {
                    method: 'post',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    data: formData
                }).then(res => {
                    console.log(res.data);
                    swal('Success', '', 'success');
                })
                    .catch(err => console.log(err.response))
            }
        })
    }

    function handleChange(medicineId, event) {
        let medicine = medicineSelected.filter(m => m.id === medicineId)[0];
        Object.assign(medicine, { 'quantity': event.target.value });
        setReRender(!reRender);
    }

    function handleGoBack() {
        history.goBack();
    }

    function handleDelete(value) {
        setSelectionModel(medicineSelected.filter(item => item !== value).map(item => item.id));
        setMedicineSelected(medicineSelected.filter(item => item !== value));
    }

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={6}>
                    <form>
                        <Button id="patient" variant="outlined" onClick={handleOpenPatient}>
                            Choose patient
                        </Button>
                        <Button id="medicine" variant="outlined" onClick={handleOpenMedicine}>
                            Choose medicine
                        </Button>
                    </form>
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
                            {patientShow ? "Choose patient" : "Choose medicine"}
                            <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleSave} aria-label="save">
                                <SaveAltIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                                {patientShow && patients ? (
                                    <>
                                        <DataTable rows={patients} columns={columnsPatient}
                                            btnTitle="" createURL="" header="" server={true}
                                            rowCount={totalElementsPatient} currentPage={currentPagePatient}
                                            pageSize={7}
                                            handleSelectionChange={handleSelectionChange} />
                                        {bookings ? (
                                            <>
                                                <Typography variant="h6">Total bookings of this patient today</Typography>
                                                <DataTable rows={bookings} columns={columnsBooking}
                                                    btnTitle="" createURL="" header=""
                                                    handleSelectionChange={handleSelectionChangeBooking} />
                                            </>
                                        ) : ''}
                                    </>
                                ) : (medicineShow && medicines ? (
                                    <DataTable rows={medicines} columns={columnsMedicine}
                                        btnTitle="" createURL="" header=""
                                        server={true} rowCount={totalElementsMedicine} currentPage={currentPageMedicine}
                                        handleSelectionChange={handleSelectionChange}
                                        selectionModel={selectionModel} pageSize={5}
                                        checkboxSelection={true} handlePageChange={handlePageChange} />
                                ) : '')}
                            </DialogContentText>
                            {medicineSelected && medicineShow && medicineSelected.map(m => <Chip
                                style={{ marginRight: 10 }}
                                label={m.name}
                                onDelete={() => handleDelete(m)} />)}
                        </DialogContent>
                        <DialogActions>
                        </DialogActions>
                    </Dialog>
                    {patientSelected || medicineSelected ? (
                        <Grid container spacing={4} style={{ marginTop: 50, backgroundColor: '#e1f5fe' }}>
                            <Grid item xs={3}>
                                {patientSelected ? (
                                    <>
                                        <img src={account?.image} width="100%" height="150" />
                                        <p style={{ textAlign: 'center' }}>
                                            {patientSelected?.lastName + ' ' + patientSelected?.firstName}
                                        </p>
                                    </>
                                ) : ''}
                                <TextareaAutosize
                                    maxRows={10}
                                    aria-label="description of prescription"
                                    placeholder="Description...."
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={9}>
                                {medicineSelected ? (
                                    <TableContainer component={Paper} style={{ overflow: 'auto', height: 400 }}>
                                        <Table arial-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Description</TableCell>
                                                    <TableCell>Unit</TableCell>
                                                    <TableCell>Price</TableCell>
                                                    <TableCell>Quantity</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {medicineSelected && medicineSelected.map(m => (
                                                    <TableRow key={m.id}>
                                                        <TableCell>{m.name}</TableCell>
                                                        <TableCell>{m.description}</TableCell>
                                                        <TableCell>{m.unit}</TableCell>
                                                        <TableCell>{m.price}</TableCell>
                                                        <TableCell>
                                                            <TextField type="number"
                                                                onChange={(event) => handleChange(m.id, event)} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : ''}
                            </Grid>
                        </Grid>
                    ) : ''}
                </Grid>
                <Grid item xs={6}>
                    <TableContainer component={Paper}>
                        <Table arial-label="prescription">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={3}>
                                        {authContext.currentAuth?.lastName + ' ' + authContext.currentAuth?.firstName}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={3}>
                                        {authContext.currentAuth?.address}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={3}>
                                        {authContext.currentAuth?.phone}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell colSpan={2}>
                                        {`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Patient name</TableCell>
                                    <TableCell colSpan={2}>
                                        {patientSelected ? patientSelected.lastName + ' ' + patientSelected.firstName : ''}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell rowSpan={medicineSelected?.length + 1}>Medicine</TableCell>
                                </TableRow>
                                {medicineSelected && medicineSelected.map(m => {
                                    return (
                                        <TableRow>
                                            <TableCell>{m.name}</TableCell>
                                            <TableCell>{m.quantity} {m.unit}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                <TableRow>
                                    <TableCell>Service name</TableCell>
                                    <TableCell>{service?.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Service fee</TableCell>
                                    <TableCell>{service?.price || 0} $</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <ButtonCustom style={{
                        margin: '40px 0px 0px 225px',
                    }} title='Create Prescription'
                        color="primary" onClick={handleSubmit} />
                </Grid>
            </Grid>
            <ButtonCustom style={{
                margin: '10px 0px 0px 0px', position: 'absolute',
                top: 110, right: 0
            }} title='Go Back'
                color="primary" onClick={handleGoBack} />
        </>
    )
}