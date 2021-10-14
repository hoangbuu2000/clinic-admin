import { Button } from "@material-ui/core"
import { lightBlue, red } from '@material-ui/core/colors';

export default function ButtonCustom(props) {
    let bgColor;
    let color;
    if (props.color === 'primary') {
        bgColor = '#e1f5fe';
        color = 'black';
    }
    else if (props.color === 'secondary') {
        bgColor = red['A400'];
        color = 'white';
    } 
    else if (props.color === 'lightPrimary') {
        bgColor = '#ffffff';
        color = '#000000';
    }
    else if (props.color === 'darkPrimary') {
        bgColor = '#afc2cb';
        color = '#000000';
    }
    else if (props.color === 'darkSecondary') {
        bgColor = '#cbcbcb';
        color = '#000000';
    }
    else if (props.color === 'white') {
        bgColor = 'white';
        color = lightBlue['A400'];
    }

    let styles = {
        color: color,
        background: bgColor
    }
    Object.assign(styles, props.style)

    return (
        <Button id={props.id} onClick={props.onClick} type={props.type} 
        variant={props.variant ? props.variant : "contained"} style={styles}>
            {props.title}
        </Button>
    )
}