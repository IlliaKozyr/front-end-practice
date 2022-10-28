function createStore(reducer) {
    let state = reducer(undefined, {}); //стартовая инициализация состояния, запуск редьюсера со state === undefined
    let cbs = []; //массив подписчиков

    const getState = () => state; //функция, возвращающая переменную из замыкания
    const subscribe = (cb) => (
        cbs.push(cb), //запоминаем подписчиков в массиве
        () => (cbs = cbs.filter((c) => c !== cb))
    ); //возвращаем функцию unsubscribe, которая удаляет подписчика из списка

    const dispatch = (action) => {
        if (typeof action === "function") {
            //если action - не объект, а функция
            return action(dispatch, getState); //запускаем эту функцию и даем ей dispatch и getState для работы
        }
        const newState = reducer(state, action); //пробуем запустить редьюсер
        if (newState !== state) {
            //проверяем, смог ли редьюсер обработать action
            state = newState; //если смог, то обновляем state
            for (let cb of cbs) cb(); //и запускаем подписчиков
        }
    };

    return {
        getState, //добавление функции getState в результирующий объект
        dispatch,
        subscribe, //добавление subscribe в объект
    };
}

function jwtDecode(token) {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {}
}

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
    // type CART_ADD CART_REMOVE CART_CLEAR CART_DEL
    // {
    //  id1: {count: 1, good: {name, price, images, id}}
    // }
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

const delay = (ms) => new Promise((ok) => setTimeout(() => ok(ms), ms));

