import {
    Avatar, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Grid, Paper, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tabs, Typography, IconButton
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import API, { endpoints } from "../API";
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import FavoriteIcon from '@material-ui/icons/Favorite';
import HealingIcon from '@material-ui/icons/Healing';
import { Pagination } from "@material-ui/lab";
import PersonIcon from '@material-ui/icons/Person';
import TodayIcon from '@material-ui/icons/Today';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import QRCode from "qrcode.react";
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CloseIcon from '@material-ui/icons/Close';

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function UserDetails(props) {
    const { userId } = useParams();
    const [user, setUser] = useState();
    const [account, setAccount] = useState();
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionDetails, setPrescriptionDetails] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isCovidTestShow, setCovidTestShow] = useState(false);
    const [isHealthRecordsShow, setHealthRecordsShow] = useState(false);
    const [prescriptionsWithVaccine, setPrescriptionsWithVaccine] = useState([]);
    const [isVaccineShow, setVaccineShow] = useState(false);
    const [prescriptionsWithCovidTest, setPrescriptionsWithCovidTest] = useState([]);
    const [prescriptionWithCovidTest, setPrescriptionWithCovidTest] = useState();
    const [isPrescriptionDetailsShow, setPrescriptionDetailsShow] = useState(false);
    const [isCovidTestDetailsShow, setCovidTestDetailsShow] = useState(false);
    const [doctorOfPrescription, setDoctorOfPrescription] = useState();
    const [medicines, setMedicines] = useState([]);
    const [valueTab, setValueTab] = useState(0);
    const role = props.role;

    async function getUser(page = "?p=1") {
        const accountId = await API.get(`${endpoints[role]}/${userId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res);
            setUser(res.data);

            return res.data.account_id;
        })
            .catch(err => console.log(err))

        const data = await API.get(`${endpoints['accounts']}/${accountId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res);
            setAccount(res.data);

            return res.data;
        })

        const prescriptionIds = await API.get(`${endpoints[role]}/${userId}/prescriptions${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res);
            setPrescriptions(res.data.content);

            return res.data.content.map(p => p.id);
        }).catch(err => console.log(err));

        let promises = [];
        let detailsArr = [];
        for (let i = 0; i < prescriptionIds?.length; i++) {
            promises.push(
                API.get(`${endpoints['prescriptions']}/${prescriptionIds[i]}/prescriptionDetails`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => detailsArr.push(res.data.content))
                    .catch(err => console.log(err))
            )
        }
        Promise.all(promises).then(() => {
            console.log(detailsArr)
            setPrescriptionDetails(detailsArr)
        });
    }

    function handleTabChange(event, newValue) {
        setValueTab(newValue);
    }

    function vaccineConfirmation() {
        const serviceName = "Covid vaccination";
        API.get(`${endpoints['patients']}/${user.id}/services/${serviceName}/prescriptions`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setPrescriptionsWithVaccine(res.data.content))
            .catch(err => console.log(err))

        setVaccineShow(true);
    }

    function covidTests() {
        const serviceName = "Covid test";
        API.get(`${endpoints['patients']}/${user.id}/services/${serviceName}/prescriptions`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setPrescriptionsWithCovidTest(res.data.content))
            .catch(err => console.log(err))

        setCovidTestShow(true);
    }

    function getHealthRecords(page = "?p=1") {
        API.get(`${endpoints['patients']}/${user.id}/prescriptions${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setPrescriptions(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
            setCurrentPage(res.data.number);
            setHealthRecordsShow(true);
        })
            .catch(err => console.log(err))
    }

    async function getPrescriptionDetails(pres) {
        const doctor = await API.get(`${endpoints['doctors']}/${pres.doctor_id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setDoctorOfPrescription(res.data))
            .catch(err => console.log(err.response))

        const medicineIds = await API.get(`${endpoints['prescriptions']}/${pres.id}/prescriptionDetails`, {
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
    }

    function handlePageChange(event, newPage) {
        getHealthRecords(`?p=${newPage}`);
        setCurrentPage(newPage - 1);
    }

    useEffect(() => {
        getUser();
    }, [])

    return (
        <Grid container spacing={4}>
            <Grid container spacing={4} item xs={4}>
                <Grid item xs={12}>
                    <Avatar style={{ width: 150, height: 150, margin: '0 auto' }} src={account?.image} />
                    <Typography style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}>
                        {user?.lastName + ' ' + user?.firstName}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Tabs
                        style={{ marginLeft: 55 }}
                        orientation="vertical"
                        indicatorColor="primary"
                        textColor="primary"
                        value={valueTab}
                        onChange={handleTabChange}>
                        <Tab label="Profile" />
                        <Tab label="Health records" />
                    </Tabs>
                </Grid>
            </Grid>
            <Grid item xs={8}>
                {valueTab === 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Full name</TableCell>
                                    <TableCell>{user?.lastName + ' ' + user?.firstName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Gender</TableCell>
                                    <TableCell>
                                        {user?.gender}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Birthday</TableCell>
                                    <TableCell>
                                        {`${new Date(user?.dateOfBirth).getDate()}/${new Date(user?.dateOfBirth).getMonth() + 1}/${new Date(user?.dateOfBirth).getFullYear()}`}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>
                                        {user?.phone}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Email</TableCell>
                                    <TableCell>{user?.email}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Address</TableCell>

                                    <TableCell>{user?.address}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Grid container spacing={8}>
                        <Grid item xs={12} container>
                            <Grid style={{ textAlign: 'center' }} item xs={4}>
                                <FavoriteIcon color="primary"
                                    style={{ fontSize: 108, textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => getHealthRecords()} />
                                <Typography color="textPrimary">Health records</Typography>
                            </Grid>
                            <Grid style={{ textAlign: 'center' }} item xs={4}>
                                <HealingIcon
                                    style={{ fontSize: 108, textAlign: 'center', cursor: 'pointer' }}
                                    color="primary" onClick={vaccineConfirmation} />
                                <Typography color="textPrimary">Vaccination confirmation</Typography>
                            </Grid>
                            <Grid style={{ textAlign: 'center' }} item xs={4}>
                                <LocalHospitalIcon color="primary"
                                    style={{ fontSize: 108, textAlign: 'center', cursor: 'pointer' }}
                                    onClick={covidTests} />
                                <Typography color="textPrimary">Covid tests</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </Grid>

            <Dialog
                open={isHealthRecordsShow}
                onClose={() => setHealthRecordsShow(false)}
            >
                <DialogTitle>
                    <Typography style={{ textAlign: 'center' }}
                        color="textPrimary" variant="h5">Health records</Typography>
                    <FavoriteIcon
                        style={{
                            textAlign: 'center', display: 'block',
                            width: '100%', fontSize: 82, marginTop: 20, marginBottom: 10, fill: '#f06292'
                        }} />
                    <hr style={{ border: '3px solid black' }} />
                    <Typography style={{ textAlign: 'center', textTransform: "uppercase" }} variant="h5">
                        List of prescriptions
                    </Typography>
                    <hr style={{ border: '3px solid black' }} />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Grid container spacing={4}>
                            {prescriptions && prescriptions.map(p => {
                                return (
                                    <Grid
                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                        item xs={4}
                                        onClick={() => {
                                            getPrescriptionDetails(p);
                                            setTimeout(() => {
                                                setPrescriptionDetailsShow(true);
                                            }, 300)
                                        }}>
                                        <div
                                            style={{
                                                background: '#f06292',
                                                minWidth: 150, textAlign: 'center', color: 'white',
                                                textTransform: 'uppercase', paddingTop: 15, paddingBottom: 5,
                                            }}>
                                            {monthNames[new Date(p.date).getMonth()]}
                                        </div>
                                        <div
                                            style={{
                                                background: '#e8eaf6', minWidth: 150, textAlign: 'center',
                                                fontSize: 56, fontWeight: 'bold'
                                            }}>
                                            {('0' + new Date(p.date).getDate()).slice(-2)}
                                        </div>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ marginTop: 40 }}>
                    <Pagination page={currentPage + 1} count={totalPages} shape="rounded" variant="outlined"
                        showFirstButton showLastButton
                        onChange={handlePageChange} />
                </DialogActions>
            </Dialog>

            <Dialog
                open={isVaccineShow}
                onClose={() => setVaccineShow(false)}
                PaperProps={{
                    style: {
                        background: prescriptionsWithVaccine?.length === 2 ?
                            '##66bb6a' : (prescriptionsWithVaccine?.length === 1 ? '#fdd835'
                                : '#e53935')
                    }
                }}
            >
                <DialogTitle>
                    <Typography style={{ textAlign: 'center' }}
                        color="textPrimary" variant="h5">Covid vaccination confirmation</Typography>
                    <VerifiedUserIcon
                        style={{
                            textAlign: 'center', display: 'block',
                            width: '100%', fontSize: 82, marginTop: 20, marginBottom: 10, fill: 'white'
                        }} />
                    <hr style={{ border: '3px solid black' }} />
                    <Typography style={{ textAlign: 'center', textTransform: "uppercase" }} variant="h5">
                        {prescriptionsWithVaccine?.length === 2 ? '2 shots of covid vaccine'
                            : (prescriptionsWithVaccine?.length === 1 ? '1 shot of covid vaccine' : '0 shot of covid vaccine')}
                    </Typography>
                    <hr style={{ border: '3px solid black' }} />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Grid container spacing={4}>
                            <Grid style={{ textAlign: 'center' }} item xs={12}>
                                <QRCode
                                    id="qrcode"
                                    value={`http://localhost`}
                                    size={100}
                                    level={'H'}
                                    includeMargin
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography
                                    variant="caption"
                                    style={{ fontSize: 16, fontWeight: 'bold' }}>Personal information</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><PersonIcon /></TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">Full name</Typography>
                                                    <Typography>{user?.lastName + ' ' + user?.firstName}</Typography>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><TodayIcon /></TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">Date of Birth</Typography>
                                                    <Typography>
                                                        {`${new Date(user?.dateOfBirth).getDate()}/${new Date(user?.dateOfBirth).getMonth() + 1}/${new Date(user?.dateOfBirth).getFullYear()}`}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><FingerprintIcon /></TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">Phone</Typography>
                                                    <Typography>{user?.phone}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isCovidTestShow}
                onClose={() => setCovidTestShow(false)}
            >
                <DialogTitle>
                    <Typography style={{ textAlign: 'center' }}
                        color="textPrimary" variant="h5">Covid tests</Typography>
                    <VerifiedUserIcon
                        style={{
                            textAlign: 'center', display: 'block',
                            width: '100%', fontSize: 82, marginTop: 20, marginBottom: 10, fill: '#f06292'
                        }} />
                    <hr style={{ border: '3px solid black' }} />
                    <Typography style={{ textAlign: 'center', textTransform: "uppercase" }} variant="h5">
                        list of test samples
                    </Typography>
                    <hr style={{ border: '3px solid black' }} />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Grid container spacing={4}>
                            {prescriptionsWithCovidTest && prescriptionsWithCovidTest.map(p => {
                                return (
                                    <Grid
                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                        item xs={4}
                                        onClick={() => {
                                            setPrescriptionWithCovidTest(p);
                                            setTimeout(() => {
                                                setCovidTestDetailsShow(true);
                                            }, 300)
                                        }}>
                                        <div
                                            style={{
                                                background: '#f06292',
                                                minWidth: 150, textAlign: 'center', color: 'white',
                                                textTransform: 'uppercase', paddingTop: 15, paddingBottom: 5,
                                            }}>
                                            {monthNames[new Date(p.date).getMonth()]}
                                        </div>
                                        <div
                                            style={{
                                                background: '#e8eaf6', minWidth: 150, textAlign: 'center',
                                                fontSize: 56, fontWeight: 'bold'
                                            }}>
                                            {('0' + new Date(p.date).getDate()).slice(-2)}
                                        </div>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog
                fullScreen
                open={isPrescriptionDetailsShow}
            >
                <DialogTitle>
                    <IconButton edge="start" color="inherit"
                        onClick={() => setPrescriptionDetailsShow(false)} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <div style={{ textAlign: 'right', marginTop: -40 }}>
                        <LocalHospitalIcon style={{ fontSize: 64, color: '#1976d2' }} />
                        <Typography variant="h6" noWrap>
                            DHB HOSPITAL
                        </Typography>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {prescriptionDetails ? (
                            <>
                                <Typography style={{ margin: '40px 0 20px 0' }}>Prescription</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ fontWeight: 'bold' }}>Patient name</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Service name</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Service fee</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Date</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Doctor</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {prescriptionDetails?.map(pd => {
                                                const prescription = prescriptions.filter(p => p.id === pd.prescription_id)[0];
                                                return (
                                                    <TableRow>
                                                        <TableCell>{user?.lastName + ' ' + user?.firstName}</TableCell>
                                                        <TableCell>{prescription?.serviceName}</TableCell>
                                                        <TableCell>{prescription?.serviceFee} $</TableCell>
                                                        <TableCell>
                                                            {`${new Date(prescription?.date).getDate()}/${new Date(prescription?.date).getMonth() + 1}/${new Date(prescription?.date).getFullYear()}`}
                                                        </TableCell>
                                                        <TableCell>{doctorOfPrescription?.lastName + ' ' + doctorOfPrescription?.firstName}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Typography style={{ margin: '40px 0 20px 0' }}>Prescription Details</Typography>
                                <TableContainer component={Paper}>
                                    <Table arial-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ fontWeight: 'bold' }}>No.</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Medicine</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Description</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Price</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Unit</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {prescriptionDetails.map((p, index) => {
                                                const medicine = medicines.filter(m => m.id === p.medicine_id)[0];
                                                return (
                                                    <TableRow key={p.id}>
                                                        <TableCell>{index + 1}</TableCell>
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
                                                <TableCell colSpan={6}>Total price of medicine</TableCell>
                                                <TableCell>
                                                    {prescriptionDetails.map(p => p.totalPrice).reduce((a, b) => a + b, 0)} $
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        ) : ''}
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog
                fullScreen
                open={isCovidTestDetailsShow}
            >
                <DialogTitle>
                    <IconButton edge="start" color="inherit"
                        onClick={() => setCovidTestDetailsShow(false)} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <div style={{ textAlign: 'right', marginTop: -40 }}>
                        <LocalHospitalIcon style={{ fontSize: 64, color: '#1976d2' }} />
                        <Typography variant="h6" noWrap>
                            DHB HOSPITAL
                        </Typography>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }}>Service name</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Service fee</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prescriptionWithCovidTest ? (
                                        <TableRow>
                                            <TableCell>{prescriptionWithCovidTest.serviceName}</TableCell>
                                            <TableCell>{prescriptionWithCovidTest.serviceFee} $</TableCell>
                                            <TableCell>
                                                {`${new Date(prescriptionWithCovidTest.date).getDate()}/${new Date(prescriptionWithCovidTest.date).getMonth() + 1}/${new Date(prescriptionWithCovidTest.date).getFullYear()}`}
                                            </TableCell>
                                            <TableCell>{prescriptionWithCovidTest.description}</TableCell>
                                        </TableRow>
                                    ) : ''
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </Grid>
    )
}