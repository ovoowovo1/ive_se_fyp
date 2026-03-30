import React, { useState } from 'react';
import { Typography, Input, Button, message, Card, Row, Col } from 'antd';

const { TextArea } = Input;
const { Text: _Text, Title } = Typography;


export default function Fcm() {

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const sendNotification = async () => {
        if (!title.trim() || !body.trim()) {
            message.warning('Please enter a title and message content');
            return;
        }

        const serverKey = 'AAAATzN3aIM:APA91bEIwKnbqe0LQDc7gJcsuEZeXh8yyRyHKwApFEWneTRGClvYA7B4-T4TtqMw9aTDuUvDC8Dm27MRWSL5l6cUV-8o59wziv1YLqsXJ2cSlkrtzf5NkXckrdorUkqWsybQ1XNHHwfJ';

        try {
            const response = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${serverKey}`,
                },
                body: JSON.stringify({
                    notification: {
                        title: title,
                        body: body,
                    },
                    to: '/topics/android_user',
                }),
            });

            if (response.ok) {
                setTitle('');
                setBody('');
                message.success('Notification has been sent');
            } else {
                message.error('Failed to send notification');
            }
        } catch (error) {
            console.error('Error when sending notification:', error);
            message.error('Failed to send notification');
        }
    };

    return (
        <>
            <Title level={3} style={{marginBottom:'10px'}}><b>Message Broadcast</b></Title>
            <Card title="Send Push Notification" style={{ width: '90%',margin: 'auto', marginTop: 50 }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter Title"
                        />
                    </Col>
                    <Col span={24}>
                        <TextArea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Enter Message Content"
                            autoSize={{ minRows: 10, maxRows: 30 }}
                        />
                    </Col>
                    <Col span={24}>
                        <Button type="primary" block onClick={sendNotification}>
                            Send Notification
                        </Button>
                    </Col>
                </Row>
            </Card>
        </>
    );
}
