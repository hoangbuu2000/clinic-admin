import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, makeStyles, MenuItem, Tooltip } from "@material-ui/core"
import { TextField, Typography } from "@material-ui/core";
import ButtonCustom from "./Button";
import { red } from "@material-ui/core/colors";
import { useHistory } from "react-router";
import { useState } from "react";
import UploadFile from "./UploadFile";
import API, { endpoints } from "../API";
import { SelectValidator, TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { useEffect } from "react";
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DataTable from "./DataTable";
import swal from "sweetalert";
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles({
    root: {
        background: 'white',
        color: 'white',
        padding: '0 30px',
        borderRadius: 3,
        display: 'flex',
        padding: 100,
        marginTop: 20,
        boxShadow: '0 3px 5px 2px rgba(189, 225, 255, 1)',
        borderRadius: '0% 100% 0% 100% / 77% 0% 100% 23% '
    },
    btn: {
        margin: 10
    },
    error: {
        color: red['A400'],
        fontWeight: 'bold'
    },
    loading: {
        opacity: 0.5,
        pointerEvents: 'none',
        backgroundImage: 'url("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/6d391369321565.5b7d0d570e829.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        background: 'linear-gradient(45deg, #81d4fa 20%, #8c9eff 90%)',
        color: 'white',
        padding: '0 30px',
        borderRadius: 3,
        display: 'flex',
        padding: 100,
        marginTop: 20,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        borderRadius: '0% 100% 0% 100% / 77% 0% 100% 23% '
    }
})

export default function FormMedicine(props) {
    const classes = useStyles();
    const history = useHistory();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [unit, setUnit] = useState('');
    const [unitInStock, setUnitInStock] = useState(0);
    const [category, setCategory] = useState();
    const [categories, setCategories] = useState();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isCategoryShow, setCategoryShow] = useState(false);
    const [infoC, setInfoC] = useState('');

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 200
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 350
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 500
        }
    ]

    function handleSubmit(event) {
        event.preventDefault();

        if (!category) {
            swal('Please choose a category', '', 'warning');
            return;
        }

        let myForm = document.querySelector('#form-medicine');
        let formData = new FormData(myForm);

        setLoading(true);

        API(`${endpoints['medicines']}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-type': 'multipart/form-data'
            },
            data: formData
        }).then(res => {
            console.log(res);
            setLoading(false);
            history.push('/medicines');
        })
            .catch(err => {
                if (err.response.status === 400) {
                    alert('Please enter valid values');
                    setLoading(false);
                }
            })
    }

    function handleChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        if (field === 'name') {
            setName(value);
        } else if (field === 'description') {
            setDescription(value);
        } else if (field === 'price') {
            setPrice(value);
        } else if (field === 'unit') {
            setUnit(value);
        } else if (field === 'unitInStock') {
            setUnitInStock(value);
        }
    }

    function handleGoBack() {
        history.goBack();
    }

    function getCategories(page = "?p=1") {
        const number = "n=7";

        API.get(`${endpoints['categories']}${page}&${number}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setCategories(res.data.content);
            setCurrentPage(res.data.number);
            setTotalElements(res.data.totalElements);
            setCategoryShow(true);
        })
            .catch(err => console.log(err.response))
    }

    function handlePageChange(newPage) {
        getCategories(`?p=${newPage + 1}`);
        setCurrentPage(newPage);
    }

    function handleSelectionChange(newSelection) {
        API.get(`${endpoints['categories']}/${newSelection}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setCategory(res.data))
            .catch(err => console.log(err.response))
    }

    function handleSave() {
        if (!category) {
            swal('Please choose a category', '', 'warning');
            return;
        }

        setInfoC(`Category: ${category.name}`);
        setCategoryShow(false);
    }

    useEffect(() => {
    }, [])

    return (
        <div className={loading ? classes.loading : classes.root}>
            <ValidatorForm id="form-medicine" onSubmit={handleSubmit}>
                <Typography style={{ color: 'black' }} variant='h4'>CREATE MEDICINE</Typography>
                <div>
                    <TextValidator id="standard-required" value={name}
                        onChange={handleChange} label="Name" name="name"
                        validators={['required']}
                        errorMessages={['this field is required']} />
                    <p id="error" className={classes.error}></p>
                </div>
                <div>
                    <TextValidator id="standard-required" value={description}
                        onChange={handleChange} label="Description" name="description"
                        validators={['required']}
                        errorMessages={['this field is required']} />
                    <p id="error" className={classes.error}></p>
                </div>
                <div>
                    <TextValidator id="standard-required" value={price}
                        onChange={handleChange} label="Price" name="price" type="number"
                        validators={['required']}
                        errorMessages={['this field is required']} />
                    <p id="error" className={classes.error}></p>
                </div>
                <div>
                    <TextValidator id="standard-required" value={unit}
                        onChange={handleChange} label="Unit" name="unit"
                        validators={['required']}
                        errorMessages={['this field is required']} />
                    <p id="error" className={classes.error}></p>
                </div>
                <div>
                    <TextValidator id="standard-required" value={unitInStock}
                        onChange={handleChange} label="Unit In Stock" name="unitInStock" type="number"
                        validators={['required']}
                        errorMessages={['this field is required']} />
                    <p id="error" className={classes.error}></p>
                </div>
                <div>
                    <Button
                        onClick={() => getCategories()}
                        variant="outlined" color="primary" style={{ minWidth: 192 }}
                    >
                        Choose category
                    </Button>
                    {
                        category ? (
                            <Tooltip color="primary" arrow title={infoC}>
                                <InfoIcon />
                            </Tooltip>
                        ) : ''
                    }
                </div>
                <div>
                    <UploadFile style={{ margin: '25px 0px 25px 10px' }} />
                </div>
                <ButtonCustom style={{ margin: '10px 0px 0px 0px' }}
                    title={props.type} type='submit' color="darkPrimary" />
                <ButtonCustom style={{ margin: '10px 0px 0px 10px' }}
                    onClick={handleGoBack} title='Go Back' color="darkSecondary" />
            </ValidatorForm>
            <img style={{ height: '400px', marginLeft: '205px' }} src={process.env.PUBLIC_URL + '/images/gui4.svg'} />

            <Dialog fullScreen open={isCategoryShow}>
                <DialogTitle>
                    <IconButton edge="start"
                        onClick={() => {
                            setCategoryShow(false);
                            setCategory();
                        }}>
                        <CloseIcon />
                    </IconButton>
                    <IconButton edge="end" style={{ position: 'absolute', right: 15 }} onClick={handleSave}>
                        <SaveAltIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <DataTable header="" rows={categories} server={true}
                            columns={columns} pageSize={7} rowCount={totalElements}
                            createURL="" handleSelectionChange={handleSelectionChange}
                            handlePageChange={handlePageChange} currentPage={currentPage}
                            btnTitle="" />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    )
}