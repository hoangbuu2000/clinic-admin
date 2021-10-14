import { Button } from "@material-ui/core";
import CancelIcon from '@material-ui/icons/Cancel';
import swal from "sweetalert";
import { useState } from "react";
import { CloudUpload } from "@material-ui/icons";

export default function UploadFile (props) {
    const [image, setImage] = useState('');

    function fileChange(event) {
        let png = event.target.value.toLowerCase().endsWith('.png');
        let jpg = event.target.value.toLowerCase().endsWith('.jpg');
        let jpeg = event.target.value.toLowerCase().endsWith('.jpeg');
        let svg = event.target.value.toLowerCase().endsWith('.svg');
        if (png || jpg || jpeg || svg)    {
            const src = URL.createObjectURL(document.getElementById('update-photo').files[0]);
            let img = document.getElementById("img-container");
            img.style.display = 'block';
            setImage(src);
            img.onload = () => {
                URL.revokeObjectURL(this.src);
            }
        }
        else {
            swal('Pls choose a file with valid extension', '', 'warning');
            event.target.value = '';
        }
    }

    function handleClose() {
        let file = document.getElementById("update-photo");
        file.value = '';
        setImage('');
        let img = document.getElementById("img-container");
        img.style.display = 'none';
    }

    return (
        <div style={props.style}>
        <label htmlFor="update-photo">
            <input id="update-photo" name="file" onChange={fileChange} style={{ display: 'none' }} type="file" />
            <Button startIcon={<CloudUpload />} style={{background:'#e1f5fe', color:'black'}} variant="contained" component="span">
                Upload photo
            </Button>
        </label>
        <div id="img-container" style={{display: 'none'}}>
            <img id="img" src={image} width='150' height='150' style={{marginTop: '20px'}} />
            <CancelIcon style={{cursor: 'pointer'}} onClick={handleClose} />
        </div>
        </div>
    )
}