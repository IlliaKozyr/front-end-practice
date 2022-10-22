import logo from "./logo.svg";
import React, { useState } from "react";
import "./App.css";

import thunk from "redux-thunk";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";

const store = createStore(
    combineReducers({
        auth: authReducer,
        promise: promiseReducer,
        cart: localStoreReducer(cartReducer, "cart"),
    }),
    applyMiddleware(thunk)
);

function jwtDecode(token) {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {}
}

const getGQL = (url) => (query, variables) =>
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // 'Accept' : 'application/json',
            ...(localStorage.authToken
                ? { Authorization: "Bearer " + localStorage.authToken }
                : {}),
        },
        body: JSON.stringify({ query, variables }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.data) {
                return Object.values(data.data)[0];
            } else throw new Error(JSON.stringify(data.errors));
        });

const backendURL = "http://shop-roles.node.ed.asmer.org.ua";
const gql = getGQL(backendURL + "/graphql");

function authReducer(state, { type, token }) {
    if (state === undefined) {
        if (localStorage.authToken) {
            type = "AUTH_LOGIN";
            token = localStorage.authToken;
        }
    }
    if (type === "AUTH_LOGIN") {
        let payload = jwtDecode(token);
        if (payload) {
            localStorage.authToken = token;
            return { token, payload };
        }
    }
    if (type === "AUTH_LOGOUT") {
        localStorage.removeItem("authToken");
        return {};
    }
    return state || {};
}

const actionAuthLogin = (token) => ({ type: "AUTH_LOGIN", token });

const actionAuthLogout = () => (dispatch) => {
    dispatch({ type: "AUTH_LOGOUT" });
    localStorage.removeItem("authToken");
};

function promiseReducer(state = {}, { type, name, status, payload, error }) {
    if (type === "PROMISE") {
        return {
            ...state,
            [name]: { status, payload, error },
        };
    }
    return state;
}

const actionPending = (name) => ({
    type: "PROMISE",
    status: "PENDING",
    name,
});
const actionFulfilled = (name, payload) => ({
    type: "PROMISE",
    status: "FULFILLED",
    name,
    payload,
});
const actionRejected = (name, error) => ({
    type: "PROMISE",
    status: "REJECTED",
    name,
    error,
});

const actionPromise = (name, promise) => async (dispatch) => {
    try {
        dispatch(actionPending(name));
        let payload = await promise;
        dispatch(actionFulfilled(name, payload));
        return payload;
    } catch (e) {
        dispatch(actionRejected(name, e));
    }
};

function cartReducer(state = {}, { type, count = 1, good }) {
    if (type === "CART_ADD") {
        return {
            ...state,
            [good._id]: { count: count + (state[good._id]?.count || 0), good },
        };
    }

    if (type === "CART_DELETE") {
        if (state[good._id].count > 1) {
            return {
                ...state,
                [good._id]: {
                    count: -count + (state[good._id]?.count || 0),
                    good,
                },
            };
        }

        if (state[good._id].count === 1) {
            let { [good._id]: id1, ...newState } = state; //o4en strashnoe koldunstvo
            //delete newState[good._id]
            return newState;
        }
    }

    if (type === "CART_CLEAR") {
        return {};
    }
    if (type === "CART_REMOVE") {
        // let newState = {...state}
        let { [good._id]: id1, ...newState } = state; //o4en strashnoe koldunstvo
        //delete newState[good._id]
        return newState;
    }

    return state;
}

const actionCartAdd = (good, count = 1) => ({ type: "CART_ADD", good, count });
const actionCartDelete = (good) => ({ type: "CART_DELETE", good });
const actionCartClear = () => ({ type: "CART_CLEAR" });
const actionCartRemove = (good) => ({ type: "CART_REMOVE", good });

function localStoreReducer(reducer, localStorageKey) {
    function localStoredReducer(state, action) {
        // Если state === undefined, то достать старый state из local storage
        if (state === undefined) {
            try {
                return JSON.parse(localStorage[localStorageKey]);
            } catch (e) {}
        }
        const newState = reducer(state, action);
        // Сохранить newState в local storage
        localStorage[localStorageKey] = JSON.stringify(newState);
        return newState;
    }
    return localStoredReducer;
}

const actionRootCats = () =>
    actionPromise(
        "rootCats",
        gql(
            `query {
                
CategoryFind(query: "[{\\"parent\\":null}]"){
_id name
}
}`
        )
    );

