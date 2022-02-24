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
			console.log(hero);
			const fullStamina = Number(hero['stats']['stamina']);
			const fullStaminaReadyAt = Number(
				hero['state']['staminaFullAt'],
			);
			let currentQuest = hero['state']['currentQuest'].toString();

			const currentLevel = hero['state']['level'];
			let calculatedXp = baseXp + xpPerLevel * currentLevel;
			if (currentLevel > 5) calculatedXp += 1000;

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
