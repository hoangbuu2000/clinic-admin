import { FormControl, Grid, makeStyles, MenuItem, TextField, ThemeProvider } from "@material-ui/core"
import ButtonCustom from "./Button"
import { red, blue } from "@material-ui/core/colors";
import { useHistory } from "react-router";
import { useContext, useEffect, useState } from "react";
import { SideBarContext } from "../pages/management/Drawer";
import { indexToSubStrCurrentEndpoint } from "../currentEndpoint";
import API, { endpoints } from "../API";
import swal from "sweetalert";
import { ValidatorForm, TextValidator, SelectValidator } from "react-material-ui-form-validator";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { InputLabel } from "@material-ui/core";
import { createTheme } from "@material-ui/core";
import axios from "axios";

const useStyles = makeStyles({
    error: {
        color: red['A400'],
        fontWeight: 'bold'
    },
    formLoading: {
        opacity: 0.5,
        pointerEvents: 'none',
        backgroundImage: 'url("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/6d391369321565.5b7d0d570e829.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
})

const theme = createTheme({
    palette: {
        primary: {
            main: '#afc2cb'
        },
        secondary: {
            main: '#e1f5fe'
        }
    }
})

export default function FormInformation(props) {
    const classes = useStyles();
    const history = useHistory();
    const [information, setInformation] = useState({});
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [selectedDate, handleDateChange] = useState(new Date());
    const [hometown, setHometown] = useState([]);

    function handleSubmit(event) {
        setLoading(true);

        const data = {
            firstName: information.firstName,
            lastName: information.lastName,
            gender: information.gender,
            dateOfBirth: selectedDate,
            email: information.email,
            phone: information.phone,
            idCardNumber: information.idCardNumber,
            address: information.address,
            hometown: information.hometown
        };

        let roleEndpoint = role.name === 'ROLE_ADMIN' ? 'admins' : (role.name === 'ROLE_DOCTOR' ? 'doctors' :
            (role.name === 'ROLE_EMPLOYEE' ? 'employees' : (role.name === 'ROLE_USER' ? 'patients' : '')));

        if (information.id) {
            API(`${endpoints['accounts']}/${information.account_id}/${roleEndpoint}/${information.id}`, {
                method: 'put',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: data
            }).then(res => {
                console.log(res);
                setLoading(false);
                swal("Success", "", "success");
            })
            .catch(err => console.log(err.response))

           
        }
        else {
            API(`${endpoints['accounts']}/${props.accountId}/${roleEndpoint}`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: data
            }).then(res => {
                setLoading(false);
                swal("Success", "", "success");
            })
            .catch(err => console.log(err.response));
        }
        event.preventDefault();
    }

    function handleChange(event) {
        const temp = { ...information };
        temp[event.target.name] = event.target.value;
        setInformation(temp);
    }

    function handleGoBack() {
        history.goBack();
    }

    function getHomeTown() {
        axios.get('https://provinces.open-api.vn/api/p/')
        .then(res => setHometown(res.data))
        .catch(err => console.log(err));
    }

    useEffect(() => {
        setInformation(props.information);
        setRole(props.role);
        setDisabled(props.disabled);
        getHomeTown();

        ValidatorForm.addValidationRule('isPhoneNumber', (value) => {
            const regex = new RegExp("(84|0[3|5|7|8|9])+([0-9]{8})\\b");
            return regex.test(value);
        })
        ValidatorForm.addValidationRule('isCardNumber', (value) => {
            const regex = new RegExp(/^(\d{9}|\d{12})$/);
            return regex.test(value);
        })

        return () => {
            ValidatorForm.removeValidationRule('isPhoneNumber');
            ValidatorForm.removeValidationRule('isCardNumber');
        }
    }, [])

    useEffect(() => {
        setInformation(props.information);
        setRole(props.role);
        handleDateChange(props.information ? props.information.dateOfBirth : new Date());
    
        if (disabled) {
            document.querySelector('#formAccount').style.cursor = 'not-allowed';
            let form = document.querySelector('#formAccount');
            Array.from(form.elements).forEach(formElement => formElement.disabled = true);
        }
        else {
            document.querySelector('#formAccount').style.cursor = 'default';
            let form = document.querySelector('#formAccount');
            Array.from(form.elements).forEach(formElement => formElement.disabled = false);
        }
    }, [props.information, props.role, disabled])

    useEffect(() => {
        setDisabled(props.disabled);
        if (disabled) {
            document.querySelector('#formAccount').style.cursor = 'not-allowed';
            let form = document.querySelector('#formAccount');
            Array.from(form.elements).forEach(formElement => formElement.disabled = true);
        }
        else {
            document.querySelector('#formAccount').style.cursor = 'default';
            let form = document.querySelector('#formAccount');
            Array.from(form.elements).forEach(formElement => formElement.disabled = false);
        }
    }, [props.disabled])

    return (
        <div className={loading ? classes.formLoading : ''}>
            {props.role?.name === 'ROLE_ADMIN' || props.role?.name === 'ROLE_DOCTOR'
                || props.role?.name === 'ROLE_EMPLOYEE' ? (
                <ValidatorForm id='formAccount' onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <h3>INFORMATION</h3>
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="First name *"
                                onChange={handleChange}
                                name="firstName"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.firstName || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Last name *"
                                onChange={handleChange}
                                name="lastName"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.lastName || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Gender *"
                                onChange={handleChange}
                                name="gender"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.gender || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <ThemeProvider theme={theme}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker style={{width: 200}} color="primary" 
                                        label="DOB *" format="dd-MM-yyyy"
                                            onChange={(date) => handleDateChange(date)}
                                            name="dateOfBirth" value={selectedDate}  />
                                    </MuiPickersUtilsProvider>
                            </ThemeProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Email *"
                                onChange={handleChange}
                                name="email"
                                validators={['required', 'isEmail']}
                                errorMessages={['this field is required', 'invalid email']}
                                value={information?.email || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Phone *"
                                onChange={handleChange}
                                name="phone"
                                validators={['required', 'isPhoneNumber']}
                                errorMessages={['this field is required', 'invalid phone number']}
                                value={information?.phone || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Card number *"
                                onChange={handleChange}
                                name="idCardNumber"
                                validators={['required', 'isCardNumber']}
                                errorMessages={['this field is required', 'invalid card number']}
                                value={information?.idCardNumber || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Address *"
                                onChange={handleChange}
                                name="address"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.address || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl variant="outlined">
                                <SelectValidator style={{width: 195, textAlign: 'left'}} name="hometown" 
                                label="Hometown *" value={information?.hometown || ''} 
                                onChange={handleChange} validators={['required']}
                                errorMessages={['this field is required']}
                                >
                                    {hometown && hometown.map(h => {
                                        return (
                                            <MenuItem value={h.name}>{h.name}</MenuItem>
                                        )
                                    })}
                                </SelectValidator>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <br/>
                    <ButtonCustom style={{ margin: '10px 0px 0px 0px' }} title={information?.id ? 'Save' : 'Create'}
                        type='submit' color="darkPrimary" />
                    <ButtonCustom style={{ margin: '10px 0px 0px 10px' }} onClick={handleGoBack}
                        title='Go Back' color="darkSecondary" />
                </ValidatorForm>
            ) : (props.role?.name === 'ROLE_USER' ? (
                <ValidatorForm id='formAccount' onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <h3>INFORMATION</h3>
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="First name *"
                                onChange={handleChange}
                                name="firstName"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.firstName || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Last name *"
                                onChange={handleChange}
                                name="lastName"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.lastName || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Gender *"
                                onChange={handleChange}
                                name="gender"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.gender || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <ThemeProvider theme={theme}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker style={{width: 200}} color="primary" 
                                        label="DOB *" format="dd-MM-yyyy"
                                            onChange={(date) => handleDateChange(date)}
                                            name="dateOfBirth" value={selectedDate}  />
                                    </MuiPickersUtilsProvider>
                            </ThemeProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Email *"
                                onChange={handleChange}
                                name="email"
                                validators={['required', 'isEmail']}
                                errorMessages={['this field is required', 'invalid email']}
                                value={information?.email || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Phone *"
                                onChange={handleChange}
                                name="phone"
                                validators={['required', 'isPhoneNumber']}
                                errorMessages={['this field is required', 'invalid phone number']}
                                value={information?.phone || ''}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextValidator
                                label="Address *"
                                onChange={handleChange}
                                name="address"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={information?.address || ''}
                            />
                        </Grid>
                    </Grid>

                    <ButtonCustom style={{ margin: '10px 0px 0px 0px' }} title={information?.id ? 'Save' : 'Create'}
                        type='submit' color="darkPrimary" />
                    <ButtonCustom style={{ margin: '10px 0px 0px 10px' }} onClick={handleGoBack}
                        title='Go Back' color="darkSecondary" />
                </ValidatorForm>
            ) : '')}
        </div>
    )
}