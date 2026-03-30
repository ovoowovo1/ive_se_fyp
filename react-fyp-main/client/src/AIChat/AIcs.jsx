import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tooltip, Space, Card, Modal, message, Typography } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, PlusOutlined, MinusCircleOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'shared/api/http';
import { buildAiServiceUrl } from 'shared/config/env';


import userIcon from '../IMG/usericon.png';
import aiIcon from '../IMG/aics.png';

const { Title } = Typography;

export default function AIcs() {
    const [form] = Form.useForm();
    const [inputList, setInputList] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [_nextId, _setNextId] = useState(0); // 新增一個狀態變量來追蹤下一個可用的 id

    const { TextArea } = Input;


    useEffect(() => {
        axios.get('/getAIChat', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                const data = res.data;

                const fetchedInputList = data.map((item, index) => [
                    { id: index * 2, name: `user-${index}`, value: item.User_Message },
                    { id: index * 2 + 1, name: `assistant-${index}`, value: item.AI_Message }
                ]).flat();
                setInputList(fetchedInputList);

                form.setFieldsValue({
                    ...fetchedInputList.reduce((values, input) => {
                        values[input.name] = input.value;
                        return values;
                    }, {})
                });
            })
            .catch(err => console.log(err));
    }, [form]);

    const addInput = () => {
        const nextId = inputList.length > 0 ? inputList[inputList.length - 1].id + 1 : 0;
        const newUserInput = { id: nextId, name: `user-${nextId}` };
        const newAssistantInput = { id: nextId + 1, name: `assistant-${nextId + 1}` };
        setInputList(inputList.concat(newUserInput, newAssistantInput));
    };

    const removePair = (id) => {
        // 同样，使用函数式更新来保证状态的正确性
        setInputList(prevInputList => prevInputList.filter(input => {
            const isUserInput = id % 2 === 0;
            const pairId = isUserInput ? id + 1 : id - 1;
            return input.id !== id && input.id !== pairId;
        }));
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form
            .validateFields()
            .then(values => {
                axios.post('/AIChat', values, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(_res => {
                        message.success('Update successfully');
                        setIsModalVisible(false);
                       // success();
                    })
                    .catch(err => {
                        console.error(err);
                        error('This is an error message');
                    });
            })
            .catch(info => {
                error('Validate Failed');
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        // 按下取消按鈕的邏輯
        setIsModalVisible(false);
    };




    const _success = () => {
        messageApi.open({
            type: 'success',
            content: 'This is a success message',
        });
    };

    const error = (theMessage) => {
        messageApi.open({
            type: 'error',
            content: theMessage,
        });
    };



    const [chatMessages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const sendMessageToServer = async (message) => {
        try {
            const response = await axios.post(buildAiServiceUrl('/test_ai'), { user_string: message });
            // 假设服务器返回的消息格式为 { message: 'response response' }
            const serverMessage = response.data.response;
            setMessages((prevMessages) => [...prevMessages, { text: serverMessage, sender: 'server', location: 'left' }]);
        } catch (error) {
            console.error('Error sending message:', error);
            // 在这里处理错误，例如显示错误消息
        }
    };

    const handleSendMessage = () => {
        console.log("this" + inputValue);


        const newMessage = { text: inputValue.trim(), sender: 'user', location: 'right' };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        sendMessageToServer(inputValue.trim());
        setInputValue(''); // 清空输入框
    };

    return (
        <>
            <Title level={3} ><b>AI Customer Service</b></Title>

            {contextHolder}


            <Card style={{ maxHeight: '500px', overflowY: 'auto' }} hoverable>

                <Button type="primary" onClick={showModal}><SaveOutlined />Save Change</Button>
                <Modal title="Update AI Customer Service" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                    {/* 模態框內容 */}
                    <p>Are you sure you want to update the AI Customer Service?</p>
                </Modal>
                <br></br>
                <br></br>
                <br></br>
                Example<Tooltip title="Added example to display chat with your desired response. It will try to simulate any responses you add here, so make sure they comply with the rules you set in your system messages.">
                    <InfoCircleOutlined style={{ marginLeft: '10px', color: '#08c', marginBottom: '20px' }} />
                </Tooltip>



                <Form form={form} name="dynamic_form_nest_item" onOk={handleOk} autoComplete="off" layout="vertical" style={{ width: '100%' }}>
                    {inputList.map((input, index) => (
                        <Space key={input.id} style={{ display: 'flex', marginBottom: 8, width: '100%' }} align="baseline" >
                            <Form.Item
                                style={{ width: '100%' }}
                                label={`${index % 2 === 0 ? "User" : "Assistant"} ${Math.floor(index / 2) + 1}:`}
                                name={input.name}
                                rules={[{ required: true, message: 'Input is required' }]}
                            >
                                <TextArea rows={4} style={{ width: '800px' }} />
                            </Form.Item>
                            {index % 2 === 0 && (
                                <MinusCircleOutlined
                                    onClick={() => removePair(input.id)}
                                    style={{ color: 'red', marginTop: '5px' }}
                                />
                            )}
                            {index % 2 === 1 && <br />}
                        </Space>
                    ))}
                    <Form.Item>
                        <Button type="dashed" onClick={addInput} block icon={<PlusOutlined />}>
                            Add
                        </Button>
                    </Form.Item>
                </Form>
            </Card>



            <Card hoverable style={{ marginTop: '30px' }}>
                <h1>Chat Test</h1>

                <div id='testchat'
                    style={{ minHeight: '500px', maxHeight: '500px', overflowY: 'auto', background: '#FAF9F8', padding: '10px' }}
                >

                    {chatMessages.length === 0 &&
                        <>
                            <div className="parent translate">
                                <div className="child"></div>
                            </div>

                            <div className="parent">
                                <Card >
                                    <table style={{ width: '100%' }}>
                                        <tr style={{ width: '30%' }}>
                                            <td rowSpan={2}>
                                                <img
                                                    src={aiIcon}
                                                    alt="AI helper"
                                                    className="chatApp__convMessageAvatar"
                                                />
                                            </td>

                                            <td><h3>Start chatting</h3></td>
                                        </tr>
                                        <tr>
                                            <td> Send a query below to test the helper. Then adjust the Helper settings to improve the Helper&apos;s response.</td>
                                        </tr>
                                    </table>

                                    <br /><br /><br />
                                </Card>
                            </div>
                        </>


                    }


                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`chatApp__convMessageItem chatApp__convMessageItem--${msg.location} clearfix`}>
                            <img
                                src={msg.sender === 'user' ? userIcon : aiIcon}
                                alt={msg.sender}
                                className="chatApp__convMessageAvatar"
                            />
                            <div className="chatApp__convMessageValue">{msg.text}</div>
                        </div>
                    ))}
                    {/*
                    <div class="chatApp__convMessageItem chatApp__convMessageItem--right clearfix">


                        <img src={userIcon} alt="Shun" class="chatApp__convMessageAvatar"></img>
                        <div class="chatApp__convMessageValue">Great! It's been a while... 🙃</div>
                    </div>

                    <div class="chatApp__convMessageItem chatApp__convMessageItem--left clearfix">
                        <img src={aiIcon} alt="Gabe" class="chatApp__convMessageAvatar"></img>
                        <div class="chatApp__convMessageValue">Indeed.... We're gonna have to fix that. 🌮🍻</div>
                    </div>
                    */}

                </div>

                <Input.TextArea
                    rows={4}
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Type your message here"
                    style={{ width: '100%', marginTop: '10px' }}
                />


                <Button
                    type="primary"
                    onClick={handleSendMessage}
                    style={{ marginTop: '10px', float: 'right', marginLeft: '30px' }}
                    shape="circle"
                    icon={<SendOutlined />}
                />

                <Button
                    danger
                    onClick={() => Modal.confirm({
                        title: 'Are you sure you want to clear the chat?',
                        icon: <DeleteOutlined />,
                        content: 'This will delete all messages in the chat.',
                        okText: 'Yes',
                        okType: 'danger',
                        cancelText: 'No',
                        onOk() {
                            setMessages([]);
                            console.log('OK');
                        },
                        onCancel() {
                            console.log('Cancel');
                        },
                    })
                    }
                    style={{ marginTop: '10px', float: 'right' }}>
                    <DeleteOutlined />Clear Chat
                </Button>
            </Card>
        </>
    );
}
