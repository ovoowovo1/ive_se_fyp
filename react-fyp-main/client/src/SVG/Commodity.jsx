import React from 'react'
import commodityIcon from './commodity.svg';

export default function Commodity(_props) {
    return (
        <>
            <span role="img" className="anticon anticon-safety ant-menu-item-icon">
                <img src={commodityIcon} alt="" className='sidebarIcon' />
            </span>
        </>
    )
}
