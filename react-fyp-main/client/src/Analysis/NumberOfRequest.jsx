import { Card, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'shared/api/http';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AAAAAA', '#FFC0CB', '#6050DC', '#123456'];

export default function NumberOfRequest() {

    const [chartData, setChartData] = useState([]);
    const { Text, Title: _Title } = Typography;

    useEffect(() => {
        axios.get(`/api/NumberOfRequestitem`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                console.log(res.data);
                const formattedData = res.data.map((item, index) => ({
                    name: item.classification_Name,
                    value: item.ItemCount,
                    fill: COLORS[index % COLORS.length] // 循環使用顏色
                }));
                setChartData(formattedData);
            })
            .catch(err => console.log(err));
    }, []);

    const renderCustomizedLabel = ({
        cx, cy, midAngle, innerRadius: _innerRadius, outerRadius, percent: _percent, index
    }) => {
        // 如果數值為0，則不渲染標籤
        if (chartData[index].value === 0) {
            return null;
        }
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 10;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${chartData[index].name} (${chartData[index].value})`}
            </text>
        );
    };

    return (
        <Card className='shadow'>
            <Text strong>User Request Posts</Text>
            <ResponsiveContainer height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={renderCustomizedLabel}
                        labelLine={false}
                    >
                        {
                            chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                        }
                    </Pie>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    )
}
