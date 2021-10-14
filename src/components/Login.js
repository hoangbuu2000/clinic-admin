import {
    Avatar, Box, Button, Checkbox, createTheme, CssBaseline, FormControlLabel, Grid, Link,
    Paper, TextField, Typography, ThemeProvider, Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Step, Stepper, StepLabel
} from "@material-ui/core";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import swal from "sweetalert";
import { AuthContext } from "../App";
import ButtonCustom from "./Button";
import { indexToSubStrCurrentEndpoint } from "../currentEndpoint";
import { LockOutlined, Facebook, Twitter, GTranslate } from "@material-ui/icons";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { loadCaptchaEnginge, LoadCanvasTemplate, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import API, { endpoints } from "../API";

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://material-ui.com/">
                DHB Hospital
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

export default function Login(props) {
    const [user, setUser] = useState({
        username: '',
        password: ''
    })
    const [forgotPassword, setForgotPassword] = useState(false);
    const history = useHistory();
    const authContext = useContext(AuthContext);
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Enter username', 'Check mail'];
    const [infoValid, setInfoValid] = useState(false);
    const [usernameToResetPassword, setUsernameToResetPassword] = useState("");
    const [userCaptcha, setUserCaptcha] = useState("");

    function handleCaptChaChange(e) {
        setUserCaptcha(e.target.value);

        if (e.target.value !== "" && usernameToResetPassword !== "")
            setInfoValid(true);
        else
            setInfoValid(false);
    }

    function handleUsernameChange(e) {
        setUsernameToResetPassword(e.target.value);

        if (userCaptcha !== "" && e.target.value !== "")
            setInfoValid(true);
        else
            setInfoValid(false);
    }

    const handleNext = () => {
        if (activeStep === 0) {
            if (validateCaptcha(userCaptcha)===true) {
                API.get(`${endpoints['accounts']}/${usernameToResetPassword}/forgot_password`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => {
                    if (res.status === 200) {
                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                    }
                })
                .catch(err => {
                    swal(err.response?.data?.message, '', 'error');
                });
            }
    
            else {
                swal('Captcha not match', '', 'error');
                loadCaptchaEnginge(6, 'black', 'white'); 
                return;
            }
        }
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setTimeout(() => {
            loadCaptchaEnginge(6, 'black', 'white'); 
        }, 100)
    }

    async function handleLogin(e) {
        let promises = [];
        promises.push(axios("http://localhost:8080/auth/signIn", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                username: user.username,
                password: user.password
            }
        }).then(response => {
            if (response.status != 401) {
                console.log(response.data);
                localStorage.setItem('token', response.data.accessToken);
            }
        }).catch(error => {
            console.log(error.response.data.status)
            if (error.response?.data?.status === 401) {
                swal('Invalid username or password', '', 'error');
                return;
            }
        }))

        Promise.all(promises).then(() => {
            setTimeout(() => {
                axios("http://localhost:8080/auth/admin/user", {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => {
                    console.log(res);
                    if (res.status === 200) {
                        authContext.setAuth(true);
                        authContext.setCurrentAuth(res.data);
                        authContext.setPage(authContext.page !== "/login" ? authContext.page : "/");
                        history.push('/');
                    }
                })
                    .catch(err => {
                        console.log(err.response)
                        if (err.response.status === 403) {
                            swal(`Your role was forbidden`, '', 'error');
                            localStorage.clear();
                            return;
                        }
                    })
            }, 500)
        })

        e.preventDefault();
    };

    function handleChange(e) {
        let temp = { ...user };
        temp[e.target.name] = e.target.value;
        setUser(temp);
    }
    
    function handleClose() {
        setForgotPassword(false);
        setActiveStep(0);
    }

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" style={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    style={{
                        backgroundImage: `url(https://image.thanhnien.vn/1024/uploaded/hoalp/2021_07_04/hospital-playlist-poster3_kfoj.jpeg)`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        style={{
                            margin: '50px 4px 8px 4px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar style={{ margin: 1, backgroundColor: '#e1f5fe', color: 'black' }}>
                            <LockOutlined />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <ValidatorForm onSubmit={handleLogin} style={{ marginTop: 1 }}>
                            <TextValidator
                                style={{ width: '60%', margin: '30px 0px 0px 125px' }}
                                validators={['required']}
                                errorMessages={['this field is required']}
                                id="username"
                                label="Username"
                                name="username"
                                variant="outlined"
                                onChange={handleChange}
                                value={user.username}
                            />
                            <TextValidator
                                style={{ width: '60%', margin: '25px 0px 0px 125px' }}
                                validators={['required']}
                                errorMessages={['this field is required']}
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                variant="outlined"
                                onChange={handleChange}
                                value={user.password}
                            />
                            <FormControlLabel
                                style={{ display: 'block', margin: '20px 0px 0px 115px' }}
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                variant="outlined"
                                style={{
                                    marginTop: 20, marginBottom: 2, marginLeft: 125, width: '60%',
                                    border: '1px solid #2196f3', color: '#2196f3'
                                }}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item xs={12} style={{ marginTop: 10, paddingLeft: 125 }}>
                                    <Link onClick={() => {
                                        
                                        setForgotPassword(true);
                                        setTimeout(() => {
                                            loadCaptchaEnginge(6, 'black', 'white');
                                        }, 100)
                                        
                                    }} style={{ color: '#2196f3' }}>
                                        Forgot password?
                                    </Link>
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                variant="outlined"
                                startIcon={<Facebook />}
                                style={{
                                    marginTop: 80, marginBottom: 2, marginLeft: 125, width: '60%',
                                    border: '1px solid #2196f3', color: '#2196f3'
                                }}
                            >
                                LOGIN WITH FACEBOOK
                            </Button>
                            <Button
                                type="submit"
                                variant="outlined"
                                startIcon={<Twitter />}
                                style={{
                                    marginTop: 20, marginBottom: 2, marginLeft: 125, width: '60%',
                                    border: '1px solid #2196f3', color: '#2196f3'
                                }}
                            >
                                LOGIN WITH TWITTER
                            </Button>
                            <Button
                                type="submit"
                                variant="outlined"
                                startIcon={<GTranslate />}
                                style={{
                                    marginTop: 20, marginBottom: 2, marginLeft: 125, width: '60%',
                                    border: '1px solid #2196f3', color: '#2196f3'
                                }}
                            >
                                LOGIN WITH GOOGLE
                            </Button>
                        </ValidatorForm>
                    </Box>
                    <Copyright style={{marginTop: 45}} />
                </Grid>
            </Grid>
            <Dialog
                fullWidth
                maxWidth="sm"
                open={forgotPassword}
                onClose={handleClose}
            >
                <DialogTitle>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => {
                            const stepProps = {};
                            const labelProps = {};
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {activeStep === 0 ? (
                            <ValidatorForm>
                                <TextValidator
                                    style={{ marginLeft: 120 }}
                                    variant="outlined"
                                    name="username"
                                    label="Username"
                                    onChange={handleUsernameChange}
                                    value={usernameToResetPassword}
                                />
                                <div style={{marginLeft: 120, marginTop: 20, marginBottom: 20}}>
                                <LoadCanvasTemplate />
                                </div>
                                <TextValidator
                                    style={{ marginLeft: 120 }}
                                    variant="outlined"
                                    name="captcha"
                                    label="Captcha"
                                    value={userCaptcha}
                                    onChange={handleCaptChaChange} />
                            </ValidatorForm>
                        ) : (
                            <Typography variant="h6" style={{ marginLeft: 120 }}>
                                We sent an email to your email address base on your username.
                            </Typography>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={activeStep === 0}
                        color="secondary" variant="contained"
                        onClick={handleBack}>Go back</Button>
                    {
                        activeStep === 1 ? (
                            <Button
                                color="primary" variant="contained" onClick={handleClose}>
                                Close
                            </Button>
                        ) : (
                            <Button
                                disabled={activeStep === 1 || !infoValid}
                                color="primary" variant="contained" onClick={handleNext}>
                                Next
                            </Button>
                        )
                    }

                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}