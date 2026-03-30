import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'shared/api/http';
import { useNavigate } from 'react-router-dom';


export default function Login() {



    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_id');
        localStorage.removeItem('Admin_Permission_User');
        localStorage.removeItem('Admin_Permission_Admin');
        localStorage.removeItem('Admin_Permission_Analysis');
    }, []);

    const navigate = useNavigate();


    // 用于存储用户输入的用户名和密码
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    const onFinish = async () => {
        try {
            const response = await axios.post('http://localhost:8081/login', {
                username,
                password
            });

            // If request is successful
            if (response.data.status === 200) {
                // You can store the token in local storage to keep the user logged in
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('Login_id', response.data.Login_id);
                // Store permissions in local storage
                localStorage.setItem('Admin_Permission_User', response.data.Admin_Permission_User);
                localStorage.setItem('Admin_Permission_Admin', response.data.Admin_Permission_Admin);
                localStorage.setItem('Admin_Permission_Analysis', response.data.Admin_Permission_Analysis);

                success(); // display success message
                setTimeout(() => {
                    navigate(`/admin/${response.data.Login_id}/`); // navigate to some path after login
                }, 500);
            } else {
                // If request is not successful, display the error message from response
                message.error(response.data.msg);
            }
        } catch (error) {
            // If there is an error in the request, display a generic error message
            console.error(error);
            message.error('An error occurred. Please try again.');
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };




    const [messageApi, contextHolder] = message.useMessage();
    const success = () => {
        messageApi.open({
            type: 'success',
            content: 'success message',
        });
    };

    const _error = () => {
        messageApi.open({
            type: 'error',
            content: 'This is an error message',
        });
    };

    return (
        <>
            {contextHolder}
            <div className="container">
                <Form
                    name="basic"
                
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    onValuesChange={(_, allValues) => {
                        setUsername(allValues.username);
                        setPassword(allValues.password);
                    }}
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>


                    <Form.Item
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
}
