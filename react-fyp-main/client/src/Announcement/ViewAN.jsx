import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';
import { useParams } from 'react-router-dom';
import { Card, Tag, Row, Col, Image, Typography, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Link } from 'react-router-dom';


export default function ViewAN() {

  const { alldonateditemID } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const { Title, Text } = Typography;

  useEffect(() => {
    // Fetch the admin details when the component mounts
    axios.get(`/SpecifyAnnouncementData/${alldonateditemID}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        setAnnouncement(res.data);
        console.log(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [alldonateditemID]); // Dependency array for useEffect

  // While the admin details are loading, display a loading message
  if (!announcement) {
    return <div>Loading announcement {alldonateditemID}  details...</div>;
  }


  // 將announcement.Announcement_Content按換行符拆分並渲染
  const renderContentWithLineBreaks = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <>
    <Title level={2}>Announcement Details</Title>
      <Card bordered={false} style={{ width: '100%' }} hoverable className='shadow'>
        <Row gutter={16}>
          <Col span={8}>

            <Image
              style={{ width: '95%' }}
              src={buildAssetUrl(announcement.Announcement_Image)}
            />
          </Col>
          <Col span={[16, 16]}>
            <Space direction="vertical">
              <Title level={2}>{announcement.Announcement_Title}</Title>
              <Text>
                {renderContentWithLineBreaks(announcement.Announcement_Content)}
              </Text>
              <Row>
                <Col>
                  <CalendarOutlined /> {moment.utc(announcement.Announcement_DateTime).local().format('MMMM Do YYYY, HH:mm:ss')}
                </Col>


              </Row>
              <Row>
                <Col>
                  {announcement.Announcement_On_Shelf_Status === "1" ? (
                    <Tag color="green">On Shelf</Tag>
                  ) : (
                    <Tag color="red">Off Shelf</Tag>
                  )}
                </Col>
              </Row>
              <Row>
                Post by: {announcement.Name} <Link to={`../${announcement.Announcement_AdminID}/admindetail`}>({announcement.Announcement_AdminID})</Link>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>
    </>
  )
}
