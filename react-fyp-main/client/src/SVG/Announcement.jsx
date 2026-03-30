import React from 'react'
import announcementIcon from './announcement.svg';

export default function Announcement(_props) {
    return (
        <>
            <span role="img" className="anticon anticon-safety ant-menu-item-icon">
                <img src={announcementIcon} alt="" className='sidebarIcon' />
            </span>
        </>
    )
}
