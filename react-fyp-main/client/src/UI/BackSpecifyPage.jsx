import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FloatButton } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';

export default function BackSpecifyPage({ to }) {

    const navigate = useNavigate();

    function handleGoBack() {
        navigate(to);
    }


    return (
        <FloatButton onClick={handleGoBack} icon={<RollbackOutlined />} />
    )
}
