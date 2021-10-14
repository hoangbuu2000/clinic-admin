import { createTheme, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, ThemeProvider } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom"
import API, { endpoints } from "../../../API";
import FormInformation from "../../../components/FormInformation";
import { makeStyles } from "@material-ui/core";
import { SideBarContext } from "../Drawer";
import { indexToSubStrCurrentEndpoint } from "../../../currentEndpoint";
import SaveIcon from '@material-ui/icons/Save';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import DeleteIcon from '@material-ui/icons/Delete';
import swal from "sweetalert";
import { blue } from "@material-ui/core/colors";
import { url } from "../../../URL";
import { AuthContext } from "../../../App";

const useStyles = makeStyles({
    info: {
        marginTop: 30,
        fontSize: 16,
        textAlign: 'center',
        // fontWeight: 'bold',
        '& p': {
            borderRadius: 10,
            background: '#e1f5fe',
            color: 'black',
            width: '50%',
            margin: '0 auto',
            // boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
            marginBottom: 15,
            padding: 10,
        }
    },
    form: {
        background: 'white',
        textAlign: 'center',
        paddingTop: '30px !important'        
    },
    formLoading : {
        background: 'white',
        textAlign: 'center',
        paddingTop: '30px !important',  
        opacity: 0.5,
        pointerEvents: 'none',
        backgroundImage: 'url("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/6d391369321565.5b7d0d570e829.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    },
    formAccountLoading: {
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
            main: '#e1f5fe'
        }
    }
})

