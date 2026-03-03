import React, { useEffect, useState } from 'react';
import {
  Layout, Card, Button, Form, Input, DatePicker, InputNumber,
  List, Progress, Popconfirm, message, Row, Col, Space, Typography,
  Modal, Select, Statistic, ConfigProvider
} from 'antd';
import {
  BookOutlined, DeleteOutlined, PlusOutlined, EditOutlined,
  CalendarOutlined, AimOutlined, ClockCircleOutlined,
  FireOutlined, StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface Subject {
  id: string;
  name: string;
}

interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  duration: number;
  content: string;
  note: string;
}

interface MonthlyGoal {
  month: string;
  targetMinutes: number;
}

const STORAGE_KEY = "studycheckdata";

const StudyCheck: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);

  const [subjectInput, setSubjectInput] = useState('');
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setSubjects(parsed.subjects || []);
      setSessions(parsed.sessions || []);
      setGoals(parsed.goals || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ subjects, sessions, goals })
    );
  }, [subjects, sessions, goals]);

  useEffect(() => {
    if (editingSession) {
      form.setFieldsValue({
        subjectId: editingSession.subjectId,
        date: dayjs(editingSession.date, 'YYYY-MM-DD HH:mm'),
        duration: editingSession.duration,
        content: editingSession.content,
        note: editingSession.note,
      });
    } else {
      form.resetFields();
    }
  }, [editingSession, form]);

  const addSubject = () => {
    const name = subjectInput.trim();
    if (!name) {
      message.warning('Vui lòng nhập tên môn học');
      return;
    }
    if (subjects.some(s => s.name === name)) {
      message.warning('Môn học đã tồn tại');
      return;
    }
    setSubjects(prev => [...prev, { id: Date.now().toString(), name }]);
    setSubjectInput('');
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setSessions(prev => prev.filter(s => s.subjectId !== id));
  };

  const openAddModal = () => {
    setEditingSession(null);
    setModalVisible(true);
  };

  const openEditModal = (session: StudySession) => {
    setEditingSession(session);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingSession(null);
    form.resetFields();
  };

  const saveSession = (values: any) => {
    if (editingSession) {
      const updatedSession: StudySession = {
        ...editingSession,
        subjectId: values.subjectId,
        date: values.date.format('YYYY-MM-DD HH:mm'),
        duration: values.duration,
        content: values.content || '',
        note: values.note || ''
      };
      setSessions(prev =>
        prev.map(s => (s.id === editingSession.id ? updatedSession : s))
      );
      message.success('Đã cập nhật buổi học');
    } else {
      const newSession: StudySession = {
        id: Date.now().toString(),
        subjectId: values.subjectId,
        date: values.date.format('YYYY-MM-DD HH:mm'),
        duration: values.duration,
        content: values.content || '',
        note: values.note || ''
      };
      setSessions(prev => [newSession, ...prev]);
      message.success('Đã thêm buổi học');
    }
    closeModal();
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    message.success('Đã xoá buổi học');
  };

  const currentMonth = dayjs().format('YYYY-MM');
  const totalMinutesThisMonth = sessions
    .filter(s => s.date.startsWith(currentMonth))
    .reduce((sum, s) => sum + s.duration, 0);
  const goal = goals.find(g => g.month === currentMonth);
  const percent = goal ? Math.min((totalMinutesThisMonth / goal.targetMinutes) * 100, 100) : 0;

  const setMonthlyGoal = (value: number | null) => {
    if (!value) return;
    setGoals([{ month: currentMonth, targetMinutes: value }]);
  };

  const totalSessions = sessions.length;
  const totalMinutesAllTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgDuration = totalSessions > 0 ? Math.round(totalMinutesAllTime / totalSessions) : 0;

  const subjectStats = sessions.reduce((acc, s) => {
    acc[s.subjectId] = (acc[s.subjectId] || 0) + s.duration;
    return acc;
  }, {} as Record<string, number>);
  const topSubjectId = Object.keys(subjectStats).sort((a, b) => subjectStats[b] - subjectStats[a])[0];
  const topSubject = subjects.find(s => s.id === topSubjectId);

  return (
    <ConfigProvider componentSize="small">
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{ 
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 56,
        }}>
          <Row justify="space-between" align="middle">
            <h1 style={{ fontSize: 18, margin: 0 }}>QUẢN LÝ HỌC TẬP</h1>
            <h3 style={{ fontSize: 14, fontFamily: '"Times New Roman", Times, serif', margin: 0 }}>
              Quản lý thời gian hiệu con nhà bà quả luôn
            </h3>
          </Row>
        </Header>

        <Content style={{ padding: '16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card size="small" bodyStyle={{ padding: '12px' }}>
                <Statistic
                  title={<span style={{ fontSize: 13 }}>Tổng số buổi học</span>}
                  value={totalSessions}
                  prefix={<CalendarOutlined />}
                  suffix="buổi"
                  valueStyle={{ fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" bodyStyle={{ padding: '12px' }}>
                <Statistic
                  title={<span style={{ fontSize: 13 }}>Tổng thời gian</span>}
                  value={totalMinutesAllTime}
                  prefix={<ClockCircleOutlined />}
                  suffix="phút"
                  valueStyle={{ fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" bodyStyle={{ padding: '12px' }}>
                <Statistic
                  title={<span style={{ fontSize: 13 }}>Trung bình mỗi buổi</span>}
                  value={avgDuration}
                  prefix={<FireOutlined />}
                  suffix="phút"
                  valueStyle={{ fontSize: 18 }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={10}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Card
                  size="small"
                  title={<><BookOutlined /> Danh mục môn học</>}
                  extra={
                        <Space>
                            <Input
                                size="small"
                                placeholder="Tên môn"
                                value={subjectInput}
                                onChange={e => setSubjectInput(e.target.value)}
                                onPressEnter={addSubject}
                                style={{ width: 120 }}
                            />
                            <Button
                                size="small"
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={addSubject}
                            />
                        </Space>
                  }
                  style={{ height: 300 }}
                  bodyStyle={{ overflowY: 'auto', height: 220, padding: '8px 12px' }}
                >
                  {subjects.length === 0 ? (
                    <Text type="secondary" style={{ fontSize: 13 }}>Chưa có môn học nào</Text>
                  ) : (
                    <List
                      size="small"
                      dataSource={subjects}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Popconfirm
                              title="Xoá môn này sẽ xoá tất cả buổi học liên quan. Tiếp tục?"
                              onConfirm={() => deleteSubject(item.id)}
                              okText="Xoá"
                              cancelText="Hủy"
                            >
                              <Button danger size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                          ]}
                        >
                          <Text strong style={{ fontSize: 13 }}>{item.name}</Text>
                        </List.Item>
                      )}
                    />
                  )}
                </Card>

                <Card size="small" title={<><AimOutlined /> Mục tiêu tháng {currentMonth}</>}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <InputNumber
                      placeholder="Nhập mục tiêu (phút)"
                      style={{ width: '100%' }}
                      min={1}
                      onChange={setMonthlyGoal}
                    />
                    <div>
                      <Text style={{ fontSize: 13 }}>Đã học: <Text strong>{totalMinutesThisMonth} phút</Text></Text>
                      {goal && (
                        <Text type="secondary" style={{ fontSize: 13 }}> / {goal.targetMinutes} phút</Text>
                      )}
                    </div>
                    {goal && (
                      <Progress
                        percent={Number(percent.toFixed(1))}
                        status={percent >= 100 ? 'success' : 'active'}
                        size="small"
                      />
                    )}
                    {topSubject && (
                      <div style={{ marginTop: 4 }}>
                        <StarOutlined style={{ color: '#faad14', fontSize: 13 }} /> 
                        <Text style={{ fontSize: 13 }}> Môn học yêu thích: <Text strong>{topSubject.name}</Text></Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Space>
            </Col>

            <Col xs={24} md={14}>
              <Card
                size="small"
                title={<><CalendarOutlined /> Lịch học</>}
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                    Thêm buổi học
                  </Button>
                }
                style={{ minHeight: 440 }}
                bodyStyle={{ overflowY: 'auto', maxHeight: 380, padding: '8px 12px' }}
              >
                {sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>Chưa có buổi học nào</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button type="dashed" icon={<PlusOutlined />} onClick={openAddModal} size="small">
                        Thêm buổi học đầu tiên
                      </Button>
                    </div>
                  </div>
                ) : (
                  <List
                    size="small"
                    dataSource={sessions}
                    renderItem={item => {
                      const subject = subjects.find(s => s.id === item.subjectId);
                      return (
                        <List.Item
                          actions={[
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => openEditModal(item)}
                            />,
                            <Popconfirm
                              title="Xoá buổi học này?"
                              onConfirm={() => deleteSession(item.id)}
                              okText="Xoá"
                              cancelText="Hủy"
                            >
                              <Button danger size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                          ]}
                        >
                            <List.Item.Meta
                            title={
                                <Space size={8}>
                                <Text strong>{subject?.name || "Đã xoá"}</Text>
                                <Text type="secondary">{item.date}</Text>
                                <Text code>{item.duration} phút</Text>
                                </Space>
                            }
                            description={
                                <Space direction="vertical" size={2}>
                                {item.content && <Text type="secondary"> {item.content}</Text>}
                                {item.note && <Text type="secondary"> {item.note}</Text>}
                                </Space>
                            }
                            />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card size="small" bodyStyle={{ padding: '8px 12px' }}>
                <Row justify="space-between" align="middle">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                     Hôm nay: {dayjs().format('dddd, DD/MM/YYYY')}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tổng số môn: {subjects.length} | Tổng số buổi: {sessions.length}
                  </Text>
                </Row>
              </Card>
            </Col>
          </Row>
        </Content>


        <Modal
          title={editingSession ? "Chỉnh sửa buổi học" : "Thêm buổi học mới"}
          visible={modalVisible}
          onCancel={closeModal}
          footer={null}
          width={400}
          bodyStyle={{ padding: '16px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={saveSession}
            initialValues={{ duration: 30 }}
            size="small"
          >
            <Form.Item
              name="subjectId"
              label="Môn học"
              rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
            >
              <Select placeholder="Chọn môn học" showSearch>
                {subjects.map(s => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="date"
              label="Ngày giờ học"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="content" label="Nội dung">
              <Input placeholder="Đã học những gì?" />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={3} placeholder="Ghi chú thêm..." />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={closeModal}>Huỷ</Button>
                <Button type="primary" htmlType="submit">
                  {editingSession ? 'Cập nhật' : 'Lưu lại'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
};

export default StudyCheck;