import { Button } from "@material-ui/core";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react"
import { useHistory } from "react-router";
import swal from "sweetalert";
import API, { endpoints } from "../../../API";
import { AuthContext } from "../../../App";
import DataTable from "../../../components/DataTable";
import { url } from "../../../URL";

export default function Categories() {
    const [categories, setCategories] = useState();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const authContext = useContext(AuthContext);
    const history = useHistory();
    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 200
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 300,
            editable: authContext.currentAuth?.role === 'ROLE_ADMIN'
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 690,
            editable: authContext.currentAuth?.role === 'ROLE_ADMIN'
        },
        authContext.currentAuth?.role === 'ROLE_ADMIN' ?
        {
            field: 'action',
            headerName: ' ',
            renderCell: (params) => {
                return (
                    <Button style={{ background: '#e1f5fe', color: 'black' }}
                        variant="contained" onClick={() => handleDelete(params.id)}>Delete</Button>
                )
            }
        } : ''
    ]

    function handleDelete(id) {
        swal({
            title: 'Are you sure to delete?',
            icon: 'warning',
            buttons: {
                cancel: 'Cancel',
                delete: {
                    text: 'Delete',
                    value: 'delete'
                }
            }
        }).then((value) => {
            switch (value) {
                case "delete":
                    return API(`${endpoints['categories']}/${id}`, {
                        method: 'delete',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    })
            }
        }).then((response) => {
            if (response.status === 200) {
                swal('Deleted', '', 'success');
                getCategories(`?p=${currentPage + 1}`);
            }
        }).catch (error => {
        if (error?.response?.status === 401) {
            if (window.confirm('Login expired! Please login again.')) {
                localStorage.clear();
                history.push(url['login']);
            }
        }
    })
}

function getCategories(page = "?p=1") {
    setLoading(true);
    const number = "n=6"

    API.get(`${endpoints['categories']}${page}&${number}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        console.log(res);

        setCategories(res.data.content);
        setCurrentPage(res.data.number);
        setTotalElements(res.data.totalElements);
        setLoading(false);
    })
        .catch(err => console.log(err.response))
}

function handleCellEditCommit({ id, field, value }) {
    API(`${endpoints['categories']}/${id}`, {
        method: 'patch',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        data: { [field]: value }
    }).then(res => {
        console.log(res);
        if (res.status === 200) {
            swal('Success', '', 'success');
        }
    }).catch(err => swal(err.response?.data?.message, '', 'error'))
}

function handlePageChange(newPage) {
    getCategories(`?p=${newPage + 1}`);
    setCurrentPage(newPage);
}

useEffect(() => {
    getCategories();
}, [])

return (
    <div style={{ height: 400, width: '100%', marginTop: 50, background: 'white' }}>
        {loading ? (
            <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
        ) : (
            <DataTable header="LIST CATEGORY" rows={categories} server={true}
                columns={columns} pageSize={6} rowCount={totalElements}
                handleCellEditCommit={handleCellEditCommit} createURL="/categories/create"
                handlePageChange={handlePageChange} currentPage={currentPage}
                btnTitle="Create" />
        )}
    </div>
)
}