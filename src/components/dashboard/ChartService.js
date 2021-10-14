import { Button, Card, CardActions, CardContent, CardHeader, Divider, Typography } from "@material-ui/core";
import { getGridDateOperators } from "@material-ui/data-grid";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import API, { endpoints } from "../../API";

export default function ChartService(props) {
    const [data, setData] = useState({});
    const [totalService1, setTotalService1] = useState(0);
    const [totalService2, setTotalService2] = useState(0);
    const [totalService3, setTotalService3] = useState(0);

    async function getData() {
        const services = [];

        await API.get(`${endpoints['services']}/1/bookings`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setTotalService1(res.data);

            services.push(res.data);
        })
            .catch(err => console.log(err.response));

        await API.get(`${endpoints['services']}/2/bookings`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setTotalService2(res.data);

            services.push(res.data);
        })
            .catch(err => console.log(err.response));

        await API.get(`${endpoints['services']}/3/bookings`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setTotalService3(res.data);

            services.push(res.data);
        })
            .catch(err => console.log(err.response));

        setTimeout(() => {
            setData({
                labels: ['Medical examination', 'Covid test', 'Covid vaccination'],
                datasets: [{
                    data: [services[0], services[1], services[2]],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1,
                }],
            });
        }, 200)
    }

    useEffect(() => {
        getData();
    }, [])

    return (
        <Card>
            <CardHeader
                title={<Typography variant="h6">Service rate</Typography>}
            />
            <Divider />
            <CardContent>
                <Doughnut data={data} />
            </CardContent>
            <CardActions>
                <Button style={{background: 'rgba(255, 99, 132, 0.2)', marginLeft: 17}}>
                    Medical examination <br/>
                    {(totalService1 / parseFloat(totalService1 + totalService2 + totalService3) * 100).toFixed(2)} %
                </Button>
                <Button style={{background: 'rgba(54, 162, 235, 0.2)'}}>
                    Covid test <br/>
                    {(totalService2 / parseFloat(totalService1 + totalService2 + totalService3) * 100).toFixed(2)} %
                </Button>
                <Button style={{background: 'rgba(255, 206, 86, 0.2)'}}>
                    Covid vaccination <br/>
                    {(totalService3 / parseFloat(totalService1 + totalService2 + totalService3) * 100).toFixed(2)} %
                </Button>
            </CardActions>
        </Card>
    )
}