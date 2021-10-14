import { createTheme, makeStyles } from "@material-ui/core";
import { blue } from "@material-ui/core/colors";
import { useEffect, useState } from "react";
import API, { endpoints } from "../../../API";
import DataTable from "../../../components/DataTable";

const theme = createTheme({
    palette: {
        primary: {
            main: blue['A400']
        }
    }
})

const useStyles = makeStyles({
    root: { 
        height: theme.spacing(50), 
        width: '100%', 
        marginTop: theme.spacing(6) + 2,
        [theme.breakpoints.down('xs')]: {
          marginTop: theme.spacing(6) + 2
        }, 
        background: 'white'
      },
})

export default function Invoices() {
    const classes = useStyles();
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState();
    const [prescriptions, setPrescriptions] = useState();
    const [accounts, setAccounts] = useState();

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 300
        },
        {
            field: 'prescription_id',
            hide: true
        },
        {
            field: 'employee_id',
            hide: true
        },
        {
            field: 'employee',
            headerName: 'Employee',
            headerAlign: 'center',
            width: 400,
            renderCell: (params) => {
                const employee_id = params.getValue(params.id, 'employee_id');
                const employee = employees?.filter(e => e.id === employee_id)[0];
                const account = accounts?.filter(a => a.id === employee.account_id)[0];
                console.log(accounts)

                return (
                    <>
                        <img style={{padding: 30, height: 100, width: '30%'}} src={account?.image} width="50%" />
                        <p>{employee?.lastName} {employee?.firstName}</p>
                    </>
                )
            }
        },
        {
            field: 'date',
            headerName: 'Released Date',
            width: 300,
            renderCell: (params) => {
                const date = new Date(params.getValue(params.id, 'date'))
                return (
                    <p>{`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}</p>
                )
            }
        }
    ]

    async function getInvoices(page='?p=1') {
        setLoading(true);

        const data = await API.get(`${endpoints['invoices']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res);
            setLoading(false);
            setInvoices(res.data.content);
            setCurrentPage(res.data.number);
            setTotalElements(res.data.totalElements);

            return {
                prescriptionIds: [...new Set(res.data.content.map(i => i.prescription_id))],
                employeeIds: [...new Set(res.data.content.map(i => i.employee_id))]
            }
        })
        .catch(err => console.log(err.response))

        let promise1 = [];
        let prescriptionArr = [];
        for (let i = 0; i < data?.prescriptionIds?.length; i++) {
            promise1.push(
                API.get(`${endpoints['prescriptions']}/${data.prescriptionIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => prescriptionArr.push(res.data))
                .catch(err => console.log(err.response))
            )
        }
        Promise.all(promise1).then(() => setPrescriptions(prescriptionArr));

        let promise2 = [];
        let employeeArr = [];
        for (let i = 0; i < data?.employeeIds?.length; i++) {
            promise2.push(
                API.get(`${endpoints['employees']}/${data.employeeIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => {
                    employeeArr.push(res.data);
                })
                .catch(err => console.log(err.response))
            )
        }
        Promise.all(promise2).then(() => {
            setEmployees(employeeArr);

            let promises = [];
            let accountArr = [];
            for (let i = 0; i < employeeArr?.length; i++) {
                promises.push(
                    API.get(`${endpoints['accounts']}/${employeeArr[i].account_id}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => accountArr.push(res.data))
                    .catch(err => console.log(err.response))
                )
            }
            Promise.all(promises).then(() => setAccounts(accountArr));
        });
    }

    function handlePageChange() {

    }

    useEffect(() => {
        getInvoices();
    }, [])

    return (
        <div className={classes.root}>
            {loading ? (
                <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
            ) : (
                <DataTable header="LIST INVOICE" rows={invoices} columns={columns} pageSize={5}
                    createURL="/invoices/create" server={true}
                    btnTitle="Create" rowCount={totalElements} handlePageChange={handlePageChange}
                    currentPage={currentPage} />
            )}
        </div>
    )
}