import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';

import { Card, Divider, Select } from 'antd';

import { useParams } from 'react-router-dom';


import CommentBox from './CommentBox';


export default function UserRating() {
    const { Option: _Option } = Select;
    const [data, setData] = useState([]);
    const { user_id } = useParams();

    useEffect(() => {
        axios.get('/api/user-about', {
            params: {
                userID: user_id
            }
        })
            .then(res => {
                const dataWithKeys = res.data.map(item => ({ ...item, key: item.ID }));
                setData(dataWithKeys);
                console.log(dataWithKeys);
            })
            .catch(err => console.log(err));
    }, [user_id]);


    return (
        <>
            <Card style={{ marginLeft: '8%', height: '100%', padding: '10px' }}>
                <h1 style={{ paddingTop: '3%', paddingLeft: '3%', margin: '0', display: 'inline-block', marginRight: '58%' }}>Rating</h1>

                <Divider style={{ marginLeft: '0' }} />
                <CommentBox data={data} />
            </Card>
        </>
    )
}
