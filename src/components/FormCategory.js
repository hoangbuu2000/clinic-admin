import { makeStyles, Typography } from "@material-ui/core";
import { useState } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { useHistory } from "react-router";
import swal from "sweetalert";
import API, { endpoints } from "../API";
import ButtonCustom from "./Button";

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
})

export default function FormCategory(props) {
    const classes = useStyles();
    const history = useHistory();
    const [category, setCategory] = useState({
        name: '',
        description: ''
    })

    const handleGoBack = () => {
        history.goBack();
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        API(`${endpoints['categories']}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: category
        }).then(res => {
            if (res.status === 201) {
                swal('Success', '', 'success');
                history.goBack();
            }
        }).catch(err => console.log(err.response))
    }

    const handleChange = (e) => {
        let temp = {...category};
        temp[e.target.name] = e.target.value;
        setCategory(temp);
    }

    return (
        <div className={classes.root}>
            <ValidatorForm id="form-medicine" onSubmit={handleSubmit}>
                <Typography style={{ color: 'black' }} variant='h4'>CREATE CATEGORY</Typography>
                <div>
                    <TextValidator id="standard-required" value={category.name}
                        onChange={handleChange} label="Name" name="name"
                        validators={['required']}
                        errorMessages={['this field is required']} />
                    <p id="error" className={classes.error}></p>
                </div>
                <div>
                    <TextValidator id="standard-required" value={category.description}
                        onChange={handleChange} label="Description" name="description"
                        validators={['required']}
                        errorMessages={['this field is required']} />
                    <p id="error" className={classes.error}></p>
                </div>
                <ButtonCustom style={{ margin: '10px 0px 0px 0px' }}
                    title={props.type} type='submit' color="darkPrimary" />
                <ButtonCustom style={{ margin: '10px 0px 0px 10px' }}
                    onClick={handleGoBack} title='Go Back' color="darkSecondary" />
            </ValidatorForm>
            <img style={{ height: '400px', marginLeft: '175px' }} src={process.env.PUBLIC_URL + '/images/gui12.svg'} />
        </div>
    )
}