const actionCatById = (_id) =>
    actionPromise(
        "catById",
        gql(
            `query catById($q: String){
CategoryFindOne(query: $q){
_id name subCategories {
    name _id
}
goods {
    _id name price images {
        url
    }
}
}
}`,
            { q: JSON.stringify([{ _id }]) }
        )
    );

const actionLogin = (login, password) =>
    actionPromise(
        "actionLogin",
        gql(
            `query log($login:String, $password:String){
                                  login(login:$login, password:$password)
                                }`,
            { login, password }
        )
    );

const actionGoodById = (_id) =>
    actionPromise(
        "GoodFineOne",
        gql(
            `query goodByid($goodId: String) {
        GoodFindOne(query: $goodId) {
            _id
          name
          price
          description
          images {
            url
          }
        }
      }`,
            { goodId: JSON.stringify([{ _id }]) }
        )
    );

store.dispatch(actionRootCats());
store.dispatch(actionCatById("6262ca7dbf8b206433f5b3d1"));

const actionFullLogin = (log, pass) => async (dispatch) => {
    let token = await dispatch(
        actionPromise(
            "login",
            gql(
                `query login($login: String, $password: String) {
            login(login: $login, password: $password)
            }`,
                { login: log, password: pass }
            )
        )
    );
    if (token) {
        dispatch(actionAuthLogin(token));
    }
};

const actionFullRegister = (login, password) => async (dispatch) => {
    let user = await dispatch(
        actionPromise(
            "register",
            gql(
                `mutation register($login: String, $password: String) {
                UserUpsert(user: {login: $login, password: $password}) {
                   _id
                   login
                 }
               }`,
                { login: login, password: password }
            )
        )
    );
    if (user) {
        dispatch(actionFullLogin(login, password));
    }
};

const actionOrder = () => async (dispatch, getState) => {
    let { cart } = getState();
    const orderGoods = Object.entries(cart).map(([_id, { count }]) => ({
        good: { _id },
        count,
    }));

    let result = await dispatch(
        actionPromise(
            "order",
            gql(
                `
                    mutation newOrder($order:OrderInput){
                    OrderUpsert(order:$order)
                        { _id total 	}
                    }
            `,
                { order: { orderGoods } }
            )
        )
    );
    if (result?._id) {
        dispatch(actionCartClear());
        document.location.hash = "#/cart/";
        alert("Purchase completed");
    }
};

const orderHistory = () =>
    actionPromise(
        "history",
        gql(` query OrderFind{
        OrderFind(query:"[{}]"){
            _id total createdAt orderGoods{
                count good{
                    _id name price images{
                        url
                    }
                }
                owner{
                    _id login 
                }
            }
        }
    }
    `)
    );

const LoginForm = ({ onLogin }) => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const checkDisable = () => {
        return !(login !== "" && password.match(/\w{8,30}$/));
    };

    const Authorization = () => {
        onLogin(login, password);
    };

    return (
        <div className="formBlock">
            <p>Enter login:</p>

            <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />
            <p>Enter password:</p>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button disabled={checkDisable()} onClick={Authorization}>
                Log In
            </button>
        </div>
    );
};

if (localStorage.authToken) {
    store.dispatch(actionAuthLogin(localStorage.authToken));
}

store.subscribe(() => console.log(store.getState()));

const cat = [
    {
        _id: "62d57ab8b74e1f5f2ec1a148",
        name: "Motorola Razr 5G 8/256GB Graphite",
        price: 3500,
    },
    {
        _id: "62d57c4db74e1f5f2ec1a14a",
        name: "Смартфон Google Pixel 6 Pro 12/128GB Stormy Black",
        price: 2800,
    },
    {
        _id: "62d58318b74e1f5f2ec1a14e",
        name: "Microsoft Surface Duo 2 8GB/256GB",
        price: 4500,
    },
    {
        _id: "62d5869bb74e1f5f2ec1a150",
        name: "Смартфон Poco F3 6/128GB EU Arctic White",
        price: 1800,
    },
    {
        _id: "62d58810b74e1f5f2ec1a152",
        name: "Мобильный телефон Xiaomi Redmi Note 9 4G (Redmi 9t EU)",
        price: 800,
    },
    {
        _id: "62d5a7deb74e1f5f2ec1a154",
        name: "LG V50 black REF",
        price: 900,
    },
];

