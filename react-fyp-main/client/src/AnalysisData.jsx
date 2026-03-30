import React, { useState } from 'react';
import axios from 'shared/api/http';
import dayjs from 'dayjs';
import moment from 'moment';


import { Card, Typography, DatePicker, Divider, Button } from 'antd';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalysisData() {




  const [chartData, setChartData] = useState([]);
  const [_chartWidth, _setChartWidth] = useState(window.innerWidth * 0.5);
  const [_selectedOption, _setSelectedOption] = useState('Number of recent logins');
  const { Text, Title } = Typography;
  const { RangePicker } = DatePicker;
  const [dates, setDates] = useState([]);




  {/* 
  useEffect(() => {
    axios.get('/api/newaccounts', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (res.status === 200) {
          const dataWithKeys = res.data.map(item => {
            // Convert CreateDate to a Date object
            let date = new Date(item.CreateDate);

            // Get month and date
            let month = date.getMonth() + 1; // getMonth() returns a zero-based value (0-11)
            let day = date.getDate();

            // Format month and date to a string (e.g., "12/31")
            let dateString = month + '/' + day;

            return { ...item, name: dateString, value: item.NewAccounts };
          });
          setData(dataWithKeys);
          console.log(dataWithKeys)
        } else {
          console.log(`Error: Server responded with status code ${res.status}`);
        }
      })
      .catch(err => console.log(err));
  }, []);


  useEffect(() => {
    const handleResize = () => setChartWidth(window.innerWidth * 0.8);

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
*/}

  const handleTimeChange = (type) => {
    const end = dayjs().endOf('day');
    let start;

    switch (type) {
      case 'today':
        start = dayjs().startOf('day');
        break;
      case 'week':
        start = dayjs().subtract(1, 'week').startOf('day'); // 一星期前的开始时间
        break;
      case 'month':
        start = dayjs().subtract(1, 'month').startOf('day'); // 一个月前的开始时间
        break;
      case 'year':
        start = dayjs().subtract(1, 'year').startOf('day'); // 一年前的开始时间
        break;
      default:
        start = end; // 如果没有匹配到任何条件，就设置为昨天（这句通常不会被执行）
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
        // Assuming the response has the data in the format that your chart expects
        const chartData = res.data.map(item => ({
          name: item.CreateDate,
          value: item.NewAccounts
        }));

        // Update your chart's data state here
        setChartData(chartData);
      })
      .catch(err => console.log(err));
  };


  const handleDateChange = (value) => {
    setDates(value);
  };

  const utcDateTickFormatter = (tick) => {
    return moment.utc(tick).format('YYYY-MM-DD'); // Format as a date without time
  };



  return (
    <>
      <Title level={3} ><b>Analysis</b></Title>

      {/* 
      <Text>Mode:</Text>
      <Select
        value={selectedOption}
        style={{ width: 200, marginLeft: '10px', marginBottom: '30px' }}
        onChange={value => setSelectedOption(value)}
      >
        <Select.Option value="登入人數">Number of recent logins</Select.Option>
        <Select.Option value="其他選項1">其他選項1</Select.Option>
        <Select.Option value="其他選項2">其他選項2</Select.Option>
      </Select>

      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
*/}

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

    </>
  );
}