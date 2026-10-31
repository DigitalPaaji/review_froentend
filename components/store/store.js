import { configureStore } from "@reduxjs/toolkit";
import client from "./clientsSlice"
const store = configureStore({
    reducer:{
        client
    }
})

export default store;