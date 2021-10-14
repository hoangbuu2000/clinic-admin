import { Card, CardContent, Grid, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import API, { endpoints } from "../../API";
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';

export default function TotalBookings(props) {
    const date = props.date;
    const [totalBookings, setTotalBookings] = useState(0);

    useEffect(() => {
        API(`${endpoints['bookings']}/total/date`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: date ? new Date(date) : new Date()
        }).then(res => setTotalBookings(res.data))
            .catch(err => console.log(err.response));
    }, [])

    return (
        <Card style={{ display: 'flex' }}>
            <CardContent style={{ flex: '1 0 auto' }}>
                <Typography variant="h5">Total bookings today</Typography>
                <Typography variant="h4">{('0' + totalBookings).slice(-2)}</Typography>
            </CardContent>
            <div>
                <LibraryBooksIcon style={{ fontSize: 84, marginTop: 10, fill: '#2979ff' }} />
            </div>
        </Card>
    )
}