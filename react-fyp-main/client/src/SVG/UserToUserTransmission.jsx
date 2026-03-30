import React from 'react'
import UserToUserTransmissionIMG from './user-to-user-transmission.svg';

export default function UserToUserTransmission(props) {
  return (
   <>
    <img src={UserToUserTransmissionIMG} className='imgicon' style={{...props.style, width:'18px'}} alt="User to User Transmission" />
   </>
  )
}
