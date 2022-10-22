import { connect } from "react-redux";
import { store } from "../reducers";

export const authLoginValidator = () => store.getState().auth.token

