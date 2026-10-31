"use client"
import React from 'react'
import { useSelector } from 'react-redux'
import AddDataForm from './AddDataForm';
import QrCodePage from './QrCodePage';

const page = () => {
  const {client} = useSelector(state=>state.client);


// console.log(client?.hasGeneratedQr)
if(client?.hasGeneratedQr){
  return (<div className=' h-screen overflow-auto p-5'>
<QrCodePage currentClient={client} />

  </div>)
}
  return (
  <AddDataForm  clientData={client} />
  )
}

export default page