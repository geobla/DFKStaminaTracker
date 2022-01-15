import { useState, useEffect } from 'react';
import { toFixed } from '../Utils';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Hero(props) {
	const timeForOneStamina = 20 * 60;
	const zeroAddress = '0x0000000000000000000000000000000000000000';
	const xpPerLevel = 1000;
	const baseXp = 1000;

	const [hero, setHero] = useState(null);

	const getCurrentStamina = async () => {
		try {
			const hero = await props.heroContract.getHero(props.id);

			const fullStamina = Number(hero['stats']['stamina']);
			const fullStaminaReadyAt = Number(
				hero['state']['staminaFullAt'],
			);
			let currentQuest = hero['state']['currentQuest'].toString();

			const currentLevel = hero['state']['level'];
			let isQuesting = true;
			if (currentQuest === zeroAddress) isQuesting = false;

			const now = parseInt(new Date().getTime() / 1000);
			const currentStamina =
				fullStamina - (fullStaminaReadyAt - now) / timeForOneStamina;

			const currentXp = Number(hero['state']['xp']);
			setHero({
				...hero,
				id: props.id,
				level: currentLevel,
				xp: currentXp,
				maximumStamina: fullStamina,
				readyAt: fullStaminaReadyAt,
				currentStamina,
				isQuesting,
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
						<Col>{hero.level}</Col>
						<Col>
							{hero.xp} / {baseXp + xpPerLevel * hero.level} (
							{Math.floor(
								(hero.xp * 100) / (baseXp + xpPerLevel * hero.level),
							)}
							%)
						</Col>
						<Col>{hero.isQuesting && <>In progress</>}</Col>
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
