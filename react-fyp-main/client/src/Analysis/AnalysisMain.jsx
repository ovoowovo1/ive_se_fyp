import React from 'react'
import NumberOfRegistered from './NumberOfRegistered'
import NumberOfDonation from './NumberOfDonation';
import NumberOfRequest from './NumberOfRequest';
import HongKongArea from './HongKongArea';

import NumberAIText from './NumberAIText'
import { Typography, Row, Col } from 'antd';


export default function AnalysisMain() {

    const { Text: _Text, Title } = Typography;


    return (
        <>
            <Title level={3} ><b>Analysis</b></Title >
            <Row gutter={[16, 24]}>
                <Col span={12}><NumberOfDonation /></Col>

                <Col span={12}><NumberOfRequest /></Col>

                <Col span={24}>
                    <NumberOfRegistered />
                </Col>

                
                <Col span={24}>
                    <NumberAIText />
                </Col>

                <Col span={24}>
                    <HongKongArea />
                </Col>

            </Row>

        </>
    )
}