export default function AccountDetails(props) {
    const {accountId} = useParams();
    const [account, setAccount] = useState(null);
    const [role, setRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [information, setInformation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [disableForm, setDisableForm] = useState(false);
    const classes = useStyles();
    const history = useHistory();
    const context = useContext(AuthContext);

    const getAccount = async () => {
        const roleID = await API.get(`${endpoints['accounts']}/${accountId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setAccount(res.data);
            return res.data.role_id;
        })
        .catch(err => {
            if (err.response?.status === 401) {
                if (window.confirm('Login expired! Please login again.')) {
                    history.push(url['login']);
                }
            }
            else if (err.response?.status === 404) {
                swal(err.response?.data?.message, '', 'error').then((value) => history.goBack());
            }  
        })

        let roleEndpoint = await API.get(`${endpoints['roles']}/${roleID}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setRole(res.data);
            return res.data.name === 'ROLE_ADMIN' ? 'admins' : (res.data.name === 'ROLE_DOCTOR' ? 'doctors' 
            : res.data.name === 'ROLE_EMPLOYEE' ? 'employees' : 'patients');
        }).catch(err => {
            if (err.response?.status === 401) {
                if (window.confirm('Login expired! Please login again.')) {
                    history.push(url['login']);
                }
            }
            else if (err.response?.status === 404) {
                swal(err.response?.data?.message, '', 'error').then((value) => history.goBack());
            }
        })

        await API.get(`${endpoints['accounts']}/${accountId}/${roleEndpoint}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setInformation(res.data);
            console.log(res.data);
            if (res.data === '')
                swal("This account doesn't have any information. You can enter it immediately.", '', 'info');
        })
        .catch(err => {
            if (err.response?.status === 401) {
                if (window.confirm('Login expired! Please login again.')) {
                    history.push(url['login']);
                }
            }
            else if (err.response?.status === 404) {
                swal(err.response?.data?.message, '', 'error').then((value) => history.goBack());
            }
        })

        await API.get(`${endpoints['roles']}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setRoles(res.data.content))
        .catch(err => console.log(err.response));
    }   

    useEffect(() => {
        context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
        getAccount();
    }, [])

    function handleChangeAccount(event) {
        const temp = { ...account };
        if (event.target.name === 'active')
            temp[event.target.name] = event.target.value === 'true' ? true : false;
        else
            temp[event.target.name] = event.target.value;
        setAccount(temp);
    }

    const handleRoleChange = (event) => {
        API.get(`${endpoints['roles']}/${event.target.value}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            if (account.role_id === event.target.value)
                setDisableForm(false);
            else 
                setDisableForm(true);
            
            setRole(res.data);
        })
        .catch(err => {
            if (err.response?.status === 404) {
                swal(err.response?.data?.message, '', 'error');
            }
        })

    }

    function handleEditAccount() {
        setLoading(true);

        let formData = new FormData();
        formData.append('username', account.username);
        formData.append('password', account.password);
        formData.append('image', account.image);
        formData.append('active', account.active);

        let file = document.getElementById("upload-image").files[0];
        if (file)
            formData.append('file', file);

        API(`${endpoints['roles']}/${role.id}/${endpoints['accounts']}/${accountId}`, {
            method: 'put',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-type': 'Multipart/form-data'
            },
            data: formData
        }).then(res => {
            setAccount(res.data);
            setLoading(false);
            setDisableForm(false);
            swal("Success", "", "success");
        })
        .catch(err => console.log(err.response))
    }

    function handleDeleteAccount() {
        API(`${endpoints['roles']}/${role.id}/accounts/${accountId}`, {
            method: 'delete',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => console.log(res))
        .catch(err => console.log(err.response));
    }

    function fileChange(event) {
        let png = event.target.value.toLowerCase().endsWith('.png');
        let jpg = event.target.value.toLowerCase().endsWith('.jpg');
        let jpeg = event.target.value.toLowerCase().endsWith('.jpeg');
        let svg = event.target.value.toLowerCase().endsWith('.svg');
        if (png || jpg || jpeg || svg)    {
            const src = URL.createObjectURL(document.getElementById('upload-image').files[0]);
            let img = document.getElementById("image");
            setAccount({...account, 'image': src});
            img.onload = () => {
                URL.revokeObjectURL(img.src);
            }
        }
        else {
            swal('Pls choose a file with valid extension', '', 'warning');
            event.target.value = '';
        }
    }

    return (
        <>
            {role && roles && account ? (
                <Grid container spacing={4}>
                    <Grid className={loading ? classes.formAccountLoading : ''} container item xs={6} spacing={4}>
                        <div style={{
                            position: 'absolute',
                            left: 713, top: 65,
                            padding: 10,
                            cursor: 'pointer', borderRadius: 10
                        }} onClick={handleEditAccount}>
                            <ThemeProvider theme={theme}>
                                <SaveIcon color="primary" style={{ fontSize: 40 }} />
                            </ThemeProvider>
                        </div>
                        <div style={{
                            position: 'absolute',
                            left: 673, top: 65,
                            padding: 10,
                            cursor: 'pointer', borderRadius: 10
                        }} onClick={handleDeleteAccount}>
                            <ThemeProvider theme={theme}>
                                <DeleteIcon color="primary" style={{ fontSize: 40 }} />
                            </ThemeProvider>
                        </div>
                        <Grid className={classes.info} item xs={12}>
                            <p>ACCOUNT DETAILS</p>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{position: 'relative'}}>
                                <img id="image" style={{ width: '100%', border: '3px solid #afc2cb' }} src={account?.image} />
                                <label style={{
                                    position: 'absolute', top: 10,
                                    left: 145
                                }}>
                                    <input id="upload-image" type="file" style={{ display: 'none' }}
                                        onChange={fileChange} />
                                    <PhotoLibraryIcon />
                                </label>
                            </div>
                        </Grid>
                        <Grid item xs={8}>
                            <p>ID: {account?.id}</p>
                            <p>Username: {account?.username}</p>
                            <p>Active: {account?.active ? 'True' : 'False'}</p>
                            <p>Role: {role?.name}</p>
                        </Grid>
                        <form>
                            <Grid container item xs={12} spacing={4}>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <TextField required id="standard-required"
                                            label="Username" name="username" value={account?.username || ''}
                                            onChange={handleChangeAccount} />
                                        <p className={classes.error}></p>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <TextField type="password" required id="standard-required"
                                            label="Password" name="password" value={account?.password || ''}
                                            onChange={handleChangeAccount} />
                                        <p className={classes.error}></p>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <FormLabel component="legend">Active:</FormLabel>
                                        <RadioGroup aria-label="active" name="active"
                                            value={account?.active ? 'true' : 'false'} onChange={handleChangeAccount}>
                                            <FormControlLabel value="true" control={<Radio color="primary" />} label="Active" />
                                            <FormControlLabel value="false" control={<Radio color="primary" />} label="Inactive" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl style={{ width: 150 }}>
                                        <FormLabel id="demo-simple-select-label">Role:</FormLabel>
                                        <Select
                                            disabled={information ? true : false}
                                            labelId="role"
                                            id="role"
                                            value={role.id}
                                            onChange={handleRoleChange}
                                        >
                                            {roles && roles.map(r => <MenuItem value={r?.id}>{r?.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                    <Grid className={classes.form} item xs={6}>
                        <FormInformation disabled={disableForm} information={information} accountId={account.id} role={role} />
                    </Grid>
                </Grid>
            ) : ''}

        </>
    )
}