const rootCats = [
    {
        name: "test3",
    },
    {
        name: "Tools",
    },
    {
        name: "Tomatoes",
    },
    {
        name: "123",
    },
    {
        name: "iPhone",
    },
    {
        name: "Samsung",
    },
    {
        name: "Smartphone",
    },
    {
        name: "Large home appliances",
    },
    {
        name: "Garden",
    },
    {
        name: "Children's products",
    },
    {
        name: " Hobbies and sports",
    },
    {
        name: "Sale",
    },
];

const CategoryMenu = ({rootCats = []}) => {
    return (
        <>
            <aside id="aside">
                <ul>
                    {rootCats.map((cat) => (
                        <CategoryMenuItem name={cat.name} />
                    ))}
                </ul>
            </aside>
        </>
    );
};

const CCategoryMenu = connect((state) => ({rootCats: state.promise?.rootCats.payload}))(CategoryMenu)

const CategoryMenuItem = ({ name }) => {
    return (
        <>
            <h2>{name}</h2>
        </>
    );
};

const Category = ({cat = []}) => {
    return (
        <div className="cardBlock">
            {cat.map((item) => (
                <GoodCard name={item.name} price={item.price} />
            ))}
        </div>
    );
};

const CCategory = connect((state) => ({cat: state.promise?.catById.payload?.goods}))(Category)

const GoodCard = ({ name, price }) => {
    return (
        <div className="card">
            <h3>{name}</h3>
            <h4>{price}</h4>
        </div>
    );
};

const CLoginForm = connect(null, { onLogin: actionFullLogin })(LoginForm);

const Spoiler = ({header = '+', open, children}) => {
    const [isOpen, setIsOpen] = useState(open);

    return (
        <div>
            <div onClick={() => {
                setIsOpen(!isOpen);
            }}>
                <span>{header}</span>
                {isOpen && (
                    <div>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

const SpoilerParent = () => {

    return (
        <div>
            <Spoiler header={<h1>Заголовок</h1>} open>
                Контент 1
                <p>
                лорем ипсум траливали и тп.лорем ипсум траливали и тп.лорем ипсум траливали и тп.лорем ипсум траливали и тп.лорем ипсум траливали и тп.
                </p>
            </Spoiler>

            <Spoiler>
                <h2>Контент 2</h2>
                <p>
                лорем ипсум траливали и тп.лорем ипсум траливали и тп.лорем ипсум траливали и тп.лорем ипсум траливали и тп.лорем ипсум траливали и тп.
                </p>
            </Spoiler>
        </div>
    );
};

class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };
    }

    inputChange = (e) => {
        this.setState({value: e.target.value});
    };

    render() {
        const {min, max} = this.props;
        const hasError = this.state.value.length > max || this.state.value.length < min;
        return (
            <div>
                <input onChange={this.inputChange} className={hasError ? 'error' : ''}/>
            </div>
        );
    }
}

const RangeInputParent = () => {
    return(
        <RangeInput min={2} max={10} />
    )
 }

 class PasswordConfirm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            passwordConfirm: '',
        };
    }

    inputChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    };

    render() {
        const {min} = this.props;
        const arePasswordsEqual = this.state.password === this.state.passwordConfirm;
        const hasErrorPsw = this.state.password.length < min || !arePasswordsEqual;
        const hasErrorPswConfirm = this.state.passwordConfirm.length < min || !arePasswordsEqual;

        return (
            <div className="PasswordConfirmWrapper">
                <input placeholder={'password'}
                       name={'password'}
                       type={'password'}
                       className={hasErrorPsw ? 'error' : ''}
                       onChange={this.inputChange}
                />
                <input placeholder={'confirm password'}
                       name={'passwordConfirm'}
                       type={'password'}
                       className={hasErrorPswConfirm ? 'error' : ''}
                       onChange={this.inputChange}/>
            </div>
        );
    }
}

class PasswordConfirmParent extends React.Component{
    render() {
        return(
            <div>
                <PasswordConfirm min={2} />
            </div>
        )
    }
}

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <SpoilerParent></SpoilerParent>
                <RangeInputParent></RangeInputParent>
                <PasswordConfirmParent></PasswordConfirmParent>
                <CLoginForm />
                <CCategoryMenu />
                <CCategory />
            </div>
        </Provider>
    );
}
export default App;
