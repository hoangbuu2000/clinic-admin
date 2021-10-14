import { DataGrid } from "@material-ui/data-grid";
import { useState } from "react";
import ButtonCustom from "./Button";

export default function DataTableSchedule(props) {

    return (
        <div style={props.style}>
            <DataGrid
            rows={props.rows}
            columns={props.columns}
            pageSize={props.pageSize}
            paginationMode="server"
            rowCount={props.rowCount}
            onPageChange={props.handlePageChange}
            page={props.currentPage}
            autoHeight={true}
            onSelectionModelChange={props.handleSelectionChange}
            />
            <ButtonCustom style={{ margin: '10px 10px 0px 0px', fontSize: 12}} title={'Save'}
             color="lightPrimary" onClick={props.handleSave} />
            <ButtonCustom style={{ margin: '10px 10px 0px 0px', fontSize: 12}} title={'Close'}
             color="lightPrimary" onClick={props.handleClose} />
        </div>
       
    )
}