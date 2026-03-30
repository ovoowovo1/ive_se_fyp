import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { Tooltip, Table, Button, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { RedoOutlined } from '@ant-design/icons';


const { Text: _Text, Title } = Typography;

export default function HumanReport() {
    const Login_id = localStorage.getItem('Login_id');
    const [data, setData] = useState([]);
    const [_searchText, _setSearchText] = useState('');
    const [_searchColumn, _setSearchColumn] = useState('Admin_ID');
    const [_isLoading, _setIsLoading] = useState(false);


    const [_pageSize, setPageSize] = useState(5);

    const _handleTableChange = (pagination) => {
        setPageSize(pagination.pageSize);
    };


    useEffect(() => {
        axios.get('/listHumanReport', {
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
    }, []);


    const fetchUserData = () => {


        axios.get('/listHumanReport', {
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



    const convertUTCtoGMT8 = (utcDateTime) => {
        const date = new Date(utcDateTime);
        date.setTime(date.getTime() + (8 * 3600000));
        return date.toISOString().replace('T', ' ').slice(0, 19);
    };


    const columns = [
        {
            title: 'Report ID ',
            dataIndex: 'Report_ID',
            key: 'ID',
            width: 100,
            sorter: (a, b) => a.Report_ID > (b.Report_ID),
        },
        {
            title: 'User ID',
            dataIndex: 'Report_User_ID',
            key: 'Name',
            width: 100,
            render: (name, _record) => (
                <div>

                    <span style={{ marginLeft: '8px' }}>{name}</span>
                </div>
            ),
        },
        {
            title: 'Report Donation Item ID',
            dataIndex: 'Report_Donation_Item_ID',
            key: 'Name',
            width: 100,
            render: (name, _record) => (
                <div>

                    <span style={{ marginLeft: '8px' }}>{name}</span>
                </div>
            ),
        },
        {
            title: 'Admin ID',
            dataIndex: 'Report_Admin_ID',
            key: 'Name',
            width: 100,
            render: (name, _record) => (
                <div>
                    <span style={{ marginLeft: '8px' }}>{name}</span>
                </div>
            ),
        },
        {
            title: 'Handle Status',
            key: 'Status',
            dataIndex: 'Report_Handle',
            width: 100,
            filters: [
                {
                    text: 'Processed',
                    value: '2',
                },
                {
                    text: 'Processing',
                    value: '1',
                },
                {
                    text: 'Not processed',
                    value: '0',
                },
            ],
            filterMode: 'tree',
            onFilter: (value, record) => String(record.Report_Handle) === value,
            render: reportHandle => {
                let color, statusText;

                switch (reportHandle) {
                    case 1:
                        color = 'gold'; 
                        statusText = 'Processing';
                        break;
                    case 2:
                        color = 'green';
                        statusText = 'Processed';
                        break;
                    default:
                        color = 'volcano'; 
                        statusText = 'Not processed';
                }

                return (
                    <Tag color={color} key={statusText}>
                        {statusText}
                    </Tag>
                );
            },
        },
        {
            title: 'Report Type',
            dataIndex: 'Report_Type',
            key: 'Name',
            width: 200,
            render: (name, _record) => (
                <div>

                    <span style={{ marginLeft: '8px' }}>{name}</span>
                </div>
            ),
        },
        {
            title: 'Report Date Time',
            dataIndex: 'Report_DateTime',
            key: 'Name',
            width: 200,
            render: (utcDateTime, _record) => (
                <div>
                    <span style={{ marginLeft: '8px' }}>{convertUTCtoGMT8(utcDateTime)}</span>
                </div>
            ),
        },
        {
            title: 'Reporter ID',
            dataIndex: 'Report_Reporter_ID',
            key: 'Name',
            width: 100,
            render: (name, _record) => (
                <div>
                    <span style={{ marginLeft: '8px' }}>{name}</span>
                </div>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/admin/${Login_id}/HumanReported/${record.Report_ID}/view`}>
                        <Button type="primary" style={{ backgroundColor: 'lawngreen' }}>View</Button>
                    </Link>
                </Space>
            )
        },
    ];












    return (
        <>
            <Title level={3} ><b>Human Report</b></Title>


            <Tooltip title="Refresh">
                <Button
                    shape="circle"
                    icon={<RedoOutlined />}
                    style={{ float: 'right', marginBottom: '24px' }}
                    onClick={fetchUserData}
                />
            </Tooltip>


            <Table

                columns={columns}
                dataSource={data}
            />


        </>
    )
}
