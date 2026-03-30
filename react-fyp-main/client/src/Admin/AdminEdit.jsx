import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { buildAssetUrl, buildApiUrl } from 'shared/config/env';
import { useParams } from 'react-router-dom';
import { Card, FloatButton, Button, message, Tag, Row, Col, Checkbox, Form, Input, Select, Upload, Modal } from 'antd';
import { ExclamationCircleFilled, PlusOutlined, MobileOutlined, UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';



const { confirm } = Modal;

export default function AdminEdit() {

    const { admin_id } = useParams();
    const [form] = Form.useForm();
    const [admin, setAdmin] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [_adminPermissions, setAdminPermissions] = useState([]);
    const [isBanned, setIsBanned] = useState();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        axios.get(`/admin/${admin_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                setAdmin(res.data);

                const permissions = [];
                if (res.data.Admin_Permission_User === 1) {
                    permissions.push('user');
                }
                if (res.data.Admin_Permission_Admin === 1) {
                    permissions.push('admin');
                }
                if (res.data.Admin_Permission_Analysis === 1) {
                    permissions.push('analysis');
                }
                if(res.data.Admin_Permission_Donate === 1){
                    permissions.push('donate');
                }
                if(res.data.Admin_Permission_Announcement === 1){
                    permissions.push('announcement');
                }

                if(res.data.Admin_Permission_Violation === 1){
                    permissions.push('violation');
                }




                form.setFieldsValue({
                    Admin_Name: res.data.Admin_Name,
                    Admin_Job_Title: res.data.Admin_Job_Title,
                    Admin_Contact_Number: res.data.Admin_Contact_Number,
                    Admin_Email: res.data.Admin_Email,
                    'permission-group': permissions
                });

                setAdminPermissions(permissions);

            })
            .catch(err => {
                console.error(err);
            });
    }, [admin_id, form]); // Dependency array for useEffect

    // While the admin details are loading, display a loading message
    if (!admin) {
        return <div>Can not find admin details...</div>;
    }



    const onFinish = (values) => {
        console.log(values);

        const formData = new FormData();
        Object.keys(values).forEach(key => {
            formData.append(key, values[key]);
        });

        // Append the image file to formData
        if (fileList.length > 0) {
            formData.append("Admin_Photo", fileList[0].originFileObj);
        }

        axios
            .post(`/editadmindata/${admin_id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,// 'token' 是你的 JWT
                    'Content-Type': 'multipart/form-data',
                }
            })
            .then(res => {
                console.log(res.data);
                //resetForm();
                //form.resetFields();
                message.success(res.data.msg); // Display success message
            })
            .catch(err => {
                console.error(err);
                if (err.response) {
                    // Server responded with a status other than 200 range
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                    message.error(err.response.data.msg); // Display error message
                } else if (err.request) {
                    // The request was made but no response was received
                    console.log(err.request);
                    message.error('No response from server'); // Display error message
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', err.message);
                    message.error('Error occurred while setting up request'); // Display error message
                }
                console.log(err.config);
            });
    };

    const handleBan = (_values) => {
        let messageTitle = '';
        let messageSuccess = '';
        let messageFail = '';
        if (admin.Admin_Suspended === 0) {
            messageTitle = 'Are you sure ban this account?';
            messageSuccess = 'Successfully ban this account.';
            messageFail = 'Failed to ban this account.';
        } else {
            messageTitle = 'Are you sure unban this account?';
            messageSuccess = 'Successfully unban this account.';
            messageFail = 'Failed to unban this account.';
        }


        confirm({
            title: messageTitle,
            icon: <ExclamationCircleFilled />,
            //content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setIsLoading(true);
                const adminID = admin.Admin_ID;
                const adminSuspended = admin.Admin_Suspended;
                axios
                    .post('/updateadminstatus', { adminID, adminSuspended }, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    .then(res => {
                        console.log(res.data);

                        setIsBanned(adminSuspended === 0); // Update isBanned based on the previous state
                        setAdmin(prevAdmin => ({ ...prevAdmin, Admin_Suspended: adminSuspended === 0 ? 1 : 0 }));
                        message.success(messageSuccess);
                        setIsLoading(false);
                    })
                    .catch(err => {
                        console.error(err);
                        message.error(messageFail);
                        setIsLoading(false);
                    });


            },
            onCancel() {
                console.log('Cancel');
            },
        });



    };



    const normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const beforeUpload = file => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );


    return (

        <Form
            form={form}
            name="register"
            onFinish={onFinish}
            scrollToFirstError
            colon={false}
        >
            <div style={{ marginLeft: '20px' }} >
                <h1 >Admin Data Edit</h1>
                <Card hoverable>

                    <table style={{ width: "100%" }}>
                        <tr>
                            <td rowSpan="2" style={{ width: "10%", verticalAlign: 'top' }} >
                                <Form.Item
                                    name="Admin_Photo"
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                >
                                    <Upload
                                        name="Admin_Photo"
                                        listType="picture-card"
                                        showUploadList={false}
                                        action={buildApiUrl('/upload')}
                                        beforeUpload={beforeUpload}
                                        onChange={(info) => {
                                            if (info.fileList.length > 1) {
                                                info.fileList.splice(0, info.fileList.length - 1); // 只保留最后一个文件
                                            }
                                            setFileList(info.fileList);
                                        }}
                                    >
                                        {fileList.length > 0 ? (
                                            <img src={URL.createObjectURL(fileList[0].originFileObj)} alt="Admin" style={{ width: '100%' }} />
                                        ) : admin.Admin_Photo ? (
                                            <img src={buildAssetUrl(admin.Admin_Photo)} alt="Admin" style={{ width: '100%' }} />
                                        ) : (
                                            uploadButton
                                        )}
                                    </Upload>
                                </Form.Item>


                            </td>
                            <td style={{ paddingLeft: '3%' }}><b>Admin Name</b><br />

                                <Form.Item
                                    name="Admin_Name"


                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter admin name',
                                        },
                                        {
                                            max: 30,
                                            message: 'Admin Name cannot be more than 30 characters',
                                        },
                                    ]}
                                >
                                    <Input style={{ width: '50%' }} placeholder="Admin Name" />
                                </Form.Item>

                            </td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: '3%' }}><b>Job Title</b><br />

                                <Form.Item
                                    name="Admin_Job_Title"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please select your job title!',
                                        },
                                    ]}
                                >
                                    <Select style={{ width: '40%' }} placeholder="Select a job title">
                                        <Select.Option value="Admin">Admin</Select.Option>
                                        <Select.Option value="Customer service staff">Customer service staff</Select.Option>

                                    </Select>
                                </Form.Item>

                            </td>
                        </tr>
                    </table>



                    <Row style={{ marginBottom: '2%' }}>
                        <Col span={10}>
                            <div>Account Details</div>
                            <div style={{ marginLeft: '0.5%', marginTop: '3%', marginBottom: '3%' }}><UserOutlined /> ID:{' '}{admin.Admin_ID} </div>
                            <div style={{ marginLeft: '0.5%', marginTop: '3%' }}><CalendarOutlined /> Create Date:{' '} {
                                (() => {
                                    const date = new Date(admin.Admin_Create_Date);
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const year = date.getFullYear();
                                    return `${day}.${month}.${year}`;
                                })()
                            }
                            </div>
                            <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '2%' }}>
                                <Tag color={admin.Admin_Suspended === 0 ? 'green' : 'volcano'}>
                                    {admin.Admin_Suspended === 0 ? 'ACTIVE' : 'SUSPENDED'}
                                </Tag>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div>Admin Permissions</div>
                            <div style={{ marginLeft: '0.5%', marginTop: '3%', marginBottom: '3%' }}>
                                <Form.Item
                                    name="permission-group"

                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please select at least one permission',
                                            type: 'array',
                                            min: 1,
                                        }
                                    ]}
                                >
                                    <Checkbox.Group>
                                        <Checkbox value="user">user</Checkbox>
                                        <Checkbox value="admin">admin</Checkbox>
                                        <Checkbox value="donate">donate</Checkbox>
                                        <Checkbox value="announcement">announcement</Checkbox>
                                        <Checkbox value="violation">violation</Checkbox>
                                        <Checkbox value="analysis">analysis</Checkbox>
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>


                    <div style={{ marginTop: '1.5%', marginBottom: '1%' }}>Contact</div>
                    <div style={{ marginLeft: '0.5%', marginBottom: '1%' }}>
                        <Form.Item
                            name="Admin_Contact_Number"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter contact number',
                                },
                                {
                                    pattern: new RegExp(/^[0-9\b]+$/),
                                    message: 'Please enter a valid contact number',
                                },
                                {
                                    max: 8,
                                    message: 'Contact number cannot exceed 8 characters',
                                },
                                {
                                    min: 8,
                                    message: 'Contact number must be at least 8 characters long',
                                },
                            ]}
                        >
                            <Input style={{ width: '35%' }} prefix={<MobileOutlined />} placeholder="E.g:12345678" />
                        </Form.Item>

                    </div>
                    <div style={{ marginLeft: '0.5%', marginBottom: '2%' }}>
                        <Form.Item
                            name="Admin_Email"
                            rules={[
                                {
                                    type: 'email',
                                    message: 'The email entered is invalid',
                                },
                                {
                                    required: true,
                                    message: 'Please enter email',
                                },
                            ]}
                        >
                            <Input style={{ width: '35%' }} prefix={<MailOutlined />} placeholder="E.g:Admin@gmail.com" />
                        </Form.Item>

                        <Form.Item className="form-item-center">
                            <Button type="primary" htmlType="submit">
                                Update
                            </Button>

                            <Button type="primary" danger onClick={handleBan} style={{ marginLeft: '10px' }} disabled={isLoading}>
                                {isBanned ? 'Unban' : 'Ban'}
                            </Button>
                        </Form.Item>


                    </div>
                </Card>
            </div>
            <FloatButton.Group >

                <FloatButton.BackTop visibilityHeight={10} />
            </FloatButton.Group>
        </Form>
    )
}
