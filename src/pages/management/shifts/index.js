import { useContext, useEffect, useState } from "react";
import API, { endpoints } from "../../../API";
import DataTable from "../../../components/DataTable";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { green, red } from "@material-ui/core/colors";
import ButtonCustom from "../../../components/Button";
import swal from "sweetalert";
import { url } from "../../../URL";
import { useHistory } from "react-router";
import { SideBarContext } from "../Drawer";
import { indexToSubStrCurrentEndpoint } from "../../../currentEndpoint";
import { AuthContext } from "../../../App";

const colorTrue = "#b3e5fc";
const colorFalse = "#afc2cb";

export default function Shifts(props) {
    const [loading, setLoading] = useState(true);
    const [shifts, setShifts] = useState([]);
    const history = useHistory();
    const context = useContext(AuthContext);

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 150
        }, 
        {
            field: 'name',
            headerName: 'Name',
            width: 300,
            editable: true
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 500,
            editable: true
        },
        {
            field: 'active',
            headerName: 'Active',
            width: 150,
            type: 'boolean',
            editable: true,
            renderCell: (params) => {
                if (params.getValue(params.id, 'active') === true)
                    return (
                        <CheckCircleIcon style={{ fill: colorTrue }} />
                    )
                else if (params.getValue(params.id, 'active') === false)
                    return (
                        <CancelIcon style={{ fill: colorFalse }} />
                    )
            }
        },
        {
            field: 'action',
            headerName: ' ',
            width: 150,
            align: 'center',
            renderCell: (params) => (<ButtonCustom onClick={() => {
                const id = params.getValue(params.id, "id");
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
                            let data = {
                                name: params.getValue(params.id, 'name'),
                                description: params.getValue(params.id, 'description'),
                                active: false
                            }
                            return API(`${endpoints['shifts']}/${id}`, {
                                method: 'put',
                                headers: {
                                    "Authorization": "Bearer " + localStorage.getItem('token')
                                },
                                data: data
                            })
                        case "delete":
                            return API(`${endpoints['shifts']}/${id}`, {
                                method: 'delete',
                                headers: {
                                    "Authorization": "Bearer " + localStorage.getItem('token')
                                }
                            })
                        default:
                            return
                    }
                }).then(response => {
                    if (response?.status === 200) {
                        if (response?.config?.method === 'put') {
                            swal("Inactivated", "", "success");
                            getShifts();
                        } else if (response?.config?.method === 'delete') {
                            swal("Deleted", "", "success");
                            getShifts();
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

    function handleCellEditCommit(params) {
        let data = {
            name: params.getValue(params.id, 'name'),
            description: params.getValue(params.id, 'description'),
            active: params.getValue(params.id, 'active')
        }
        data[params.field] = params.value;
        API(`${endpoints['shifts']}/${params.id}`, {
            method: 'put',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: data
        }).then(res => console.log(res))
        .catch(err => {
            if (err.response.status === 401)
                if (window.confirm('Login expired! Please login again.')) {
                    localStorage.clear();
                    history.push(url['login']);
                }
        })
    }

    function getShifts() {
        setLoading(true);

        API(`${endpoints['shifts']}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setShifts(res.data.content);
            setLoading(false);
        }).catch(err => console.log(err.response));
    }

    useEffect(() => {
        getShifts();
        context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
    }, [])

    return (
        <div style={{ height: 400, width: '100%', marginTop: 50, background: 'white' }}>
            {loading ? (
                <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
            ) : (
                <DataTable header="LIST SHIFT" rows={shifts} columns={columns} pageSize={5}
                    handleCellEditCommit={handleCellEditCommit} createURL="/shifts/create"
                    btnTitle="Create" />
            )}
        </div>
    )
}