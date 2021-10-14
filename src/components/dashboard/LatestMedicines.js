import {
    Card, CardActions, CardContent, CardHeader, Divider, IconButton, Paper, Table, TableBody,
    TableCell,
    TableContainer, TableRow, Typography
} from "@material-ui/core";
import { useEffect, useState } from "react";
import API, { endpoints } from "../../API";
import MoreVertIcon from '@material-ui/icons/MoreVert';

export default function LatestMedicines() {
    const [medicines, setMedicines] = useState([]);

    function getLatestMedicines() {
        const sort = "?s=createdDate";
        API.get(`${endpoints['medicines']}${sort}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setMedicines(res.data.content))
            .catch(err => console.log(err.response))
    }

    useEffect(() => {
        getLatestMedicines();
    }, [])

    return (
        <Card>
            <CardHeader
                title={<Typography variant="h6">Latest Medicines</Typography>}
            />
            <Divider />
            <CardContent>
                <TableContainer>
                    <Table>
                        <TableBody>
                            {medicines && medicines.map(m => {
                                return (
                                    <TableRow>
                                        <TableCell width="150">
                                            <img style={{ width: '100%' }} src={m.image} />
                                        </TableCell>
                                        <TableCell width="300">
                                            <Typography>{m.name}</Typography>
                                            <Typography variant="caption">
                                                Updated on {`${new Date(m.updatedDate).getDate()}/${new Date(m.updatedDate).getMonth() + 1}/${new Date(m.updatedDate).getFullYear()}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
            <CardActions style={{ flexDirection: 'row-reverse' }}>
                <Typography variant="caption" style={{ padding: 10, color: "#2979ff" }}>VIEW ALL</Typography>
            </CardActions>
        </Card>
    )
}