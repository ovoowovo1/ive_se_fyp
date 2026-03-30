import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';

export default function ViewUserNav() {

    const [current, setCurrent] = useState('');
    const navigate = useNavigate();
    const Login_id = localStorage.getItem('Login_id');
    const { user_id: User_id } = useParams();
    const location = useLocation();

    const items = [
        {
            label: 'Rating',
            key: 'rating',
            //icon: <MailOutlined />,
        },
        {
            label: 'Donated Item',
            key: 'donated',
            //icon: <GiftOutlined />,
        },
    ];

    useEffect(() => {
        if (location.pathname.includes('donateditem')) {
            setCurrent('donated');
        } else if (location.pathname.includes('userdetail')) {
            setCurrent('rating');
        }
    }, [location]);

    const onClick = (e) => {
        console.log('click ', e);
        setCurrent(e.key);
        if (e.key === 'donated') {
            navigate(`/admin/${Login_id}/${User_id}/user/view/donateditem`);
        } else {
            navigate(`/admin/${Login_id}/${User_id}/user/view/rating`);
        }
    };

    return (
        <Menu onClick={onClick}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
            style={{ marginLeft: '8%' }} />
    )
}



