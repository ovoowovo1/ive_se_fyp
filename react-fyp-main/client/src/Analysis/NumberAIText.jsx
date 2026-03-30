import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Card, Typography, DatePicker, Divider, Button } from 'antd';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

dayjs.extend(utc);
dayjs.extend(timezone);


export default function NumberAIText() {
    const [chartData, setChartData] = useState([]);
    const { Text } = Typography;
    const { RangePicker } = DatePicker;
    const [dates, setDates] = useState([]);

    useEffect(() => {
        handleTimeChange('week');
    }, []);

    useEffect(() => {
        if (dates.length === 2 && dates[0] && dates[1]) {
            const startDate = dates[0].format('YYYY-MM-DD');
            const endDate = dates[1].format('YYYY-MM-DD');

            axios.get(`/api/numbertextviolation?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => {
                    console.log(res.data);
                    const nextChartData = res.data.map(item => ({
                        name: item.Date,
                        ...item
                    }));

                    setChartData(nextChartData);
                })
                .catch(err => console.log(err));
        }
    }, [dates]);

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
        const startDate = dates[0].format('YYYY-MM-DD');
        const endDate = dates[1].format('YYYY-MM-DD');

        axios.get(`/api/numbertextviolation?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                const chartData = res.data.map(item => ({
                    name: item.Date,
                    ...item
                }));

                setChartData(chartData);
            })
            .catch(err => console.log(err));
    };

    const handleDateChange = (value) => {
        setDates(value);
    };

    const utcDateTickFormatter = (tick) => {
        return dayjs.utc(tick).tz('Asia/Singapore').format('YYYY-MM-DD');
    };

    const tooltipFormatter = (props) => {
        const { active, payload, label } = props;
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`Date: ${dayjs.utc(label).tz('Asia/Singapore').format('YYYY-MM-DD')}`}</p>
                    {payload.map((entry, index) => (
                        <p key={`item-${index}`} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className='shadow'>
            <Text strong>AI Text Violations</Text>

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
            <ResponsiveContainer height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="name" tickFormatter={utcDateTickFormatter} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                        content={tooltipFormatter}
                        contentStyle={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}
                    />
                    <Legend />
                    <Bar dataKey="Hate_0" fill="#8884d8" name="Hate 0" />
                    <Bar dataKey="Hate_2" fill="#8884d8" name="Hate 2" />
                    <Bar dataKey="Hate_4" fill="#8884d8" name="Hate 4" />
                    <Bar dataKey="Hate_6" fill="#8884d8" name="Hate 6" />
                    <Bar dataKey="SelfHarm_0" fill="#82ca9d" name="Self Harm 0" />
                    <Bar dataKey="SelfHarm_2" fill="#82ca9d" name="Self Harm 2" />
                    <Bar dataKey="SelfHarm_4" fill="#82ca9d" name="Self Harm 4" />
                    <Bar dataKey="SelfHarm_6" fill="#82ca9d" name="Self Harm 6" />
                    <Bar dataKey="Sexual_0" fill="#ffc658" name="Sexual 0" />
                    <Bar dataKey="Sexual_2" fill="#ffc658" name="Sexual 2" />
                    <Bar dataKey="Sexual_4" fill="#ffc658" name="Sexual 4" />
                    <Bar dataKey="Sexual_6" fill="#ffc658" name="Sexual 6" />
                    <Bar dataKey="Violence_0" fill="#ff7300" name="Violence 0" />
                    <Bar dataKey="Violence_2" fill="#ff7300" name="Violence 2" />
                    <Bar dataKey="Violence_4" fill="#ff7300" name="Violence 4" />
                    <Bar dataKey="Violence_6" fill="#ff7300" name="Violence 6" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
