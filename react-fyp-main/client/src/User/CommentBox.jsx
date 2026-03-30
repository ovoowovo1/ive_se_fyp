import React from 'react'
import { Avatar, Rate, Image, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { buildAssetUrl } from 'shared/config/env';



export default function CommentBox({ data }) {
    return (
        <>
            {data.map((comment) => (
                <Card className='shadow' key={comment.ID} style={{marginTop:'10px'}}>
                    <table style={{ width: '95%', marginBottom: '0px' }}>
                        <tbody>
                            <tr>
                                <td rowSpan="4" style={{ width: '10%', verticalAlign: 'top', paddingRight: '5px' }} >
                                    {comment.User_image ? (
                                        <Avatar size={50} icon={<UserOutlined />} 
                                            src={buildAssetUrl(comment.User_image)}
                                        />
                                    ) : (
                                        <Avatar size={50} icon={<UserOutlined />} />
                                    )}
                                </td>
                                <td>
                                    {comment.SenderID} Review ∙ {new Date(comment.CommentDate).toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })}
                                </td>
                            </tr>
                            <tr>
                                <td><Rate disabled allowHalf defaultValue={0} value={comment.Rating} /></td>
                            </tr>
                            <tr>
                                <td style={{ paddingBottom: '10px' }}>
                                    {comment.CommentText}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div style={{ borderRadius: '7px' }}>
                                        <Image
                                            width={50}
                                            src={comment.product_image}
                                            style={{ marginRight: '10px' }}
                                        /> 
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
            ))}
        </>
    )
}
