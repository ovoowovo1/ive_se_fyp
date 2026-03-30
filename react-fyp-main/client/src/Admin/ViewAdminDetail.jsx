import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';
import { useParams } from 'react-router-dom';
import { Typography, Avatar, Tag, Row, Col, Checkbox, Card } from 'antd';
import { MobileOutlined, UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';


import Backpage from '../UI/Backpage';
const { Title, Text: _Text } = Typography;
export default function ViewAdminDetail() {
  const { admin_id } = useParams();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Fetch the admin details when the component mounts
    axios.get(`/admin/${admin_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        console.log(res.data);
        setAdmin(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [admin_id]); // Dependency array for useEffect

  // While the admin details are loading, display a loading message
  if (!admin) {
    return <div>Loading admin details...</div>;
  }

  const formattedDate = moment(admin.Admin_Create_Date).format('MMMM Do YYYY, h:mm:ss a');

  return (
    < >
      <Title level={3} ><b>Admin Detail</b></Title>

      <Card>

        <table style={{ width: "100%" }}>
          <tr>
            <td rowSpan="2" style={{ width: "10%" }} > <Avatar  icon={<UserOutlined/>} size={100} src={buildAssetUrl(admin.Admin_Photo)} alt="Admin photo" /></td>
            <td style={{ paddingLeft: '3%' }}><b>Admin Name</b><br />  {admin.Admin_Name}  </td>
          </tr>
          <tr>
            <td style={{ paddingLeft: '3%' }}><b>Job Title</b><br />  {admin.Admin_Job_Title}  </td>
          </tr>
        </table>



        <Row style={{ marginTop: '3%', marginBottom: '3%' }}>
          <Col span={10}>
            <div>Account Details</div>
            <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '3%' }}><UserOutlined /> ID:{' '}{admin.Admin_ID} </div>
            <div style={{ marginLeft: '0.5%', marginTop: '5%' }}><CalendarOutlined /> Create Date:{' '} {formattedDate}
            </div>
            <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '2%' }}>
              <Tag color={admin.Admin_Suspended === 0 ? 'green' : 'volcano'}>
                {admin.Admin_Suspended === 0 ? 'ACTIVE' : 'SUSPENDED'}
              </Tag>
            </div>
          </Col>
          <Col span={8}>
            <div>Admin Permissions</div>
            <div style={{ marginLeft: '0.5%', marginBottom: '3%' }}>
              <Checkbox checked={admin.Admin_Permission_User} style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '3%' }}>User</Checkbox>
              <Checkbox checked={admin.Admin_Permission_Admin}>Admin</Checkbox>
              <Checkbox checked={admin.Admin_Permission_Analysis}>Analysis</Checkbox>
              <Checkbox checked={admin.Admin_Permission_Donate}>Donate</Checkbox>
              <Checkbox checked={admin.Admin_Permission_Announcement}>Announcement</Checkbox>
              <Checkbox checked={admin.Admin_Permission_Violation}>Violation</Checkbox>

            </div>
          </Col>
        </Row>


        <div style={{ marginTop: '3%', marginBottom: '3%' }}>Contact</div>
        <div style={{ marginLeft: '0.5%', marginBottom: '2%' }}><MobileOutlined /> {admin.Admin_Contact_Number} </div>
        <div style={{ marginLeft: '0.5%', marginBottom: '3%' }}><MailOutlined /> {admin.Admin_Email}  </div>
      </Card>
      <Backpage />
    </>
  );
}
