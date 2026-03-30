import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { useParams } from 'react-router-dom';
import { Card, List, Divider, Select } from 'antd';

import DonatedItemBox from '../Donate/DonatedItemBox';


export default function UserDonatedItem() {

  const { user_id } = useParams();
  const [donatedItems, setDonatedItems] = useState([]);
  const { Option: _Option } = Select;
  const _Login_id = localStorage.getItem('Login_id');


  useEffect(() => {
    axios.get(`/user/${user_id}/donateitem`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        setDonatedItems(res.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [user_id]);




  return (
    <>
          <Card style={{ marginLeft: '8%' ,marginBottom:'100px' }}>
            <h1 style={{ paddingTop: '3%', paddingLeft: '3%', margin: '0', display: 'inline-block', marginRight: '43%' }}>Donated Item</h1>


            <Divider style={{ marginLeft: '0' }} />
            <div style={{ padding: '20px', boxSizing: 'border-box' }}>
              <List
                itemLayout="horizontal"
                dataSource={donatedItems}
                grid={{
                  gutter: 16,
                  column: 2,
                }}
                renderItem={item => (
                  <List.Item>
                    <DonatedItemBox item={item} />
                  </List.Item>
                )}
              />
            </div>

          </Card>
      
    </>
  )
}
