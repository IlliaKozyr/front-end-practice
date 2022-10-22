import { actionPromise } from '../reducers'

export const actionUploadFile = (name, file) => {
    const fd = new FormData()
    fd.append(name, file)
    return actionPromise(
        'uploadFile',
        fetch('http://chat.ed.asmer.org.ua/upload', {
            method: 'POST',
            headers: localStorage.authToken
                ? { Authorization: 'Bearer ' + localStorage.authToken }
                : {},
            body: fd,
        }).then((res) => res.json())
    )
}