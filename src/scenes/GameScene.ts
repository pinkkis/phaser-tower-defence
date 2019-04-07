import { BaseScene } from './BaseScene';

export class GameScene extends BaseScene {
	constructor(key: string, options: any) {
		super('GameScene');
	}

	public preload(): void {
		// empty
	}

	public init(): void {
		// empty
	}

	public create(): void {
		console.info('GameScene - create()');

		const map = this.make.tilemap({ key: 'map-001' });
		const tiles = map.addTilesetImage('tiles', 'tiles');
		const bottomLayer = map.createStaticLayer('bg', tiles, 0, 0).setDepth(0);
		const topLayer = map.createStaticLayer('top', tiles, 0, 0).setDepth(10);

		// const playerSpawnPoint: any = this.map.findObject(MapLayer.OBJECTS, obj => obj.name === MapObjectType.PLAYER_SPAWN);

		this.add.bitmapText(10, 10, 'silk', 'Game Scene', 8).setDepth(20);
	}

	public update(time: number, delta: number): void {
		// empty
	}

	// private methods ------------
}
