import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import dayjs from 'dayjs';
import moment from 'moment';


import { Card, Typography, DatePicker, Divider, Button } from 'antd';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


export default function NumberOfRegistered() {

    const [chartData, setChartData] = useState([]);
    const { Text, Title: _Title } = Typography;
    const { RangePicker } = DatePicker;

    const [dates, setDates] = useState([]);


    useEffect(() => {
        // Set the default date range to the last 7 days
        handleTimeChange('week');
    }, []);

    useEffect(() => {
        // Call search whenever dates change
        if (dates.length === 2 && dates[0] && dates[1]) {
            const startDate = dates[0].format('YYYY-MM-DD');
            const endDate = dates[1].format('YYYY-MM-DD');

            axios.get(`/api/newaccounts2?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => {
                    console.log(res.data);

                    const nextChartData = res.data.map(item => ({
                        name: item.CreateDate,
                        value: item.NewAccounts
                    }));

                    setChartData(nextChartData);
                })
                .catch(err => console.log(err));
        }
    }, [dates]); // Only re-run the effect if dates changes



    const handleTimeChange = (type) => {
        const end = dayjs().endOf('day');
        let start;

        switch (type) {
            case 'today':
                start = dayjs().startOf('day');
                break;
            case 'week':
                start = dayjs().subtract(1, 'week').startOf('day');
                break;
            case 'month':
                start = dayjs().subtract(1, 'month').startOf('day');
                break;
            case 'year':
                start = dayjs().subtract(1, 'year').startOf('day');
                break;
            default:
                start = end;
        }

        setDates([start, end]);
    };


    const search = () => {
        // Format dates for the query parameters
        const startDate = dates[0].format('YYYY-MM-DD');
        const endDate = dates[1].format('YYYY-MM-DD');

        axios.get(`/api/newaccounts2?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);

                const chartData = res.data.map(item => ({
                    name: item.CreateDate,
                    value: item.NewAccounts
                }));


                setChartData(chartData);
            })
            .catch(err => console.log(err));
    };


    const handleDateChange = (value) => {
        setDates(value);
    };

    const utcDateTickFormatter = (tick) => {
        return moment.utc(tick).utcOffset(8).format('YYYY-MM-DD');
    };




    return (
        <Card className='shadow'>
            <Text strong>Number of registered</Text>

            <Button type="primary" style={{ float: 'right', marginLeft: '10px' }} onClick={() => search()}>Search</Button>

            <RangePicker
                value={dates.length ? [dayjs(dates[0]), dayjs(dates[1])] : []}
                format="YYYY-MM-DD"
                style={{ float: 'right', marginBottom: '10px' }}
                onChange={handleDateChange}
            />
            <Button type="text" style={{ float: 'right', marginBottom: '10px' }} onClick={() => handleTimeChange('year')}>Year</Button>
            <Button type="text" style={{ float: 'right', marginBottom: '10px' }} onClick={() => handleTimeChange('month')}>Month</Button>
            <Button type="text" style={{ float: 'right', marginBottom: '10px' }} onClick={() => handleTimeChange('week')}>Week</Button>
            <Button type="text" style={{ float: 'right', marginBottom: '10px' }} onClick={() => handleTimeChange('today')}>Today</Button>


            <Divider />
            <ResponsiveContainer height={300} >
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="name" tickFormatter={utcDateTickFormatter} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    )
}
