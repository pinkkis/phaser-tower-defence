import { BaseScene } from './BaseScene';
import { Enemy, EnemyType } from '../components/Enemy';
import { Input } from 'phaser';

interface ITiledPolyline extends Phaser.GameObjects.GameObject {
	x: number;
	y: number;
	polyline: Phaser.Math.Vector2[];
}

export class GameScene extends BaseScene {
	public enemies: Phaser.GameObjects.Group;

	public map: Phaser.Tilemaps.Tilemap;
	public tileset: Phaser.Tilemaps.Tileset;

	public uiContainer: Phaser.GameObjects.Container;

	private scrollZoneLeft: Phaser.Geom.Rectangle;
	private scrollZoneRight: Phaser.Geom.Rectangle;
	private scrollZoneUp: Phaser.Geom.Rectangle;
	private scrollZoneDown: Phaser.Geom.Rectangle;

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

		this.enemies = this.add.group();

		this.map = this.make.tilemap({ key: 'map-001' });
		this.tileset = this.map.addTilesetImage('tiles', 'tiles');

		const bottomLayer = this.map.createStaticLayer('bg', this.tileset, 0, 0).setDepth(0);
		const topLayer = this.map.createStaticLayer('top', this.tileset, 0, 0).setDepth(10);

		const creepPathObject = this.map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.type === 'CREEP_PATH') as ITiledPolyline;
		const spawnStart = this.map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.name === 'START');
		const spawnEnd = this.map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.name === 'END');

		// create creeppath
		const creepPath = this.createCreepPath(creepPathObject);

		// create enemies
		const enemy = new Enemy(this, creepPath, EnemyType.NORMAL);
		this.enemies.add(enemy);


		// create UI
		this.uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

		this.uiContainer.add([
			this.add.rectangle(0, 0, this.scale.gameSize.width, 20, 0x333333, 1).setOrigin(0),
			this.add.bitmapText(5, 5, 'silk', 'Game Scene', 8).setDepth(20),
		]);


		// setup camera
		this.cameras.main.scrollY -= 20;
		this.cameras.main.setBounds(0, -levelTopMargin, this.map.widthInPixels, this.map.heightInPixels + levelTopMargin);

		// create camera scroll
		const zoneSize = 20;
		this.scrollZoneLeft = new Phaser.Geom.Rectangle(0, levelTopMargin, zoneSize, this.scale.gameSize.height);
		this.scrollZoneUp = new Phaser.Geom.Rectangle(0, levelTopMargin, this.scale.gameSize.width, zoneSize);
		this.scrollZoneRight = new Phaser.Geom.Rectangle(this.scale.gameSize.width - zoneSize, levelTopMargin, zoneSize, this.scale.gameSize.height);
		this.scrollZoneDown = new Phaser.Geom.Rectangle(0, this.scale.gameSize.height - zoneSize, this.scale.gameSize.width, zoneSize);


		// start game
		this.startWave();
	}

	public update(time: number, delta: number): void {
		const pointerPos = this.input.activePointer.position;

		if (this.scrollZoneDown.contains(pointerPos.x, pointerPos.y)) {
			this.cameras.main.scrollY += 1;
		}

		if (this.scrollZoneRight.contains(pointerPos.x, pointerPos.y)) {
			this.cameras.main.scrollX += 1;
		}

		if (this.scrollZoneUp.contains(pointerPos.x, pointerPos.y)) {
			this.cameras.main.scrollY -= 1;
		}

		if (this.scrollZoneLeft.contains(pointerPos.x, pointerPos.y)) {
			this.cameras.main.scrollX -= 1;
		}

	}

	public startWave(): void {
		this.enemies.getChildren().forEach( (e: Enemy, index: number) => {
			setTimeout(() => e.start(), index * 200);
		});
	}

	// private methods ------------

	private createCreepPath(creepPathObject: ITiledPolyline): Phaser.Curves.Path {
		const creepPath = new Phaser.Curves.Path(creepPathObject.x + creepPathObject.polyline[0].x, creepPathObject.y + creepPathObject.polyline[0].y);
		for (let i = 1; i < creepPathObject.polyline.length; i++) {
			creepPath.lineTo(creepPathObject.x + creepPathObject.polyline[i].x, creepPathObject.y + creepPathObject.polyline[i].y);
		}

		return creepPath;
	}
}
