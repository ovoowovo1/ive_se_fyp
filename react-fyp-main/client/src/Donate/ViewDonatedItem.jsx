import React, { useState, useRef, useEffect } from 'react';
import { Carousel, Button, Modal, Divider, Row, Col, Avatar, Rate, Typography, Card } from 'antd';
import { PictureOutlined, EnvironmentOutlined, ClockCircleOutlined ,UserOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import axios from 'shared/api/http';
import { buildAssetUrl } from 'shared/config/env';



import UserToUserTransmission from '../SVG/UserToUserTransmission';
import CateIcon1 from '../IMG/CateIcon';
import Product from '../SVG/Product';


const ViewDonatedItem = () => {
    const { donateditem_id } = useParams();
    const carousel = useRef();
    const [visible, setVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState('');
    const [donatedItem, setDonatedItem] = useState(null);

    const [donatedItemDetail, setDonatedItemDetail] = useState(null);
    const [attributeData, setAttributeData] = useState(null);
    const [validEntries, setValidEntries] = useState(null);
    const [user, setUser] = useState(null);
    const [rating, setRating] = useState(null);
    const [slides, setSlides] = useState([]);
    const { Text } = Typography;
    const Login_id = localStorage.getItem('Login_id');

    useEffect(() => {
        axios.get(`/donateitem/${donateditem_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                setDonatedItem(res.data);
                console.log(res.data);

                // Add this block to extract the photo URLs and set them to the slides state variable
                if (res.data.photos && Array.isArray(res.data.photos)) {
                    // Ensure that photos is not null or undefined
                    const photoUrls = res.data.photos.map(photoObj => {
                        // Make sure the photoObj and Donate_Photo property exist and are not null
                        return photoObj && photoObj.Donate_Photo
                            ? buildAssetUrl(photoObj.Donate_Photo)
                            : null; // or some default photo URL if desired
                    }).filter(url => url !== null); // Filter out any null values that were returned due to missing data

                    setSlides(photoUrls);
                }

                axios.get(`/getclassification/${res.data.Donate_Item_type}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(res => {
                        setAttributeData(res.data);
                        console.log("getclassification", res.data);
                    })
                    .catch(err => {
                        console.error(err);
                    });



                axios.get(`/donateitemdetail/${donateditem_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(res => {
                        setDonatedItemDetail(res.data);
                        console.log(res.data);
                    })
                    .catch(err => {
                        console.error(err);
                    });


                // Call the second API after setting the donatedItem
                if (res.data && res.data.Donate_User_ID) {
                    axios.get(`/user/${res.data.Donate_User_ID}`, {
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


                    axios.get(`/getUserRatingAvgMark/${res.data.Donate_User_ID}`, {
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
                }
            })
            .catch(err => {
                console.error(err);
            });
    }, [donateditem_id]); // Dependency array for useEffect



    useEffect(() => {
        // 从 donatedItemDetail 筛选出有效的键值对
        if (donatedItemDetail && attributeData) {
            const updatedEntries = Object.entries(donatedItemDetail).filter(
                ([key, value]) => {
                    // 确认值不是 null 并且键不是 'Item_details_ID'
                    const isValueNotNull = value !== null;
                    const isKeyNotItemDetailsID = key !== 'Item_details_ID';

                    // 确认键存在于 attributeData 的 Attribute_Name 中
                    const attributeInfo = attributeData.find(attr => attr.Attribute_Name === key);
                    const isKeyInAttributeData = !!attributeInfo;

                    return isValueNotNull && isKeyNotItemDetailsID && isKeyInAttributeData;
                }
            ).map(([key, value]) => {
                // 查找对应的 Attribute_DataType
                const attributeInfo = attributeData.find(attr => attr.Attribute_Name === key);

                if (attributeInfo && attributeInfo.Attribute_DataType === 'date') {
                    // 如果 DataType 是 date，转换为 UTC+8
                    const date = new Date(value);
                    const utcDate = new Date(date.getTime() + (8 * 60 * 60 * 1000)); // 转换为 UTC+8
                    // 格式化日期为 YYYY-MM-DD
                    const formattedDate = utcDate.toISOString().split('T')[0];
                    value = formattedDate;
                }
                return [key, value];
            });

            setValidEntries(updatedEntries);
            console.log(updatedEntries);
        }
    }, [donatedItemDetail, attributeData]);


    const handleImageClick = (slide) => {
        setCurrentSlide(slide);
        setVisible(true);
    };

    const handleOk = () => {
        setVisible(false);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const next = () => {
        carousel.current.next();
    }

    const previous = () => {
        carousel.current.prev();
    }





    if (!donatedItem) {
        return <div>Loading donated item details...</div>;
    }

    if (!user) {
        return <div>Loading user details...</div>;
    }

    if (!rating) {
        return <div>Loading rating...</div>;
    }


    return (
        <>
            <h2>Donated Item Detail</h2>
            <div style={{ height: '60vh', width: '75vw' }}>

                <Carousel ref={carousel}>
                    {
                        slides ? (
                            slides.map((slide, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleImageClick(slide)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            handleImageClick(slide);
                                        }
                                    }}
                                    className="carousel-div"
                                    role="button"
                                    tabIndex={0}
                                >
                                    <img src={slide} alt={`Slide ${index}`} style={{ width: '100%', height: '55vh', objectFit: 'cover', borderRadius: '10px' }} />
                                </div>
                            ))
                        ) : (
                            // Fallback UI, could be a loader or a message
                            <div>Loading images...</div>
                        )
                    }
                </Carousel>

                <Modal open={visible} onOk={handleOk} onCancel={handleCancel} width={800} footer={null}>
                    <img src={currentSlide} style={{ width: '100%', height: 'auto' }} alt="Donation preview" />
                </Modal>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                    <Button style={{ marginRight: '10px' }} onClick={previous}>Previous</Button>
                    <Button style={{ marginRight: '10px' }} onClick={next}>Next</Button>
                    <PictureOutlined style={{ marginRight: '5px' }} /> {slides.length}
                </div>
            </div>
            <Divider />
            <div className="containerViewDonatedItem">
                <div className="itemData">
                    <Row >
                        <Col span={24}><h2>{donatedItem.Donate_Item_Name}</h2></Col>
                        <Col span={8} style={{ fontSize: '15px' }}><Product style={{ marginRight: '5px' }} />{donatedItem.Donate_Item_Status}</Col>
                        <Col span={8} style={{ fontSize: '15px' }}><UserToUserTransmission style={{ marginRight: '5px' }} />

                            {donatedItem.Donate_Item_Meetup === 'T' && 'Meet up'}
                            {donatedItem.Donate_Item_Meetup === 'T' && donatedItem.Donate_Item_MailingDelivery === 'T' && ', '}
                            {donatedItem.Donate_Item_MailingDelivery === 'T' && 'Mailing Delivery'}
                        </Col>
                        <Col span={8} style={{ fontSize: '15px' }}>
                            <EnvironmentOutlined style={{ marginRight: '5px' }} />
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donatedItem.Donate_Item_Location)}`} target="_blank" rel="noopener noreferrer">
                                {donatedItem.Donate_Item_Location}
                            </a>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}><h2>Donated Describe</h2></Col>
                    </Row>
                    <Row>
                        <Col span={8}>Publication time</Col>
                        <Col span={8}>Item type</Col>
                    </Row>
                    <Row gutter={[0, 24]}>
                        <Col span={8}>

                            <ClockCircleOutlined style={{ marginRight: '5px' }} />
                            {new Date(donatedItem.Donate_Item_Post_Date).toLocaleString(undefined, { hour12: false })}
                        </Col>

                        <Col span={8}><CateIcon1 style={{ width: '1em', height: '1.1em', marginRight: '5px' }} />{donatedItem.Donate_Item_type}</Col>

                        <Col span={24}>{donatedItem.Donate_Item_Describe}</Col>
                        <Col span={24}><h2>Donated Details</h2></Col>
                    </Row>

                    {
                        validEntries && validEntries.length > 0 ? (
                            validEntries.map(([_key, _value], index) => {
                                // Check if the key should start on a new row.
                                const isNewRow = index % 3 === 0;
                                if (isNewRow) {
                                    // Get the next 3 items from the current index.
                                    const nextItems = validEntries.slice(index, index + 3);
                                    return (
                                        <Row key={`row-${index}`} gutter={[0, 24]}>
                                            {nextItems.map(([key, value]) => (
                                                <Col key={key} span={8}>
                                                    <strong>{key}:</strong> {value.toString()}
                                                </Col>
                                            ))}
                                        </Row>
                                    );
                                }
                                return null; // For items that don't start a new row, return null.
                            })
                        ) : (
                            // If validEntries is null or empty, you can return null or some fallback UI.
                            null
                        )
                    }

                    <Row>
                        <Col span={24}>
                            <h2>
                                {donatedItem.Donate_Item_Meetup === 'T' && donatedItem.Donate_Item_MailingDelivery === 'T'
                                    ? 'Meet up or Delivery details'
                                    : donatedItem.Donate_Item_Meetup === 'T'
                                        ? 'Meet up details'
                                        : donatedItem.Donate_Item_MailingDelivery === 'T'
                                            ? 'Delivery details'
                                            : null
                                }
                            </h2>
                        </Col>
                    </Row>
                    <Row >
                        <Col span={24}>
                            {donatedItem.Donate_Item_Meetup === 'T' && (
                                <>
                                    <span>Meetup Location : </span>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donatedItem.Donate_Item_MeetupLocation)}`} target="_blank" rel="noopener noreferrer">
                                        {donatedItem.Donate_Item_MeetupLocation}
                                    </a>
                                </>
                            )}
                        </Col>
                    </Row>

                    <Row style={{ marginTop: '10px' }}>
                        <Col span={24}>
                            {donatedItem.Donate_Item_MailingDelivery === 'T' && 'Delivery Method : ' + donatedItem.Donate_Item_MailingDeliveryMethod}
                        </Col>
                    </Row>



                </div>


                <div className="userData">
                    <Card hoverable className='shadow'>
                        <table style={{ width: "100%", marginBottom: '10px' }}>
                            <tbody>
                                <tr>
                                    <td rowSpan="2" style={{ width: "10%", verticalAlign: 'top' }} > 
                                    
                                    <Avatar size={70}
                                    icon={<UserOutlined />}
                                    src={
                                        user.User_image
                                            ? buildAssetUrl(user.User_image)
                                            : ''   } 
 />
                                    </td>
                                    <td style={{ paddingLeft: '3%', width: "90%" }}> {user.Name}  <br />
                                        <Link to={`/admin/${Login_id}/${user.ID}/user/view/`} ><Text underline>@{user.ID}</Text></Link>

                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: '3%' }}>({rating.avgMark ?? 0}/5)
                                        <Rate disabled allowHalf defaultValue={0} value={rating.avgMark} />
                                        ({rating.totalRatings ?? 0})
                                        <br /><Text type="secondary"></Text>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </Card>
                </div>
            </div>
        </>
    );
};

export default ViewDonatedItem;
