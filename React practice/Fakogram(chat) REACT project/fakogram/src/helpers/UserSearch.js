import React, { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { actionFindUsers } from "../actions";
import { CSearchAvatar } from "../components/Avatar";

import Button from "react-bootstrap/esm/Button";
import { Link } from "react-router-dom";

const useDebounce = (cb, depArray, delay, onAdd) => {
    let timeoutRef = useRef();
    useEffect(() => {
        clearInterval(timeoutRef.current);
        timeoutRef.current === undefined
            ? (timeoutRef.current = -1)
            : (timeoutRef.current = setTimeout(cb, delay));
    }, depArray);
};

const SearchByLogin = ({ onGetUser, foundUsers, onChange }) => {
    const [login, setLogin] = useState();
    useDebounce(() => onGetUser(login), [login], 2000);

    const newUserId = (user) => {
        onChange(user)
    }

    return (
        <form>
            <label for="loginInput">Add users to a group: </label>
            <div className="search-box">
                <input
                    className="form-control-editing form-control"
                    placeholder=""
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
            </div>

            {foundUsers
                ? foundUsers.map((user) => {
                      return (
                          <div className="searchBlock">
                              {user?.avatar !== null ? (
                                  <CSearchAvatar avatarUrl={user} />
                              ) : (
                                  <div className="avatarStubChat2"></div>
                              )}

                              <div>{user?.login ? user.login : "anon"}</div>

                              <div>
                                  <Button
                                      user={user}
                                      onClick={() => console.log(user)}
                                      onChange={newUserId}
                                  >
                                      +
                                  </Button>
                              </div>
                          </div>
                      );
                  })
                : null}
        </form>
    );
};

export const CSearchByLogin = connect(
    (state) => ({
        foundUsers: state?.promise?.findUsers?.payload,
        // state: state
    }),
    {
        onGetUser: actionFindUsers,
    }
)(SearchByLogin);
