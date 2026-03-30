import React from 'react';
import { Card, Image } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { buildAssetUrl } from 'shared/config/env';

const { Meta } = Card;


export default function DonatedItemBox({ item }) {

    const navigate = useNavigate();
    const Login_id = localStorage.getItem('Login_id');

    const handleEditClick = () => {
        navigate(`/admin/${Login_id}/${item.Donate_Item_ID}/donatededit`);
    };

    const handleViewClick = () => {
        navigate(`/admin/${Login_id}/${item.Donate_Item_ID}/donatedetail`);
    };


    return (

        <Card hoverable

            cover={
                <Image
                    src={buildAssetUrl(item.First_Donate_Photo)} alt="Admin photo"
                    style={{ width: '100%', height: '200px' }}
                />}
            actions={[

                <EditOutlined key="edit" onClick={handleEditClick}/>,
                <EyeOutlined key="view"  onClick={handleViewClick}/>
            ]}
        >
            <Meta title={item.Donate_Item_Name}
                description={item.Donate_Item_Location} />
        </Card>

    )
}
