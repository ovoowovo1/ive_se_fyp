import React, { useState } from 'react';
import { Input, Button, message, Card, Row, Col } from 'antd';

export default function Testfirebase() {


    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const sendNotification = async () => {
        if (!title.trim() || !body.trim()) {
            message.warning('請輸入標題和訊息內容');
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
                message.success('推送通知已發送');
            } else {
                message.error('發送推送通知失敗');
            }
        } catch (error) {
            console.error('發送推送通知時出錯:', error);
            message.error('發送推送通知失敗');
        }
    };

    return (
        <Card title="發送推送通知" style={{ width: 300, margin: 'auto', marginTop: 50 }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="請輸入標題"
                    />
                </Col>
                <Col span={24}>
                    <Input
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="請輸入訊息內容"
                    />
                </Col>
                <Col span={24}>
                    <Button type="primary" block onClick={sendNotification}>
                        發送推廣
                    </Button>
                </Col>
            </Row>
        </Card>
    );
}