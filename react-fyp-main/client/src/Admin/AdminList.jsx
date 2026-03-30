import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';
import { Avatar, Table, Button, Space, Tag, message, Modal, Input, Select, Typography, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { PlusCircleOutlined, ExclamationCircleFilled, RedoOutlined ,UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function AdminList() {
    const { t, i18n: _i18n } = useTranslation();
    const Login_id = localStorage.getItem('Login_id');
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchColumn, setSearchColumn] = useState('Admin_ID');
    const [_isLoading, setIsLoading] = useState(false);

    const [pageSize, setPageSize] = useState(5);

    const handleTableChange = (pagination) => {
        setPageSize(pagination.pageSize);
    };

    const { Text, Title } = Typography;

    useEffect(() => {
        axios.get('/listadmindata', {
            headers: {
                // Add the token to the request headers
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                const dataWithKeys = res.data.map(item => ({ ...item, key: item.ID }));
                setData(dataWithKeys);
            })
            .catch(err => console.log(err));
    }, []);


    const fetchUserData = () => {


        axios.get('/listadmindata', {
            headers: {
                // Add the token to the request headers
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                const dataWithKeys = res.data.map(item => ({ ...item, key: item.ID }));
                setData(dataWithKeys);
            })
            .catch(err => console.log(err));
    };


    const updateUserStatus = ({ adminID, adminSuspended }) => {

        let messageTitle = '';
        let messageSuccess = '';
        let messageFail = '';
        if (adminSuspended === 0) {
            messageTitle = 'Are you sure ban this account?';
            messageSuccess = 'Successfully ban this account.';
            messageFail = 'Failed to ban this account.';
        } else {
            messageTitle = 'Are you sure unban this account?';
            messageSuccess = 'Successfully unban this account.';
            messageFail = 'Failed to unban this account.';
        }


        Modal.confirm({
            title: messageTitle,
            icon: <ExclamationCircleFilled />,
            //content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setIsLoading(true);
                axios
                    .post('/updateadminstatus', {
                        adminID,
                        adminSuspended
                    }, {
                        headers: {
                            // Add the token to the request headers
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    .then(res => {
                        console.log(res.data);
                        fetchUserData();
                        message.success(messageSuccess);
                        setIsLoading(false);
                    })
                    .catch(_err => {
                        message.error(messageFail);
                        setIsLoading(false);
                    });
            },
            onCancel() {
                console.log('Cancelled');
            },
        });
    };



    // Use the fetchUserData function in your useEffect hook
    useEffect(() => {
        fetchUserData();
    }, []);

    const columns = [
        {
            title: t('ID'),
            dataIndex: 'Admin_ID',
            key: 'ID',
            width: 150,
            sorter: (a, b) => a.Admin_ID.localeCompare(b.Admin_ID),
        },
        {
            title: t('Name'),
            dataIndex: 'Admin_Name',
            key: 'Name',
            width: 300,
            render: (name, record) => (
                <div>
                    <Avatar 
                     icon={<UserOutlined />}
                    src={buildAssetUrl(record.Admin_Photo)} alt="Admin photo" />
                    <span style={{ marginLeft: '8px' }}>{name}</span>
                </div>
            ),
        }, {
            title: t('Status'),
            key: 'Status',
            dataIndex: 'Admin_Suspended',
            width: 150,
            filters: [
                {
                    text: 'SUSPENDED',
                    value: '1',
                },
                {
                    text: 'ACTIVE',
                    value: '0',
                },
            ],
            filterMode: 'tree',
            onFilter: (value, record) => String(record.Admin_Suspended) === value,
            render: is_suspended => {
                let color = is_suspended ? 'volcano' : 'green';
                let statusText = is_suspended ? 'SUSPENDED' : 'ACTIVE';
                return (
                    <Tag color={color} key={statusText}>
                         {t(statusText)}
                    </Tag>
                );
            },
        },

        {
            title: t('Action'),
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/admin/${Login_id}/${record.Admin_ID}/adminedit`}>
                        <Button type="primary" style={{ backgroundColor: 'Gold' }}>{t('Edit')}</Button>
                    </Link>
                    <Link to={`/admin/${Login_id}/${record.Admin_ID}/admindetail`}>
                        <Button type="primary" style={{ backgroundColor: 'lawngreen' }}>{t('View')}</Button>
                    </Link>
                    <Button
                        type="primary"
                        style={{ backgroundColor: 'red' }}
                        onClick={() => updateUserStatus({ adminID: record.Admin_ID, adminSuspended: Number(record.Admin_Suspended) })}
                    >
                        {String(record.Admin_Suspended) === '1' ? t('Unban') : t('Ban')}
                    </Button>
                </Space>
            )
        },
    ];

    const searchOptions = [
        { value: 'Admin_ID', label: 'ID' },
        { value: 'Admin_Name', label: 'Name' },
        // Add other columns here if needed
    ];

    const [messageApi, contextHolder] = message.useMessage();
    const _success = () => {
        messageApi.open({
            type: 'success',
            content: 'You have successfully chaged ths account status',
        });
    };

    const filteredData = data.filter(item =>
        String(item[searchColumn]).toLowerCase().includes(searchText.toLowerCase())
    );


    return (
        <>
            {contextHolder}
            <Title level={3} ><b>{t('Admin Data')}</b></Title>



            <Space style={{ marginBottom: 20 }}>
                <Text>{t('Column')}:</Text>
                <Select
                    defaultValue={searchOptions[0].value}
                    onChange={value => setSearchColumn(value)}
                    style={{ width: 120 }}
                >
                    {searchOptions.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                            {option.label}
                        </Select.Option>
                    ))}
                </Select>
                <Text>{t('Key word')}:</Text>
                <Input.Search
                    placeholder={`Search ${searchOptions.find(option => option.value === searchColumn).label}`}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />

                <Link to="../createadmin"><Button type="primary" icon={<PlusCircleOutlined />}>{t('Create')}</Button></Link>
            </Space>

            <Tooltip title={t('Refresh')}>
                <Button
                    shape="circle"
                    icon={<RedoOutlined />}
                    style={{ float: 'right' }}
                    onClick={fetchUserData}
                />
            </Tooltip>



            <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: pageSize, showSizeChanger: true, pageSizeOptions: ['5', '10', '15', '20'] }}
                bordered
                onChange={handleTableChange}
            />
        </>
    );
}
