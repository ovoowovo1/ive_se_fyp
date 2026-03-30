import React from 'react'


import CategoryIcon from './categorymanagement.png';



export default function CateIcon(props) {
    return (
            <img src={CategoryIcon} className='imgiconalt' alt="CategoryIcon" style={{ ...props.style }} />
        
    )
}
