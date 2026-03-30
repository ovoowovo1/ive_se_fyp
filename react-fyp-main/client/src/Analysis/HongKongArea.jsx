import React, { useState, useEffect } from 'react';
import { Card, Divider } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'shared/api/http';
import { GOOGLE_MAPS_API_KEY } from 'shared/config/env';

function getLongNamesWithDistrict(payload) {
    const results = payload.results;
    const longNamesWithDistrict = [];

    for (const result of results) {
        const addressComponents = result.address_components;

        for (const component of addressComponents) {
            const longName = component.long_name;

            if (longName.includes('?')) {
                longNamesWithDistrict.push(longName);
                break;
            }
        }
    }

    return longNamesWithDistrict;
}

async function getDistrictByLatLng(lat, lon) {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await axios.get(url);
        const results = response.data.results;

        if (results && results.length > 0) {
            const longNamesWithDistrict = getLongNamesWithDistrict(response.data);
            if (longNamesWithDistrict.length > 0) {
                return longNamesWithDistrict[0];
            }
        }

        return 'Unknown';
    } catch (error) {
        console.error("Error fetching district info:", error);
        return 'Unknown';
    }
}

export default function HongKongArea() {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            setData([]);
            return;
        }

        const loadDistrictData = async () => {
            try {
                const response = await axios.get('/getMapDonationItemDataAndlatlon', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const districtMap = {};
                for (const item of response.data) {
                    const district = await getDistrictByLatLng(item.lat, item.lon);
                    districtMap[district] = (districtMap[district] || 0) + 1;
                }

                setData(
                    Object.keys(districtMap).map(key => ({
                        name: key,
                        count: districtMap[key]
                    })),
                );
            } catch (error) {
                console.error("Error in getting data from backend:", error);
            }
        };

        loadDistrictData();
    }, []);

    return (
        <>
            <Card className="shadow">
                <Divider>Number of baby items donated by various districts in Hong Kong</Divider>
                {!GOOGLE_MAPS_API_KEY && <div>Google Maps is not configured.</div>}
                <ResponsiveContainer height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </>
    );
}
