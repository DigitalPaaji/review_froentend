"use client"
import ClientSidebar from '@/components/ClientSidebar'
import Loder from '@/components/Loder'
import { addclient } from '@/components/store/clientsSlice'
import store from '@/components/store/store'
import { base_url } from '@/components/utils'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {  useDispatch } from 'react-redux'
axios.defaults.withCredentials = true
 export const CompoLayout = ({ children }) => { 
   const route =useRouter()
  const [loading,setLoading] =useState(true)
  const [user,setUser]=useState()
  const dispatch = useDispatch()
const verifyClient = async()=>{
  try {
    const response = await axios.get(`${base_url}/client/auth/verify`)
    const data = await response.data;
  
    if(data.success){
       setUser(data.client)
       dispatch(addclient(data.client))
       setLoading(false)
    }else{
       route.push("/login")
    }
  
  } catch (error) {
    route.push("/login")
  }
}

useEffect(()=>{verifyClient()},[ ])



if(loading){
  return  <Loder />
}
  return (
    <div className='lg:flex'>
      
      <ClientSidebar   />
      <div className='flex-1'>
      {children}
      </div>
        
  
      </div>
  )
}

