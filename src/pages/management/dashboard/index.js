import { Grid } from "@material-ui/core";
import ChartPrescription from "../../../components/dashboard/ChartPrescription";
import ChartService from "../../../components/dashboard/ChartService";
import LatestBookings from "../../../components/dashboard/LatestBookings";
import LatestMedicines from "../../../components/dashboard/LatestMedicines";
import TotalBookings from "../../../components/dashboard/TotalBookings";
import TotalPatients from "../../../components/dashboard/TotalPatients";
import TotalSales from "../../../components/dashboard/TotalSales";

export default function Dashboard() {
    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={4}>
                    <TotalPatients />
                </Grid>
                <Grid item xs={4}>
                    <TotalBookings date={new Date()} />
                </Grid>
                <Grid item xs={4}>
                    <TotalSales date={new Date()} />
                </Grid>
                <Grid item xs={7}>
                    <ChartPrescription footer={true} />
                </Grid>
                <Grid item xs={5}>
                    <ChartService />
                </Grid>
                <Grid item xs={5}>
                    <LatestMedicines />
                </Grid>
                <Grid item xs={7}>
                    <LatestBookings />
                </Grid>
            </Grid>
        </>
    )
}