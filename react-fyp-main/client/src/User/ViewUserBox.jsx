import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';
import { useParams } from 'react-router-dom';
import { Avatar, Tag, Row, Col, Rate, Card } from 'antd';
import { MobileOutlined, UserOutlined, MailOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';

import BirthdayCakeIcon from '../IMG/BirthdayCakeIcon';


export default function ViewUserBox() {

  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(null);


  useEffect(() => {
    // Fetch the admin details when the component mounts
    axios.get(`/user/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        setUser(res.data);
        console.log(res.data);
      })
      .catch(err => {
        console.error(err);
      });


      axios.get(`/getUserRatingAvgMark/${user_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          setRating(res.data);
          console.log(res.data);
        })
        .catch(err => {
          console.error(err);
        });



  }, [user_id]); // Dependency array for useEffect






  // While the admin details are loading, display a loading message
  if (!user) {
    return <div>Loading user details...</div>;
  }


  if (!rating) {
    return <div>Loading rating details...</div>;
  }

  let photoUrl = buildAssetUrl('default-avatar.png');

  if (user.User_image) {
    photoUrl = buildAssetUrl(user.User_image);
  }




  return (
    <Card hoverable className='shadow' >

      <table >
        <tbody>
          <tr>
            <td rowSpan="2" style={{ width: "10%" }} > <Avatar icon={<UserOutlined/>} src={photoUrl} size={100} alt="user photo" /></td>
            <td style={{ paddingLeft: '3%', width: "90%" }}><b>User Name</b><br />  {user.Name}  </td>
          </tr>
          <tr>
            <td style={{ paddingLeft: '3%' }}><Rate disabled allowHalf defaultValue={0} value={rating.avgMark ?? 0}/>
              <br />({rating.avgMark ?? 0}/5.0) ({rating.totalRatings ?? 0})
            </td>
          </tr>
        </tbody>
      </table>


      <Row style={{ marginTop: '3%', marginBottom: '3%' }}>
        <Col span={20}>
          <div><b>Account Details</b></div>
          <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '3%' }}><UserOutlined /> ID:{' '}{user.ID} </div>
          <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '3%' }}><CalendarOutlined /> Create Date:{' '} {
            (() => {
              const date = new Date(user.User_Create_Date);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}.${month}.${year}`;
            })()
          }
          </div>
          <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '3%' }}><EnvironmentOutlined />Location: {user.User_Location}</div>


          <div style={{ marginLeft: '0.5%', marginTop: '5%', marginBottom: '2%' }}>
            <Tag color={user.is_suspended === 0 ? 'green' : 'volcano'}>
              {user.user === 0 ? 'ACTIVE' : 'SUSPENDED'}
            </Tag>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: '3%', marginBottom: '4%' }}><b>Contact</b></div>
      <div style={{ marginLeft: '1%', marginBottom: '3%' }}><MobileOutlined style={{ marginRight: '1%' }} /> {user.User_Contact_Number} </div>
      <div style={{ marginLeft: '1%', marginBottom: '6%' }}><MailOutlined style={{ marginRight: '1%' }} /> {user.User_Email}  </div>

      <div style={{ marginTop: '3%', marginBottom: '4%' }}><b>Peronsal Data</b></div>
      <div style={{ marginLeft: '1%', marginBottom: '3%' }}>
        {user.User_Birthday ? (() => {
          const date = new Date(user.User_Birthday);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return <span><BirthdayCakeIcon style={{ marginRight: '1%', width: '1em', height: '1em' }} />{`${day}.${month}.${year}`}</span>;
        })() : null}
      </div>


      <div style={{ marginLeft: '1%', marginBottom: '5%' }}>
        {user.User_Gender === null ? null :
          user.User_Gender === 'Male' ? <Tag color="blue">Male</Tag> : <Tag color="pink">Female</Tag>
        }
        <div style={{ marginTop: '3%', marginBottom: '4%' }}>About Me</div>
        <div style={{ marginLeft: '1%', marginBottom: '3%' }}>
          {/* Replace this with the actual about me content */}
          <p>{user.User_AboutMe}</p>
        </div>





      </div>

    </Card>
  )
}