function combineReducers(reducers) {
    //пачку редьюсеров как объект {auth: authReducer, promise: promiseReducer}
    function combinedReducer(combinedState = {}, action) {
        //combinedState - типа {auth: {...}, promise: {....}}
        const newCombinedState = {};
        for (const [reducerName, reducer] of Object.entries(reducers)) {
            const newSubState = reducer(combinedState[reducerName], action);
            if (newSubState !== combinedState[reducerName]) {
                newCombinedState[reducerName] = newSubState;
            }
        }
        if (Object.keys(newCombinedState).length === 0) {
            return combinedState;
        }
        return { ...combinedState, ...newCombinedState };
    }

    return combinedReducer; //нам возвращают один редьюсер, который имеет стейт вида {auth: {...стейт authReducer-а}, promise: {...стейт promiseReducer-а}}
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

const store = createStore(
    combineReducers({
        auth: authReducer,
        promise: promiseReducer,
        cart: localStoreReducer(cartReducer, "cart"),
    })
); //не забудьте combineReducers если он у вас уже есть
if (localStorage.authToken) {
    store.dispatch(actionAuthLogin(localStorage.authToken));
}

store.subscribe(() => console.log(store.getState()));


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
        alert("Purchase completed")
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

store.subscribe(() => {
    const { rootCats } = store.getState().promise;
    if (rootCats?.payload) {
        aside.innerHTML = "";
        for (let { _id, name } of rootCats?.payload) {
            const a = document.createElement("a");
            a.href = `#/category/${_id}`;
            a.innerHTML = name;
            aside.append(a);
        }
    }
});

store.subscribe(() => {
    const { catById } = store.getState().promise;
    const [, route] = location.hash.split("/");

    if (catById?.payload && route === "category") {
        const { name, goods, subCategories } = catById?.payload;
        categoryName.innerHTML = `<h1>${name}</h1>`;
        var element = document.getElementById("productBlock");
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        

        if (subCategories) {
            for (let { name, _id } of subCategories) {
                const link = document.createElement("a");
                link.id = "subCategories";
                link.href = `#/category/${_id}`;
                link.innerText = name;
                productBlock.append(link);
            }
        }
        
        for (let { _id, name, price, images, } of goods) {
            // console.log()
            const description = document.createElement("div");
            const textBlock = document.createElement("div");
            const imgProduct = document.createElement("img");
            const a = document.createElement("p");
            const productPrice = document.createElement("p");
            const linkCard = document.createElement("a");
            const addToCartButton = document.createElement('button')
            
            addToCartButton.innerHTML = "add to cart"
            addToCartButton.id = "addToCartButtonn"

            linkCard.innerHTML = "About the product"
            linkCard.href = `#/good/${_id}`;
            
            linkCard.className = "linkCard"

            productBlock.append(description);
            description.setAttribute("class", "card");
            description.id = "card";

            description.append(imgProduct);
            

            imgProduct.src = `${backendURL}/${images[0].url}`;

            description.append(textBlock);

            a.innerHTML = name;
            textBlock.append(a);

            productPrice.innerHTML = "price: " + price;
            textBlock.append(productPrice);

            textBlock.append(linkCard);
            textBlock.append(addToCartButton)


            addToCartButton.onclick = () => {
            store.dispatch(actionCartAdd({_id, name, price, images,}));
        };
           
        }
    }
});

const flexBlockForGFO = document.createElement("div");
flexBlockForGFO.id = "flexBlockForGFO";
const goodFineOneImgBlock = document.createElement("div");
const goodFineOneTextBlock = document.createElement("div");
const goodFineOneName = document.createElement("h2");
const goodFineOneImg = document.createElement("img");
const goodFineOnePrice = document.createElement("p");
const goodFineOneDescription = document.createElement("p");
const goodFineOneAddToCartButton = document.createElement("button");

const buttonPlus = document.createElement("button");
const buttonMinus = document.createElement("button");
buttonPlus.innerHTML = "+";
buttonMinus.innerHTML = "-";

store.subscribe(() => {
    const { GoodFineOne } = store.getState().promise;
    const [, route, _id] = location.hash.split("/");
    if (GoodFineOne?.payload && route === "good") {
        productBlock.innerHTML = "";
        const { name, images, price, description } = GoodFineOne?.payload;
        productBlock.append(flexBlockForGFO);

        flexBlockForGFO.append(goodFineOneImgBlock);
        goodFineOneImg.src = `${backendURL}/${images[0].url}`;
        goodFineOneImg.id = "goodOneImg";
        goodFineOneImgBlock.append(goodFineOneImg);

        flexBlockForGFO.append(goodFineOneTextBlock);

        goodFineOneName.innerHTML = name;
        goodFineOneTextBlock.append(goodFineOneName);

        goodFineOnePrice.innerHTML = "price: " + price;
        goodFineOneTextBlock.append(goodFineOnePrice);
        goodFineOneDescription.innerHTML = description;
        goodFineOneTextBlock.append(goodFineOneDescription);
        goodFineOneAddToCartButton.innerHTML = "add to cart";
        goodFineOneTextBlock.append(goodFineOneAddToCartButton);

        goodFineOneAddToCartButton.onclick = () => {
            store.dispatch(actionCartAdd(GoodFineOne.payload));
        };
        
        // const a = document.getElementById(addToCartButtonn)
        // a.onclick = () => {
        //     store.dispatch(actionCartAdd(GoodFineOne.payload));
        // };

    }
});

const bPoputDeleteBlock = document.createElement("div");
const bPoput = document.createElement("div");
bPoput.className = "b-popup";
bPoput.id = "b-popup";
const bPoputContainer = document.createElement("div");
bPoputContainer.className = "b-popup-content";
bPoputContainer.id = "bPopupContent";
const buttonGoodDeleteBlock = document.createElement("div");
buttonGoodDeleteBlock.id = "buttonGoodDeleteBlock";

const buttonCloseCart = document.createElement("button");
buttonCloseCart.innerText = `×`;
buttonCloseCart.id = "buttonCloseCartId";
const buttonGoodDelete = document.createElement("button");
buttonGoodDelete.innerText = "delete";
buttonGoodDelete.id = "buttonDelete";

shoppingCart.onclick = () => {
    header.append(bPoput);
    bPoput.append(bPoputContainer);
};

bPoputContainer.append(buttonGoodDeleteBlock);
buttonGoodDeleteBlock.append(buttonGoodDelete);
bPoputContainer.append(buttonCloseCart);

const divToCardBlock = document.createElement("div");
const goodByIdPrice = document.createElement("h2");
const buyBlock = document.createElement("div");
buyBlock.className = "buyBlock";
const buttonBuy = document.createElement("button");
buttonBuy.className = "buttonBuy";
buttonBuy.id = "buttonBuy";

const a = document.createElement('p')
a.innerHTML = "clear"
store.subscribe(() => {
    divToCardBlock.innerHTML = "";
    goodByIdPrice.innerHTML = "";
    const toCartById = store.getState().cart;
    
    
    let countSum = 0;
    let priceSum = 0;
    for (let value of Object.values(toCartById)) {
        const { count, good, price } = value;

        countSum += count;
        priceSum += good.price * count;

        divToCardBlock.id = "divToCartBlock";
        const divToCart = document.createElement("div");
        const goodByIdImage = document.createElement("img");
        const goodByIdName = document.createElement("h2");
        const goodByIdCount = document.createElement("h2");
        const buttonPlus = document.createElement("button");
        const buttonMinus = document.createElement("button");
        const removePosition = document.createElement("button")

        buttonBuy.style.display = "block";
        buttonBuy.innerHTML = "Buy";

        goodByIdPrice.innerHTML = "Total: " + priceSum;

        removePosition.innerHTML = "Remove"
        removePosition.id = "removePosition"
        buttonPlus.innerHTML = "+";
        buttonMinus.innerHTML = "-";
        buttonPlus.id = "buttonPlus";
        buttonMinus.id = "buttonMinus";

        divToCart.id = "divToCart";
        bPoputContainer.append(divToCardBlock);
        divToCardBlock.append(divToCart);
        divToCart.append(goodByIdImage);
        divToCart.append(goodByIdName);
        divToCart.append(goodByIdCount);
        divToCart.append(buttonPlus);
        divToCart.append(buttonMinus);
        divToCart.append(removePosition)
        bPoputContainer.append(buyBlock);
        buyBlock.append(goodByIdPrice);
        buyBlock.append(buttonBuy);

        goodByIdImage.src = `${backendURL}/${value.good.images[0].url}`;
        goodByIdName.innerText = good.name;
        goodByIdCount.innerText = count;

        buttonBuy.onclick = () => {
            store.dispatch(actionOrder());
            store.dispatch(orderHistory());

        };

        buttonPlus.onclick = () => store.dispatch(actionCartAdd(value.good));
        buttonMinus.onclick = () => {
            store.dispatch(actionCartDelete(value.good));
            console.log(value.good, "this");
        };

        removePosition.onclick = () => store.dispatch(actionCartRemove(value.good))
    }

    shoppingCart.innerHTML = "Cart: " + countSum;

    buttonCloseCart.onclick = () => {
        var parent = document.getElementById("header");
        var child = document.getElementById("b-popup");
        parent.removeChild(child);
    };

    const payload = store.getState().auth.token;
    if (payload) {
        shoppingCart.style.display = "block";
    } else {
        shoppingCart.style.display = "none";
    }
});

buttonGoodDelete.onclick = () => {
    store.dispatch(actionCartClear());
    let a = document.getElementById("divToCartBlock");
    a.innerHTML = "";
    let b = document.getElementById("shoppingCart");
    b.innerHTML = "Cart";
    let c = document.getElementById("buttonBuy");
    c.style.display = "none";
};

const goodByIdName = document.createElement("div");

const h2text = document.createElement("h2");
h2text.id = "h2text";
qwer.append(h2text);
const logoutButton = document.createElement("button");
logoutButton.id = "logoutButton";
qwer.append(logoutButton);

store.subscribe(() => {
    const payload = store.getState().auth.token;
    if (payload) {
        logoutButton.style.display = "block";
        logoutButton.innerHTML = "Logout";
        login.style.display = "none";
        reg.style.display = "none";

        h2text.style.display = "block";

        h2text.innerText = jwtDecode(payload).sub.login;
    } else {
        h2text.style.display = "none";
        logoutButton.style.display = "none";
    }
});

// store.subscribe(() => {
//     const orders = store.dispatch()

// })

const buttonLogin = document.createElement("button");
buttonLogin.id = "loginInputt";
buttonLogin.innerText = "Login";

const buttonReg = document.createElement("button");
buttonReg.id = "regInput";
buttonReg.innerText = "Registration";

function bPopupCreate(text) {
    const bPopup = document.createElement("div");
    const bPopupContent = document.createElement("div");
    bPopup.id = "b-popup";
    bPopup.className = "b-popup";
    bPopupContent.className = "b-popup-content b-poput-container-flex";
    header.append(bPopup);
    bPopup.append(bPopupContent);
    const buttonCloseCart = document.createElement("button");
    buttonCloseCart.innerText = `×`;
    buttonCloseCart.id = "buttonCloseCartId";
    bPopupContent.append(buttonCloseCart);

    const loginText = document.createElement("h2");
    const passwordText = document.createElement("h2");
    loginText.innerText = "Enter Login:";
    bPopupContent.append(loginText);
    const loginInput = document.createElement("input");
    loginInput.type = "text";
    bPopupContent.append(loginInput);
    loginInput.id = "loginInput";
    loginInput.value = "illiaKozyr";
    passwordText.innerText = "Enter Password:";
    bPopupContent.append(passwordText);
    const loginInputPassword = document.createElement("input");
    loginInputPassword.type = "password";
    bPopupContent.append(loginInputPassword);
    loginInputPassword.id = "passwordInput";
    loginInputPassword.value = "qwerty123456";
    bPopupContent.append(text);

    buttonCloseCart.onclick = () => {
        var parent = document.getElementById("header");
        var child = document.getElementById("b-popup");
        parent.removeChild(child);
    };
}

window.onhashchange = () => {
    const [, route, _id] = location.hash.split("/");

    const routes = {
        category() {
            store.dispatch(actionCatById(_id));
        },
        good() {
            store.dispatch(actionGoodById(_id));
        },
        dashboard() {
            store.dispatch(orderHistory());
        },
    };

    if (route in routes) {
        routes[route]();
    }
};

window.onhashchange();

store.dispatch(orderHistory());
const h2 = document.createElement("h2");
store.subscribe(() => {
    const { history } = store.getState().promise;
    const [, route] = location.hash.split("/");
    purchaseHistory.onclick = () => {
        const bPopup = document.createElement("div");
        const bPopupContent = document.createElement("div");
        bPopup.id = "b-popup";
        bPopup.className = "b-popup";
        bPopupContent.className = "b-popup-content b-poput-container-flex";
        header.append(bPopup);
        bPopup.append(bPopupContent);
        const buttonCloseCart = document.createElement("button");
        buttonCloseCart.innerText = `×`;
        buttonCloseCart.id = "buttonCloseCartId";
        bPopupContent.append(buttonCloseCart);

        for (let [key, value] of Object.entries(history.payload)) {
            const { _id, createdAt, total, orderGoods } = value;
            const historyDiv = document.createElement("div")
            historyDiv.style = 'padding-right: 100px'
            bPopupContent.append(historyDiv)
            const card      = document.createElement('div')
            card.style     = 'width: 100%;border-style: groove;border-color: #black;padding: 10px;border-radius: 10px;margin: 5px;' 
            card.innerHTML = `<h3>Order: ${createdAt}</h3>`
            for (const {count, good} of orderGoods){{ _id, name, price, images }}
                const divGood      = document.createElement('div')
                divGood.style= "display:flex;margin-bottom: 20px;"
                
                divGood.innerHTML += `<div>Product: <b>${good.name}</b><br> Price: <b>${good.price}</b><br> Count: <b>${count} </b></b></div><img style="max-width: 80px;margin-right: 20px;display: block;margin-left: auto;" src="http://shop-roles.node.ed.asmer.org.ua/${good.images[0].url}"/><br><br>`
                card.append(divGood)
            }
            card.innerHTML += 'Date: <b>'+new Date(+createdAt).toLocaleString().replace(/\//g, '.')+'</b>'
            card.innerHTML += `<br>Total: <b style="color:red;">${total}</b>`
            historyDiv.append(card)
            
        }

        if (Object.keys(history.payload).length == 0) {
            const p = document.createElement("p");
            p.innerHTML = "<p>No purchases made yet</p>";
            card.append(p);
        }

        buttonCloseCart.onclick = () => {
            var parent = document.getElementById("header");
            var child = document.getElementById("b-popup");
            parent.removeChild(child);
        };
    });

login.onclick = () => {
    bPopupCreate(buttonLogin);
    buttonLogin.onclick = () => {
        store.dispatch(actionFullLogin(loginInput.value, passwordInput.value));
        logoutButton.style.display = "block";

        var parent = document.getElementById("header");
        var child = document.getElementById("b-popup");
        parent.removeChild(child);
        purchaseHistory.style.display = "block";
    };
};

reg.onclick = () => {
    bPopupCreate(buttonReg);
    buttonReg.onclick = () => {
        store.dispatch(
            actionFullRegister(loginInput.value, passwordInput.value),
            store.dispatch(actionCartClear())
        );
        var parent = document.getElementById("header");
        var child = document.getElementById("b-popup");
        parent.removeChild(child);
    };
};

logoutButton.onclick = () => {
    store.dispatch(actionAuthLogout());
    login.style.display = "block";
    reg.style.display = "block";
    purchaseHistory.style.display = "none";
};


