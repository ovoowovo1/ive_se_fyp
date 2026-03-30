import { Modal, Button, Steps, Card, Typography, Row, Col, message, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { useParams, Link } from 'react-router-dom';

const { Step: _Step } = Steps;
const { Text, Title } = Typography;




export default function ViewHumanReport() {
    const Login_id = localStorage.getItem('Login_id');
    const { humanReportID } = useParams();
    const [report, setReport] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [caseOutcome, setCaseOutcome] = useState('');

    const showConfirmationModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        if (report.Report_Handle === 1) {
            updateReportStatus(caseOutcome);
        } else {
            updateReportStatus();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        // Fetch the admin details when the component mounts
        axios.get(`/HumanReport/${humanReportID}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                setReport(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }, [humanReportID]); // Dependency array for useEffect

    // While the admin details are loading, display a loading message
    if (!report) {
        return <div>Loading report details...</div>;
    }


    const convertUTCtoGMT8 = (utcDateTime) => {
        if (utcDateTime === null) {
            return ('');
        }
        const date = new Date(utcDateTime);
        date.setTime(date.getTime() + (8 * 3600000));
        return date.toISOString().replace('T', ' ').slice(0, 19);
    };


    const renderHandleStatus = (handleStatus) => {
        if (handleStatus === 0) {
            return "Not Processed";
        } else if (handleStatus === 1) {
            return "Processing";
        } else if (handleStatus === 2) {
            return "Processed";
        } else {
            return "Unknown Status"; // For any other value
        }
    };

    const nowDateTime = () => {
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();

        const todayDateAndTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        return todayDateAndTime;
    }




    const updateReportStatus = (caseOutcome = '') => {
        let newStatus;
        if (report.Report_Handle === 0) {
            newStatus = 1;
        } else if (report.Report_Handle === 1) {
            newStatus = 2;
        }

        axios.post(`/HumanReport/${humanReportID}/updateStatus`, { newStatus, Login_id, caseOutcome }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                if (newStatus === 1) {
                    setReport({ ...report, Report_Handle: newStatus, Report_Admin_ID: Login_id, Report_Processing_DateTime: nowDateTime() });
                } else {
                    setReport({ ...report, Report_Handle: newStatus, Report_Admin_ID: Login_id, Report_Processed_DateTime: nowDateTime(), Report_Case_Outcome: caseOutcome });
                }
                setCaseOutcome('');
                message.success('Report status updated successfully');
            })
            .catch(err => {
                console.error(err);
                message.error('Failed to update report status');
            });
    };

    return (
        <>

            <Title level={3}><b>Report Details</b></Title>
            <Title level={4}><b>Report ID : {report.Report_ID}</b></Title>
            <br></br>

            <Row >
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Report Date Time: </Text><Text className='fontSize14'>{convertUTCtoGMT8(report.Report_DateTime)}</Text>
                </Col>
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Handle Status: </Text><Text className='fontSize14'>{renderHandleStatus(report.Report_Handle)}</Text>
                </Col>
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Handle By: </Text><Text className='fontSize14'> <Link to={`/admin/${Login_id}/${report.Report_Admin_ID}/admindetail`}>{report.Report_Admin_ID}</Link></Text>
                </Col>
            </Row>

            <Row style={{ marginTop: '10px' }}>
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Reporter ID: </Text><Text className='fontSize14'><Link to={`/admin/${Login_id}/${report.Report_Reporter_ID}/user/edit`}>{report.Report_Reporter_ID}</Link></Text>
                </Col>
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Report Type: </Text><Text className='fontSize14'>{report.Report_Type} </Text>
                </Col>
            </Row>

            <Row style={{ marginTop: '10px' }}>
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Associated Users ID: </Text><Text className='fontSize14'><Link to={`/admin/${Login_id}/${report.Report_User_ID}/user/edit`}>{report.Report_User_ID}</Link></Text>
                </Col>
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Associated Donation ID: </Text><Text className='fontSize14'> <Link to={`/admin/${Login_id}/${report.Report_Donation_Item_ID}/donatededit`}>{report.Report_Donation_Item_ID}</Link></Text>
                </Col>
            </Row>

            <Row style={{ marginTop: '10px' }}>
                <Col span={8}>
                    <Text type="secondary" className='fontSize14'>Report Reason: </Text><Text className='fontSize14'>{report.Report_Content}</Text>
                </Col>
            </Row>




            {report.Report_Handle === 2 && (
                <Card style={{ marginTop: '10px' }} title="Case Outcome">
                    <Text>{report.Report_Case_Outcome}</Text>
                </Card>
            )}


            <Card style={{ marginTop: '10px' }} title="Process Progress">
                <Steps
                    style={{ marginTop: '10px' }}
                    progressDot
                    current={report.Report_Handle}
                    items={[
                        {
                            title: 'Not processed',
                            description: convertUTCtoGMT8(report.Report_DateTime),
                        },
                        {
                            title: 'Processing',
                            description: (
                                <div>
                                    <div>{convertUTCtoGMT8(report.Report_Processing_DateTime)}</div>
                                    <div>Admin ID: {report.Report_Admin_ID}</div>
                                </div>
                            ),
                        },
                        {
                            title: 'Processed',
                            description: convertUTCtoGMT8(report.Report_Processed_DateTime),
                        },
                    ]}>
                </Steps>
                <div style={{ marginTop: 16 }}>
                    <Modal
                        title="Confirm Action"
                        visible={isModalVisible}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        okButtonProps={{ disabled: report.Report_Handle === 1 && !caseOutcome }}
                    >
                        <p>Are you sure you want to change the status of this report?</p>
                        {report.Report_Handle === 1 && (
                            <>
                                <p>Please enter the case outcome:</p>
                                <Input.TextArea
                                    value={caseOutcome}
                                    onChange={(e) => setCaseOutcome(e.target.value)}
                                    rows={4}
                                    placeholder="Enter the case outcome"
                                />
                            </>
                        )}
                    </Modal>
                    {report.Report_Handle !== 2 && (
                        <Button
                            type="primary"
                            onClick={showConfirmationModal}
                        >
                            {report.Report_Handle === 0 ? "Mark as processing" : "Mark as Processed"}
                        </Button>
                    )}
                </div>
            </Card>

        </>
    )
}
