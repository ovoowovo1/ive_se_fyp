import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { Table, Button, Space, Tag, Modal, Input, Select, Typography, Tooltip, Divider } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';


export default function AlDetectedList() {
    const _Login_id = localStorage.getItem('Login_id');
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchColumn, setSearchColumn] = useState('ID');
    const [_isLoading, _setIsLoading] = useState(false);

    const [pageSize, setPageSize] = useState(5);

    const showModal = (record) => {
        showInfoModal(record); // Pass the record directly to the function
    };



    const showInfoModal = (record) => {
        console.log(record.Text_Content);
        Modal.info({
            title: 'Details',
            content: (
                <div>

                    <>
                        <p>ID: {record.ID}</p>
                        <p>User ID: {record.User_ID}</p>
                        <p>Checktime: {dayjs(record.Checktime).format('YYYY-MM-DD HH:mm:ss')}</p>
                        <p>Block :
                            <Tag color={record.Block === 0 ? 'green' : 'red'} >
                                {record.Block === 0 ? 'Unblocked' : 'Blocked'}
                            </Tag>
                        </p>
                        <Divider />
                        <p>Text_Hate: {getTextHateTag(record.Text_Hate)}</p>
                        <p>Text_SelfHarm: {getTextHateTag(record.Text_SelfHarm)}</p>
                        <p>Text_Sexual: {getTextHateTag(record.Text_Sexual)}</p>
                        <p>Text_Violence: {getTextHateTag(record.Text_Violence)}</p>
                        <p style={{ whiteSpace: 'pre-wrap' }}>Content: {record.Text_Content}</p>
                    </>

                </div>
            ),
            onOk() { },
            okText: 'OK',
            // Modal.info does not support a footer prop like Modal does, so customization here is limited
        });
    };

    const getTextHateTag = (textHateValue) => {
        let color = 'green';
        let text = 'Safe';

        switch (textHateValue) {
            case 0:
                color = 'green';
                text = 'Safe';
                break;
            case 2:
                color = 'gold';
                text = 'Low';
                break;
            case 4:
                color = 'orange';
                text = 'Medium';
                break;
            case 6:
                color = 'red';
                text = 'High';
                break;
            default:
                color = 'default';
                text = 'Unknown';
        }

        return <Tag color={color}>{text}</Tag>;
    };


    const handleTableChange = (pagination) => {
        setPageSize(pagination.pageSize);
    };

    const { Text, Title } = Typography;


    const judgement = [
        {
            text: 'Safe',
            value: '0',
        },
        {
            text: 'Low',
            value: '2',
        },
        {
            text: 'Medium',
            value: '4',
        },
        {
            text: 'High',
            value: '6',
        },
    ];



    useEffect(() => {
        axios.get('/getTextResultData', {
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


        axios.get('/getTextResultData', {
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


    // Use the fetchUserData function in your useEffect hook
    useEffect(() => {
        fetchUserData();
    }, []);


    function generateColumnDefinition(title, dataIndex, judgement) {
        return {
            title: title,
            key: dataIndex,
            dataIndex: dataIndex,
            width: 80,
            filters: judgement,
            filterMode: 'tree',
            onFilter: (value, record) => String(record[dataIndex]) === value,
            render: (value) => {
                // Ensure value is a string for comparison
                const valueStr = String(value);

                // Find the judgement corresponding to the value
                const judgementObj = judgement.find(j => j.value === valueStr);

                let color = 'green'; // Default color
                let statusText = judgementObj ? judgementObj.text : 'UNKNOWN'; // Set statusText based on judgementObj

                // Determine the color based on the status text
                switch (statusText) {
                    case 'Low': color = 'gold'; break;
                    case 'Medium': color = 'orange'; break;
                    case 'High': color = 'red'; break;
                    case 'Safe': color = 'green'; break;
                    default: break; // Keep default color if not matched
                }

                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Tag color={color} key={statusText}>
                            {statusText}
                        </Tag>
                    </div>
                );
            },
        };
    }




    const columns = [
        {
            title: 'ID',
            dataIndex: 'ID',
            key: 'ID',
            width: 80,
            sorter: (a, b) => a.ID > b.ID,
        },
        {
            title: 'Checktime',
            dataIndex: 'Checktime',
            key: 'Checktime',
            width: 150,
            render: (name, _record) => (
                <div>
                    {/* Format date using dayjs */}
                    <span style={{ marginLeft: '8px' }}>{dayjs(name).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
            ),
        },
        {
            title: 'User ID',
            dataIndex: 'User_ID',
            key: 'User_ID',
            width: 150,
            render: (name, _record) => (
                <div>
                    <span style={{ marginLeft: '8px' }}>{name}</span>
                </div>
            ),
        },
        {
            title: 'Block',
            dataIndex: 'Block',
            key: 'Block',
            width: 100,
            filters: [
                { text: 'Blocked', value: '1' },
                { text: 'Unblocked', value: '0' },
            ],
            onFilter: (value, record) => record.Block.toString() === value,
            render: (name, _record) => (
                <div>
                    <Tag color={name === 0 ? 'green' : 'red'} >
                        {name === 0 ? 'Unblocked' : 'Blocked'}
                    </Tag>
                </div>
            ),
        },
        generateColumnDefinition('Text_Hate', 'Text_Hate', judgement),
        generateColumnDefinition('Text_SelfHarm', 'Text_SelfHarm', judgement),
        generateColumnDefinition('Text_Sexual', 'Text_Sexual', judgement),
        generateColumnDefinition('Text_Violence', 'Text_Violence', judgement),
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => showModal(record)} style={{ backgroundColor: 'lawngreen' }}>View</Button>
                </Space>
            )
        },
    ];

    const searchOptions = [
        { value: 'ID', label: 'ID' },
        { value: 'User_ID', label: 'User ID' },
        // Add other columns here if needed
    ];



    const filteredData = data.filter(item =>
        String(item[searchColumn]).toLowerCase().includes(searchText.toLowerCase())
    );


    return (
        <>

            <Title level={3} ><b>AI Text Detected</b></Title>


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

            <Tooltip title="Refresh">
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
