import React, { useState, useEffect } from 'react';
import { Menu, Divider, Table, Tag, Button, Card, message, Typography, Row, Col, Input, Slider, Checkbox } from 'antd';
import { PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'shared/api/http';
import { buildAiServiceUrl } from 'shared/config/env';

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function DectectedTextSetting() {

    // 状态钩子，用于控制开关的状态
    const [_isEnabled, _setIsEnabled] = useState(true);

    const [violence, setViolence] = useState(0);
    const [selfharm, setSelfharm] = useState(0);
    const [sexual, setSexual] = useState(0);
    const [hate, setHate] = useState(0);

    const [violenceChecked, setViolenceChecked] = useState(false);
    const [selfharmChecked, setSelfharmChecked] = useState(false);
    const [sexualChecked, setSexualChecked] = useState(false);
    const [hateChecked, setHateChecked] = useState(false);

    const [textAreaContent, setTextAreaContent] = useState('');
    const handleTextAreaChange = (e) => {
        setTextAreaContent(e.target.value);
    };


    const [testResult, setTestResult] = useState();

    const items = [
        {
            label: 'Configure filters',
            key: 'filters',

        },
        {
            label: 'Use blocklist',
            key: 'blocklist',
        }
    ];

    const [current, setCurrent] = useState('filters');
    const onClick = (e) => {
        console.log('click ', e);
        setCurrent(e.key);
    };


    useEffect(() => {
        // Fetch the admin details when the component mounts
        axios.get(`/get_ai_text_settings`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                const settings = res.data;
                settings.forEach(setting => {

                    const isOpen = setting.open === "1"; // Convert "1" or other to true/false
                    const judgementValue = parseInt(setting.judgement, 10); // Ensure the judgement is parsed as a decimal number

                    switch (setting.ID) {
                        case 'Hate':
                            setHateChecked(isOpen);
                            setHate(judgementValue);
                            break;
                        case 'SelfHarm':
                            setSelfharmChecked(isOpen);
                            setSelfharm(judgementValue);
                            break;
                        case 'Sexual':
                            setSexualChecked(isOpen);
                            setSexual(judgementValue);
                            break;
                        case 'Violence':
                            setViolenceChecked(isOpen);
                            setViolence(judgementValue);
                            break;
                        default:
                            console.log("Unknown setting ID:", setting.ID);
                    }
                });
            })
            .catch(err => {

                console.error(err);
            });
    }, []); // Dependency array for useEffect






    const handleSliderChangeViolence = (value) => {
        setViolence(value);
    };


    const handleSliderChangeSelfharm = (value) => {
        setSelfharm(value);
    };


    const handleSliderChangeSexual = (value) => {
        setSexual(value);
    };

    const handleSliderChangeHate = (value) => {
        setHate(value);
    };


    // 更新函数
    const handleCheckboxChange = (type) => {
        switch (type) {
            case 'violence':
                setViolenceChecked(!violenceChecked);
                break;
            case 'selfharm':
                setSelfharmChecked(!selfharmChecked);
                break;
            case 'sexual':
                setSexualChecked(!sexualChecked);
                break;
            case 'hate':
                setHateChecked(!hateChecked);
                break;
            default:
                break;
        }

    };

    const _test = () => {
        console.log(violenceChecked);
        console.log(selfharmChecked);
        console.log(sexualChecked);
        console.log(hateChecked);
        console.log("--------")
    }


    const columns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Severity Level',
            dataIndex: 'severityLevel',
            key: 'severityLevel',
            render: (text) => {
                let color = 'green';
                if (text === 'Medium') {
                    color = 'orange';
                } else if (text === 'High') {
                    color = 'red';
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Threshold',
            dataIndex: 'threshold',
            key: 'threshold',
            render: (text) => {
                let color = 'green';
                if (text === 'Medium') {
                    color = 'orange';
                } else if (text === 'High') {
                    color = 'red';
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Judgement',
            dataIndex: 'judgement',
            key: 'judgement',
            render: (text) => {
                let color = text === 'Allowed' ? 'green' : 'volcano';
                return <Tag color={color}>{text}</Tag>;
            },
        },
    ];

    const _data = [
        {
            key: '1',
            category: 'Hate',
            severityLevel: 'Safe',
            threshold: 'Low',
            judgement: 'Allowed',
        },
        {
            key: '2',
            category: 'Violence',
            severityLevel: 'Safe',
            threshold: 'Low',
            judgement: 'Allowed',
        },
        {
            key: '3',
            category: 'Sexual',
            severityLevel: 'Low',
            threshold: 'Low',
            judgement: 'Blocked',
        },
        {
            key: '4',
            category: 'Self-harm',
            severityLevel: 'Safe',
            threshold: 'Low',
            judgement: 'Allowed',
        },
    ];

    const handleRunTest = () => {


        axios.post(buildAiServiceUrl('/azure_text'), {
            text: textAreaContent,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            console.log(res.data);
            const processedData = res.data.categoriesAnalysis.map((item, index) => {
                // Determine threshold based on the category
                let categoryThreshold;
                switch (item.category) {
                    case "Violence":
                        if (!violenceChecked) {
                            return; // Skip this category if it's not enabled
                        }
                        categoryThreshold = violence;
                        break;
                    case "SelfHarm":
                        if (!selfharmChecked) {
                            return; // Skip this category if it's not enabled
                        }
                        categoryThreshold = selfharm;
                        break;
                    case "Sexual":
                        if (!sexualChecked) {
                            return; // Skip this category if it's not enabled
                        }
                        categoryThreshold = sexual;
                        break;
                    case "Hate":
                        if (!hateChecked) {
                            return; // Skip this category if it's not enabled
                        }
                        categoryThreshold = hate;
                        break;
                    default:
                        categoryThreshold = 0; // Default or error handling
                }

                // Convert threshold to label
                const thresholdLabel = categoryThreshold === 2 ? 'Low' : categoryThreshold === 4 ? 'Medium' : categoryThreshold === 6 ? 'High' : 'Undefined';

                // Determine judgement
                const judgement = item.severity >= categoryThreshold ? 'Blocked' : 'Allowed';

                return {
                    key: index,
                    category: item.category,
                    severityLevel: item.severity === 0 ? 'Safe' : item.severity <= 2 ? 'Low' : item.severity <= 4 ? 'Medium' : 'High',
                    threshold: thresholdLabel,
                    judgement: judgement,
                };
            });
            setTestResult(processedData); // Update state with the processed data
            message.success('Test run successfully');
        }).catch((err) => {
            console.error(err);
            message.error('Failed to run test');
        });
    };

    const handleSave = () => {
        const formData = {
            violence: violenceChecked ? 1 : 0,
            selfharm: selfharmChecked ? 1 : 0,
            sexual: sexualChecked ? 1 : 0,
            hate: hateChecked ? 1 : 0,
            violenceValue: violence,
            selfharmValue: selfharm,
            sexualValue: sexual,
            hateValue: hate,
        };

        axios.post('/ai_text_settings', formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).then((res) => {
            console.log(res.data);
            message.success('Settings saved successfully');
        }).catch((err) => {
            console.error(err);
            message.error('Failed to save settings');
        });
    };

    return (
        <>
            <Title level={3} ><b>AI Text Setting</b></Title>

            <Row gutter={16} style={{ marginBottom: '10px' }}>
                <Col span={12}>
                    <Menu mode="horizontal" items={[{ label: 'Test' }]} />
                </Col>
                <Col span={12}>
                    <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
                </Col>
            </Row>



            <Row gutter={16}  >
                <Col span={12} >
                    <Card className="card-height shadow" bordered >

                        <TextArea
                            placeholder="enter text"
                            rows={15}
                            value={textAreaContent}
                            onChange={handleTextAreaChange}
                        />
                        <Divider />
                        <Button type="primary" style={{ marginTop: '10px' }} icon={<PlayCircleOutlined />} onClick={handleRunTest}>Run test</Button>
                    </Card>

                </Col>
                {/*<Button onClick={test}> test</Button>*/}
                <Col span={12} >
                    <Card className="card-height shadow" title="Setting options" >
                        {current === 'filters' && (
                            <>
                                <Row>
                                    <Col span={8}>
                                        <Checkbox checked={hateChecked} onChange={() => handleCheckboxChange('hate')}>Hate</Checkbox>
                                    </Col>
                                    <Col span={16}>
                                        <Slider
                                            min={2}
                                            max={6}
                                            step={2}
                                            marks={{
                                                2: 'Low',
                                                4: 'Medium',
                                                6: 'High',
                                            }}
                                            value={hate}
                                            onChange={handleSliderChangeHate}

                                        />
                                    </Col>
                                </Row>

                                <Divider />
                                <Row>
                                    <Col span={8}>
                                        <Checkbox checked={selfharmChecked} onChange={() => handleCheckboxChange('selfharm')}>Self-harm</Checkbox>
                                    </Col>
                                    <Col span={16}>
                                        <Slider
                                            min={2}
                                            max={6}
                                            step={2}
                                            marks={{
                                                2: 'Low',
                                                4: 'Medium',
                                                6: 'High',
                                            }}
                                            value={selfharm}
                                            onChange={handleSliderChangeSelfharm}

                                        />
                                    </Col>
                                </Row>

                                <Divider />
                                <Row>
                                    <Col span={8}>
                                        <Checkbox checked={sexualChecked} onChange={() => handleCheckboxChange('sexual')}>Sexual</Checkbox>
                                    </Col>
                                    <Col span={16}>
                                        <Slider
                                            min={2}
                                            max={6}
                                            step={2}
                                            marks={{
                                                2: 'Low',
                                                4: 'Medium',
                                                6: 'High',
                                            }}
                                            value={sexual}
                                            onChange={handleSliderChangeSexual}

                                        />
                                    </Col>
                                </Row>

                                <Divider />
                                <Row>
                                    <Col span={8}>
                                        <Checkbox checked={violenceChecked} onChange={() => handleCheckboxChange('violence')}>Violence</Checkbox>
                                    </Col>
                                    <Col span={16}>
                                        <Slider
                                            min={2}
                                            max={6}
                                            step={2}
                                            marks={{
                                                2: 'Low',
                                                4: 'Medium',
                                                6: 'High',
                                            }}
                                            value={violence}
                                            onChange={handleSliderChangeViolence}

                                        />
                                    </Col>
                                </Row>

                                <Divider />
                                <Button type="primary" icon={<SaveOutlined />} style={{ width: '100%' }} onClick={handleSave}>Save</Button>
                            </>
                        )}
                    </Card>
                </Col>
            </Row>



            <Row style={{ marginTop: '10px' }}>
                <Col span={24}>
                    <Card className="shadow" style={{ width: '100%' }}>
                        <Text strong>Category and risk level detection results</Text><br></br>
                        <Text>The content will be annotated as Safe, Low, Medium or High.</Text>
                        <Table columns={columns} dataSource={testResult} pagination={false} />
                    </Card>
                </Col>
            </Row>
        </>
    )
}
