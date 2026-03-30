import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { Typography, Table, Button, Space, Tag, message, Modal, Input, Select, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { ExclamationCircleFilled, RedoOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import MapIcon from '../SVG/Mapdraw';





export default function DonatedItemList() {
    const { t, i18n: _i18n } = useTranslation();
    const Login_id = localStorage.getItem('Login_id');
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchColumn, setSearchColumn] = useState('Donate_ID');
    const [_isLoading, setIsLoading] = useState(false);

    const [pageSize, setPageSize] = useState(5);

    const handleTableChange = (pagination) => {
        setPageSize(pagination.pageSize);
    };


    const { Text, Title } = Typography;



    useEffect(() => {
        fetchUserData();
    }, []);


    const fetchUserData = () => {


        axios.get('/listdonateditemdata', {
            headers: {
                // Add the token to the request headers
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                const dataWithKeys = res.data.map(item => ({ ...item, key: item.ID }));
                setData(dataWithKeys);
            })
            .catch(err => console.log(err));
    };


    const updateDonatedViolation = ({ donateItemID, donateViolation }) => {

        let messageTitle = '';
        let messageSuccess = '';
        let messageFail = '';
        if (donateViolation === 0) {
            messageTitle = 'Are you sure this item violates the rules?';
            messageSuccess = 'Successfully marked this item as violating the rules.';
            messageFail = 'Failed to mark this item as violating the rules.';
        } else {
            messageTitle = 'Are you sure this item does not violate the rules?';
            messageSuccess = 'Successfully marked this item as not violating the rules.';
            messageFail = 'Failed to mark this item as not violating the rules.';
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
                    .post('/updatedonatedviolation', {
                        donateItemID,
                        donateViolation
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
    //useEffect(() => {
    //     fetchUserData();
    //}, []);

    const columns = [
        {
            title: t('Donate ID'),
            dataIndex: 'Donate_Item_ID',
            key: 'ID',
            width: 100,
            sorter: (a, b) => a.Donate_Item_ID - b.Donate_Item_ID,
        },
        {
            title: t('Item Name'),
            dataIndex: 'Donate_Item_Name',
            key: 'ItemName',
            width: 200,
            render: (text) => {
                return (
                    <Tooltip title={text}>
                        <div style={{ width: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {text}
                        </div>
                    </Tooltip>
                )
            }
        },
        {
            title: t('Donated User ID'),
            dataIndex: 'Donate_User_ID',
            key: 'UserID',
            width: 150,
        },
        {
            title: t('Donated Status'),
            key: 'Status',
            dataIndex: 'Donate_Status',
            width: 130,
            filters: [
                {
                    text: 'Available',
                    value: 'Available',
                },
                {
                    text: 'Reserved',
                    value: 'Reserved',
                },
                {
                    text: 'Unavailable',
                    value: 'Unavailable',
                },
                {
                    text: 'Deleted',
                    value: 'Deleted',
                }
            ],
            filterMode: 'tree',
            onFilter: (value, record) => record.Donate_Status === value,
            render: donate_status => {
                let color;
                switch (donate_status) {
                    case 'Available':
                        color = 'green';
                        break;
                    case 'Reserved':
                        color = 'purple';
                        break;
                    case 'Unavailable':
                        color = 'red';
                        break;
                    case 'Deleted':
                        color = 'red';
                        break;
                }
                return (
                    <Tag color={color} key={donate_status}>
                        {donate_status}
                    </Tag>
                );
            },
        }, {
            title: t('Donated Violation'),
            key: 'Violation',
            dataIndex: 'Donate_Item_Violation',
            width: 110,
            filters: [
                {
                    text: 'NO',
                    value: 0,
                },
                {
                    text: 'YES',
                    value: 1,
                },
            ],
            filterMode: 'tree',
            onFilter: (value, record) => record.Donate_Item_Violation === value,
            render: Donate_Item_Violation => {
                let color;
                let text;
                switch (Donate_Item_Violation) {
                    case 0:
                        color = 'green';
                        text = 'NO';
                        break;
                    case 1:
                        color = 'red';
                        text = 'YES';
                        break;
                }
                return (
                    <Tag color={color} key={Donate_Item_Violation}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: t('Action'),
            key: 'action',
            fixed: 'right',
            width: 260,
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/admin/${Login_id}/${record.Donate_Item_ID}/donatededit`}>
                        <Button type="primary" style={{ backgroundColor: 'Gold' }}>{t('Edit')}</Button>
                    </Link>
                    <Link to={`/admin/${Login_id}/${record.Donate_Item_ID}/donatedetail`}>
                        <Button type="primary" style={{ backgroundColor: 'lawngreen' }}>{t('View')}</Button>
                    </Link>
                    <Button
                        type="primary"
                        style={{ backgroundColor: 'red' }}
                        onClick={() => updateDonatedViolation({ donateItemID: record.Donate_Item_ID, donateViolation: Number(record.Donate_Item_Violation) })}
                    >
                        {String(record.Donate_Item_Violation) === '1' ? t('Compliant') : t('Violation')}
                    </Button>
                </Space>
            )
        },
    ];

    const searchOptions = [
        { value: 'Donate_ID', label: 'Donate ID' },
        { value: 'Donate_Name', label: 'Item Name' },
        { value: 'Donate_User_ID', label: 'User ID' },
        // Add other columns here if needed
    ];



    const filteredData = data.filter(item =>
        String(item[searchColumn]).toLowerCase().includes(searchText.toLowerCase())
    );






    return (
        <>
            <Title level={3} ><b>{t('Donate Item Data')}</b></Title>


            <Space style={{ paddingBottom: '10px', boxSizing: 'border-box' }}>
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
            </Space>




            <Tooltip title={t('Refresh')}>
                <Button
                    shape="circle"
                    icon={<RedoOutlined />}
                    style={{ float: 'right' }}
                    onClick={fetchUserData}
                />
            </Tooltip>

            <Link to={`/admin/${Login_id}/mapShowDonation`}>
                <Tooltip title={t('Map')}>
                    <Button
                        shape="circle"
                        icon={<MapIcon />}
                        style={{ float: 'right', marginRight: '10px' }}
                    ></Button>
                </Tooltip>
            </Link >


            <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: pageSize, showSizeChanger: true, pageSizeOptions: ['5', '10', '15', '20'] }}
                bordered
                tableLayout="fixed"
                scroll={{ x: '1000' }}
                onChange={handleTableChange}
            />
        </>
    )
}
