import React, { useState, useEffect } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    BellOutlined,
    LockOutlined,
    SafetyOutlined,
    TranslationOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Typography, Input, Space, Select, message, Modal, Popover, Badge, Switch, FloatButton, ConfigProvider } from 'antd';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';
import { useAuth } from 'shared/auth/useAuth';

import { useTranslation } from 'react-i18next';

import Announcement from '../SVG/Announcement';
import Commodity from '../SVG/Commodity';

const { Header, Sider, Content } = Layout;
const { Search: _Search } = Input;
const { Option: _Option } = Select;
const { Text } = Typography;

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

export default function NewUI() {
    const { t, i18n } = useTranslation();
    const changeLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
    }

    const { Login_id } = useParams();
    const { adminImage, adminName, permissions, signOut } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const [dateTime, setDateTime] = useState(new Date());

    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleTheme = (checked) => {
        setIsDarkMode(checked);

    };
    const themeAlgorithm = isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm;
    const colorBgContainer = isDarkMode ? '#001529' : '#FFFFFF';

    //date and time
    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    //logout
    const logout = () => {
        axios.get(`/logout/${Login_id}`)
            .then(() => {
                signOut();
                message.success('You have been logged out.');
                navigate('/');
            })
            .catch(err => console.error(err));
    };


    const items = [
        getItem(t('User'), 'sub1', permissions.user === '1' ? <UserOutlined /> : <LockOutlined />, [
            getItem(t('User Data'), '1'),
        ]),
        getItem(t('Admin'), 'sub2', permissions.admin === '1' ? <SafetyOutlined /> : <LockOutlined />, [
            getItem(t('Admin Data'), '3'),
            getItem(t('Create Account'), '4'),
        ]),
        getItem(t('Donate'), 'sub3', permissions.donate === '1' ? <Commodity /> : <LockOutlined />, [
            getItem(t('Donate Item Data'), '5'),
            getItem(t('Classification'), '6'),

        ]),
        getItem(t('Announcement'), 'sub4', permissions.announcement === '1' ? <Announcement /> : <LockOutlined />, [
            getItem(t('Announcement Data'), '7'),
            getItem(t('Publish'), '8'),
        ]),
        getItem(t('Violation'), 'sub5', permissions.violation === '1' ? <UserOutlined /> : <LockOutlined />, [
            getItem(t('AI Text Detected'), '11'),
            getItem(t('AI Image Detected'), '16'),
            getItem(t('AI Text Setting'), '15'),
            getItem(t('AI Image Setting'), '14'),
            getItem(t('Human Reported'), '12'),
        ]),

        getItem(t('Other'), 'grp', null, [getItem(t('Analysis'), '10'), getItem(t('AI CS'), '13'), getItem(t('Logout'), '999')], 'group'),
    ];




    const [userPermission, setUserPermission] = useState(null);
    const [adminPermission, setAdminPermission] = useState(null);
    const [donatePermission, setDonatePermission] = useState(null);
    const [announcementPermission, setAnnouncementPermission] = useState(null);
    const [violationPermission, setViolationPermission] = useState(null);
    const [analysisPermission, setAnalysisPermission] = useState(null);

    useEffect(() => {
        setUserPermission(permissions.user);
        setAdminPermission(permissions.admin);
        setDonatePermission(permissions.donate);
        setAnnouncementPermission(permissions.announcement);
        setViolationPermission(permissions.violation);
        setAnalysisPermission(permissions.analysis);

    }, [permissions]);

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
        if (e.key === '5' && donatePermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '6' && donatePermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '7' && announcementPermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '8' && announcementPermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '10' && analysisPermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '11' && violationPermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '12' && violationPermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '14' && violationPermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '15' && violationPermission !== '1') {
            message.error('You do not have permission to access this page.');
            return;
        }

        if (e.key === '16' && violationPermission !== '1') {
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
            navigate(`/admin/${Login_id}/donationClassification`);
        } else if (e.key === '7') {
            navigate(`/admin/${Login_id}/announcementhistory`);
        } else if (e.key === '8') {
            navigate(`/admin/${Login_id}/publishannouncement`);
        } else if (e.key === '9') {
            navigate(`/admin/${Login_id}/activity`);
        } else if (e.key === '10') {
            navigate(`/admin/${Login_id}/analysis`);
        } else if (e.key === '11') {
            navigate(`/admin/${Login_id}/AIDetected`);
        } else if (e.key === '12') {
            navigate(`/admin/${Login_id}/HumanReported`);
        } else if (e.key === '13') {
            navigate(`/admin/${Login_id}/AIChat`);
        } else if (e.key === '14') {
            navigate(`/admin/${Login_id}/AIDetectedsetting`);
        } else if (e.key === '15') {
            navigate(`/admin/${Login_id}/AITextSetting`);
        } else if (e.key === '16') {
            navigate(`/admin/${Login_id}/AIImageDetected`);
        }


        //else if (e.key === '14') {
        //    navigate(`/admin/${Login_id}/setting`);
        //}
    };


    return (
        <ConfigProvider
            theme={{
                // Use the chosen algorithm along with the compactAlgorithm
                algorithm: [themeAlgorithm, theme.compactAlgorithm],
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={collapsed} >
                    <div style={{ backgroundColor: '#dbdbdb', borderRadius: '30px', margin: '10px', marginBottom: '10px' }}>
                        <center>
                            <img width={50} src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="Baby Item logo" />
                        </center>
                    </div>
                    <Menu
                        onClick={onClick}
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={[selectedKey]}
                        defaultOpenKeys={['sub1']}
                        items={items}
                    />

                </Sider>
                <Layout style={{ height: '100%' }}>
                    <Header
                        style={{
                            padding: 0,
                            background: colorBgContainer,
                            display: 'flex',           // Enable flexbox
                            justifyContent: 'space-between' // Space items between
                        }}
                    >
                        <Space size="middle">
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />
                            <Text strong style={{ fontSize: '20px' }} >{adminName}</Text>
                        </Space>

                        <Space size="middle">
                            {dateTime.toLocaleString()}
                            <Badge >
                                <TranslationOutlined style={{ fontSize: '20px' }}   onClick={changeLanguage}/>
                            </Badge>
                            <Popover placement="bottomRight" title="Notifications" trigger="click">
                                <Badge >
                                    <BellOutlined style={{ fontSize: '20px' }}/>
                                </Badge>
                            </Popover>
                            <Switch
                                checkedChildren={t('Dark')}
                                unCheckedChildren={t('Light')}
                                checked={isDarkMode}
                                onChange={toggleTheme}
                            />
                            <Avatar 
                            icon={<UserOutlined />}
                            src={buildAssetUrl(adminImage)} alt="Admin photo" style={{ marginRight: '20px' }} />
                        </Space>
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                            background: colorBgContainer,
                        }}
                    >

               
                        <Outlet />
                        <FloatButton.BackTop visibilityHeight={10} />
                    </Content>

                </Layout>
            </Layout>
        </ConfigProvider>
    )
}
