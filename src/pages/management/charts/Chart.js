import { Grid } from "@material-ui/core";
import ChartMedicine from "../../../components/chart/ChartMedicine";
import ChartPatient from "../../../components/chart/ChartPatient";
import ChartSale from "../../../components/chart/ChartSale";
import ChartPrescription from "../../../components/dashboard/ChartPrescription";


export default function Chart() {
    return (
        <Grid container spacing={4}>
            <Grid item xs={6}>
                <ChartPatient />
            </Grid>
            <Grid item xs={6}>
                <ChartPrescription footer={false} />
            </Grid>
            <Grid item xs={6}>
                <ChartSale />
            </Grid>
            <Grid item xs={6}>
                <ChartMedicine />
            </Grid>
        </Grid>
    )
}