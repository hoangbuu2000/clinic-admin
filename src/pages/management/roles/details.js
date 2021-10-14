import { Grid, Card, CardActionArea, CardMedia, Typography, CardContent, 
    createTheme, ThemeProvider, TextField, FormControl, Button } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router"
import API, { endpoints } from "../../../API";
import { makeStyles } from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import { blue } from "@material-ui/core/colors";
import ButtonCustom from "../../../components/Button";
import swal from "sweetalert";
import UploadFile from "../../../components/UploadFile";
import { url } from "../../../URL";
import { SideBarContext } from "../Drawer";
import { indexToSubStrCurrentEndpoint } from "../../../currentEndpoint";
import { AuthContext } from "../../../App";

const useStyles = makeStyles({
    card: {
      maxWidth: 345,
    },
    media: {
      height: 200,
    },
    pagination: {
        marginTop: 30
    },
    info: {
        marginTop: 30,
        fontSize: 16,
        textAlign: 'center',
        // fontWeight: 'bold',
        '& p': {
            borderRadius: 10,
            background: '#e1f5fe',
            // boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
            color: 'black',
            width: '50%',
            margin: '0 auto',
            marginBottom: 15,
            padding: 10,
        }
    },
    form: {
        background: 'white',
        textAlign: 'center',
        paddingTop: '170px !important'        
    },
    formLoading : {
        background: 'white',
        textAlign: 'center',
        paddingTop: '170px !important',  
        opacity: 0.5,
        pointerEvents: 'none',
        backgroundImage: 'url("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/6d391369321565.5b7d0d570e829.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
});

const theme = createTheme({
    palette: {
        primary: {
            main: '#e1f5fe'
        }
    }
})

export default function RoleDetails(props) {
    const classes = useStyles();
    const { roleId } = useParams();
    const history = useHistory();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [page, setPage] = useState(1);
    const context = useContext(AuthContext);
    let tempRole = {};

    function getRole() {
        API.get(`${endpoints['roles']}/${roleId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(res => {
            Object.assign(tempRole, res.data);
            getAccountsOfRole(window.location.search).then(res => {
                Object.assign(tempRole, {
                    accounts: res.data.content,
                    totalElements: res.data.totalElements,
                    totalPages: res.data.totalPages,
                    currentPage: parseInt(res.data.number) + 1
                });
                setRole(tempRole);
                setLoading(false);
            })
        }).catch(error => {
            if (error.response?.status === 404) {
                alert(error.response?.data?.message);
            } else if (error.response?.status === 401) {
                if (window.confirm('Login expired! Please login again.')) {
                    localStorage.clear();
                    history.push(url['login']);
                }
            }
        })
    }

    function getAccountsOfRole(page="?p=1") {
        return API.get(`${endpoints['roles']}/${roleId}/${endpoints['accounts']}${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
    }

    useEffect(() => {
        getRole();
        context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
    }, [])

    function handlePageChange(event, value) {
        history.push(`/roles/${roleId}?p=${value}`);
        setPage(value);
        getRole();
    }

    function handleSubmit(event) {
        event.preventDefault();

        let myForm = document.getElementById('formAccount');
        let formData = new FormData(myForm);
        
        setFormLoading(true);

        API(`${endpoints['roles']}/${roleId}/${endpoints['accounts']}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-type': 'multipart/form-data'
            },
            data: formData
        }).then(res => {
            getRole();
            setFormLoading(false);
        }).catch(error => {
            console.log(error.response);
            if (error.response.status === 401)
                if (window.confirm('Login expired! Please login again.')) {
                    localStorage.clear();
                    history.push(url['login']);
                }

            if (error.response?.data?.message) {
                swal(error.response?.data?.message, '', 'error');
            } else if (Array.isArray(error.response?.data)) {
                for (let i = 0; i < error.response.data.length; i++) {
                    swal('', error.response.data[i].message, 'warning');
                }
            }
            setFormLoading(false);
        });
    }

    function handleChange(event) {
        if (event.target.name === 'username') {
            setUsername(event.target.value);
        } else if (event.target.name === 'password') {
            setPassword(event.target.value);
        }
    }

    function handleGoBack() {
        history.goBack();
    }

    return (
        <div>
            <>
                <Grid container spacing={4} style={{ display: 'flex' }}>
                    {loading ? (
                        <img src={process.env.PUBLIC_URL + "/images/loading.gif"} />
                    ) : (
                        <Grid container item xs={6} spacing={4}>
                            <Grid className={classes.info} item md={12}>
                                <p>Role name: {role?.name}</p>
                                <p>Total accounts: {role?.totalElements}</p>
                            </Grid>
                            {role?.accounts?.map(a => (
                                <Grid key={a.id} item xs={4}>
                                    <Card onClick={() => history.push(`/accounts/${a.id}`)} className={classes.card}>
                                        <CardActionArea>
                                            <CardMedia
                                                className={classes.media}
                                                image={a.image}
                                                title="Contemplative Reptile"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {a.username}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    <Grid item xs={6} className={formLoading ? classes.formLoading : classes.form}>
                        <h3>ADD ACCOUNT</h3>
                        <form id='formAccount' onSubmit={handleSubmit}>
                            <FormControl>
                                <TextField required id="standard-required" value={username}
                                    label="Username" name="username" onChange={handleChange} />
                                <p className={classes.error}></p>
                            </FormControl> <br />
                            <FormControl>
                                <TextField required id="standard-required" type="password"
                                    value={password} label="Password" name="password" onChange={handleChange} />
                                <p className={classes.error}></p>
                            </FormControl> <br />
                            <FormControl>
                                <UploadFile style={{margin: '0px 0px 20px 0px'}} />
                            </FormControl> <br />
                            <ButtonCustom style={{ margin: '10px 0px 0px 0px' }} title="Create" type='submit'
                                color="darkPrimary" />
                            <ButtonCustom style={{ margin: '10px 0px 0px 10px' }} onClick={handleGoBack}
                                title='Go Back' color="darkSecondary" />
                        </form>
                    </Grid>
                </Grid>
                <ThemeProvider theme={theme}>
                    <Pagination color="primary" className={classes.pagination}
                        page={page} count={role?.totalPages}
                        showFirstButton showLastButton onChange={handlePageChange} />
                </ThemeProvider>
            </>
        </div>
    )
}