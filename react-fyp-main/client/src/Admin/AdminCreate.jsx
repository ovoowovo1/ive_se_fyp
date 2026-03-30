import React, { useState } from 'react';
import {Typography, Card, Upload, message, Form, Input, Button, Select, Checkbox, Row, Col } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'shared/api/http';
import { useTranslation } from 'react-i18next';



const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must be smaller than 2MB 2MB!');
    }
    return isJpgOrPng && isLt2M;
}

const AdminCreate = () => {
    const { t, i18n: _i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const { Title } = Typography;

    const handleChange = info => {
        setFileList(info.fileList);

        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, imageUrl => {
                setImageUrl(imageUrl);
                setLoading(false);
            });
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} File upload failed.`);
            setLoading(false);
        }
    };

    const customRequest = ({ file }) => {
        getBase64(file, imageUrl => {
            setImageUrl(imageUrl);
            setLoading(false);
        });
    }

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>upload</div>
        </div>
    );

    const resetForm = () => {
        form.resetFields();
        setFileList([]);
        setImageUrl('');
    };

    const onFinish = (values) => {
        console.log(values);

        const formData = new FormData();
        Object.keys(values).forEach(key => {
            formData.append(key, values[key]);
        });

        // Append the image file to formData
        formData.append('Admin_Photo', fileList[0].originFileObj);
        axios
            .post('/createadmin', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,// 'token' 是你的 JWT
                    'Content-Type': 'multipart/form-data',
                }
            })
            .then(res => {
                console.log(res.data);
                resetForm();
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

    return (
        <>
            <Title level={3} ><b>{t('Create Admin Account')}</b></Title>
 
            <Card className='shadow'>
                <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    scrollToFirstError
                    layout="vertical"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',


                    }}
                >



                    <Form.Item
                        name="Admin_Photo"
                        className="form-item-center"
                        label={<span>{t('Admin Photo')}</span>}
                    >

                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={handleChange}
                            customRequest={customRequest}
                            fileList={fileList}
                        >
                            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%', borderRadius: '50%' }} /> : uploadButton}
                        </Upload>
                    </Form.Item>


                    <Form.Item
                        name="Admin_ID"
                        label={<span className="required-star">{t('Admin ID')}</span>}
                        rules={[
                            {
                                required: true,
                                message: 'Please enter  Admin ID',
                            },
                            {
                                max: 10,
                                message: 'Admin ID cannot exceed 10 characters',
                            },
                        ]}
                    >
                        <Input placeholder="Admin ID" />
                    </Form.Item>



                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="Admin_Name"

                                label={<span className="required-star">{t('Admin Name')}</span>}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter admin name',
                                    },
                                    {
                                        max: 30,
                                        message: 'Admin Name cannot exceed 30 characters',
                                    },
                                ]}
                            >
                                <Input placeholder="Admin Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>


                            <Form.Item
                                name="Admin_Job_Title"
                                label={t('Job Title')}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select your job title!',
                                    },
                                ]}
                            >
                                <Select placeholder="Select a job title">
                                    <Select.Option value="Admin">Admin</Select.Option>
                                    <Select.Option value="Customer service staff">Customer service staff</Select.Option>

                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>





                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="Admin_Contact_Number"

                                label={<span className="required-star">{t('Admin Contact Number')}</span>}
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
                                <Input placeholder="E.g 12345678" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Admin_Email"
                                label={<span className="required-star">{t('Email')}</span>}
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
                                <Input placeholder="email" />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="Admin_Password"
                                label={<span className="required-star">{t('Password')}</span>}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter password',
                                    },
                                    {
                                        min: 6,
                                        message: 'Password length must be at least 6 characters',
                                    },
                                ]}
                                hasFeedback
                            >
                                <Input.Password placeholder="password" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="confirm"
                                label={<span className="required-star">{t('Confirm Password')}</span>}
                                dependencies={['Admin_Password']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please confirm password',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('Admin_Password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The passwords entered twice do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="confirmpassword" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="permission-group"
                        label={t('Admin Permission')}

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
                            <Checkbox value="user">{t('user')}</Checkbox>
                            <Checkbox value="admin">{t('admin')}</Checkbox>
                            <Checkbox value="donate">{t('donate')}</Checkbox>
                            <Checkbox value="announcement">{t('announcement')}</Checkbox>
                            <Checkbox value="violation">{t('violation')}</Checkbox>
                            <Checkbox value="analysis">{t('analysis')}</Checkbox>
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item className="form-item-center">
                        <Button type="primary" htmlType="submit">
                        {t('Create')}
                        </Button>
                    </Form.Item>

                </Form>
            </Card>


        </>
    );
}

export default AdminCreate;