import React, { useState } from 'react';
import axios from 'shared/api/http';
import { Typography,Form, Upload, Button, Input, message, Row, Col, Modal } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text: _Text,Title } = Typography;



const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const { confirm } = Modal;

export default function Publish() {
    const [form] = Form.useForm();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [_previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState([]);
    const [_isLoading, setIsLoading] = useState(false);

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };


    const beforeUpload = (file) => {
        setFileList([file]);
        return false; // Prevent automatic addition to fileList
    };

    
    const handleSubmit = (values) => {
        confirm({
            title: "Are you sure to publish this announcement?",
            icon: <ExclamationCircleFilled />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                setIsLoading(true);

                const formData = new FormData();
                formData.append('adminID', localStorage.getItem('Login_id'));
                formData.append('announcementTitle', values.title);
                formData.append('announcementContent', values.announcement);
                formData.append('Announcement_Image', fileList[0]?.originFileObj || '');

                axios
                    .post('/AdminPublishAnnouncement', formData, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    .then(res => {
                        console.log(res.data);
                        message.success("Successfully published announcement.");

                        // Clear the file list after successful submission
                        setFileList([]);

                        form.resetFields();
                        setPreviewImage('');
                        setIsLoading(false);
                    })
                    .catch(err => {
                        console.error(err);
                        message.error("Failed to publish announcement.");
                        setIsLoading(false);
                    });
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleCancel = () => setPreviewOpen(false);

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const customRequest = ({ file: _file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    return (
        <>

            <Title level={3} ><b>Publish Announcement</b></Title>

            <Form form={form}
                onFinish={handleSubmit}
                layout="vertical">
                <Modal open={previewOpen} footer={null} onCancel={handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            label="Announcement Image"
                            name="upload"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: 'Please upload an image!' }]}
                        >
                            <Upload
                                name="announcementImage"
                                listType="picture-card"
                                onPreview={handlePreview}
                                fileList={fileList}
                                onChange={handleChange}
                                customRequest={customRequest}
                                beforeUpload={beforeUpload} 
                            >
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>

                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[{ required: true, message: 'Please enter a title!' }]}
                        >
                            <Input placeholder="Enter title" />
                        </Form.Item>
                        <Form.Item
                            label="Announcement Content"
                            name="announcement"
                            rules={[{ required: true, message: 'Please enter announcement content!' }]}
                        >
                            <TextArea rows={10} placeholder="Write your announcement here" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Publish Announcement
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    );
}
