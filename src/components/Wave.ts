import { EnemyType } from './Enemy';

export class Wave {
	public creeps: EnemyType[];

	constructor(creeps: EnemyType[] = []) {
		this.creeps = creeps;
	}
}

export function waveParser(waveString: string): Wave {
	const enemytypes: EnemyType[] = [];

	waveString.split('').forEach( (e: string) => {
		if (e === 'N') { enemytypes.push(EnemyType.NORMAL); }
		if (e === 'H') { enemytypes.push(EnemyType.HEAVY); }
		if (e === 'S') { enemytypes.push(EnemyType.SPEEDY); }
		if (e === 'F') { enemytypes.push(EnemyType.FLYING); }
	});

	return new Wave(enemytypes);
}
