import {
    Avatar, Dialog, DialogContent, DialogContentText, DialogTitle,
    Grid, IconButton, makeStyles, Tab, Tabs, TextField, Tooltip, Typography
} from "@material-ui/core";
import { useState } from "react"
import SendIcon from '@material-ui/icons/Send';
import {
    getFirestore, collection, addDoc, Timestamp,
    where, query, getDocs, onSnapshot, setDoc, doc, documentId
} from "firebase/firestore";
import { useEffect } from "react";

const useStyles = makeStyles({
    sender: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 16,
        borderRadius: 30,
        background: '#eeeeee',
        width: '50%',
        padding: '8px 8px 8px 15px',
        fontWeight: 'bold'
    },
    receiver: {
        display: 'inline-block',
        marginTop: 16,
        marginLeft: 10,
        borderRadius: 30,
        background: '#3d5afe',
        color: 'white',
        width: '50%',
        padding: '8px 8px 8px 15px',
        marginLeft: 270
    }
})

export default function Chat(props) {
    const [isOpen, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messageSelected, setMessageSelected] = useState([]);
    const [message, setMessage] = useState("");
    const [tabValue, setTabValue] = useState(0);
    const classes = useStyles();
    const uid = props.uid;

    const handleOpenChat = () => {
        const db = getFirestore();

        onSnapshot(collection(db, 'chats'),
            (snapShot) => {
                let arr = [];
                let promises = [];
                snapShot.docs.forEach(async (doc) => {

                    const q = query(collection(db, 'users'), where(documentId(), "==", doc.id));
                    promises.push(getDocs(q).then(value => {
                        const element = {
                            messageId: doc.id,
                            messages: doc.data().messages,
                            from: value.docs[0].data()
                        }
                        arr.push(element);
                    }).catch(err => console.log(err))
                    )
                })
                Promise.all(promises).then(() => {
                    setMessages(arr);
                })

            },
            (error) => { console.log(error) }
        )

        setTimeout(() => {
            setOpen(true);
        }, 200)


    }

    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    const handleChangeTab = (e, value) => {
        setTabValue(value);
    }

    const handleSubmit = (e) => {
        console.log(messages);
        const data = {
            messages: [
                ...messages[tabValue].messages,
                {
                    content: message,
                    uid: uid || '',
                    time: Timestamp.now()
                }
            ]
        }
        const db = getFirestore();
        const ref = collection(db, 'chats');
        const docId = messages[tabValue].messageId;
        const docRef = doc(ref, docId);
        setDoc(docRef, data, { merge: true })
            .then(res => setMessage(''))
            .catch(err => console.log(err));

        e.preventDefault();
    }

    return (
        <>
            <div style={{ position: 'fixed', bottom: 20, right: 7, cursor: 'pointer', width: 70 }}
                onClick={handleOpenChat}>
                <img width="100%" src='https://res.cloudinary.com/dk5jgf3xj/image/upload/v1633499175/doank18/logo/chat-removebg-preview_xbkxge.png'
                    alt="Chat" />
            </div>

            <Dialog
                open={isOpen}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography>Chat with hospital</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Grid container spacing={4}>
                            <Grid item xs={3}>
                                <Tabs
                                    orientation="vertical"
                                    variant="scrollable"
                                    sx={{ borderRight: 1, borderColor: 'divider' }}
                                    value={tabValue}
                                    onChange={handleChangeTab}
                                >
                                    {messages && messages.map(m => {
                                        return (
                                            <Tab
                                                icon={<Avatar
                                                    src={m.from?.photoURL} />}
                                                label={m.from?.displayName} />
                                        )
                                    })}
                                </Tabs>
                            </Grid>
                            <Grid item xs={9}>
                                <div style={{ height: 300, overflow: 'auto' }}>
                                    {messages[tabValue]?.messages && messages[tabValue]?.messages.map(m => {
                                        let time = new Date(1970, 0, 1);
                                        time.setUTCSeconds(m.time?.seconds);
                                        
                                        const message = messages.filter(m => m.messageId !== m.uid)[tabValue];

                                        return (
                                            <div>
                                                {m.uid !== uid ? (
                                                    <Tooltip title={time.toString()}>
                                                        <Avatar
                                                            style={{ display: 'inline-block', width: 30, height: 30 }}
                                                            src={message?.from?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"} />
                                                    </Tooltip>
                                                ) : ''}
                                                <span className={m.uid !== uid ? classes.sender : classes.receiver}
                                                >
                                                    {m.content}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <form
                                    style={{ width: 650, marginTop: 20 }}
                                    onSubmit={handleSubmit}>
                                    <TextField placeholder="Aa" style={{ width: '90%' }}
                                        onChange={handleChange} value={message} />
                                    <IconButton disabled={message === ""} type="submit">
                                        <SendIcon color={message === "" ? '' : 'primary'} />
                                    </IconButton>
                                </form>
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    )
}