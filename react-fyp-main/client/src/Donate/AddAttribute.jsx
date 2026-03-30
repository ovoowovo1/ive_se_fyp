import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { Form, Input, Button, Space, Select, Table, Modal, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;


export default function AddAttribute() {
    const [_form] = Form.useForm();
    const [formAttribute] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [data, setData] = useState([]);

    const [isDataTypeDate, setIsDataTypeDate] = useState(false);
    const [isCheckboxOrRadio, setIsCheckboxOrRadio] = useState(false);

    const [_selectedAttributes, _setSelectedAttributes] = useState([]);

    //edit attribute
    const [editMode, setEditMode] = useState(false);
    const [currentEdAttribute, setCurrentAttribute] = useState(null);
    const [originalAttributeName, setOriginalAttributeName] = useState(null);


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

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        formAttribute
            .validateFields()
            .then((values) => {

                if (isCheckboxOrRadio) {
                    if (!values.additionalOptions || values.additionalOptions.length < 2) {
                        message.error('Please provide at least two options.');
                        return;
                    }
                }

                onSubmit(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditMode(false);
        setCurrentAttribute(null);
        setIsCheckboxOrRadio(false);
        formAttribute.resetFields();
    };

    const onSubmit = (values) => {
        axios
            .post(`/addnewclassificationattribute`, values, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,// 'token' 是你的 JWT
                }
            })
            .then(res => {
                console.log(res.data);
                formAttribute.resetFields();
                fetchAttributes(); // 再次获取属性列表以更新数据
                setIsModalVisible(false);
                message.success('Successfully added new attribute.'); // Display success message
                //wait 1 second
                setTimeout(() => {
                    //refresh the web page
                    window.location.reload();
                }, 1000);
            })
            .catch(err => {
                console.error(err);
                message.error('Failed to add new attribute.'); // Display error message
                console.log(err.config);
            });

    };

    const onFormValuesChange = (changedValues) => {
        if ('attributeDataType' in changedValues) {
            setIsDataTypeDate(changedValues.attributeDataType === 'date');
        }

        if ('attributeEnterMethod' in changedValues) {
            const method = changedValues.attributeEnterMethod;
            setIsCheckboxOrRadio(method === 'checkbox' || method === 'radiobutton' || method === 'select');
        }
    };



    const columns = [
        {
            title: 'Name',
            dataIndex: 'Attribute_Name',
            key: 'Attribute_Name',
            width: 150,
        },
        {
            title: 'Data Type',
            dataIndex: 'Attribute_Type',
            key: 'Attribute_Type',
            width: 100,
        },
        {
            title: 'Enter Method',
            dataIndex: 'Attribute_DataType',
            key: 'Attribute_DataType',
            width: 100,
        },
        {
            title: 'Max Length',
            dataIndex: 'Attribute_Length',
            key: 'Attribute_Length',
            width: 50,
        },
        {
            title: 'Action',
            render: (text, record) => (
                <Space size="middle">
                    <Button type="primary" style={{ backgroundColor: 'Gold' }} onClick={() => showEditModal(record)}>Edit</Button>
                    <Button type="primary" onClick={() => deleteAttribute(record.Attribute_ID, record.Attribute_Name)} danger>Delete</Button>
                </Space>
            ),
        }

    ];

    const _attributeOptions = data.map(item => ({
        label: item.Attribute_Name,
        value: item.Attribute_Name
    }));




    const showEditModal = (attribute) => {

        setOriginalAttributeName(attribute.Attribute_Name);

        setIsCheckboxOrRadio(attribute.Attribute_Type === 'checkbox' || attribute.Attribute_Type === 'radiobutton' || attribute.Attribute_Type === 'select');
        if (setIsDataTypeDate(attribute.Attribute_DataType === 'date')) {
            setIsCheckboxOrRadio(false);
        }

        if (attribute.Attribute_Type === 'checkbox' || attribute.Attribute_Type === 'radiobutton' || attribute.Attribute_Type === 'select') {
            fetchAttributeOptions(attribute.Attribute_ID);
        }

        formAttribute.setFieldsValue({
            attributeName: attribute.Attribute_Name,
            attributeDataType: attribute.Attribute_DataType,
            attributeEnterMethod: attribute.Attribute_Type,
            attributeMaxLength: attribute.Attribute_Length,
        });
        setEditMode(true);
        setCurrentAttribute(attribute);
        setIsModalVisible(true);
        // Pre-populate form here if needed
    };

    const fetchAttributeOptions = (attributeID) => {
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


    const updateAttribute = (values) => {

        values.attributeID = currentEdAttribute.Attribute_ID;
        values.oldAttributeName = currentEdAttribute.Attribute_Name;
        console.log(values);

        axios
            .post(`/updateattribute`, values, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            })
            .then(res => {
                console.log(res.data);
                fetchAttributes(); // 再次获取属性列表以更新数据
                setIsModalVisible(false);
                message.success('Successfully updated attribute.'); // Display success message
                setTimeout(() => {
                    //refresh the web page
                    window.location.reload();
                }, 1000);
            })
            .catch(err => {
                console.error(err);
                message.error('Failed to update attribute.'); // Display error message
                console.log(err.config);
            });
    };


    //is Attribute List Delete ,not Add New Classification Attribute 
    const deleteAttribute = (attributeID, attributeName) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this attribute?',
            content: `Attribute: ${attributeName} (ID: ${attributeID})`,
            onOk() {
                console.log(attributeID);
                console.log(attributeName);
                axios.post(`/deleteattribute`, { attributeID, attributeName }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                })
                    .then(res => {
                        console.log(res.data);
                        fetchAttributes(); // Refresh the attribute list
                        message.success('Successfully deleted attribute.');
                        setTimeout(() => {
                            //refresh the web page
                            window.location.reload();
                        }, 1000);
                    })
                    .catch(err => {
                        console.error(err);
                        message.error('Failed to delete attribute.');
                    });
            },
            onCancel() {
                console.log('Deletion cancelled');
            },
        });
    };




    return (
        <>
            <Button type="primary" icon={<PlusCircleOutlined />} style={{ float: 'right', marginBottom: '10px' }} onClick={showModal}>Add New Attribute </Button>
            <Modal
                title={editMode ? "Edit Attribute" : "Add New Attribute"}
                open={isModalVisible}
                onOk={() => {
                    if (editMode) {
                        formAttribute
                            .validateFields()
                            .then((values) => {

                                updateAttribute(values);
                            })
                            .catch((info) => {
                                console.log('Validate Failed:', info);
                            });
                    } else {
                        handleOk();
                    }
                }}
                onCancel={handleCancel}
            >
                <Form form={formAttribute}
                    layout="vertical"
                    name="form_in_modal"
                    onValuesChange={onFormValuesChange}>
                    <Form.Item
                        name="attributeName"
                        label="Name"
                        rules={[
                            { required: true, message: 'Please input your attribute name!' },
                            {
                                validator(_, value) {
                                    if (!value) {

                                        return Promise.resolve();
                                    }
                                    // 如果是編輯模式且名稱未變更，直接通過驗證
                                    if (editMode && value === originalAttributeName) {
                                        return Promise.resolve();
                                    }
                                    // 檢查名稱是否已存在於其他屬性中
                                    if (data.some(item => item.Attribute_Name === value && item.Attribute_Name !== originalAttributeName)) {
                                        return Promise.reject(new Error('Attribute name already exists!'));
                                    }
                                    return Promise.resolve();
                                },
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>


                    <Form.Item
                        name="attributeDataType"
                        rules={[{ required: true, message: 'Please select a data type!' }]}
                        label="Data Type"
                    >
                        <Select disabled={editMode}>
                            <Option value="string">String</Option>
                            <Option value="number">Number</Option>
                            <Option value="date">Date</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item

                        name="attributeEnterMethod"
                        rules={[{ required: !isDataTypeDate, message: 'Please select a enter method!' }]}
                        label="Enter Method"
                        hidden={isDataTypeDate}
                    >
                        <Select disabled={editMode}>
                            <Option value="textbox">Text box</Option>
                            <Option value="select">Select</Option>
                            <Option value="checkbox">Check box</Option>
                            <Option value="radiobutton">Radio button</Option>
                        </Select>
                    </Form.Item>

                    {isCheckboxOrRadio && (
                        <Form.List name="additionalOptions">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'option']}
                                                rules={[{ required: true, message: 'Please input the option!' }]}
                                            >
                                                <Input placeholder="Option" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add Option
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    )}

                    <Form.Item

                        name="attributeMaxLength"
                        rules={[
                            {
                                required: !(isDataTypeDate || isCheckboxOrRadio),
                                message: 'Please input the length!'
                            },
                            {
                                validator: (_, value) =>
                                    (isDataTypeDate || isCheckboxOrRadio) || (value > 0) ?
                                        Promise.resolve() :
                                        Promise.reject(new Error('Length must be more than 0!')),
                            },
                        ]}
                        label="Max Length"
                        hidden={isDataTypeDate || isCheckboxOrRadio}
                    >
                        <Input type="number" />
                    </Form.Item>


                    {/* 可以添加更多的 Form.Item */}
                </Form>
            </Modal>

            <Table dataSource={data} columns={columns} />

        </>
    )
}
