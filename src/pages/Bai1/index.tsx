import { useMemo, useState } from 'react';
import { Button, Card, Col, InputNumber, Row, Typography, message } from 'antd';

const { Title, Paragraph, Text } = Typography;

const MAX_ATTEMPTS = 10;

const Bai1 = () => {
	const [secretNumber, setSecretNumber] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
	const [currentGuess, setCurrentGuess] = useState<number | null>(null);
	const [attempts, setAttempts] = useState<number>(0);
	const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
	const [history, setHistory] = useState<
		{ guess: number; result: 'low' | 'high' | 'correct' }[]
	>([]);

	const remainingAttempts = useMemo(() => MAX_ATTEMPTS - attempts, [attempts]);

	const handleGuess = () => {
		if (status !== 'playing') {
			message.info('Vui lòng bấm "Chơi lại" để bắt đầu game mới.');
			return;
		}

		if (currentGuess === null) {
			message.warning('Vui lòng nhập số bạn đoán.');
			return;
		}

		if (currentGuess < 1 || currentGuess > 100) {
			message.warning('Vui lòng nhập số trong khoảng từ 1 đến 100.');
			return;
		}

		const newAttempts = attempts + 1;
		setAttempts(newAttempts);

		if (currentGuess === secretNumber) {
			setStatus('won');
			setHistory((prev) => [...prev, { guess: currentGuess, result: 'correct' }]);
			message.success('Chúc mừng! Bạn đã đoán đúng!');
			return;
		}

		if (newAttempts >= MAX_ATTEMPTS) {
			setStatus('lost');
			setHistory((prev) => [
				...prev,
				{ guess: currentGuess, result: currentGuess < secretNumber ? 'low' : 'high' },
			]);
			message.error(`Bạn đã hết lượt! Số đúng là ${secretNumber}.`);
			return;
		}

		const result: 'low' | 'high' = currentGuess < secretNumber ? 'low' : 'high';
		setHistory((prev) => [...prev, { guess: currentGuess, result }]);

		if (result === 'low') {
			message.info('Bạn đoán quá thấp!');
		} else {
			message.info('Bạn đoán quá cao!');
		}
	};

	const handleReset = () => {
		setSecretNumber(Math.floor(Math.random() * 100) + 1);
		setCurrentGuess(null);
		setAttempts(0);
		setStatus('playing');
		setHistory([]);
	};

	return (
		<Row justify='center' style={{ padding: 24 }}>
			<Col xs={24} sm={20} md={16} lg={12} xl={10}>
				<Card>
					<Title level={3}>Bài 1: Trò chơi đoán số</Title>
					<Paragraph>
						Hệ thống sinh ra một số <Text strong>ngẫu nhiên từ 1 đến 100</Text>. Bạn có{' '}
						<Text strong>{MAX_ATTEMPTS} lượt</Text> để đoán đúng số này.
					</Paragraph>

					<Paragraph>
						<Text>Lượt còn lại: </Text>
						<Text strong>{remainingAttempts}</Text>
					</Paragraph>

					<Row gutter={8} align='middle' style={{ marginBottom: 16 }}>
						<Col flex='auto'>
							<InputNumber
								style={{ width: '100%' }}
								min={1}
								max={100}
								value={currentGuess as number | null}
								onChange={(value) => setCurrentGuess(value as number | null)}
								placeholder='Nhập số bạn đoán (1 - 100)'
								disabled={status !== 'playing'}
							/>
						</Col>
						<Col>
							<Button type='primary' onClick={handleGuess} disabled={status !== 'playing'}>
								Đoán
							</Button>
						</Col>
						<Col>
							<Button onClick={handleReset}>Chơi lại</Button>
						</Col>
					</Row>

					{status === 'won' && (
						<Paragraph type='success'>
							<Text strong>Chúc mừng! Bạn đã đoán đúng số {secretNumber}.</Text>
						</Paragraph>
					)}
					{status === 'lost' && (
						<Paragraph type='danger'>
							<Text strong>Bạn đã hết lượt! Số đúng là {secretNumber}.</Text>
						</Paragraph>
					)}

					<Paragraph strong>Lịch sử các lần đoán:</Paragraph>
					{history.length === 0 ? (
						<Text type='secondary'>Chưa có lần đoán nào.</Text>
					) : (
						<ul style={{ paddingLeft: 20 }}>
							{history.map((item, index) => (
								<li key={index}>
									Lần {index + 1}: bạn đoán <Text strong>{item.guess}</Text> -{' '}
									{item.result === 'correct' ? (
										<Text type='success'>Đoán đúng!</Text>
									) : item.result === 'low' ? (
										<Text type='warning'>Quá thấp</Text>
									) : (
										<Text type='warning'>Quá cao</Text>
									)}
								</li>
							))}
						</ul>
					)}
				</Card>
			</Col>
		</Row>
	);
};

export default Bai1;