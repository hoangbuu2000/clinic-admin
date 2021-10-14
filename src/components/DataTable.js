import { makeStyles, Typography } from "@material-ui/core"
import ButtonCustom from "./Button";
import { DataGrid } from "@material-ui/data-grid";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    typoContainer: {
        padding: 30,
        width: '30%',
        margin: '0 auto'
    },
    typo: {
        borderRadius: 6,
        textAlign: 'center',
        background: '#e1f5fe',
        fontSize: 24,
        padding: 5,
        color: '#000000'
    },
    root: {
        '& .super-app-theme--Max': {
            backgroundColor: '#ef9a9a',
            '&:hover': {
                backgroundColor: '#ffcdd2'
            }
        }
    }
}))

export default function DataTable(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {props.header ? (
                <div className={classes.typoContainer}>
                <Typography className={classes.typo} variant="h4">{props.header}</Typography>
                </div>
            ) : ''}
            <DataGrid
            getRowClassName={(params) => params.getValue(params.id, 'isMax') === true ? `super-app-theme--Max` : ''}
            className={props.className}
            rows={props.rows}
            columns={props.columns}
            pageSize={props.pageSize}
            checkboxSelection={!props.checkboxSelection ? props.checkboxSelection : true}
            disableSelectionOnClick={!props.disableSelectionOnClick ? props.disableSelectionOnClick : true }
            paginationMode={props.server ? 'server' : 'client'}
            filterMode={props.filter ? 'server' : 'client'}
            onCellEditCommit={props.handleCellEditCommit}
            rowCount={props.rowCount}
            onPageChange={props.handlePageChange}
            page={props.currentPage}
            autoHeight={true}
            selectionModel={props.selectionModel}
            onSelectionModelChange={props.handleSelectionChange}
            checkboxSelection={props.checkboxSelection ? true : false}
            isRowSelectable={props.isRowSelectable}
            />
            <br/>
            {props.btnTitle !== "" && props.createURL !== "" ? (
                <Link to={props.createURL} style={{textDecoration: 'none', position: 'fixed', right: 0, top: 100}}>
                    <ButtonCustom title={props.btnTitle} color="primary" />
                </Link>
            ) : ""}
        </div>
    )
}