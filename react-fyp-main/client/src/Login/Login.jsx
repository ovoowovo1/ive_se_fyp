import React, { useState, useEffect } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'shared/api/http';
import { useAuth } from 'shared/auth/useAuth';
import { clearSession } from 'shared/auth/session';

import loginLeftImg from '../IMG/loginLeftImg.png';


export default function NewLogin() {
  const [_username, setUsername] = useState('');
  const [_password, setPassword] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearSession();
  }, []);


  const onFinish = async (values) => {
    setUsername(values.username);
    setPassword(values.password);
    setLoading(true);

    try {

      const response = await axios.post('/login', {
        username: values.username,
        password: values.password
      });

      // If request is successful
      if (response.data.status === 200) {
        signIn(response.data);
        success(); // display success message
        setTimeout(() => {
          navigate(`/admin/${response.data.Login_id}/`); // navigate to some path after login
        }, 500);
      } else {
        // If request is not successful, display the error message from response
        message.error(response.data.msg);
        setLoading(false);
      }

    } catch (error) {
      setLoading(false);
      // If there is an error in the request, display a generic error message
      console.error(error);
      message.error('An error occurred. Please try again.');
    }
  };

  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Login Successful',
    });
  };

  return (
    <>
      {contextHolder}
      <div className="logincontainer">
        <div className="image">
          <img className="loginIMG" src={loginLeftImg} alt="Login visual" />
        </div>
        <div className="login">
          <div className="loginbox">
            <center style={{ marginBottom: '20px' }}> <img style={{ width: '50%' }} src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="Brand logo" /></center>


            <Form
              name="normal_login"
              className="login-form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <h2>Login</h2>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your Username!' }]}
              >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} style={{ width: '100%' }} placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Password"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>


              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }} loading={loading}  >
                  Log in
                </Button>

              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}
