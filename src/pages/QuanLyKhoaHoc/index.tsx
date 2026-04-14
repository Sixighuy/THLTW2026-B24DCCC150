import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

type TrangThaiKhoaHoc = 'dang_mo' | 'da_ket_thuc' | 'tam_dung';

interface KhoaHoc {
  id: string;
  tenKhoaHoc: string;
  giangVien: string;
  soLuongHocVien: number;
  moTa: string;
  trangThai: TrangThaiKhoaHoc;
}

const TRANG_THAI_OPTIONS: { label: string; value: TrangThaiKhoaHoc; color: string }[] = [
  { label: 'Dang mo', value: 'dang_mo', color: 'green' },
  { label: 'Da ket thuc', value: 'da_ket_thuc', color: 'blue' },
  { label: 'Tam dung', value: 'tam_dung', color: 'orange' },
];

const GIANG_VIEN_OPTIONS = [
  'Nguyen Van A',
  'Tran Thi B',
  'Le Quang C',
  'Pham Thanh D',
  'Vo Minh E',
];

const INITIAL_KHOA_HOC: KhoaHoc[] = [
  {
    id: 'KH001',
    tenKhoaHoc: 'ReactJS Can Ban',
    giangVien: 'Nguyen Van A',
    soLuongHocVien: 26,
    moTa: '<p>Khoa hoc ReactJS can ban cho nguoi moi bat dau.</p>',
    trangThai: 'dang_mo',
  },
  {
    id: 'KH002',
    tenKhoaHoc: 'TypeScript Nang Cao',
    giangVien: 'Tran Thi B',
    soLuongHocVien: 0,
    moTa: '<p>TypeScript nang cao voi generic va utility type.</p>',
    trangThai: 'tam_dung',
  },
  {
    id: 'KH003',
    tenKhoaHoc: 'NodeJS Backend',
    giangVien: 'Le Quang C',
    soLuongHocVien: 18,
    moTa: '<p>Xay dung REST API voi NodeJS va Express.</p>',
    trangThai: 'da_ket_thuc',
  },
];

interface FormValues {
  tenKhoaHoc: string;
  giangVien: string;
  soLuongHocVien: number;
  moTa: string;
  trangThai: TrangThaiKhoaHoc;
}

const taoMaKhoaHoc = (ds: KhoaHoc[]) => {
  const soLonNhat = ds.reduce((max, item) => {
    const so = Number(item.id.replace('KH', ''));
    return Number.isNaN(so) ? max : Math.max(max, so);
  }, 0);
  return `KH${String(soLonNhat + 1).padStart(3, '0')}`;
};

