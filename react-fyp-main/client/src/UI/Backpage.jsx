import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FloatButton } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';

export default function Backpage() {

    const navigate = useNavigate();

    function handleGoBack() {
        navigate(-1);
    }


    return (
        <FloatButton onClick={handleGoBack} icon={<RollbackOutlined />} />
    )
}
