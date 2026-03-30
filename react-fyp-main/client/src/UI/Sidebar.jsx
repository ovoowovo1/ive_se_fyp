import React, { useState, useEffect } from 'react'
import { LockOutlined, UserOutlined, SafetyOutlined } from '@ant-design/icons';
import { message, Menu, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'shared/api/http';
import { useAuth } from 'shared/auth/useAuth';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}




export default function Sidebar() {
  const { Login_id } = useParams();
  const { permissions, signOut } = useAuth();


  const logout = () => {
    axios.get(`/logout/${Login_id}`)
      .then(() => {
        signOut();
        navigate('/');  // Move this below setIsLogged(false)
      })
      .catch(err => console.error(err));
  };



  const items = [
    getItem('User', 'sub1', permissions.user === '1' ? <UserOutlined /> : <LockOutlined />, [
      getItem('User Data', '1'),
      getItem('Group User Data', '2'),

    ]),
    getItem('Admin', 'sub2', permissions.admin === '1' ? <SafetyOutlined /> : <LockOutlined />, [
      getItem('Admin Data', '3'),
      getItem('Create Admin Account', '4'),
    ]),
    getItem('Donate', 'sub3', permissions.admin === '1' ? <SafetyOutlined /> : <LockOutlined />, [
      getItem('Donate Item Data', '5'),
      getItem('Request Item ', '6'),
    ]),
    getItem('Announcements', 'sub4', permissions.admin === '1' ? <SafetyOutlined /> : <LockOutlined />, [
      getItem('Announcements Data', '7'),
      getItem('Publish An Announcement', '8'),
    ]),

    getItem('Other', 'grp', null, [getItem('Activity', '9'), getItem('Analysis', '10'), getItem('Log out', '999')], 'group'),
  ];




  const [userPermission, setUserPermission] = useState(null);
  const [adminPermission, setAdminPermission] = useState(null);

  useEffect(() => {
    setUserPermission(permissions.user);
    setAdminPermission(permissions.admin);
  }, [permissions]);

  const navigate = useNavigate();




  const [selectedKey, setSelectedKey] = useState('0'); // 增加一个新的状态 selectedKey
  const onClick = (e) => {
    console.log('click ', e);
    setSelectedKey(e.key); // 更新 selectedKey 的值为被点击的菜单项的 key


    // Check permissions before navigating
    if (e.key === '1' && userPermission !== '1') {
      message.error('You do not have permission to access this page.');
      return;
    }
    if (e.key === '3' && adminPermission !== '1') {
      message.error('You do not have permission to access this page.');
      return;
    }
    if (e.key === '4' && adminPermission !== '1') {
      message.error('You do not have permission to access this page.');
      return;
    }


    if (e.key === '999') {
      Modal.confirm({
        title: 'Do you want to log out?',
        content: 'If you click OK, you will be logged out.',
        onOk: logout,
        onCancel() {
          console.log('Cancelled');
        },
      });
    } else if (e.key === '1') {
      navigate(`/admin/${Login_id}/alluserdata`);
    } else if (e.key === '2') {
      navigate(`/admin/${Login_id}/allgroupuserdata`);
    } else if (e.key === '3') {
      navigate(`/admin/${Login_id}/alladmindata`);
    } else if (e.key === '4') {
      navigate(`/admin/${Login_id}/createadmin`);
    } else if (e.key === '5') {
      navigate(`/admin/${Login_id}/alldonateditem`);
    } else if (e.key === '6') {
      navigate(`/admin/${Login_id}/requestitem`);
    } else if (e.key === '7') {
      navigate(`/admin/${Login_id}/announcements`);
    } else if (e.key === '8') {
      navigate(`/admin/${Login_id}/publishannouncement`);
    } else if (e.key === '9') {
      navigate(`/admin/${Login_id}/activity`);
    } else if (e.key === '10') {
      navigate(`/admin/${Login_id}/analysis`);
    }
  };


  return (
    <>
      <Menu
        onClick={onClick}
        style={{
          width: 256,
          height: '100%',
        }}
        defaultSelectedKeys={[selectedKey]}
        defaultOpenKeys={['sub1']}
        mode="inline"
        items={items}
      />
    </>
  )
}
