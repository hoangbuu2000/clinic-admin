import { TextField, Typography, RadioGroup, FormControlLabel, Radio, makeStyles } from "@material-ui/core"
import { useState } from "react";
import ButtonCustom from "./Button"
import axios from "axios";
import { useHistory } from "react-router";
import { red } from "@material-ui/core/colors";

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
    }
})

export default function FormRole(props) {
    const [name, setName] = useState('');
    const history = useHistory();
    const classes = useStyles();

    function handleSubmit(e) {
        axios({
            method: 'post',
            url: 'http://localhost:8080/roles',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                name: name
            }
        }).then(response => {
            console.log(response.data);
            history.push('/roles');
        }).catch(error => {
            if (error.response?.status === 400) {
                let e = document.querySelector('#error');
                e.innerText = 'This field is required';
            }
            console.log(error);
        })
        e.preventDefault();
    }

    function handleChange(e) {
        if (e.target.name === 'name') {
            setName(e.target.value);
            if (e.target.value !== '') {
                let e = document.querySelector('#error');
                e.innerText = '';
            }
        }
    }

    function handleGoBack() {
        history.goBack();
    }

    return (
        <div className={classes.root}>
        <form onSubmit={handleSubmit}>
            <Typography style={{color:'black'}} variant='h4'>CREATE ROLE</Typography>
            <div>
            <TextField required id="standard-required" value={name} onChange={handleChange} label="Name" name="name" />
            <p id="error" className={classes.error}></p>
            </div>
            <ButtonCustom style={{margin: '10px 0px 0px 0px'}} title={props.type} type='submit' color="primary" />
            <ButtonCustom style={{margin: '10px 0px 0px 10px'}} onClick={handleGoBack} title='Go Back' 
            color="darkPrimary" />
        </form>
        <img style={{height: '400px', marginLeft: '300px'}} src={process.env.PUBLIC_URL + '/images/gui1.svg'} />
        </div>
    )
}