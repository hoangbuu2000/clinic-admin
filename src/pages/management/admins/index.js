import DateFnsUtils from "@date-io/date-fns";
import { Button, createTheme, makeStyles, ThemeProvider } from "@material-ui/core"
import { blue } from "@material-ui/core/colors";
import { TramRounded } from "@material-ui/icons";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import swal from "sweetalert";
import API, { endpoints } from "../../../API";
import { AuthContext } from "../../../App";
import ButtonCustom from "../../../components/Button";
import DataTable from "../../../components/DataTable";
import { indexToSubStrCurrentEndpoint } from "../../../currentEndpoint";
import { url } from "../../../URL";
import { SideBarContext } from "../Drawer";

const useStyles = makeStyles({
    root: { 
        height: 400, 
        width: '100%', 
        marginTop: 50, 
        background: 'white'
    }
})

const theme = createTheme({
    palette: {
        primary: {
            main: '#afc2cb'
        }
    }
})
export default function Admins(props) {
    const classes = useStyles();
    const [admins, setAdmins] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [totalElements, setTotalElements] = useState();
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const context = useContext(AuthContext);
    const history = useHistory();

    const columns = [
        {
            field: 'id',
            hide: true
        },
        {
            field: 'account_id',
            hide: true
        },
        {
            field: 'image',
            headerName: 'Avatar',
            width: 120,
            renderCell: (params) => {
                const account_id = params.getValue(params.id,  'account_id');
                const account = accounts.filter(a => a.id === account_id);
                let url = `/accounts/${account_id}`;
                return (
                    <Link style={{textDecoration: 'none', color: 'black', width: '100%'}} to={url}>
                        <img style={{
                            width: '70%',
                            height: '55px',
                            padding: '5px',
                            marginTop: 20
                        }} src={account[0] ? account[0].image : ''}/>
                    </Link>
                )
            }
        },
        {   
            field: 'firstName',
            headerName: 'First Name',
            width: 200,
        }, 
        {
            field: 'lastName',
            headerName: 'Last Name',
            width: 200,
        },
        {
            field: 'gender',
            headerName: 'Gender',
            width: 150,
        },
        {
            field: 'dateOfBirth',
            headerName: 'DOB',
            width: 200,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker readOnly style={{ width: 200 }} color="primary"
                                InputProps={{readOnly: true}}
                                format="dd-MM-yyyy"
                                onChange={(date) => alert(date)}
                                name="dateOfBirth" value={params.getValue(params.id, 'dateOfBirth')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        },
        {
            field: 'phone',
            headerName: 'Phone',
            width: 200,
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200,
        },
        {
            field: 'joinDate',
            headerName: 'Join Date',
            width: 200,
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker readOnly style={{ width: 200 }} color="primary"
                                InputProps={{readOnly: true}}
                                format="dd-MM-yyyy"
                                onChange={(date) => alert(date)}
                                name="dateOfBirth" value={params.getValue(params.id, 'joinDate')} />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                )
            }
        },
        {
            field: 'idCardNumber',
            headerName: 'Card Number',
            width: 200,
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 200,
        },
        {
            field: 'hometown',
            headerName: 'Hometown',
            width: 200,
        },
        {
            field: 'action',
            headerName: ' ',
            width: 150,
            align: 'center',
            renderCell: (params) => (<ButtonCustom onClick={() => {
                const id = params.getValue(params.id, "id");
                const account_id = params.getValue(params.id, "account_id");
                const account = accounts.filter(a => a.id === account_id);
                swal({
                    title: "Are you sure to delete?",
                    icon: "warning",
                    buttons: {
                        cancel: 'Cancel',
                        inactive: {
                            text: 'Inactivate',
                            value: 'inactive'
                        },
                        delete: {
                            text: 'Delete anyway',
                            value: 'delete'
                        }
                    }
                }).then((value) => {
                    switch (value) {
                        case "inactive":
                            let formData = new FormData();
                            formData.append('username', account[0].username);
                            formData.append('password', account[0].password);
                            formData.append('image', account[0].image);
                            formData.append('active', false);
                            return API(`${endpoints['roles']}/${account[0].role_id}/accounts/${account_id}`, {
                                method: 'put',
                                headers: {
                                    "Authorization": "Bearer " + localStorage.getItem('token'),
                                    "Content-type": "multipart/form-data"
                                },
                                data: formData
                            })
                        case "delete":
                            return API(`${endpoints['accounts']}/${account_id}/admins/${id}`, {
                                method: 'delete',
                                headers: {
                                    "Authorization": "Bearer " + localStorage.getItem('token')
                                }
                            })
                    }
                }).then(response => {
                    if (response?.status === 200) {
                        if (response?.config?.method === 'put') {
                            swal("Inactivated", "", "success");
                        } else if (response?.config?.method === 'delete') {
                            swal("Deleted", "", "success");
                            getAdmins("?p=" + (currentPage + 1));
                        }
                    }
                }).catch(error => {
                    console.log(error.response);
                    if (error?.response?.status === 401) {
                        if (window.confirm('Login expired! Please login again.')) {
                            localStorage.clear();
                            history.push(url['login']);
                        }
                    }
                })
            }} color='primary' title='Delete' />)
        }
    ]

    const getAdmins = async (page="?p=1") => {
        setLoading(true);

        const accountIds = await API.get(`${endpoints['admins']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setAdmins(res.data.content);
            setTotalElements(res.data.totalElements);
            setCurrentPage(res.data.number);
            setLoading(false);

            return res.data.content.map(a => a.account_id);
        })
        .catch(err => console.log(err.response))

        let promises = [];
        let temp = [];
        for (let i = 0; i < accountIds.length; i++) {
            promises.push(API.get(`${endpoints['accounts']}/${accountIds[i]}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => temp.push(res.data)));
        }
        Promise.all(promises).then(() => setAccounts(temp));
    }

    useEffect(() => {
        getAdmins();
        context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
    }, [])

    function handlePageChange(newPage) {
        getAdmins(`?p=${newPage + 1}`);
        setCurrentPage(newPage);
    }

    return (
        <div className={classes.root}>
            {loading ? (
                <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
            ) : (
                <DataTable header="LIST ADMIN" rows={admins} columns={columns} pageSize={7}
                    createURL="" server={true}
                    btnTitle="" rowCount={totalElements} handlePageChange={handlePageChange}
                    currentPage={currentPage} />
            )}
        </div>
    )
}