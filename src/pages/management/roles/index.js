import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ButtonCustom from '../../../components/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { green, red } from '@material-ui/core/colors';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import swal from 'sweetalert';
import API, { endpoints } from '../../../API';
import { makeStyles } from '@material-ui/core';
import DataTable from '../../../components/DataTable';
import { url } from '../../../URL';
import { SideBarContext } from '../Drawer';
import { indexToSubStrCurrentEndpoint } from '../../../currentEndpoint';
import { AuthContext } from '../../../App';

const colorTrue = '#b3e5fc';
const colorFalse = '#afc2cb';

const useStyles = makeStyles((theme) => ({
  root: { 
    height: theme.spacing(50), 
    width: '100%', 
    marginTop: theme.spacing(6) + 2,
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(6) + 2
    }, 
    background: 'white'
  },
  table: {
    display: 'block'
  }
}))

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const context = React.useContext(AuthContext);
  const classes = useStyles();

  function getRole() {
    setLoading(true);

    API.get(endpoints.roles, {
      headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
          let rows = response.data.content;
          for(let i = 0; i < rows.length; i++) {
            Object.assign(rows[i], {action: 'Delete'});
          }
          setRoles(rows);
          setLoading(false);
    }).catch(error => {
      if (error?.response?.status === 401) {
        if (window.confirm('Login expired! Please login again.')) {
          localStorage.clear();
          history.push(url['login']);
        }
      }
    }); 
  }

  useEffect(() => {
    getRole();
    context.setPage(window.location.href.substring(indexToSubStrCurrentEndpoint));
  }, [])

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 200,
      renderCell: (params) => {
        const id = params.getValue(params.id, "id");
        let url = "/roles/" + id;
        return (
          <Link style={{textDecoration: 'none', color: 'black', width: '100%'}} to={url}>{id}</Link>
        )
      }
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 700,
      editable: true,
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 200,
      editable: true,
      type: 'boolean',
      renderCell: (params) => {
        if (params.getValue(params.id, 'active') === true)
          return (
            <CheckCircleIcon style={{fill: colorTrue}} />
          )
        else if (params.getValue(params.id, 'active') === false)
          return (
            <CancelIcon style={{fill: colorFalse}} />
          )
      }
    },
    {
      field: 'action',
      headerName: ' ',
      width: 150,
      align: 'center',
      renderCell: (params) => (<ButtonCustom onClick={() => {
        const id = params.getValue(params.id, "id");
        swal({
          title: "Are you sure to delete?",
          icon: "warning",
          buttons: {
            cancel: 'Cancel',
            inactive: {
              text: 'Inactivate',
              value: 'inactive'
            },
            delete: {
              text: 'Delete anyway',
              value: 'delete'
            }
          }
        }).then((value) => {
          switch(value) {
            case "inactive":
              return axios(`http://localhost:8080/roles/${id}`, {
                method: 'put',
                headers: {
                  "Authorization": "Bearer " + localStorage.getItem('token')
                },
                data: {
                  name: params.getValue(params.id, "name"),
                  active: false
                }
              })
            case "delete":
              return axios(`http://localhost:8080/roles/${id}`, {
                method: 'delete',
                headers: {
                  "Authorization": "Bearer " + localStorage.getItem('token')
                }
              })
            default:
              return
          }
        }).then(response => {
          if (response?.status === 200) {
            if (response?.config?.method === 'put') {
              swal("Inactivated", "", "success");
              getRole();
            } else if (response?.config?.method === 'delete') {
              swal("Deleted", "", "success");
              getRole();
            }
          }
        }).catch(error => {
          console.log(error.response);
          if (error?.response?.status === 401) {
            if (window.confirm('Login expired! Please login again.')) {
              localStorage.clear();
              history.push(url['login']);
            }
          }
        })
      }} color='primary' title='Delete' />),
    },
  ];

  const handleCellEditCommit = useCallback(({id, field, value}) => {
    let data = {};

    API(`${endpoints['roles']}/${id}`, {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      data = res.data;
      data[field] = value;

      API(`${endpoints['roles']}/${id}`, {
        method: 'put',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        data: data
      }).then(res => console.log(res))
        .catch(err => {
          if (err.response.status === 401)
            if (window.confirm('Login expired! Please login again.')) {
              localStorage.clear();
              history.push(url['login']);
            }
        })
    })
    .catch(error => {
        if (error.response.status === 401)
            if (window.confirm('Login expired! Please login again.')) {
              localStorage.clear();
              history.push(url['login']);
            }
    })
  }, [])

  return (
    <div className={classes.root}>
      {loading ? (
        <img style={{width: '100%', height: 600}} src={process.env.PUBLIC_URL + "/images/loading.gif"} />
      ) : (
        <DataTable className={classes.table} header="LIST ROLE" rows={roles} columns={columns} pageSize={5} 
        handleCellEditCommit={handleCellEditCommit} createURL="/roles/create"
        btnTitle="Create" />
      )}
    </div>
  );
}
