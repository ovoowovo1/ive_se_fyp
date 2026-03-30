import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { Typography, Table, Button, Space, Tag, message, Modal, Input, Select } from 'antd';
import { Link } from 'react-router-dom';
import { ExclamationCircleFilled } from '@ant-design/icons';




export default function History() {
    const { Title, Text } = Typography;

    const Login_id = localStorage.getItem('Login_id');
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchColumn, setSearchColumn] = useState('Announcement_ID');
    const [_isLoading, _setIsLoading] = useState(false);

    const [_sortOrder, _setSortOrder] = useState(null);
    const [_sortField, _setSortField] = useState(null);

    const [pageSize, setPageSize] = useState(5);

    const handleTableChange = (pagination) => {
        setPageSize(pagination.pageSize);
    };


    useEffect(() => {
        axios.post('/AllAnnouncementData', {}, {
            headers: {
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


    const updateAnnouncementStatus = (announcementId, status) => {
        Modal.confirm({
            title: 'Are you sure?',
            icon: <ExclamationCircleFilled />,
            content: 'Do you really want to change the status of this announcement?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                axios.post('/AdminUpdateAnnouncementStatus', {
                    Announcement_ID: announcementId,
                    Announcement_On_Shelf_Status: status,
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                    .then(_response => {
                        message.success('Announcement status updated successfully.');
                        const updatedData = data.map(item => {
                            if (item.Announcement_ID === announcementId) {
                                return { ...item, Announcement_On_Shelf_Status: status };
                            }
                            return item;
                        });
                        setData(updatedData);
                    })
                    .catch(error => {
                        message.error('An error occurred while updating the announcement status.');
                        console.error(error);
                    });
            },
        });
    };








    const columns = [
        {
            title: 'ID',
            dataIndex: 'Announcement_ID',
            key: 'ID',
            sorter: (a, b) => a.Announcement_ID - b.Announcement_ID,
        },
        {
            title: 'Admin ID',
            dataIndex: 'Announcement_AdminID',
            key: 'Admin_ID',
        },
        {
            title: 'Title',
            dataIndex: 'Announcement_Title',
            key: 'Title',
        },
        {
            title: 'Date & Time',
            dataIndex: 'Announcement_DateTime',
            key: 'Date_Time',
            render: (text, _record) => {
                const dateTime = new Date(text);
                return dateTime.toLocaleString(); // Format the date and time
            },
        },
        {
            title: 'On Shelf Status',
            dataIndex: 'Announcement_On_Shelf_Status',
            key: 'On_Shelf_Status',
            filters: [
                { text: 'On Shelf', value: '1' },
                { text: 'Off Shelf', value: '0' }, // Assuming '0' represents "Off Shelf"
            ],
            onFilter: (value, record) => record.Announcement_On_Shelf_Status === value,
            render: (text, _record) => {
                return text === '1' ? <Tag color='green'>On Shelf</Tag> : <Tag color='red'>Off Shelf</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">

                    <Link to={`/admin/${Login_id}/announcement/edit/${record.Announcement_ID}`}><Button type="primary" style={{ backgroundColor: 'Gold' }} >Edit</Button></Link>

                    <Link to={`/admin/${Login_id}/announcement/view/${record.Announcement_ID}`}><Button type="primary" style={{ backgroundColor: 'lawngreen' }} >View</Button></Link>

                    {record.Announcement_On_Shelf_Status !== '0' && (
                        <Button
                            type="primary"
                            style={{ backgroundColor: 'red' }}
                            onClick={() => updateAnnouncementStatus(record.Announcement_ID, '0')}
                        >
                            Hide
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const searchOptions = [
        { value: 'Announcement_ID', label: 'ID' },
        { value: 'Announcement_AdminID', label: 'Admin ID' },
        { value: 'Announcement_Title', label: 'Title' },
    ];

    const filteredData = data.filter(item =>
        String(item[searchColumn]).toLowerCase().includes(searchText.toLowerCase())
    );




    return (
        < >
            <Title level={3} ><b>Announcement Data</b></Title>

            <Space style={{ marginBottom: 20 }}>
                <Text>Column:</Text>
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
                <Text>Key word:</Text>
                <Input.Search
                    placeholder={`Search ${searchOptions.find(option => option.value === searchColumn).label}`}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
            </Space>

            <Table
                columns={columns}
                dataSource={filteredData}
                bordered
                pagination={{ pageSize: pageSize, showSizeChanger: true, pageSizeOptions: ['5', '10', '15', '20'] }}
                onChange={handleTableChange}
            />
        </ >
    )
}
