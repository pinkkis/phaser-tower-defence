import { Enemy, EnemyType } from './Enemy';

export class Wave {
	public creeps: EnemyType[];

	constructor(creeps: EnemyType[] = []) {
		this.creeps = creeps;
	}
}

export function waveParser(waveString: string): Wave {
	const enemies: EnemyType[] = [];

	waveString.split('').forEach( (e: string) => {
		if (e === 'N') { enemies.push(EnemyType.NORMAL); }
		if (e === 'H') { enemies.push(EnemyType.HEAVY); }
		if (e === 'S') { enemies.push(EnemyType.SPEEDY); }
		if (e === 'F') { enemies.push(EnemyType.FLYING); }
	});

	return new Wave(enemies);
}
