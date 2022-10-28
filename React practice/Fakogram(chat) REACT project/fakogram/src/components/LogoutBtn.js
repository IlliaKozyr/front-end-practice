import React from 'react'
import { connect } from 'react-redux'
import Button from 'react-bootstrap/esm/Button'
import { Link } from 'react-router-dom'

import { actionFullLogout } from '../actions'

const LogoutBtn = ({ onLogout }) => (
    <>
        <Link className='nav' to='/login' onClick={() => onLogout()}>Sign Out</Link>
    </>
)

export const CLogoutBtn = connect(null, { onLogout: actionFullLogout })(
    LogoutBtn
)