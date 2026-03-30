import React, { useState, useEffect } from 'react';
import { Button,
    Row, Col, Typography, Card,
    Form, Input, Select, Checkbox, Radio, message, Upload
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';


// 这个函数用于在上传前处理文件，使其可以预览
const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditDonatedItem = () => {
    const { donateditem_id } = useParams();
    const [_form] = Form.useForm();
    const [donatedItem, setDonatedItem] = useState(null);
    const [donatedItemDetail, setDonatedItemDetail] = useState(null);
    const [user, setUser] = useState(null);
    const [_slides, _setSlides] = useState([]);
    const _Login_id = localStorage.getItem('Login_id');
    const { Option } = Select;
    const [classification, setClassification] = useState(null);
    const [attributeData, setAttributeData] = useState(null);

    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState();

    const [_fileList, setFileList] = useState([]);
    const [_previewImage, setPreviewImage] = useState('');
    const [_previewVisible, setPreviewVisible] = useState(false);

    const handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    const handleChange = ({ fileList }) => setFileList(fileList);

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );




    useEffect(() => {
        axios.get(`/donateitem/${donateditem_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                setDonatedItem(res.data);
                setSelectedDeliveryOption((res.data.Donate_Item_Meetup === 'T' && res.data.Donate_Item_MailingDelivery === 'T')
                    ? '3'  // 如果两者都为'T'
                    : (res.data.Donate_Item_Meetup === 'T'
                        ? '1'  // 只有Meetup为'T'
                        : (res.data.Donate_Item_MailingDelivery === 'T' ? '2' : '')))
                console.log(res.data);

                axios.get(`/getclassification/${res.data.Donate_Item_type}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(res => {
                        setAttributeData(res.data);
                        console.log(res.data);
                    })
                    .catch(err => {
                        console.error(err);
                    });

                // Call the second API after setting the donatedItem
                if (res.data && res.data.Donate_User_ID) {
                    axios.get(`/user/${res.data.Donate_User_ID}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                        .then(res => {
                            setUser(res.data);
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            })
            .catch(err => {
                console.error(err);
            });
    }, [donateditem_id]); // Dependency array for useEffect

    useEffect(() => {
        axios.get(`/donateitemdetail/${donateditem_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                setDonatedItemDetail(res.data);
                console.log(res.data);
            })
            .catch(err => {
                console.error(err);
            });

    }, [donateditem_id]);



    // Add this useEffect block to fetch the classification data
    useEffect(() => {
        axios.post('/donateclassificationdata', {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                setClassification(res.data);
            })
            .catch(err => console.log(err));
    }, []);




    const renderFormElement = (attribute) => {
        switch (attribute.Attribute_Type) {
            case 'textbox':
                return (
                    <Input maxLength={attribute.Attribute_Length} />
                );
            case 'select':

                return (
                    <Select placeholder="Please select" allowClear>
                        {attribute.options.map((option, index) => (
                            <Option key={index} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                );
            case 'checkbox':
                return (
                    <Checkbox.Group>
                        {attribute.options.map((option, index) => (
                            <Checkbox key={index} value={option}>
                                {option}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                );
            case 'radiobutton':
                return (
                    <Radio.Group>
                        {attribute.options.map((option, index) => (
                            <Radio key={index} value={option}>
                                {option}
                            </Radio>
                        ))}
                    </Radio.Group>
                );
            default:
                return null;
        }
    };





    // 过滤掉值为null或undefined的项，以及键名为'Item_details_ID'的项
    const _validEntries = donatedItemDetail ? Object.entries(donatedItemDetail).filter(
        ([key, value]) => value != null && key !== 'Item_details_ID'
    ) : [];



    const onFinish = (values) => {
        console.log('Received values of form: ', values);

        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (key === 'upload' && Array.isArray(values[key])) {
                values[key].forEach(file => {
                    formData.append(key, file.originFileObj);
                    formData.append(key, file.url);
                });




            } else {
                formData.append(key, values[key]);
            }
        });

        axios.post(`/editdonateitem/${donateditem_id}`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                console.log(res.data);
                message.success("Successfully edit donated item");
            })
            .catch(err => {
                console.error(err);
                message.error("Failed to edit donated item");
            });
    };






    if (!donatedItem) {
        return <div>Loading donated item details...</div>;
    }

    if (!user) {
        return <div>Loading user details...</div>;
    }




    // 函数用于合并两个对象，并取donatedItemDetail中的非null值覆盖donatedItem中的值
    function mergeWithNonNull(defaults, updates) {
        const result = { ...defaults }; // 创建初始值的副本
        Object.keys(updates).forEach(key => {
            const updateValue = updates[key];
            if (updateValue !== null) { // 如果更新中的值不是null，则使用它
                result[key] = updateValue;
            }
        });
        return result;
    }

    // 用于创建initialValues的函数
    function createInitialValues(donatedItem, donatedItemDetail) {
        // 创建基础initialValues
        let initialValues = {
            Donate_Item_Name: donatedItem.Donate_Item_Name,
            Donate_Item_Status: donatedItem.Donate_Item_Status,
            Donate_Item_MeetupMailingDelivery: (donatedItem.Donate_Item_Meetup === 'T' && donatedItem.Donate_Item_MailingDelivery === 'T')
                ? '3'  // 如果两者都为'T'
                : (donatedItem.Donate_Item_Meetup === 'T'
                    ? '1'  // 只有Meetup为'T'
                    : (donatedItem.Donate_Item_MailingDelivery === 'T' ? '2' : '')),  // 只有MailingDelivery为真
            Donate_Item_Location: donatedItem.Donate_Item_Location,
            Donate_Item_type: donatedItem.Donate_Item_type,
            Donate_Item_Describe: donatedItem.Donate_Item_Describe,
            Meetup_Location: donatedItem.Donate_Item_MeetupLocation,
            Delivery_Method: donatedItem.Donate_Item_MailingDeliveryMethod,
            upload: (donatedItem.photos || []).map(photo => ({
                uid: photo.Donate_Photo_ID,
                name: `photo${photo.Donate_Photo_ID}.png`, // 假设图片格式为png，根据实际情况修改
                status: 'done',
                url: buildAssetUrl(photo.Donate_Photo), // 根据实际情况修改
            })),
            // 其他表单项...
        };

        // 如果donatedItemDetail不是null，则使用它来更新initialValues
        if (donatedItemDetail) {
            initialValues = mergeWithNonNull(initialValues, donatedItemDetail);
        }
        return initialValues;
    }

    // 创建initialValues时调用这个函数
    const initialValues = createInitialValues(donatedItem, donatedItemDetail);




    const handleItemTypeChange = (value) => {
        console.log(`selected ${value}`);
        axios.get(`/getclassification/${value}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                setAttributeData(res.data);
                console.log(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    };





    return (
        <>
            <Title level={2}>Edit Donated Item</Title>
            <Text strong > Donated Item ID: {donateditem_id} </Text>


            <Card className='shadow' style={{ marginTop: '10px' }}>

                <Form layout="vertical" onFinish={onFinish}
                    initialValues={initialValues}

                >
                    <Row>
                        <Col span={24}>

                            <Form.Item
                                name="upload"
                                valuePropName="fileList"
                                getValueFromEvent={e => {
                                    if (Array.isArray(e)) {
                                        return e;
                                    }
                                    return e && e.fileList;
                                }}

                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={initialValues.upload}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    beforeUpload={() => false} // 返回false阻止自动上传
                                >
                                    {initialValues.upload.length >= 8 ? null : uploadButton}
                                </Upload>

                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="Donate_Item_Name"
                                label="Donate Item Name"
                                rules={[{ required: true, message: 'Please input the name of the item!' }]}

                            >
                                <Input placeholder="Enter item name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>

                        <Col span={8}>
                            <Form.Item
                                name="Donate_Item_Status"
                                label="Donate Item Status"
                                rules={[{ required: true, message: 'Please select the status of the item!' }]}
                            >
                                <Select placeholder="Enter item status"
                                    options={[
                                        {
                                            value: 'Brand new',
                                            label: 'Brand new',
                                        },
                                        {
                                            value: 'Like new',
                                            label: 'Like new',
                                        },
                                        {
                                            value: 'Lightly used',
                                            label: 'Lightly used',
                                        },
                                        {
                                            value: 'Well used',
                                            label: 'Well used',
                                        },
                                        {
                                            value: 'Heavily used',
                                            label: 'Heavily used',
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="Donate_Item_MeetupMailingDelivery"
                                label="Delivery Options"
                                rules={[{ required: true, message: 'Please select the status of the item!' }]}
                            >
                                <Select placeholder="Select item status"
                                    onChange={(value) => {
                                        setSelectedDeliveryOption(value)
                                    }}
                                    options={[
                                        {
                                            value: '1',
                                            label: 'Meet up',
                                        },
                                        {
                                            value: '2',
                                            label: 'Mailing Delivery',
                                        },
                                        {
                                            value: '3',
                                            label: 'Meet up, Mailing Delivery',
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>


                        <Col span={8}>
                            <Form.Item
                                name="Donate_Item_Location"
                                label="Donate Item Location"
                                rules={[{ required: true, message: 'Please input the location of the item!' }]}
                            >
                                <Input placeholder="Enter item location" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Title level={4}>Donated Describe</Title>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="Donate_Item_type"
                                label="Donate Item Type"
                                rules={[{ required: true, message: 'Please input the type of the item!' }]}
                            >
                                <Select placeholder="Select item type"
                                    onChange={handleItemTypeChange}>
                                    {/* 將分類數據映射到 Select 選項中 */}
                                    {classification.map(item => (
                                        <Option key={item.classification_Name} value={item.classification_Name}>
                                            {item.classification_Name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="Donate_Item_Describe"
                                label="Donate Describe"
                                rules={[{ required: true, message: 'Please input the item description!' }]}
                            >
                                <TextArea placeholder="Enter item description"
                                    maxLength={300} showCount />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row >
                        <Col span={24}>
                            <Title level={4}>Donated Details</Title>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        {attributeData.map((attribute, index) => (
                            <Col span={8} key={index}>
                                <Form.Item
                                    name={attribute.Attribute_Name}
                                    label={attribute.Attribute_Name}
                                >
                                    {renderFormElement(attribute)}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Title level={4}>
                                {selectedDeliveryOption === '1' && 'Meet up Details'}
                                {selectedDeliveryOption === '2' && 'Mailing Delivery Details'}
                                {selectedDeliveryOption === '3' && 'Meet Up Or Mailing Delivery Details'}
                            </Title>
                        </Col>
                        <Col span={16}>

                            {(selectedDeliveryOption === '1' || selectedDeliveryOption === '3') && (
                                <>
                                    <Form.Item
                                        name="Meetup_Location"
                                        label="Meet up Location"
                                        rules={[{ required: true, message: 'Please input the meet up Location!' }]}
                                    >
                                        <Input placeholder="Enter meet up" />
                                    </Form.Item>
                                </>
                            )}
                            {(selectedDeliveryOption === '2' || selectedDeliveryOption === '3') && (
                                <>
                                    <Form.Item
                                        name="Delivery_Method"
                                        label="Delivery Method "
                                        rules={[{ required: true, message: 'Please input the delivery method!' }]}
                                    >
                                        <Input placeholder="Enter delivery method" />
                                    </Form.Item>
                                </>
                            )}
                        </Col>

                    </Row>


                    <Form.Item
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Button type="primary" htmlType="submit" >
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </>
    );
};

export default EditDonatedItem;
