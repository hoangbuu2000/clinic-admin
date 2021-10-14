import { Card, CardActions, CardContent, CardHeader, Divider, Tab, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Typography } from "@material-ui/core"
import { useEffect, useState } from "react";
import API, { endpoints } from "../../API";

export default function LatestBookings() {
    const [bookings, setBookings] = useState([]);
    const [tokens, setTokens] = useState([]);

    async function getLatestBookings() {
        const sort = "?s=date";
        const bookingIds = await API.get(`${endpoints['bookings']}${sort}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setBookings(res.data.content);

            return res.data.content.map(b => b.id);
        })
        .catch(err => console.log(err))

        let promises = [];
        let tokenArr = [];
        for (let i = 0; i < bookingIds?.length; i++) {
            promises.push(
                API.get(`${endpoints['bookings']}/${bookingIds[i]}/tokens`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => tokenArr.push(res.data))
                .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises).then(() => setTokens(tokenArr));
    }

    useEffect(() => {
        getLatestBookings();
    }, [])

    return (
        <Card style={{height: '100%'}}>
            <CardHeader
                title={<Typography variant="h6">Latest Bookings</Typography>}
            />
            <Divider />
            <CardContent>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{textAlign: 'left'}}>Booking Id</TableCell>
                                <TableCell style={{textAlign: 'left'}}>Patient</TableCell>
                                <TableCell style={{textAlign: 'left'}}>Date</TableCell>
                                <TableCell style={{textAlign: 'left'}}>Status</TableCell>
                            </TableRow>    
                        </TableHead>
                        <TableBody>
                            {bookings && bookings.map(b => {
                                const token = tokens.filter(t => t.booking_id === b.id)[0];
                                return (
                                    <TableRow>
                                        <TableCell style={{textAlign: 'left'}}>{b.id}</TableCell>
                                        <TableCell style={{textAlign: 'left'}}>{b.fullName}</TableCell>
                                        <TableCell style={{textAlign: 'left'}}>
                                            {`${new Date(b.date).getDate()}/${new Date(b.date).getMonth() + 1}/${new Date(b.date).getFullYear()}`}
                                        </TableCell>
                                        <TableCell style={{textAlign: 'left'}}>
                                            {token?.confirmedAt ? 
                                            <Typography 
                                            style={{color: 'white', background: '#2979ff', 
                                            textAlign: 'center', borderRadius: 20, padding: 3}}>confirmed</Typography> : 
                                            <Typography 
                                            style={{color: 'white', background: '#3f51b5',
                                            textAlign: 'center', borderRadius: 20, padding: 3}}>pending</Typography>}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
            <CardActions style={{ flexDirection: 'row-reverse', marginTop: 25 }}>
                <Typography variant="caption" style={{ padding: 10, color: "#2979ff" }}>VIEW ALL</Typography>
            </CardActions>
        </Card>
    )
}