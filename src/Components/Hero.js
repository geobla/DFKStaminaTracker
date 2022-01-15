import { useState, useEffect } from 'react';
import { toFixed } from '../Utils';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Hero(props) {
	const [hero, setHero] = useState(null);
	const timeForOneStamina = 20 * 60;

	const getCurrentStamina = async () => {
		try {
			const hero = await props.heroContract.getHero(props.id);

			const fullStamina = Number(hero['stats']['stamina']);
			const fullStaminaReadyAt = Number(
				hero['state']['staminaFullAt'],
			);
			const now = parseInt(new Date().getTime() / 1000);
			const currentStamina =
				fullStamina - (fullStaminaReadyAt - now) / timeForOneStamina;

			setHero({
				...hero,
				id: props.id,
				maximumStamina: fullStamina,
				readyAt: fullStaminaReadyAt,
				currentStamina: currentStamina,
			});
		} catch (err) {
			console.warn(`Error getting hero ${props.id}`);
		}
	};

	useEffect(() => {
		getCurrentStamina();
	}, [props]);

	return (
		<>
			{hero && (
				<>
					<Row className='align-items-center'>
						<Col>{hero.id}</Col>
						<Col></Col>
						<Col>
							~{toFixed(hero.currentStamina, 1)} /{' '}
							{hero.maximumStamina} (
							{Math.floor(
								(hero.currentStamina * 100) / hero.maximumStamina,
							)}
							%)
							<ProgressBar
								animated
								now={
									(hero.currentStamina * 100) / hero.maximumStamina
								}
							/>
						</Col>
						<Col>
							{new Date(hero.readyAt * 1000).toLocaleString()}
						</Col>
					</Row>
				</>
			)}
		</>
	);
}

export default Hero;
