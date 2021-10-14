import { makeStyles, Typography, TextField } from "@material-ui/core"
import { red } from "@material-ui/core/colors"
import { useState } from "react";
import { useHistory } from "react-router";
import API, { endpoints } from "../API";
import { url } from "../URL";
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
    btn: {
        margin: 10
    },
    error: {
        color: red['A400'],
        fontWeight: 'bold'
    }
})

export default function FormShift(props) {
    const classes = useStyles();
    const history = useHistory();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    function handleSubmit(event) {
        event.preventDefault();

        API(`${endpoints['shifts']}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                name: name,
                description: description
            }
        }).then(res => {
            history.push("/shifts");
        }).catch(err => {
            console.log(err.response);
            if (err.response.status === 401) {
                if (window.confirm('Login expired! Please login again')) {
                    localStorage.clear();
                    history.push(url['login']);
                }
            }
            else if (err.response.status === 400) {
                alert('Please enter valid values');
            }
        })
    }
    
    function handleChange(event) {
        if (event.target.name === 'name') {
            setName(event.target.value);
        } else if (event.target.name === 'description') {
            setDescription(event.target.value);
        }
    }

    function handleGoBack() {
        history.goBack();
    }

    return (
        <div className={classes.root}>
            <form onSubmit={handleSubmit}>
                <Typography style={{color:'black'}} variant='h4'>CREATE SHIFT</Typography>
                <div>
                    <TextField required id="standard-required" onChange={handleChange} value={name} label="Name" 
                    name="name" />
                    <p id="error" className={classes.error}></p>
                </div>
                <div>
                    <TextField required id="standard-required" onChange={handleChange} value={description} 
                    label="Description" name="description" />
                    <p id="error" className={classes.error}></p>
                </div>
                <ButtonCustom style={{ margin: '10px 0px 0px 0px' }} title={props.type} type='submit' 
                color="darkPrimary" />
                <ButtonCustom style={{ margin: '10px 0px 0px 10px' }} onClick={handleGoBack} title='Go Back' 
                color="darkSecondary" />
            </form>
            <img style={{ height: '400px', marginLeft: '380px' }} src={process.env.PUBLIC_URL + '/images/gui3.svg'} />
        </div>
    )
}