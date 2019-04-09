import { BaseScene } from './BaseScene';
import { Enemy, EnemyType } from '../components/Enemy';
import { Input } from 'phaser';
import { Tower, TowerType } from '../components/Tower';
import { Wave, waveParser } from '../components/Wave';

interface ITiledPolyline extends Phaser.GameObjects.GameObject {
	x: number;
	y: number;
	polyline: Phaser.Math.Vector2[];
}

interface ITiledGameTile extends Phaser.Tilemaps.Tile {
	properties: {
		buildable: boolean;
		walkable: boolean;
		collides: boolean;
	};
}

interface ITiledMap extends Phaser.Tilemaps.Tilemap {
	properties: any[];
}

export class GameScene extends BaseScene {
	public enemies: Enemy[];
	public towerTile: Map<string, Tower>;

	public map: ITiledMap;
	public tileset: Phaser.Tilemaps.Tileset;

	public waves: Wave[];
	public creepPath: Phaser.Curves.Path;

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

		this.enemies = [];
		this.towerTile = new Map<string, Tower>();

		this.map = this.make.tilemap({ key: 'map-001' }) as ITiledMap;
		this.tileset = this.map.addTilesetImage('tiles', 'tiles');
		this.map.createStaticLayer('bg', this.tileset, 0, 0).setDepth(0);
		this.map.createStaticLayer('top', this.tileset, 0, 0).setDepth(10);

		// create creeppath
		const creepPathObject = this.map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.type === 'CREEP_PATH') as ITiledPolyline;
		this.creepPath = this.createCreepPath(creepPathObject);

		// load waves
		this.waves = [];
		this.map.properties.forEach( (p: any) => {
			if (p.name === 'waves') {
				p.value.split('\n').forEach( (line: string) => {
					this.waves.push(waveParser(line));
				});
			}
		});

		// create enemies
		const enemy = new Enemy(this, this.creepPath, EnemyType.NORMAL);
		this.enemies.push(enemy);

		// click to add tower
		this.input.on(Input.Events.POINTER_DOWN, (pointer: Input.Pointer) => {
			const worldPoint = pointer.positionToCamera(this.cameras.main) as Vector2Like;
			const tile = this.map.getTileAtWorldXY(worldPoint.x, worldPoint.y) as ITiledGameTile;

			if (tile && tile.properties.buildable) {
				if (!this.towerTile.has(`${tile.x}|${tile.y}`)) {
					const tower = this.createTower(tile, TowerType.NORMAL);
					this.towerTile.set(`${tile.x}|${tile.y}`, tower);
				}
			}
		});

		// create UI
		this.createUI();


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

		if (this.scrollZoneDown.contains(pointerPos.x, pointerPos.y))  { this.cameras.main.scrollY += 1; }
		if (this.scrollZoneRight.contains(pointerPos.x, pointerPos.y)) { this.cameras.main.scrollX += 1; }
		if (this.scrollZoneUp.contains(pointerPos.x, pointerPos.y))    { this.cameras.main.scrollY -= 1; }
		if (this.scrollZoneLeft.contains(pointerPos.x, pointerPos.y))  { this.cameras.main.scrollX -= 1; }

		this.towerTile.forEach( (tower: Tower) => {
			tower.update(time, delta);
		});
	}

	public startWave(waveIndex?: number): void {
		waveIndex = waveIndex || this.registry.get('wave');

		const waveEnemies = this.createWaveEnemies(this.waves[waveIndex]);

		waveEnemies.forEach( (e: Enemy, index: number) => {
			this.enemies.push(e);
			setTimeout(() => e.start(), index * 2000);
		});
	}

	// private methods ------------

	private createWaveEnemies(wave: Wave): Enemy[] {
		const enemies: Enemy[] = [];
		wave.creeps.forEach( (et: EnemyType) => {
			const enemy = new Enemy(this, this.creepPath, et);
			enemies.push(enemy);
		});

		return enemies;
	}

	private createCreepPath(creepPathObject: ITiledPolyline): Phaser.Curves.Path {
		const creepPath = new Phaser.Curves.Path(creepPathObject.x + creepPathObject.polyline[0].x, creepPathObject.y + creepPathObject.polyline[0].y);
		for (let i = 1; i < creepPathObject.polyline.length; i++) {
			creepPath.lineTo(creepPathObject.x + creepPathObject.polyline[i].x, creepPathObject.y + creepPathObject.polyline[i].y);
		}

		return creepPath;
	}

	private createTower(tile: Phaser.Tilemaps.Tile, towerType: TowerType): Tower {
		if (!tile) { return; }
		const tower = new Tower(this, tile.getCenterX(), tile.getCenterY(), towerType);
		return tower;
	}

	private createUI(): void {
		this.uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
		this.uiContainer.add([
			this.add.rectangle(0, 0, this.scale.gameSize.width, 20, 0x333333, 1).setOrigin(0),
			this.add.bitmapText(15, 5, 'silk', '100', 8).setDepth(20).setOrigin(0),
			this.add.sprite(5, 6, 'coin', 'coin_03').setOrigin(0).play('spin'),
		]);
	}
}
