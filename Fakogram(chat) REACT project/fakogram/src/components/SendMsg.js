import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/esm/Button'
import { connect } from 'react-redux'


// import { MsgDropZone } from './MsgDropZone'
import { actionSendMsg } from '../actions'
import { backURL } from '../constants'

const SendingField = ({ chatId, onSend, msg }) => {
    const [text, setText] = useState(msg?.text || '')
    const [files, setFiles] = useState(
        msg?.media.map((mediaFile) => ({
            ...mediaFile,
            url: backURL + mediaFile.url,
        })) || []
    )
    const [msgId, setMsgId] = useState(msg?._id || null)

    useEffect(() => {
        setText(msg?.text || '')
        setFiles(
            msg?.media.map((mediaFile) => ({
                ...mediaFile,
                url: backURL + mediaFile.url,
            })) || []
        )
        setMsgId(msg?._id || null)
    }, [msg])

    return (
        <div className="sendingField">
            <div className="buttonSendBox">
            
                        <div className="sendBlock">
                            <img src="https://img.icons8.com/ios-filled/344/folder-invoices--v2.png" className="sandFile"/>
                            <textarea placeholder="Write a message..." rows="2"  value={text} onChange={(e) => setText(e.target.value)}/>
                        </div>
                        
                        <Button 
                        endIcon={"@"}
                        onClick={() => {
                            ;(text.match(/^\s*$/) && files.length === 0) ||
                                onSend(chatId, text.trim(), 'media', files, msgId)
                            setText('')
                            setFiles([])
                            setMsgId()
                        }}
                        >Send a message</Button>
                    
                <Button
                    className="buttonSend"
                    variant="contained"
                    endIcon={"@"}
                    onClick={() => {
                        ;(text.match(/^\s*$/) && files.length === 0) ||
                            onSend(chatId, text.trim(), 'media', files, msgId)
                        setText('')
                        setFiles([])
                        setMsgId()
                    }}
                >
                    Отправить
                </Button>
            </div>
        </div>
    )
}



export const CSendingField = connect(null, { onSend: actionSendMsg })(
    SendingField
)