import { history } from '../App'
import { gql } from '../helpers'
import {
    actionPromise,
    actionAuthLogin,
    actionAuthLogout,
    actionAboutMe,
    actionChatsClear,
} from '../reducers'
import { actionUploadFile } from './mediaActions'

export const actionFullLogout = () => async (dispatch) => {
    history.push('/login')
    await dispatch(actionAuthLogout())
    await dispatch(actionChatsClear())
}

const actionLogin = (login, password) =>
    actionPromise(
        'login',
        gql(
            `query log($login: String, $password: String) {
         login(login: $login, password: $password)
      }`,
            { login, password }
        )
    )

export const actionFullLogin = (login, password) => async (dispatch) => {
    history.push('/main')
    const token = await dispatch(actionLogin(login, password))
    if (token) {
        await dispatch(actionAuthLogin(token))
        await dispatch(actionAboutMe())
    }
}

const actionRegister = (login, password, nick) =>
    actionPromise(
        'register',
        gql(
            `mutation reg($user:UserInput) {
         UserUpsert(user:$user) {
         _id 
         }
      }
      `,
            { user: { login, password, nick } }
        )
    )

export const actionFullRegister =
    (login, password, nick) => async (dispatch) => {
        const regId = await dispatch(actionRegister(login, password, nick))
        if (regId) {
            await dispatch(actionFullLogin(login, password))
        }
    }

const actionUpdateUserAvatar = (userId, avatarId) =>
    actionPromise(
        'updateUserAv',
        gql(
            `mutation updateUserAv($user:UserInput) {
         UserUpsert(user:$user) {
            _id   
            login  
            nick
            avatar {
               url
            }
         }
      }`,
            { user: { _id: userId, avatar: { _id: avatarId } } }
        )
    )

const actionUpdateUserLogin = (userId, newLogin, newNick) =>
    actionPromise(
        'updateUser',
        gql(
            `mutation updateUser($user:UserInput) {
         UserUpsert(user:$user) {
            _id   
            login  
            nick
         }
      }`,
            { user: { _id: userId, login: newLogin, nick: newNick } }
        )
    )

export const actionSetUserInfo =
    (name, file, newLogin, newNick) => async (dispatch, getState) => {
        const { auth } = getState()
        const userId = auth.payload?.sub?.id
        if (file) {
            const fileObj = await dispatch(actionUploadFile(name, file))
            await dispatch(actionUpdateUserAvatar(userId, fileObj?._id))
        }
        await dispatch(actionUpdateUserLogin(userId, newLogin, newNick))
        await dispatch(actionAboutMe())
    }

const actionChangePass = (_id, password) =>
    actionPromise(
        'register',
        gql(
            `mutation reg($user:UserInput) {
         UserUpsert(user:$user) {
         _id 
         }
      }
      `,
            { user: { _id, password } }
        )
    )

export const actionSetUserPass = (password) => async (dispatch, getState) => {
    const { auth } = getState()
    const userId = auth.payload?.sub?.id

    await dispatch(actionChangePass(userId, password))
}
