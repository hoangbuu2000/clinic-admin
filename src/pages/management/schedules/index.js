import DateFnsUtils from "@date-io/date-fns";
import {
    CardContent, createTheme, Grid, Card, makeStyles,
    ThemeProvider, Typography, CardMedia, DialogContentText, Button, Divider, Select, MenuItem
} from "@material-ui/core";
import { blue, lightBlue } from "@material-ui/core/colors";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { useContext, useEffect, useState } from "react";
import API, { endpoints } from "../../../API";
import DataTable from "../../../components/DataTable";
import ButtonCustom from "../../../components/Button";
import React from 'react';
import { Slide, Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import { Link } from "react-router-dom";
import { SideBarContext } from '../Drawer';
import { indexToSubStrCurrentEndpoint } from "../../../currentEndpoint";
import EditIcon from '@material-ui/icons/Edit';
import { AuthContext } from "../../../App";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
    },
    cover: {
        width: '100%',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    playIcon: {
        height: 38,
        width: 38,
    },
}))

const theme = createTheme({
    palette: {
        primary: {
            main: '#e1f5fe'
        }
    }
})

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Schedules() {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPageDoctor, setCurrentPageDoctor] = useState(0);
    const [totalPagesDoctor, setTotalPagesDoctor] = useState(0);
    const [doctors, setDoctors] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [shifts, setShifts] = useState();
    const [open, setOpen] = useState(false);
    const [imageDetail, setImageDetail] = useState();
    const [doctorId, setDoctorId] = useState();
    const context = useContext(AuthContext);

    const columns = [
        {
            field: 'id',
            headerName: 'STT',
            width: 200
        },
        {
            field: 'doctor_id',
            headerName: 'Doctor ID',
            width: 400
        },
        {
            field: 'shift_id',
            headerName: 'Shift ID',
            width: 300
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 300,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker readOnly style={{ width: 200 }} color="primary"
                                format="dd-MM-yyyy"
                                name="dateOfBirth" value={params.getValue(params.id, 'joinDate')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        }
    ]

    const getDoctors = async (page = "?p=1") => {
        setLoading(true);
        const number = "n=6";

        const accountIds = await API.get(`${endpoints['doctors']}${page}&${number}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setDoctors(res.data.content);
            setCurrentPageDoctor(res.data.number);
            setTotalPagesDoctor(res.data.totalPages);
            return res.data.content.map(d => d.account_id);
        }).catch(err => console.log(err.response));

        let promises = [];
        let accountArr = [];
        for (let i = 0; i < accountIds.length; i++) {
            promises.push(
                API.get(`${endpoints['accounts']}/${accountIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => accountArr.push(res.data))
                    .catch(err => err.response)
            )
        }
        Promise.all(promises).then(() => {
            setAccounts(accountArr);
            setLoading(false);
        });
    }

    function handlePageChange(event, newPage, doctorId, image) {
        handleViewDetails(`?p=${newPage}`, doctorId, image);
        setCurrentPage(newPage - 1);
    }

    function handlePageChangeDoctor(event, newPage) {
        getDoctors(`?p=${newPage}`);
        setCurrentPageDoctor(newPage - 1);
    }

    const handleViewDetails = async (page = "?p=1", doctorId, image) => {
        setImageDetail(image);
        setDoctorId(doctorId);
        setOpen(true);
        const shiftIds = await API.get(`${endpoints['doctors']}/${doctorId}/schedules${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setSchedules(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);
            return [...new Set(res.data.content.map(s => s.shift_id))];
        })
            .catch(err => console.log(err.response))

        let promises = [];
        let shiftArr = [];
        for (let i = 0; i < shiftIds?.length; i++) {
            promises.push(
                API.get(`${endpoints['shifts']}/${shiftIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => shiftArr.push(res.data))
                    .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises).then(() => setShifts(shiftArr))
    }

    function handleClose() {
        setOpen(false);
    }

    useEffect(() => {
        getDoctors();
        context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
    }, [])

    return (
        <Grid container spacing={4}>
            {loading ? (
                <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
            ) : (
                <>
                    <Typography variant="h5"
                        style={{
                            background: '#e1f5fe',
                            width: '20%', textAlign: 'center',
                            margin: '40px auto auto 15px',
                        }}>LIST SCHEDULE</Typography>
                    <Grid style={{ marginTop: 20 }} container item xs={12} spacing={4}>
                        <Grid item xs={4}>
                            <Select variant="outlined" value="0">
                                <MenuItem value="0">Choose a date</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={4}>
                            <Select variant="outlined" value="0">
                                <MenuItem value="0">Choose a doctor</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={4}>
                            <Select variant="outlined" value="0">
                                <MenuItem value="0">Choose a shift</MenuItem>
                            </Select>
                        </Grid>
                        {doctors && doctors.map(d => {
                            const account = accounts.filter(a => a.id === d.account_id);
                            return (
                                <Grid item xs={4}>
                                    <Card className={classes.root}>
                                        <div className={classes.details}>
                                            <CardContent className={classes.content}>
                                                <Typography component="h5" variant="h5">
                                                    {d.firstName + ' ' + d.lastName}
                                                </Typography>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    {d.phone}
                                                </Typography>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    {d.email}
                                                </Typography>
                                            </CardContent>
                                            <div className={classes.controls}>
                                                <ButtonCustom style={{ margin: '10px 0px 0px 0px' }}
                                                    title="View Details"
                                                    color="primary" onClick={() => handleViewDetails("?p=1", d.id,
                                                        account[0].image)} />
                                            </div>
                                        </div>
                                        <CardMedia
                                            className={classes.cover}
                                            image={account[0].image}
                                            title="Avatar"
                                        />
                                    </Card>
                                </Grid>
                            )
                        })}
                        <Dialog
                            open={open}
                            TransitionComponent={Transition}
                            keepMounted
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-slide-title"
                            aria-describedby="alert-dialog-slide-description"
                        >
                            <DialogTitle id="alert-dialog-slide-title">{"Schedule Details"}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-slide-description">
                                    <Grid container spacing={4}>
                                        <Grid item xs={6} style={{ marginTop: 100 }}>
                                            <Link to={`/accounts/${accounts.filter(a => a.image === imageDetail)[0]?.id}`}>
                                                <img width="100%" src={imageDetail} />
                                            </Link>
                                        </Grid>
                                        <Grid item xs={6}>
                                            {schedules && shifts && schedules.map(s => {
                                                const shift = shifts.filter(sh => sh.id === s.shift_id);
                                                const date = new Date(s.date);
                                                return (
                                                    <>
                                                        <Grid item xs={12}>
                                                            <EditIcon style={{
                                                                color: '#afc2cb', position: 'absolute',
                                                                right: 35
                                                            }} />
                                                            <p>Shift name: {shift[0]?.name}</p>
                                                            <p>Shift description: {shift[0]?.description}</p>
                                                            <p>Date: {`${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`}</p>
                                                        </Grid>
                                                        <Divider />
                                                    </>
                                                )
                                            })}
                                        </Grid>
                                    </Grid>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <ThemeProvider theme={theme}>
                                    <Pagination color="primary" className={classes.pagination}
                                        page={currentPage + 1} count={totalPages}
                                        showFirstButton showLastButton
                                        onChange={(event, value) => handlePageChange(event, value, doctorId, imageDetail)} />
                                </ThemeProvider>
                            </DialogActions>
                        </Dialog>
                    </Grid>
                    <ThemeProvider theme={theme}>
                        <Pagination color="primary" className={classes.pagination} style={{ position: 'absolute', top: 660, left: '45%' }}
                            page={currentPageDoctor + 1} count={totalPagesDoctor}
                            showFirstButton showLastButton
                            onChange={(event, value) => handlePageChangeDoctor(event, value)} />
                    </ThemeProvider>
                    <Link to="/schedules/create" style={{
                        textDecoration: 'none', position: 'fixed',
                        top: 100, right: -1
                    }}>
                        <Button variant="contained"
                            style={{ marginLeft: 15, marginTop: 15, background: '#e1f5fe', color: 'black' }}>
                            Create</Button>
                    </Link>
                </>
            )}
        </Grid>
    )
}