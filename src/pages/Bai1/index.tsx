import React, { useState } from "react";
import { Button, Card, Space, Typography, Tag, List } from "antd";

const { Title } = Typography;

const choices = ["Kéo", "Búa", "Bao"];

export default function Bai1() {

  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const playGame = (playerChoice: string) => {

    const computerChoice =
      choices[Math.floor(Math.random() * choices.length)];

    let ketQua = "";

    if (playerChoice === computerChoice) {
      ketQua = "Hòa";
    } else if (
      (playerChoice === "Kéo" && computerChoice === "Bao") ||
      (playerChoice === "Búa" && computerChoice === "Kéo") ||
      (playerChoice === "Bao" && computerChoice === "Búa")
    ) {
      ketQua = "Thắng";
    } else {
      ketQua = "Thua";
    }

    const text = `Bạn: ${playerChoice} | Máy: ${computerChoice} → ${ketQua}`;

    setResult(text);
    setHistory([text, ...history]);
  };

  return (
    <div style={{ padding: 30 }}>

      <Card>

        <Title level={3}>Bài 1 - Trò chơi Oẳn Tù Tì</Title>

        <Space size="large">

          <Button type="primary" onClick={() => playGame("Kéo")}>
            Kéo
          </Button>

          <Button type="primary" onClick={() => playGame("Búa")}>
            Búa
          </Button>

          <Button type="primary" onClick={() => playGame("Bao")}>
            Bao
          </Button>

        </Space>

        <br />
        <br />

        <Title level={5}>Kết quả:</Title>

        {result && <Tag color="blue">{result}</Tag>}

        <br />
        <br />

        <Title level={5}>Lịch sử</Title>

        <List
          bordered
          dataSource={history}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />

      </Card>

    </div>
  );
}