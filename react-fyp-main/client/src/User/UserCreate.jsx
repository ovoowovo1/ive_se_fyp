import React from 'react'
import { Button, Form, Input, Space, message} from 'antd';
import axios from 'shared/api/http';



const SubmitButton = ({ form }) => {
  const [submittable, setSubmittable] = React.useState(false);

  // Watch all values
  const values = Form.useWatch([], form);
  React.useEffect(() => {
    form
      .validateFields({
        validateOnly: true,
      })
      .then(
        () => {
          setSubmittable(true);
        },
        () => {
          setSubmittable(false);
        },
      );
  }, [form, values]);
  return (
    <Button type="primary" htmlType="submit" disabled={!submittable}>
      Submit
    </Button>
  );
};







export default function UserCreate() {
  const [form] = Form.useForm();

  
 
  const handleSubmit = (values) => {
    axios
      .post('/createuser', values)
      .then(res => {
        console.log(res.data);
        console.log("hi");
        success();
        form.resetFields();
      })
      .catch(err => {
        console.error(err);
      });
  }


  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'You have successfully created an account',
    });
  };

  return (
    <div>
      {contextHolder}
      <Form form={form} name="validateOnly" layout="vertical" autoComplete="off" onFinish={handleSubmit}>
        <Form.Item
          name="Name"
          label="Name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Age"
          label="Age"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Space>
            <SubmitButton form={form} />
            <Button htmlType="reset">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
      
    </div>
  )
}
