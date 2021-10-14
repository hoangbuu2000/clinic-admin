import { Card, CardActions, CardContent, CardHeader, Divider, IconButton, MenuItem, Select, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import API, { endpoints } from '../../API';

const colors = ['red', 'green', 'blue', 'yellow', 'black', 'brown', 'pink']
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function ChartPatient(props) {
    const labelsSevenDays = []
    const [filter, setFilter] = useState(7);
    const [totalPrescriptions, setTotalPrescriptions] = useState([]);
    const [data, setData] = useState({});

    useEffect(() => {
        let promises = [];
        let totalArr = [];
        const goal = filter ? filter - 1 : 6;
        for (let i = goal; i >= 0; i--) {
            let today = new Date();
            let date = new Date(today.getFullYear(), today.getMonth(), today.getUTCDate() - i + 1)
            labelsSevenDays.push(`${date.getUTCDate()}, ${monthNames[date.getMonth()]}`)
            API(`${endpoints['prescriptions']}/total/date`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: date
            }).then(res => {
                totalArr.push(res.data)
            })
                .catch(err => console.log(err.response))
        }
        Promise.all(promises).then(() => {
            setTotalPrescriptions(totalArr);

            setTimeout(() => {
                setData({
                    labels: labelsSevenDays,
                    datasets: [{
                        label: 'Latest prescription',
                        data: totalArr,
                        backgroundColor: '#2979ff'
                    }],
                })
            }, 200)
        });
    }, [filter])

    function handleSelectChange(e) {
        setFilter(e.target.value);
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardHeader
                title={<Typography variant="h6">Latest prescription</Typography>}
                action={
                    <Select disableUnderline value={filter} style={{ width: 150, marginTop: 10 }}
                        onChange={handleSelectChange}>
                        <MenuItem value="7">Last 7 days</MenuItem>
                        <MenuItem value="15">Last 15 days</MenuItem>
                    </Select>
                }
            />
            <Divider />
            <CardContent>
                <Bar style={{ marginTop: 30 }} data={data} />
            </CardContent>
            
            {props.footer ? (
                <>
                <Divider style={{ marginTop: 120 }} />
                <CardActions style={{ flexDirection: 'row-reverse' }}>
                    <Typography variant="caption" style={{ padding: 10, color: "#2979ff" }}>OVERVIEW</Typography>
                </CardActions>
                </>
            ) : ''}
        </Card>
    )
}