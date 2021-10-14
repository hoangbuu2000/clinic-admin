import { useEffect, useState } from "react";
import API, { endpoints } from "../../API";
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import { Card, CardContent, Typography } from "@material-ui/core";

export default function TotalSales(props) {
    const date = props.date;
    const [totalSales, setTotalSales] = useState(0);

    useEffect(() => {
        API(`${endpoints['invoices']}/totalSales/date`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: date ? new Date(date) : new Date()
        }).then(res => setTotalSales(res.data))
        .catch(err => console.log(err.response))
    }, [])

    return (
        <Card style={{ display: 'flex' }}>
            <CardContent style={{ flex: '1 0 auto' }}>
                <Typography variant="h5">Sales today</Typography>
                <Typography variant="h4">{(Math.round(totalSales * 100) / 100).toFixed(2)} $</Typography>
            </CardContent>
            <div>
                <MonetizationOnIcon style={{ fontSize: 84, marginTop: 10, fill: '#2979ff' }} />
            </div>
        </Card>
    )
}