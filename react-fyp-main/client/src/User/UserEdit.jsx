import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { buildAssetUrl, buildApiUrl } from 'shared/config/env';
import { useParams } from 'react-router-dom';
import { Modal, Tag, Row, Col, Rate, Radio, Select, DatePicker, Card, Upload, message ,Typography } from 'antd';
import { MobileOutlined, UserOutlined, MailOutlined, CalendarOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

import BirthdayCakeIcon from '../IMG/BirthdayCakeIcon';

import { Form, Input, Button } from 'antd';
const { confirm: _confirm } = Modal;
const { Option } = Select;
const { Text: _Text, Title } = Typography;


export default function UserEdit() {

    const { user_id } = useParams();
    const [user, setUser] = useState(null);
    const [formInitialValues, setFormInitialValues] = useState({});
    const [fileList, setFileList] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const locations = [
        { label: 'China', value: 'China' },
        { label: 'China(Hong Kong)', value: 'China(Hong Kong)' },
        // ... more locations ...
    ];

    const onFinish = (values) => {
        console.log(values);
        setIsSubmitting(true); // Disable the button when submitting

        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (key === 'User_Birthday' && values[key]) {
                // Format the date to 'YYYY-MM-DD' before appending
                formData.append(key, values[key].format('YYYY-MM-DD'));
            } else {
                formData.append(key, values[key]);
            }
        });

        // Append the image file to formData
        if (fileList.length > 0) {
            formData.append("User_image", fileList[0].originFileObj);
        }

        axios
            .post(`/editUserdata/${user_id}`, formData, {
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
                setIsSubmitting(false); // Re-enable the button after response
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
                setIsSubmitting(false); // Re-enable the button after response
                console.log(err.config);
            });
    };


    useEffect(() => {
        // Fetch the admin details when the component mounts
        axios.get(`/user/${user_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                const fetchedUser = res.data;
                setUser(fetchedUser);
                setFormInitialValues({
                    Name: fetchedUser.Name,
                    User_Contact_Number: fetchedUser.User_Contact_Number,
                    User_Location: fetchedUser.User_Location,
                    User_Email: fetchedUser.User_Email,
                    User_Birthday: fetchedUser.User_Birthday ? moment(fetchedUser.User_Birthday) : null,
                    User_Gender: fetchedUser.User_Gender,
                    User_AboutMe: fetchedUser.User_AboutMe,

                });

                if (fetchedUser.User_image) {
                    const initialFileList = [{
                        uid: '-1', // Unique identifier, you can set your own
                        name: 'image.png', // File name, you can set according to your file
                        status: 'done', // Status should be 'done' to show as uploaded
                        url: buildAssetUrl(fetchedUser.User_image), // File URL
                    }];
                    setFileList(initialFileList);
                }
                console.log(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }, [user_id]); // Dependency array for useEffect

    // While the user details are loading, display a loading message
    if (!user) {
        return <div>Loading user details...</div>;
    }

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
        <>
          <Title level={3} style={{marginBottom:'10px'}}><b>Edit User Data</b></Title>
            <Card hoverable  >
                <Form
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={formInitialValues}
                >
                    <table>
                        <tbody>
                            <tr>
                                <td rowSpan="2" style={{ width: "10%" }} >
                                    <Form.Item name="userImage" valuePropName="fileList" getValueFromEvent={normFile}>
                                        <Upload
                                            listType="picture-card"
                                            name="userImage"
                                            showUploadList={false}
                                            action={buildApiUrl('/upload')} // Replace with your upload path
                                            beforeUpload={beforeUpload}
                                            onChange={(info) => {
                                                if (info.fileList.length > 1) {
                                                    info.fileList.splice(0, info.fileList.length - 1); // 只保留最后一个文件
                                                }
                                                setFileList(info.fileList);
                                            }}
                                        >

                                            {
                                                fileList.length > 0 && fileList[0].originFileObj ? (
                                                    <img src={URL.createObjectURL(fileList[0].originFileObj)} alt="User" style={{ width: '100%' }} />
                                                ) : user.User_image ? (
                                                    <img src={buildAssetUrl(user.User_image)} alt="User" style={{ width: '100%' }} />
                                                ) : (
                                                    uploadButton
                                                )
                                            }

                                        </Upload>
                                    </Form.Item>


                                </td>
                                <td style={{ paddingLeft: '3%', width: "90%" }}><b>User Name</b><br />
                                    <Form.Item name="Name">
                                        <Input prefix={<UserOutlined />} style={{ width: '50%' }} />
                                    </Form.Item>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '3%' }}><Rate disabled allowHalf defaultValue={3.5} />
                                    <br />asdasd
                                </td>
                            </tr>
                        </tbody>
                    </table>


                    <Row style={{ marginTop: '3%', marginBottom: '3%' }}>
                        <Col span={20}>
                            <div><b>Account Details</b></div>
                            <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '3%' }}><UserOutlined /> ID:{' '}{user.ID} </div>
                            <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '3%' }}><CalendarOutlined /> Create Date:{' '} {
                                (() => {
                                    const date = new Date(user.User_Create_Date);
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const year = date.getFullYear();
                                    return `${day}.${month}.${year}`;
                                })()
                            }
                            </div>



                            <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '2%' }}>
                                <Tag color={user.is_suspended === 0 ? 'green' : 'volcano'}>
                                    {user.user === 0 ? 'ACTIVE' : 'SUSPENDED'}
                                </Tag>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: '3%', marginBottom: '4%' }}><b>Contact</b></div>


                    <div style={{ marginLeft: '1%', marginBottom: '3%' }}>
                        <Form.Item name="User_Contact_Number" >
                            <Input prefix={<MobileOutlined />} style={{ width: '40%' }} />
                        </Form.Item>
                    </div>
                    <div style={{ marginLeft: '1%', marginBottom: '6%' }}>
                        <Form.Item name="User_Email" >
                            <Input prefix={<MailOutlined />} style={{ width: '40%' }} />
                        </Form.Item>
                    </div>

                    <div style={{ marginTop: '3%', marginBottom: '2%' }}><b>Peronsal Data</b></div>

                    <div style={{ marginLeft: '1%', marginTop: '3%', marginBottom: '3%' }}>
                        <Form.Item name="User_Location" label={<span><EnvironmentOutlined style={{ width: '1em', height: '1em' }} />Location</span>} style={{ marginLeft: '1%' }}>
                            <Select
                                name="User_Location"
                                placeholder="Select a location"
                                allowClear
                                style={{ width: '40%' }}
                            >
                                {locations.map(loc => (
                                    <Option key={loc.value} value={loc.value}>{loc.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                    </div>

                    <div style={{ marginLeft: '1%', marginBottom: '3%' }}>
                        <Form.Item name="User_Birthday" label={<span><BirthdayCakeIcon style={{ width: '1em', height: '1em' }} /> Birthday</span>} style={{ marginLeft: '1%' }}>
                            <DatePicker
                                format="DD.MM.YYYY"
                            />
                        </Form.Item>


                    </div>


                    <div style={{ marginLeft: '1%', marginBottom: '5%' }}>

                        <Form.Item name="User_Gender" label="Gender" style={{ marginLeft: '1%' }}>
                            <Radio.Group>
                                <Radio value="Male">Male</Radio>
                                <Radio value="Female">Female</Radio>
                                {/* Add more options if needed */}
                            </Radio.Group>
                        </Form.Item>


                        <div style={{ marginLeft: '1%', marginBottom: '3%' }}>
                            {/* Replace this with the actual about me content */}
                            <Form.Item name="User_AboutMe" label="About Me">
                                <Input.TextArea rows={8} maxLength={300} showCount />
                            </Form.Item>
                        </div>
                    </div>

                    <center>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isSubmitting} >
                                Save Changes
                            </Button>
                        </Form.Item>
                    </center>

                </Form>
            </Card>
        </>
    )
}
