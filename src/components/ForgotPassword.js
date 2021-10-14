import { Avatar, Box, Button, Container, createTheme, CssBaseline, FormControlLabel, 
    Grid, Link, TextField, Typography, ThemeProvider } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { useState } from "react";
import { useEffect } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { useHistory } from "react-router";
import swal from "sweetalert";
import API, { endpoints } from "../API";
import { indexToSubStrGetAccountId } from "../currentEndpoint";

const theme = createTheme();

export default function ForgotPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();

        const accountId = window.location.href.substr(indexToSubStrGetAccountId, 36);
        API(`${endpoints['accounts']}/${accountId}`, {
            method: 'patch',
            data: {password: password}
        }).then(res => {
            if (res.status === 200) {
                swal('Success', '', 'success');
                history.push('/');
            }
        })
        .catch(err => console.log(err.response))
    };

    const handleChange = (event) => {
        if (event.target.name === 'password') {
            setPassword(event.target.value);
        } else if (event.target.name === 'confirmPassword') {
            setConfirmPassword(event.target.value);
        }
    }

    useEffect(() => {
        ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
            return value === document.getElementsByName('password')[0].value;
        })
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" style={{width:'100%', margin: '0 auto', marginTop: 200, marginLeft: 100}}>
                <CssBaseline />
                <Box
                    style={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar style={{ margin: 1, backgroundColor: '#e1f5fe', color: 'black' }}>
                        <LockOutlined />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Reset password
                    </Typography>
                    <ValidatorForm onSubmit={handleSubmit} style={{ marginTop: 1 }}>
                        <TextValidator
                            style={{marginTop: 20, minWidth: 400}}
                            validators={['required']}
                            errorMessages={['this field is required']}
                            id="password"
                            label="Password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={handleChange}
                            autoFocus
                        />
                        <TextValidator
                            style={{marginTop: 30, marginBottom: 40, minWidth: 400}}
                            validators={['required', 'isPasswordMatch']}
                            errorMessages={['this field is required', 'password not match']}
                            name="confirmPassword"
                            label="Confirm password"
                            type="password"
                            value={confirmPassword}
                            onChange={handleChange}
                            id="confirmPassword"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="outlined"
                            style={{ marginTop: 3, marginBottom: 2, border: '1px solid #2979ff', color: '#2979ff' }}
                        >
                            Reset
                        </Button>
                    </ValidatorForm>
                </Box>
            </Container>
        </ThemeProvider>
    );
}