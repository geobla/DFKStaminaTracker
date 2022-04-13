import { useState, useEffect } from 'react';
import { toFixed } from '../Utils';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function calculateRequiredXp(currentLevel) {
	let xpNeeded;
	const nextLevel = currentLevel + 1;
	switch (true) {
		case currentLevel < 6:
			xpNeeded = nextLevel * 1000;
			break;
		case currentLevel < 9:
			xpNeeded = 4000 + (nextLevel - 5) * 2000;
			break;
		case currentLevel < 16:
			xpNeeded = 12000 + (nextLevel - 9) * 4000;
			break;
		case currentLevel < 36:
			xpNeeded = 40000 + (nextLevel - 16) * 5000;
			break;
		case currentLevel < 56:
			xpNeeded = 140000 + (nextLevel - 36) * 7500;
			break;
		case currentLevel >= 56:
			xpNeeded = 290000 + (nextLevel - 56) * 10000;
			break;
		default:
			xpNeeded = 0;
			break;
	}

	return xpNeeded;
}
function Hero(props) {
	const timeForOneStamina = 20 * 60;
	const zeroAddress = '0x0000000000000000000000000000000000000000';
	const xpPerLevel = 1000;
	const baseXp = 1000;

	const [hero, setHero] = useState(null);

	const getCurrentStamina = async () => {
		try {
			const hero = await props.heroContract.getHero(props.id);
			console.log(hero);
			const fullStamina = Number(hero['stats']['stamina']);
			const fullStaminaReadyAt = Number(
				hero['state']['staminaFullAt'],
			);
			let currentQuest = hero['state']['currentQuest'].toString();

			const currentLevel = hero['state']['level'];
			let calculatedXp = calculateRequiredXp(currentLevel);

			let isQuesting = true;
			if (currentQuest === zeroAddress) isQuesting = false;

			const now = parseInt(new Date().getTime() / 1000);
			let currentStamina = 0;
			if (fullStaminaReadyAt <= now) currentStamina = fullStamina;
			else
				currentStamina =
					fullStamina -
					(fullStaminaReadyAt - now) / timeForOneStamina;

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
				levelUpXp: calculatedXp,
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
					<Row className='align-items-center mt-3'>
						<Col xs={2} md>
							{hero.id}
						</Col>
						<Col className='d-none d-sm-block'>{hero.level}</Col>
						<Col xs={3} md>
							{hero.xp} / {hero.levelUpXp} (
							{Math.floor((hero.xp * 100) / hero.levelUpXp)}
							%)
						</Col>
						<Col xs={3} md>
							{hero.isQuesting && <>YES</>}
						</Col>
						<Col xs={4} md>
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
						<Col className='d-none d-sm-block'>
							{hero.currentStamina === hero.maximumStamina
								? 'Now'
								: new Date(hero.readyAt * 1000).toLocaleString()}
						</Col>
					</Row>
				</>
			)}
		</>
	);
}

export default Hero;
