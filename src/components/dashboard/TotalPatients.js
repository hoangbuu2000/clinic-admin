import { Card, CardContent, Grid, Typography } from "@material-ui/core";
import { AccessibleForward } from "@material-ui/icons";
import { useEffect } from "react";
import { useState } from "react"
import API, { endpoints } from "../../API";

export default function TotalPatients(props) {
    const [totalPatients, setTotalPatients] = useState(0);

    useEffect(() => {
        API.get(`${endpoints['patients']}/total`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setTotalPatients(res.data))
            .catch(err => console.log(err.response))
    }, [])

    return (
        <Card style={{ display: 'flex' }}>
            <CardContent style={{ flex: '1 0 auto' }}>
                <Typography variant="h5">Total of patients</Typography>
                <Typography variant="h4">{('0' + totalPatients).slice(-2)}</Typography>
            </CardContent>
            <div>
                <AccessibleForward style={{ fontSize: 84, marginTop: 10, fill: '#2979ff' }} />
            </div>
        </Card>
    )
}