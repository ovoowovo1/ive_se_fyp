import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';
import { Avatar, Input, Table, Button, Space, Tag, message, Modal, Select , Typography } from 'antd';
import { Link } from 'react-router-dom';




const { Title } = Typography;


function GroupUserList() {
  const [data, setData] = useState([]);
  const Login_id = localStorage.getItem('Login_id');
  const [searchColumn, setSearchColumn] = useState('ID');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    axios.get('/', {
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



  const updateUserStatus = ({ id, status }) => {
    Modal.confirm({
      title: 'Do you want to update the status?',
      content: 'If you click OK, the status will be updated.',
      onOk() {
        axios
          .post('/updateuserstatus', { id, status }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then(res => {
            console.log(res.data);
            fetchUserData();
            success();
          })
          .catch(err => {
            console.error(err);
          });
      },
      onCancel() {
        console.log('Cancelled');
      },
    });
  };



  const fetchUserData = () => {


    axios.get('/', {
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

  // Use the fetchUserData function in your useEffect hook
  useEffect(() => {
    fetchUserData();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'ID',
      width: 150,
      sorter: (a, b) => a.ID - b.ID,
    },
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
      width: 300,
      render: (text, record) => {
        let photoUrl = buildAssetUrl('default-avatar.png');

        if (record.User_image) {
          photoUrl = buildAssetUrl(record.User_image);
        }

        return (
          <Space>
            <Avatar src={photoUrl} alt="Admin photo" />
            <span>{text}</span>
          </Space>
        );
      },
    }, {
      title: 'Status',
      key: 'Status',
      dataIndex: 'is_suspended',
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
      onFilter: (value, record) => String(record.is_suspended) === value,
      render: is_suspended => {
        let color = is_suspended ? 'volcano' : 'green';
        let statusText = is_suspended ? 'SUSPENDED' : 'ACTIVE';
        return (
          <Tag color={color} key={statusText}>
            {statusText}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/admin/${Login_id}/${record.ID}/user/edit`}>
            <Button type="primary" style={{ backgroundColor: 'Gold' }}>Edit</Button>
          </Link>
          <Link to={`/admin/${Login_id}/${record.ID}/user/view`}>
            <Button type="primary" style={{ backgroundColor: 'lawngreen' }}>View</Button>
          </Link>
          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={() => updateUserStatus({ id: record.ID, status: Number(record.is_suspended) })}
          >
            {String(record.is_suspended) === '1' ? 'Unban' : 'Ban'}
          </Button>
        </Space>
      )
    },
  ];


  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'You have successfully chaged ths account status',
    });
  };


  const { Search: _Search } = Input;
  const searchOptions = [
    { value: 'ID', label: 'ID' },
    { value: 'Name', label: 'Name' },
    // Add other columns here if needed
  ];


  const filteredData = data.filter(item =>
    String(item[searchColumn]).toLowerCase().includes(searchText.toLowerCase())
  );



  return (
    <>
      {contextHolder}
      <Title level={3} ><b>Group User</b></Title>

      <Space style={{ marginBottom: 20 }}>
        Column:
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
        Key word:
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
        pagination={{ pageSize: 5, }}
        bordered
      />
      </>
  );
}

export default GroupUserList;
