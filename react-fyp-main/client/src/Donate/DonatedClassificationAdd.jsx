import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { Typography, Form, Input, Button, Space, Select, Col, Row, message, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';




import AddAttribute from './AddAttribute';


export default function DonatedClassificationAdd() {
    const { Title } = Typography;
    const { Option: _Option } = Select;
    const [form] = Form.useForm();
    const [formAttribute] = Form.useForm();
    const [_isModalVisible, _setIsModalVisible] = useState(false);
    const [data, setData] = useState([]);

    const [_isDataTypeDate, _setIsDataTypeDate] = useState(false);
    const [_isCheckboxOrRadio, _setIsCheckboxOrRadio] = useState(false);

    const [selectedAttributes, setSelectedAttributes] = useState([]);

    //edit attribute
    const [_editMode, _setEditMode] = useState(false);
    const [_currentEdAttribute, _setCurrentAttribute] = useState(null);
    const [_originalAttributeName, _setOriginalAttributeName] = useState(null);

    useEffect(() => {
        fetchAttributes(); // 调用函数以在组件加载时获取属性列表
    }, []);

    const fetchAttributes = () => {
        axios.get('/getattribute', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                const dataWithKeys = res.data.map(item => ({ ...item, key: item.ID }));
                setData(dataWithKeys);
            })
            .catch(err => console.log(err));
    };




    const _fetchAttributeOptions = (attributeID) => {
        axios.get(`/getspecificattributeoption/${attributeID}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                const formValues = res.data.map(item => ({ option: item.item_Option }));
                formAttribute.setFieldsValue({ additionalOptions: formValues });
            })
            .catch(err => console.log(err));
    };




    //add new classification
    const onFinish = (values) => {
        console.log('Received values:', values);
        axios
            .post(`/addnewclassification`, values, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            })
            .then(res => {
                console.log(res.data);
                form.resetFields();
                setSelectedAttributes([]);
                message.success('Successfully added new classification.'); // Display success message
            })
            .catch(err => {
                console.error(err);
                message.error('Failed to add new classification.'); // Display error message
                console.log(err.config);
            });

    };





    const attributeOptions = data.map(item => ({
        label: item.Attribute_Name,
        value: item.Attribute_Name
    }));



    return (
        <>
            <Title level={3} ><b>Add New Classification</b></Title>

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

                            <Form.List name="attributes" initialValue={[{ name: '' }]}>
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, fieldKey, ...restField }) => {
                                            // 当选择改变时，更新已选择的属性列表
                                            const handleSelectChange = (selectedValue) => {
                                                const newSelectedAttributes = [...selectedAttributes];
                                                newSelectedAttributes[fieldKey] = selectedValue;
                                                setSelectedAttributes(newSelectedAttributes);
                                            };

                                            // 过滤掉已经被选择的选项
                                            const filteredOptions = attributeOptions.filter(
                                                option => !selectedAttributes.includes(option.value) ||
                                                    form.getFieldValue(['attributes', name, 'name']) === option.value
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
                                                    <MinusCircleOutlined onClick={() => {
                                                        remove(name);
                                                        // 更新选项列表以反映移除的选项
                                                        const newSelectedAttributes = [...selectedAttributes];
                                                        newSelectedAttributes.splice(fieldKey, 1);
                                                        setSelectedAttributes(newSelectedAttributes);
                                                    }} />
                                                </Space>
                                            );
                                        })}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add({ name: '' })} block icon={<PlusOutlined />} style={{ width: '90%' }}>
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
