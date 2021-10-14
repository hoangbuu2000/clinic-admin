import { useContext, useEffect, useState } from "react"
import API, { endpoints } from "../../../API";
import { Grid, Card, CardActionArea, CardMedia, CardContent,Typography, 
    ThemeProvider, createTheme, makeStyles, Divider, TextField, Select, MenuItem } from '@material-ui/core';
import ButtonCustom from "../../../components/Button";
import { Pagination, usePagination } from "@material-ui/lab";
import { blue } from "@material-ui/core/colors";
import { useHistory } from "react-router";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
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
        '& p': {
            borderRadius: 5,
            background: '#e1f5fe',
            color: 'black',
            width: '50%',
            margin: '0 auto',
            marginBottom: 15,
            padding: 10,
        }
    },
    action: {
        background: 'white',
        textAlign: 'center',
        paddingTop: '180px !important'        
    },
    roleInfo: {
        position: 'relative',
        background: '#e1f5fe',
        color: 'black',
        padding: '30px 10px 10px 10px',
        height: 150,
        margin: '0 auto',
        fontSize: 16,
        cursor: 'pointer'
    },
    form: {
        position: 'absolute',
        top: 80,
        marginLeft: 22
    },
});

const theme = createTheme({
    palette: {
        primary: {
            main: '#e1f5fe'
        }
    }
})

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        username: '',
        role: '0',
        hasInfo: ''
    });
    const classes = useStyles();
    const history = useHistory();
    const context = useContext(AuthContext);
    let promises = [];

    useEffect(() => {
        getRoles();
        getAccounts(window.location.search, filter);
        context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
    }, [])

    function getAccounts(page="?p=1", {username, role, hasInfo}) {
        setLoading(true);

        let apiURL;
        if (username === "" && role === "0" && hasInfo === "")
            apiURL = `${endpoints['accounts']}${page}`;
        else if (role !== "0" && username !== "" && hasInfo !== "")
            apiURL = `${endpoints['accounts']}${page}&role=${role}&username=${username}&hasInfo=${hasInfo}`;
        else if (role !== "0" && username === "" && hasInfo === "")
            apiURL = `${endpoints['accounts']}${page}&role=${role}`;
        else if (role !== "0" && username !== "" && hasInfo === "")
            apiURL = `${endpoints['accounts']}${page}&role=${role}&username=${username}`;
        else if (role === "0" && username !== "" && hasInfo === "")
            apiURL = `${endpoints['accounts']}${page}&username=${username}`;
        else if (role === "0" && username !== "" && hasInfo !== "")
            apiURL = `${endpoints['accounts']}${page}&username=${username}&hasInfo=${hasInfo}`;
        else if (role === "0" && username === "" && hasInfo !== "")
            apiURL = `${endpoints['accounts']}${page}&hasInfo=${hasInfo}`;
        else if (role !== "0" && username === "" && hasInfo !== "")
            apiURL = `${endpoints['accounts']}${page}&role=${role}&hasInfo=${hasInfo}`;

        API.get(apiURL, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res);
            setFilter({...filter, username: username});
            setAccounts(res.data.content);
            setLoading(false);
            setPage(res.data.number + 1);
            setTotalPages(res.data.totalPages);
        })
        .catch(err => {
            if (err.response?.status === 401) {
                if (window.confirm('Login expired! Please login again.')) {
                    localStorage.clear();
                    history.push(url['login']);
                }
            }
            console.log(err.response);
        })
    }

    function getRoles() {
        API.get(`${endpoints['roles']}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            let result = res.data.content;
            for (let i = 0; i < result.length; i++) {
                promises.push(getAccountsOfRole(result[i].id)
                .then(value => {
                    Object.assign(result[i], {totalAccounts: value})
                }));
            }

            Promise.all(promises).then(() => setRoles(result));
        }).catch(err => {
            if (err.response.status === 401) 
                if (window.confirm('Login expired! Please login again.')) {
                    localStorage.clear();
                    history.push(url['login']);
                }
        })
    }

    async function getAccountsOfRole(roleId) {
        return API.get(`${endpoints['roles']}/${roleId}/${endpoints['accounts']}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => res.data.totalElements);
    }

    function handlePageChange(event, value) {
        history.push(`/accounts?p=${value}`);
        setPage(value);
        if (filter) {
            getAccounts("?p=" + value, filter)
        }
        else {
            getAccounts("?p=" + value);
        }
    }

    function handleClick(roleId) {
        history.push(`/roles/${roleId}`);
        context.setPage('/roles');
    }

    function handleFilter(event) {
        let temp = filter;
        temp[event.target.name] = event.target.value;
        setFilter(temp);
        getAccounts(`?p=${page}`, filter);
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
                                <p>LIST ACCOUNT</p>
                            </Grid>
                            {accounts?.map(a => (
                                <Grid key={a.id} item xs={4}>
                                    <Card onClick={() => history.push(`/accounts/${a.id}`)} className={classes.card}>
                                        <CardActionArea>
                                            <CardMedia
                                                className={classes.media}
                                                image={a.image}
                                                title="Contemplative Reptile"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h6" component="h2">
                                                    {a.username}
                                                </Typography>
                                                {a.active ? <CheckCircleIcon /> : <CancelIcon />}
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    <Grid container item xs={6} className={classes.action}>
                        {roles.length > 0 ? (
                            <form className={classes.form}>
                                <TextField variant="outlined" onChange={handleFilter} required id="standard-required"
                                label="Username" value={filter.username} name="username" />
                                <Select style={{width: 180}} name="role" variant="outlined"
                                onChange={handleFilter}
                                value={filter.role}>
                                    <MenuItem value={0}>Choose Role</MenuItem>
                                    {roles && roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                                </Select>
                                <Select style={{width: 180}} name="hasInfo" variant="outlined"
                                onChange={handleFilter}
                                value={filter.hasInfo}>
                                    <MenuItem value={true}>Has info</MenuItem>
                                    <MenuItem value={false}>No info</MenuItem>
                                </Select>
                            </form>
                        ) : ''}
                        {roles && roles.map((r, idx) => {
                            return (
                                <Grid onClick={() => handleClick(r.id)} item xs={5} key={r.id} className={classes.roleInfo}>
                                    <p>Role name: {r.name}</p>
                                    <p>Total accounts: {r.totalAccounts}</p>
                                </Grid>
                            )
                        })}
                       
                    </Grid>
                </Grid>
                <ThemeProvider theme={theme}>
                    <Pagination color="primary" className={classes.pagination}
                        page={page} count={totalPages}
                        showFirstButton showLastButton onChange={handlePageChange} />
                </ThemeProvider>
            </>
        </div>
    )
}