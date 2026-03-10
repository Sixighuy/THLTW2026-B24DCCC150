import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Card,
  message,
} from "antd";

const { Option } = Select;

interface CauHoi {
  id: number;
  monHoc: string;
  khoi: string;
  mucDo: string;
  noiDung: string;
}

interface CauTruc {
  id: number;
  ten: string;
  de: number;
  trungBinh: number;
  kho: number;
  ratKho: number;
}

export default function Bai2() {
  const [cauHoi, setCauHoi] = useState<CauHoi[]>([]);
  const [deThi, setDeThi] = useState<CauHoi[]>([]);
  const [cauTrucs, setCauTrucs] = useState<CauTruc[]>([]);
  const [chonCauTruc, setChonCauTruc] = useState<number | null>(null);

  const [monHoc, setMonHoc] = useState("");
  const [khoi, setKhoi] = useState("");
  const [mucDo, setMucDo] = useState("Dễ");
  const [noiDung, setNoiDung] = useState("");

  const [tenCauTruc, setTenCauTruc] = useState("");

  const [cauTruc, setCauTruc] = useState({
    de: 0,
    trungBinh: 0,
    kho: 0,
    ratKho: 0,
  });

  const themCauHoi = () => {
    if (!monHoc || !khoi || !noiDung) {
      message.error("Nhập đầy đủ thông tin");
      return;
    }

    const newCH: CauHoi = {
      id: Date.now(),
      monHoc,
      khoi,
      mucDo,
      noiDung,
    };

    setCauHoi([...cauHoi, newCH]);
    setNoiDung("");
  };

  const luuCauTruc = () => {
    if (!tenCauTruc) {
      message.error("Nhập tên cấu trúc");
      return;
    }

    const newCT: CauTruc = {
      id: Date.now(),
      ten: tenCauTruc,
      ...cauTruc,
    };

    setCauTrucs([...cauTrucs, newCT]);
    setTenCauTruc("");

    message.success("Đã lưu cấu trúc đề!");
  };

  const taoDeThi = () => {
    const ct = cauTrucs.find((c) => c.id === chonCauTruc);

    if (!ct) {
      message.error("Chọn cấu trúc đề!");
      return;
    }

    const de: CauHoi[] = [];

    const deDe = cauHoi.filter((c) => c.mucDo === "Dễ").slice(0, ct.de);
    const trung = cauHoi
      .filter((c) => c.mucDo === "Trung bình")
      .slice(0, ct.trungBinh);

    const kho = cauHoi.filter((c) => c.mucDo === "Khó").slice(0, ct.kho);

    const ratKho = cauHoi
      .filter((c) => c.mucDo === "Rất khó")
      .slice(0, ct.ratKho);

    de.push(...deDe, ...trung, ...kho, ...ratKho);

    const tong = ct.de + ct.trungBinh + ct.kho + ct.ratKho;

    if (de.length < tong) {
      message.error("Không đủ câu hỏi!");
      return;
    }

    setDeThi(de);
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Môn học", dataIndex: "monHoc" },
    { title: "Khối", dataIndex: "khoi" },
    { title: "Mức độ", dataIndex: "mucDo" },
    { title: "Nội dung", dataIndex: "noiDung" },
  ];

  const columnsCauTruc = [
    { title: "Tên cấu trúc", dataIndex: "ten" },
    { title: "Dễ", dataIndex: "de" },
    { title: "Trung bình", dataIndex: "trungBinh" },
    { title: "Khó", dataIndex: "kho" },
    { title: "Rất khó", dataIndex: "ratKho" },
  ];

  return (
    <div style={{ padding: 30 }}>
      <h2>Bài 2 - Ngân hàng câu hỏi</h2>

      <Card title="Thêm câu hỏi" style={{ marginBottom: 20 }}>
        <Space>
          <Input
            placeholder="Môn học"
            onChange={(e) => setMonHoc(e.target.value)}
          />

          <Input
            placeholder="Khối kiến thức"
            onChange={(e) => setKhoi(e.target.value)}
          />

          <Select
            defaultValue="Dễ"
            style={{ width: 150 }}
            onChange={(v) => setMucDo(v)}
          >
            <Option value="Dễ">Dễ</Option>
            <Option value="Trung bình">Trung bình</Option>
            <Option value="Khó">Khó</Option>
            <Option value="Rất khó">Rất khó</Option>
          </Select>

          <Input
            placeholder="Nội dung câu hỏi"
            onChange={(e) => setNoiDung(e.target.value)}
          />

          <Button type="primary" onClick={themCauHoi}>
            Thêm
          </Button>
        </Space>
      </Card>

      <Card title="Danh sách câu hỏi" style={{ marginBottom: 20 }}>
        <Table
          columns={columns}
          dataSource={cauHoi}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card title="Tạo cấu trúc đề" style={{ marginBottom: 20 }}>
        <Space>
          <Input
            placeholder="Tên cấu trúc"
            value={tenCauTruc}
            onChange={(e) => setTenCauTruc(e.target.value)}
          />

          Dễ
          <InputNumber
            min={0}
            onChange={(v) =>
              setCauTruc({ ...cauTruc, de: v || 0 })
            }
          />

          Trung bình
          <InputNumber
            min={0}
            onChange={(v) =>
              setCauTruc({ ...cauTruc, trungBinh: v || 0 })
            }
          />

          Khó
          <InputNumber
            min={0}
            onChange={(v) =>
              setCauTruc({ ...cauTruc, kho: v || 0 })
            }
          />

          Rất khó
          <InputNumber
            min={0}
            onChange={(v) =>
              setCauTruc({ ...cauTruc, ratKho: v || 0 })
            }
          />

          <Button type="primary" onClick={luuCauTruc}>
            Lưu cấu trúc
          </Button>
        </Space>
      </Card>

      <Card title="Danh sách cấu trúc đề" style={{ marginBottom: 20 }}>
        <Table
          columns={columnsCauTruc}
          dataSource={cauTrucs}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card title="Tạo đề thi">
        <Space>
          <Select
            placeholder="Chọn cấu trúc đề"
            style={{ width: 250 }}
            onChange={(v) => setChonCauTruc(v)}
          >
            {cauTrucs.map((ct) => (
              <Option key={ct.id} value={ct.id}>
                {ct.ten}
              </Option>
            ))}
          </Select>

          <Button type="primary" onClick={taoDeThi}>
            Tạo đề thi
          </Button>
        </Space>

        <Table
          style={{ marginTop: 20 }}
          columns={columns}
          dataSource={deThi}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}