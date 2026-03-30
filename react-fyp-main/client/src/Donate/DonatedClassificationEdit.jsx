import React, { useState, useEffect, useCallback } from 'react';
import axios from 'shared/api/http';

import { useParams } from 'react-router-dom';
import { Typography, Form, Input, Button, Space, Select, Col, Row, message, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import AddAttribute from './AddAttribute';

export default function DonatedClassificationEdit() {
    const { classificationID } = useParams();
    const { Title } = Typography;
    const [form] = Form.useForm();

    const [data, setData] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [classificationAttributes, setClassificationAttributes] = useState([]);

    const getClassificationName = useCallback(() => {
        axios.get(`/getclassificationdata/${classificationID}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                form.setFieldsValue({
                    categoryName: res.data[0].classification_Name
                });
            })
            .catch(err => console.log(err));
    }, [classificationID, form]);

    const fetchAttributes = useCallback(() => {
        axios.get('/getattribute', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                const dataWithKeys = res.data.map(item => ({ ...item, key: item.ID }));
                setData(dataWithKeys);

                return axios.get(`/getspecificclassification/${classificationID}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            })
            .then(res => {
                setClassificationAttributes(res.data);
                form.setFieldsValue({
                    attributes: res.data.map(attr => ({
                        name: attr.Attribute_Name
                    }))
                });
            })
            .catch(err => console.log(err));
    }, [classificationID, form]);

    useEffect(() => {
        fetchAttributes();
        getClassificationName();
    }, [fetchAttributes, getClassificationName]);

    useEffect(() => {
        const initialSelectedAttributes = classificationAttributes.map(attr => attr.Attribute_Name);
        setSelectedAttributes(initialSelectedAttributes);
    }, [classificationAttributes]);

    const onFinish = (values) => {
        axios
            .post(`/editclassification/${classificationID}`, values, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            })
            .then(res => {
                console.log(res.data);
                message.success('Successfully added new classification.');
            })
            .catch(err => {
                console.error(err);
                message.error('Failed to add new classification.');
            });
    };

    const attributeOptions = data.map(item => ({
        label: item.Attribute_Name,
        value: item.Attribute_Name
    }));

    return (
        <>
            <Title level={3}><b>Edit Classification ID({classificationID})</b></Title>

            <Row gutter={[10, 10]}>
                <Col span={10}>
                    <Card hoverable style={{ width: '90%' }}>
                        <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
                            <Form.Item
                                name="categoryName"
                                rules={[{ required: true, message: 'Please enter the classification name!' }]}
                            >
                                <Input placeholder="Classification Name" style={{ width: '90%' }} />
                            </Form.Item>

                            <Form.List name="attributes">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, fieldKey, ...restField }) => {
                                            const handleSelectChange = (selectedValue) => {
                                                const newSelectedAttributes = [...selectedAttributes];
                                                newSelectedAttributes[fieldKey] = selectedValue;
                                                setSelectedAttributes(newSelectedAttributes);
                                            };

                                            const filteredOptions = attributeOptions.filter(
                                                option => !selectedAttributes.includes(option.value) ||
                                                    form.getFieldValue(['attributes', name, 'name']) === option.value,
                                            );

                                            return (
                                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'name']}
                                                        rules={[{ required: true, message: 'Please select an attribute!' }]}
                                                    >
                                                        <Select
                                                            placeholder="Select an attribute"
                                                            style={{ width: 200 }}
                                                            options={filteredOptions}
                                                            onChange={handleSelectChange}
                                                        />
                                                    </Form.Item>
                                                    <MinusCircleOutlined
                                                        onClick={() => {
                                                            remove(name);
                                                            const newSelectedAttributes = [...selectedAttributes];
                                                            newSelectedAttributes.splice(fieldKey, 1);
                                                            setSelectedAttributes(newSelectedAttributes);
                                                        }}
                                                    />
                                                </Space>
                                            );
                                        })}
                                        <Form.Item>
                                            <Button
                                                type="dashed"
                                                onClick={() => add({ name: '' })}
                                                block
                                                icon={<PlusOutlined />}
                                                style={{ width: '90%' }}
                                            >
                                                Add Field
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>

                            <Form.Item>
                                <center>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </center>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col span={14}>
                    <AddAttribute />
                </Col>
            </Row>
        </>
    );
}
