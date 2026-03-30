import React, { useRef, useEffect, useState } from 'react';
import { Avatar } from 'antd';
import { Outlet } from 'react-router-dom';
import { buildAssetUrl } from 'shared/config/env';
import { useAuth } from 'shared/auth/useAuth';

import Sidebar from './Sidebar';

export default function Topbar2() {


    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const { adminImage, adminName } = useAuth();


    useEffect(() => {
        setHeaderHeight(headerRef.current.offsetHeight);
    }, []);

    return (
        <>
            <header className='top-bar' ref={headerRef}>
                <div className="left-content">
                    <img width={50} src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="Baby Item logo" />
                    <span style={{ margin: '10px' }}><b>Baby Item</b></span>
                </div>
                <span className="avatar-container">
                    <span style={{marginRight:'10px'}}>{adminName}</span>
                    <Avatar size={40} src={buildAssetUrl(adminImage)} alt="Admin photo" style={{ marginRight: '10px' }} />
                </span>
            </header>
            <div className="container" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
                <div className="sidebar">
                    <Sidebar />
                </div>
                <div className="content">
                    <Outlet />
                    
                    
                </div>
            </div>

        </>
    )
}
