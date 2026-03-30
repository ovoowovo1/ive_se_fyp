import React from 'react'
import birthdaycake from './birthdaycake.png';

export default function BirthdayCakeIcon(props) {
    return (
        <>
            <img src={birthdaycake} className='imgicon' style={{ ...props.style }} alt="Birthday Cake" />
        </>
    )
}
