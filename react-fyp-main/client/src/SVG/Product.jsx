import React from 'react'
import adProduct from './ad-product.svg';


export default function Product(props) {
  return (
   <>
   <img src={adProduct} className='imgicon' style={{...props.style,width:'18px'}} alt="User to User Transmission" />
   </>
  )
}
