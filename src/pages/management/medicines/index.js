import { useContext, useEffect, useState } from "react";
import API, { endpoints } from '../../../API';
import { url } from '../../../URL';
import DataTable from "../../../components/DataTable";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { green, red } from '@material-ui/core/colors';
import { makeStyles } from "@material-ui/styles";
import { CancelOutlined } from '@material-ui/icons';
import { Button } from "@material-ui/core";
import swal from "sweetalert";
import { useHistory } from "react-router";
import ButtonCustom from "../../../components/Button";
import { SideBarContext } from "../Drawer";
import { indexToSubStrCurrentEndpoint } from "../../../currentEndpoint";
import { AuthContext } from "../../../App";

const colorTrue = "#b3e5fc";
const colorFalse = "#afc2cb";
const useStyles = makeStyles({
    root: {
        height: 400,
        width: '100%',
        marginTop: 50,
        background: 'white'
    },
    imageContainer: {
        position: 'absolute',
        top: 130,
        left: 350,
        width: '60%',
    },
    updateLoading: {
        height: 400,
        width: '100%',
        marginTop: 50,
        background: 'white',
        opacity: 0.5,
        pointerEvents: 'none',
        backgroundImage: 'url("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/6d391369321565.5b7d0d570e829.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    },
    imageScale: {
        width: '100%',
        height: '520px'
    },
    btnClose: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 120
    },
    btnUpload: {
        position: 'absolute',
        top: 30,
        right: 0,
        width: 120
    }
})

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentImageID, setCurrentImageID] = useState(0);
    const classes = useStyles();
    const history = useHistory();
    const context = useContext(AuthContext);


    async function getMedicines(page = "?p=1") {
        setLoading(true);

        const categoryIds = await API.get(`${endpoints['medicines']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(response => {
            setMedicines(response.data.content);
            setTotalElements(response.data.totalElements);
            setCurrentPage(response.data.number);
            setLoading(false);

            return response.data.content.map(m => m.category_id);
        }).catch(err => console.log(err))

        let promises = [];
        let categoryArr = [];
        for (let i = 0; i < categoryIds?.length; i++) {
            promises.push(
                API.get(`${endpoints['categories']}/${categoryIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => categoryArr.push(res.data))
                .catch(err => console.log(err.response))
            )
        }
        Promise.all(promises).then(() => setCategories(categoryArr));
    }

    useEffect(() => {
        getMedicines();
        context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
    }, [])

    const handleFileChange = async (event, id) => {
        let png = event.target.value.toLowerCase().endsWith('.png');
        let jpg = event.target.value.toLowerCase().endsWith('.jpg');
        let jpeg = event.target.value.toLowerCase().endsWith('.jpeg');
        let svg = event.target.value.toLowerCase().endsWith('.svg');
        if (png || jpg || jpeg || svg) {
            setUpdateLoading(true);

            const file = document.getElementById('update-photo').files[0];

            const data = await API.get(`${endpoints['medicines']}/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => {
                let formData = new FormData();
                let obj = res.data;
                obj['file'] = file;
                formData.append('id', obj.id);
                formData.append('name', obj.name);
                formData.append('description', obj.description);
                formData.append('price', obj.price);
                formData.append('unit', obj.unit);
                formData.append('image', obj.image);
                formData.append('active', obj.active);
                formData.append('file', obj.file);


                let imgScale = document.getElementById('image-container');
                imgScale.style.display = "none"

                return formData;
            }).catch(err => {
                if (err.response.status === 401)
                    if (window.confirm('Login expired! Please login again.')) {
                        localStorage.clear();
                        history.push(url['login']);
                    }
            })

            await API(`${endpoints['medicines']}/${id}`, {
                method: 'put',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-type': 'multipart/form-data'
                },
                data: data
            }).then(res => {
                console.log(res)
                const src = res.data.image
                let img = document.getElementById(`image${id}`);
                img.src = src;

                setUpdateLoading(false);
                getMedicines("?p=" + (currentPage + 1));
            })
                .catch(err => {
                    if (err.response.status === 401)
                        if (window.confirm('Login expired! Please login again.')) {
                            localStorage.clear();
                            history.push(url['login']);
                        }
                });

        }
        else {
            swal('Pls choose a file with valid extension', '', 'warning');
            event.target.value = '';
        }
    }

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
            editable: context.currentAuth?.role === 'ROLE_ADMIN'
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 300,
            editable: context.currentAuth?.role === 'ROLE_ADMIN'
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 200,
            editable: context.currentAuth?.role === 'ROLE_ADMIN'
        },
        {
            field: 'unit',
            headerName: 'Unit',
            width: 150,
            editable: context.currentAuth?.role === 'ROLE_ADMIN'
        },
        {
            field: 'active',
            headerName: 'Active',
            width: 200,
            editable: context.currentAuth?.role === 'ROLE_ADMIN',
            type: 'boolean',
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
            field: 'image',
            headerName: 'Image',
            width: 120,
            renderCell: (params) => {
                const img = params.getValue(params.id, 'image');
                let id = params.getValue(params.id, 'id');
                return (
                    <>
                        <img id={'image' + id} onClick={() => {
                            let imgScale = document.getElementById('img-scale');
                            let imgContainer = document.getElementById('image-container');
                            imgScale.src = img;
                            imgContainer.style.display = 'block';
                            setCurrentImageID(id);
                        }} style={{
                            width: '70%',
                            height: '100%',
                            padding: '5px'
                        }} src={img} alt='No image' />

                    </>
                )
            }
        },
        {
            field: 'unitInStock',
            headerName: 'Unit in stock',
            width: 200,
            editable: context.currentAuth?.role === 'ROLE_ADMIN'
        },
        {
            field: 'category_id',
            headerName: 'Category',
            width: 200,
            renderCell: (params) => {
                const category_id = params.getValue(params.id, 'category_id');
                const category = categories.filter(c => c.id === category_id)[0];

                return (
                    <p>{category?.name}</p>
                )
            }
        },
        context.currentAuth?.role === 'ROLE_ADMIN' ?
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
                                let formData = new FormData();
                                formData.append('name', params.getValue(params.id, "name"));
                                formData.append('description', params.getValue(params.id, "description"));
                                formData.append('price', params.getValue(params.id, "price"));
                                formData.append('unit', params.getValue(params.id, "unit"));
                                formData.append('image', params.getValue(params.id, "image"));
                                formData.append('active', false);
                                formData.append('unitInStock', params.getValue(params.id, "unitInStock"));

                                return API(`${endpoints['medicines']}/${id}`, {
                                    method: 'put',
                                    headers: {
                                        "Authorization": "Bearer " + localStorage.getItem('token'),
                                        "Content-type": "multipart/form-data"
                                    },
                                    data: formData
                                })
                            case "delete":
                                return API(`${endpoints['medicines']}/${id}`, {
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
                                getMedicines("?p=" + (currentPage + 1));
                            } else if (response?.config?.method === 'delete') {
                                swal("Deleted", "", "success");
                                getMedicines("?p=" + (currentPage + 1))
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
            } : ''
    ]

    function handlePageChange(newPage) {
        getMedicines(`?p=${newPage + 1}`);
        setCurrentPage(newPage);
    }


    const handleCellEditCommit = async ({ id, field, value }) => {
        const data = await API.get(`${endpoints['medicines']}/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            let formData = new FormData();
            let obj = res.data;
            obj[field] = value;
            formData.append('id', obj.id);
            formData.append('name', obj.name);
            formData.append('description', obj.description);
            formData.append('price', obj.price);
            formData.append('unit', obj.unit);
            formData.append('image', obj.image);
            formData.append('active', obj.active);
            formData.append('unitInStock', obj.unitInStock);

            return formData;
        })

        await API(`${endpoints['medicines']}/${id}`, {
            method: 'put',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-type': 'multipart/form-data'
            },
            data: data
        }).then(res => console.log(res))
            .catch(err => alert(`${field} - ${err.response.data[0].message}`))
    }

    function handleClose() {
        let imgScale = document.getElementById('img-scale');
        let imgContainer = document.getElementById('image-container');
        imgScale.src = "";
        imgContainer.style.display = 'none';
    }

    return (
        <div className={updateLoading ? classes.updateLoading : classes.root}>
            {loading ? (
                <img style={{ width: '100%', height: 600 }} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
            ) : (
                <DataTable header="LIST MEDICINE" rows={medicines} columns={columns} pageSize={5}
                    handleCellEditCommit={handleCellEditCommit}
                    createURL={context.currentAuth?.role === "ROLE_ADMIN" ? "/medicines/create" : ""}
                    btnTitle={context.currentAuth?.role === "ROLE_ADMIN" ? "Create" : ""}
                    rowCount={totalElements} handlePageChange={handlePageChange}
                    currentPage={currentPage} server={true} />
            )}
            <div id="image-container" className={classes.imageContainer}
                style={{ display: 'none' }}>
                <img id="img-scale" className={classes.imageScale} src="" />
                <div className={classes.btnClose}>
                    <Button onClick={handleClose}
                        style={{ width: '100%', fontSize: 10 }} variant="contained"
                        color="secondary">Close</Button>
                </div>
                {context.currentAuth?.role === 'ROLE_ADMIN' ? (
                    <div className={classes.btnUpload}>
                        <label style={{ width: '100%' }} htmlFor="update-photo">
                            <input id="update-photo" name="file" onClick={(event) => event.target.click()}
                                onChange={(event) => handleFileChange(event, currentImageID)}
                                style={{ display: 'none' }} type="file" />
                            <Button style={{ width: '100%', fontSize: 10 }}
                                color="primary" variant="contained" component="span">
                                Upload photo
                            </Button>
                        </label>
                    </div>
                ) : ''}
            </div>
        </div>
    )
}