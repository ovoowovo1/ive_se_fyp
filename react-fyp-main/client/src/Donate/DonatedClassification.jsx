import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { Typography, Table, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export default function DonatedClassification() {
    const { t, i18n: _i18n } = useTranslation();
    const [data, setData] = useState([]);
    const Login_id = localStorage.getItem('Login_id');

    useEffect(() => {
        axios.post('/donateclassificationdata', {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                const dataWithKeys = res.data.map(item => ({ ...item, key: item.ID }));
                setData(dataWithKeys);
            })
            .catch(err => console.log(err));
    }, []);

    const columns = [
        {
            title: t('ID'),
            dataIndex: 'classification_ID',
            key: 'classification_ID',
        },
        {
            title: t('Name'),
            dataIndex: 'classification_Name',
            key: 'classification_Name',
        },
        {
            title: t('Action'),
            render: (text, record) => (
                <Space size="middle">
                    
                    <Link to={`/admin/${Login_id}/donationClassification/${record.classification_ID}/edit`}>
                        <Button type="primary" >{t('Edit')}</Button>
                    </Link>
                </Space>
            ),


        }
    ];

    return (
        <>
            <Title level={3} ><b>{t('Donation classification')}</b></Title>

            <Link to="add">
                <Button type="primary" icon={<PlusCircleOutlined />} style={{ float: 'right', marginBottom: '10px' }}>{t('Add New Classification')}</Button>
            </Link>


            <Table dataSource={data} columns={columns} />


        </>
    )
}
