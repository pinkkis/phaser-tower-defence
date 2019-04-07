import { BaseScene } from './BaseScene';
import { Enemy, EnemyType } from '../components/Enemy';

interface ITiledPolyline extends Phaser.GameObjects.GameObject {
	x: number;
	y: number;
	polyline: Phaser.Math.Vector2[];
}

export class GameScene extends BaseScene {
	public enemies: Phaser.GameObjects.Group;

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

		const levelTopMargin = 20;

		const map = this.make.tilemap({ key: 'map-001' });
		const tiles = map.addTilesetImage('tiles', 'tiles');
		const bottomLayer = map.createStaticLayer('bg', tiles, 0, 0).setDepth(0);
		const topLayer = map.createStaticLayer('top', tiles, 0, 0).setDepth(10);

		const creepPathObject = map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.type === 'CREEP_PATH') as ITiledPolyline;
		const spawnStart = map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.name === 'START');
		const spawnEnd = map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.name === 'END');

		// create creeppath
		const creepPath = new Phaser.Curves.Path(creepPathObject.x + creepPathObject.polyline[0].x, creepPathObject.y + creepPathObject.polyline[0].y);
		for (let i = 1; i < creepPathObject.polyline.length; i++) {
			creepPath.lineTo(creepPathObject.x + creepPathObject.polyline[i].x, creepPathObject.y + creepPathObject.polyline[i].y);
		}

		this.enemies = this.add.group();

		const enemy = new Enemy(this, creepPath, EnemyType.NORMAL);

		this.enemies.add(enemy);

		const uiContainer = this.add.container(0, 0).setScrollFactor(0);
		uiContainer.add([
			this.add.rectangle(0, 0, this.scale.gameSize.width, 20, 0x333333, 1).setOrigin(0),
			this.add.bitmapText(5, 5, 'silk', 'Game Scene', 8).setDepth(20),
		]);

		// debugger;

		// const g = this.add.graphics().lineStyle(1, 0xffffff);
		// creepPath.draw(g, 100);

		this.cameras.main.scrollY -= 20;
		this.cameras.main.setBounds(0, -levelTopMargin, map.widthInPixels, map.heightInPixels);

		this.startWave();
	}

	public update(time: number, delta: number): void {
		// this.enemies.
	}

	public startWave(): void {
		this.enemies.getChildren().forEach( (e: Enemy, index: number) => {
			setTimeout(() => e.start(), index * 200);
		});
	}

	// private methods ------------
}
