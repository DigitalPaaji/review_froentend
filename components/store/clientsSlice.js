import { createSlice } from "@reduxjs/toolkit";


const clientSlice = createSlice({
    name:"client",
    initialState:{client:null},
    reducers:{
    addclient: (state, action) => {
      state.client = action.payload;
    },

    removeclient: (state) => {
      state.client = null;
    },
    }
})



export const { addclient, removeclient } = clientSlice.actions;

export default clientSlice.reducer;