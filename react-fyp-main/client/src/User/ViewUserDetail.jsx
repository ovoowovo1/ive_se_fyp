import React from 'react';

import { Row, Col, Typography } from 'antd';

import { Outlet } from 'react-router-dom';


import ViewUserNav from './ViewUserNav';
import ViewUserBox from './ViewUserBox';

const { Text: _Text, Title } = Typography;

export default function ViewUserDetail() {


  return (
    <>

      <Row>
        <Col span={8}><Title level={3}><b>User Detail</b></Title></Col>
        <Col span={16} > <br />
          <ViewUserNav />
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          <ViewUserBox />
        </Col>
        <Col span={16}>

          <Outlet />

        </Col>
      </Row>

    </>
  )
}