const QuanLyKhoaHocPage = () => {
  const [form] = Form.useForm<FormValues>();
  const [courses, setCourses] = useState<KhoaHoc[]>(INITIAL_KHOA_HOC);
  const [searchName, setSearchName] = useState('');
  const [filterGiangVien, setFilterGiangVien] = useState<string | undefined>();
  const [filterTrangThai, setFilterTrangThai] = useState<TrangThaiKhoaHoc | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<KhoaHoc | null>(null);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((item) =>
        item.tenKhoaHoc.toLocaleLowerCase().includes(searchName.trim().toLocaleLowerCase()),
      )
      .filter((item) => (filterGiangVien ? item.giangVien === filterGiangVien : true))
      .filter((item) => (filterTrangThai ? item.trangThai === filterTrangThai : true))
      .sort((a, b) =>
        sortOrder === 'asc'
          ? a.soLuongHocVien - b.soLuongHocVien
          : b.soLuongHocVien - a.soLuongHocVien,
      );
  }, [courses, searchName, filterGiangVien, filterTrangThai, sortOrder]);

  const resetModalState = () => {
    form.resetFields();
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    form.resetFields();
    form.setFieldsValue({
      soLuongHocVien: 0,
      trangThai: 'dang_mo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: KhoaHoc) => {
    setEditingCourse(record);
    form.setFieldsValue({
      tenKhoaHoc: record.tenKhoaHoc,
      giangVien: record.giangVien,
      soLuongHocVien: record.soLuongHocVien,
      moTa: record.moTa,
      trangThai: record.trangThai,
    });
    setIsModalOpen(true);
  };

  const isTenKhoaHocDaTonTai = (tenKhoaHoc: string) => {
    const normalizedTen = tenKhoaHoc.trim().toLocaleLowerCase();
    return courses.some((item) => {
      if (editingCourse && item.id === editingCourse.id) return false;
      return item.tenKhoaHoc.trim().toLocaleLowerCase() === normalizedTen;
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isTenKhoaHocDaTonTai(values.tenKhoaHoc)) {
        form.setFields([
          {
            name: 'tenKhoaHoc',
            errors: ['Ten khoa hoc da ton tai, vui long nhap ten khac.'],
          },
        ]);
        return;
      }

      if (editingCourse) {
        setCourses((prev) =>
          prev.map((item) =>
            item.id === editingCourse.id
              ? {
                  ...item,
                  ...values,
                }
              : item,
          ),
        );
        message.success('Cap nhat khoa hoc thanh cong.');
      } else {
        const newCourse: KhoaHoc = {
          id: taoMaKhoaHoc(courses),
          ...values,
        };
        setCourses((prev) => [newCourse, ...prev]);
        message.success('Them moi khoa hoc thanh cong.');
      }
      resetModalState();
    } catch (_error) {
      // antd form da hien thi loi validate, khong can xu ly them
    }
  };

  const handleDelete = (record: KhoaHoc) => {
    if (record.soLuongHocVien > 0) {
      message.error('Chi duoc xoa khoa hoc chua co hoc vien.');
      return;
    }
    setCourses((prev) => prev.filter((item) => item.id !== record.id));
    message.success(`Da xoa khoa hoc ${record.tenKhoaHoc}.`);
  };

  const columns: ColumnsType<KhoaHoc> = [
    {
      title: 'ID khoa hoc',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Ten khoa hoc',
      dataIndex: 'tenKhoaHoc',
      key: 'tenKhoaHoc',
    },
    {
      title: 'Giang vien',
      dataIndex: 'giangVien',
      key: 'giangVien',
      width: 180,
    },
    {
      title: 'So luong hoc vien',
      dataIndex: 'soLuongHocVien',
      key: 'soLuongHocVien',
      width: 170,
      align: 'right',
    },
    {
      title: 'Trang thai',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (trangThai: TrangThaiKhoaHoc) => {
        const option = TRANG_THAI_OPTIONS.find((item) => item.value === trangThai);
        if (!option) return null;
        return <Tag color={option.color}>{option.label}</Tag>;
      },
    },
    {
      title: 'Thao tac',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => {
        const disableDelete = record.soLuongHocVien > 0;
        return (
          <Space size="small">
            <Tooltip title="Chinh sua">
              <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)} />
            </Tooltip>
            <Tooltip
              title={
                disableDelete ? 'Chi xoa duoc khoa hoc chua co hoc vien.' : 'Xoa khoa hoc'
              }
            >
              <Popconfirm
                title="Ban chac chan muon xoa khoa hoc nay?"
                okText="Xoa"
                cancelText="Huy"
                onConfirm={() => handleDelete(record)}
                disabled={disableDelete}
              >
                <Button type="link" danger icon={<DeleteOutlined />} disabled={disableDelete} />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      title="Quan ly khoa hoc"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
          Them moi khoa hoc
        </Button>
      }
    >
      <Space wrap size={[12, 12]} style={{ marginBottom: 16 }}>
        <Input
          allowClear
          placeholder="Tim theo ten khoa hoc"
          value={searchName}
          onChange={(event) => setSearchName(event.target.value)}
          style={{ width: 260 }}
        />
        <Select
          allowClear
          placeholder="Loc theo giang vien"
          style={{ width: 220 }}
          value={filterGiangVien}
          onChange={(value) => setFilterGiangVien(value)}
          options={GIANG_VIEN_OPTIONS.map((item) => ({ label: item, value: item }))}
        />
        <Select
          allowClear
          placeholder="Loc theo trang thai"
          style={{ width: 200 }}
          value={filterTrangThai}
          onChange={(value) => setFilterTrangThai(value)}
          options={TRANG_THAI_OPTIONS.map((item) => ({ label: item.label, value: item.value }))}
        />
        <Select
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
          style={{ width: 230 }}
          options={[
            { label: 'Sap xep hoc vien: tang dan', value: 'asc' },
            { label: 'Sap xep hoc vien: giam dan', value: 'desc' },
          ]}
        />
      </Space>

      <Table<KhoaHoc>
        rowKey="id"
        columns={columns}
        dataSource={filteredCourses}
        scroll={{ x: 920 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />

      <Modal
        visible={isModalOpen}
        title={editingCourse ? 'Chinh sua khoa hoc' : 'Them moi khoa hoc'}
        okText={editingCourse ? 'Luu thay doi' : 'Tao moi'}
        cancelText="Huy"
        onCancel={resetModalState}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form<FormValues> form={form} layout="vertical">
          <Form.Item
            name="tenKhoaHoc"
            label="Ten khoa hoc"
            rules={[
              { required: true, message: 'Vui long nhap ten khoa hoc.' },
              { max: 100, message: 'Ten khoa hoc toi da 100 ky tu.' },
            ]}
          >
            <Input placeholder="Nhap ten khoa hoc" />
          </Form.Item>

          <Form.Item
            name="giangVien"
            label="Giang vien"
            rules={[{ required: true, message: 'Vui long chon giang vien.' }]}
          >
            <Select
              placeholder="Chon giang vien"
              options={GIANG_VIEN_OPTIONS.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>

          <Form.Item
            name="soLuongHocVien"
            label="So luong hoc vien"
            rules={[{ required: true, message: 'Vui long nhap so luong hoc vien.' }]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="moTa"
            label="Mo ta khoa hoc (HTML)"
            rules={[{ required: true, message: 'Vui long nhap mo ta khoa hoc.' }]}
          >
            <Input.TextArea rows={4} placeholder="<p>Noi dung mo ta</p>" />
          </Form.Item>

          <Form.Item
            name="trangThai"
            label="Trang thai khoa hoc"
            rules={[{ required: true, message: 'Vui long chon trang thai.' }]}
          >
            <Select
              placeholder="Chon trang thai"
              options={TRANG_THAI_OPTIONS.map((item) => ({ label: item.label, value: item.value }))}
            />
          </Form.Item>
          <Typography.Text type="secondary">
            Du lieu ten khoa hoc duoc kiem tra khong de trong va khong trung lap.
          </Typography.Text>
        </Form>
      </Modal>
    </Card>
  );
};

export default QuanLyKhoaHocPage;
