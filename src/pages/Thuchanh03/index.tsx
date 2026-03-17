import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Select,
  Tag,
  Rate,
  message,
} from "antd";

const { Header, Sider, Content } = Layout;

export default function App() {
  const [page, setPage] = useState("employee");

  const [employees, setEmployees] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const [modal, setModal] = useState<any>({ type: "", visible: false, record: null });
  const [form] = Form.useForm();

  const openModal = (type: string, record: any = null) => {
    setModal({ type, visible: true, record });
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const closeModal = () => {
    setModal({ type: "", visible: false, record: null });
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    if (modal.type === "employee") {
      setEmployees([...employees, { ...values, key: Date.now() }]);
    }

    if (modal.type === "employee_edit") {
      setEmployees(
        employees.map((e) =>
          e.key === modal.record.key ? { ...e, ...values } : e
        )
      );
    }

    if (modal.type === "service") {
      setServices([...services, { ...values, key: Date.now() }]);
    }

    if (modal.type === "booking") {
      const exist = bookings.find(
        (b) =>
          b.employee === values.employee &&
          b.date === values.date.format("YYYY-MM-DD") &&
          b.time === values.time.format("HH:mm")
      );

      if (exist) {
        message.error("Trùng lịch!");
        return;
      }

      setBookings([
        ...bookings,
        {
          ...values,
          key: Date.now(),
          date: values.date.format("YYYY-MM-DD"),
          time: values.time.format("HH:mm"),
          status: "Chờ",
        },
      ]);
    }

    if (modal.type === "review") {
      setReviews([...reviews, { ...values, key: Date.now() }]);
    }

    closeModal();
  };

  const deleteEmployee = (key: number) => {
    setEmployees(employees.filter((e) => e.key !== key));
  };

  const updateStatus = (record: any, status: string) => {
    setBookings(
      bookings.map((b) => (b.key === record.key ? { ...b, status } : b))
    );
  };

  const getAvgRating = (name: string) => {
    const list = reviews.filter((r) => r.employee === name);
    if (!list.length) return 0;
    return list.reduce((s, r) => s + r.rating, 0) / list.length;
  };

  const getRevenueByMonth = () => {
    const result: any = {};
    bookings.forEach((b) => {
      if (b.status !== "Hoàn thành") return;
      const service = services.find((s) => s.name === b.service);
      if (!service) return;
      const month = b.date.slice(0, 7);
      result[month] = (result[month] || 0) + service.price;
    });
    return Object.entries(result).map(([month, revenue]) => ({ key: month, month, revenue }));
  };

  const getRevenueByEmployee = () => {
    const result: any = {};
    bookings.forEach((b) => {
      if (b.status !== "Hoàn thành") return;
      const service = services.find((s) => s.name === b.service);
      if (!service) return;
      result[b.employee] = (result[b.employee] || 0) + service.price;
    });
    return Object.entries(result).map(([name, revenue]) => ({ key: name, name, revenue }));
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[page]}
          onClick={(e) => setPage(e.key)}
        >
          <Menu.Item key="employee">Nhân viên</Menu.Item>
          <Menu.Item key="service">Dịch vụ</Menu.Item>
          <Menu.Item key="booking">Lịch hẹn</Menu.Item>
          <Menu.Item key="review">Đánh giá</Menu.Item>
          <Menu.Item key="report">Thống kê</Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ color: "white" }}>Hệ thống đặt lịch</Header>

        <Content style={{ padding: 20 }}>
          {page === "employee" && (
            <>
              <Button danger onClick={() => openModal("employee")}>+ Thêm nhân viên</Button>
              <Table
                style={{ marginTop: 20 }}
                dataSource={employees}
                columns={[
                  { title: "Tên", dataIndex: "name" },
                  { title: "Max/ngày", dataIndex: "max" },
                  { title: "Đánh giá", render: (_, r) => <Rate disabled value={getAvgRating(r.name)} /> },
                  {
                    title: "Hành động",
                    render: (_, record) => (
                      <>
                        <Button size="small" onClick={() => openModal("employee_edit", record)}>Sửa</Button>
                        <Button size="small" danger onClick={() => deleteEmployee(record.key)}>Xóa</Button>
                      </>
                    ),
                  },
                ]}
              />
            </>
          )}

          {page === "service" && (
            <>
              <Button danger onClick={() => openModal("service")}>+ Thêm dịch vụ</Button>
              <Table
                style={{ marginTop: 20 }}
                dataSource={services}
                columns={[{ title: "Tên", dataIndex: "name" }, { title: "Giá", dataIndex: "price" }]}
              />
            </>
          )}

          {page === "booking" && (
            <>
              <Button danger onClick={() => openModal("booking")}>+ Tạo lịch hẹn</Button>
              <Table
                style={{ marginTop: 20 }}
                dataSource={bookings}
                columns={[
                  { title: "Nhân viên", dataIndex: "employee" },
                  { title: "Dịch vụ", dataIndex: "service" },
                  { title: "Ngày", dataIndex: "date" },
                  { title: "Giờ", dataIndex: "time" },
                  {
                    title: "Trạng thái",
                    render: (_, r) => {
                      const color = r.status === "Hoàn thành" ? "green" : r.status === "Hủy" ? "red" : "orange";
                      return <Tag color={color}>{r.status}</Tag>;
                    },
                  },
                  {
                    title: "Hành động",
                    render: (_, r) => (
                      <>
                        <Button size="small" onClick={() => updateStatus(r, "Hoàn thành")}>Done</Button>
                        <Button size="small" danger onClick={() => updateStatus(r, "Hủy")}>Hủy</Button>
                        <Button size="small" onClick={() => openModal("review", { employee: r.employee })}>Đánh giá</Button>
                      </>
                    ),
                  },
                ]}
              />
            </>
          )}

          {page === "review" && (
            <Table
              dataSource={reviews}
              columns={[
                { title: "Nhân viên", dataIndex: "employee" },
                { title: "Số sao", render: (_, r) => <Rate disabled value={r.rating} /> },
                { title: "Nhận xét", dataIndex: "comment" },
              ]}
            />
          )}

          {page === "report" && (
            <>
              <h2>📊 Doanh thu theo tháng</h2>
              <Table
                dataSource={getRevenueByMonth()}
                columns={[{ title: "Tháng", dataIndex: "month" }, { title: "Doanh thu", dataIndex: "revenue", render: (v) => v.toLocaleString() + " đ" }]}
              />

              <h2 style={{ marginTop: 30 }}>👨‍💼 Doanh thu theo nhân viên</h2>
              <Table
                dataSource={getRevenueByEmployee()}
                columns={[{ title: "Nhân viên", dataIndex: "name" }, { title: "Doanh thu", dataIndex: "revenue", render: (v) => v.toLocaleString() + " đ" }]}
              />
            </>
          )}

          <Modal visible={modal.visible} onCancel={closeModal} footer={null}>
            <Form layout="vertical" form={form} onFinish={handleSubmit}>

              {(modal.type === "employee" || modal.type === "employee_edit") && (
                <>
                  <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="max" label="Max/ngày" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </>
              )}

              {modal.type === "service" && (
                <>
                  <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </>
              )}

              {modal.type === "booking" && (
                <>
                  <Form.Item name="employee" label="Nhân viên" rules={[{ required: true }]}>
                    <Select options={employees.map(e => ({ label: e.name, value: e.name }))} />
                  </Form.Item>
                  <Form.Item name="service" label="Dịch vụ" rules={[{ required: true }]}>
                    <Select options={services.map(s => ({ label: s.name, value: s.name }))} />
                  </Form.Item>
                  <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="time" label="Giờ" rules={[{ required: true }]}>
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </>
              )}

              {modal.type === "review" && (
                <>
                  <Form.Item name="employee" hidden>
                    <Input />
                  </Form.Item>

                  <Form.Item name="rating" label="Đánh giá" rules={[{ required: true }]}>
                    <Rate />
                  </Form.Item>

                  <Form.Item name="comment" label="Nhận xét">
                    <Input.TextArea />
                  </Form.Item>
                </>
              )}

              <Button htmlType="submit" type="primary" danger block>
                Lưu
              </Button>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
}