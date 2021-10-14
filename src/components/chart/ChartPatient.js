import { Button, Card, CardContent, CardHeader, Dialog, DialogContent, DialogContentText, DialogTitle, Divider, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { useEffect } from "react";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import DateFnsUtils from "@date-io/date-fns";
import API, { endpoints } from "../../API";

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function ChartPatient() {
    const [data, setData] = useState({});
    const [filter, setFilter] = useState({
        date: new Date(),
        month: 0,
        year: 0
    });
    const [dialog, setDialog] = useState({
        date: false,
        month: false,
        year: false
    })

    const handleSelectChange = (e) => {
        const value = e.target.value;
        if (value === 'date') {
            setDialog({ ...dialog, date: true })
        } else if (value === 'month') {
            setDialog({ ...dialog, month: true })
        } else if (value === 'year') {
            setDialog({ ...dialog, year: true })
        }
    }

    function getBookingsByDate(date = new Date()) {
        API(`${endpoints['bookings']}/date`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: date
        }).then(res => {
            console.log(res.data.content.length)
            setData({
                labels: [date],
                datasets: [{
                    label: 'Total patients by date',
                    data: [res.data.content.length],
                    backgroundColor: '#2979ff'
                }]
            })
        }).catch(err => console.log(err.response))
    }

    function getBookingsByMonth(month) {
        API.get(`${endpoints['bookings']}/month/${month}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res.data.content.length)
            setData({
                labels: [monthNames[month - 1]],
                datasets: [{
                    label: 'Total patients by month',
                    data: [res.data.content.length],
                    backgroundColor: '#2979ff'
                }]
            })
        })
            .catch(err => console.log(err.response))
    }

    function handleDateChange(date) {
        setFilter({ ...filter, date: date })
        getBookingsByDate(date);
    }

    function handleMonthChange(e) {
        setFilter({ ...filter, month: e.target.value })
        getBookingsByMonth(e.target.value);
    }

    function handleYearChange(e) {
        setFilter({ ...filter, year: e.target.value });
    }

    async function getBookingsByYear() {
        let promises = [];
        let totalArr = [];
        for(let i = 1; i <= 12; i++) {
            promises.push(
                API.get(`${endpoints['bookings']}/month/${i}?year=${filter.year}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => {
                    totalArr.push(res.data.content.length);
                }).catch(err => console.log(err.response))
            )
        }
        Promise.all(promises).then(() => {
            setData({
                labels: monthNames,
                datasets: [{
                    label: 'Total patients by year',
                    data: totalArr,
                    backgroundColor: '#2979ff'
                }]
            })
            setDialog({...dialog, year:false})
        })
    }

    useEffect(() => {
        if (filter.date) {
            getBookingsByDate(filter.date);
        }
    }, [])

    return (
        <>
            <Card>
                <CardHeader
                    title={<Typography variant="h6">Total patients</Typography>}
                    action={
                        <Select disableUnderline value={filter} style={{ width: 100, marginTop: 10 }}
                            onChange={handleSelectChange}>
                            <MenuItem value="date">Date</MenuItem>
                            <MenuItem value="month">Month</MenuItem>
                            <MenuItem value="year">Year</MenuItem>
                        </Select>
                    }
                />
                <Divider />
                <CardContent>
                    <Bar style={{ marginTop: 30 }} data={data} />
                </CardContent>
            </Card>
            <Dialog
                open={dialog.date}
                onClose={() => setDialog({ ...dialog, date: false })}
            >
                <DialogTitle>
                    <Typography>Enter a date</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker style={{ width: 200 }} color="primary"
                                label="Date *" format="dd-MM-yyyy"
                                onChange={(date) => handleDateChange(date)}
                                name="date" value={filter.date} />
                        </MuiPickersUtilsProvider>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog
                open={dialog.month}
                onClose={() => setDialog({ ...dialog, month: false })}
            >
                <DialogTitle>
                    <Typography>Enter a month</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Select value={filter.month} onChange={handleMonthChange}>
                            <MenuItem value="0">Choose a month</MenuItem>
                            <MenuItem value="1">January</MenuItem>
                            <MenuItem value="2">February</MenuItem>
                            <MenuItem value="3">March</MenuItem>
                            <MenuItem value="4">April</MenuItem>
                            <MenuItem value="5">May</MenuItem>
                            <MenuItem value="6">June</MenuItem>
                            <MenuItem value="7">July</MenuItem>
                            <MenuItem value="8">August</MenuItem>
                            <MenuItem value="9">September</MenuItem>
                            <MenuItem value="10">October</MenuItem>
                            <MenuItem value="11">November</MenuItem>
                            <MenuItem value="12">December</MenuItem>
                        </Select>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog
                open={dialog.year}
                onClose={() => setDialog({ ...dialog, year: false })}
            >
                <DialogTitle>
                    <Typography>Enter a year</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <TextField label="Enter a year" value={filter.year}
                            onChange={handleYearChange} />
                            <br/>
                        <Button onClick={getBookingsByYear} variant="outlined" 
                        color="primary" style={{marginTop: 20}}>Ok</Button>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    )
}